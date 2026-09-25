async function goGetTheRecentStationData(currentYear, stationId) {
    const params = {
        "stationTriplets": `${stationId}:CO:SNTL`,
        "elements": "WTEQ",
        "duration": "MONTHLY",
        "beginDate": "2022-04-02",
        "endDate": "2026-08-19"
    };

    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const apiResponse = await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?' + queryParams).then(x => x.json())
    const items = apiResponse[0].data[0].values;

    return Object.fromEntries(items
        .filter(({year, month}) => year === currentYear || (year === currentYear - 1 && month > 10))
        .map(({year, month, value}) => [`${year}-${month}`, value]));
}

async function chartOneStationPrecipitationFor2026(stationMap) {
    const upperColoradoWatershed = [602, 505, 1014, 970, 335, 415];
    const xAxis = [
        { year: 2025, month: 11 },
        { year: 2025, month: 12 },
        ...Array.from({ length: 9 }).map((_, i) => ({ year: 2026, month: i + 1}))
    ].map(({ year, month }) => `${year}-${month}`)
    const currentYear = 2026
    const stationData = await goGetTheRecentStationData(currentYear, 938);
    const chartContext = document.querySelector('main #chart canvas');
    let cumulativeSum = 0;
    const smoosh = thing => {
        cumulativeSum += thing;
        return cumulativeSum;
    }
    const chartData = xAxis.map(yearMonth => ({x: yearMonth, y: smoosh(stationData[yearMonth]) }));
    new Chart(chartContext, {
        type: 'line',
        data: {
            datasets: [{
                label: `Inches of Precipitation (${currentYear})`,
                data: chartData
            }]
        }
    });
    document.querySelector('#loading-indicator').remove()
    document.querySelector('#chartTitle').innerHTML = "Upper Colorado Watershed";
    document.querySelector('#chartSubtitle').innerHTML = "SNOTEL Stations: " + upperColoradoWatershed.map(x => stationMap[x]).join(", ");
}

async function readStationMetadata() {
    const params = {
        "stationTriplets": "*:CO:SNTL"
    }
    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const apiResponse = await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?' + queryParams).then(x => x.json())
    console.log(apiResponse);
    const stationMap = Object.fromEntries(apiResponse
        .sort((lhs, rhs) => lhs.stationId - rhs.stationId)
        .map(({stationId, name}) => [stationId, name]))
    console.log(stationMap);

    return stationMap;
}

async function main() {
    const stationMap = await readStationMetadata();
    await chartOneStationPrecipitationFor2026(stationMap);


}

main();
