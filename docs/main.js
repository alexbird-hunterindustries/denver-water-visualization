async function goGetTheRecentStationData(currentYear, stationId) {
    const params = {
        "stationTriplets": `${stationId}:CO:SNTL`,
        "elements": "PREC",
        "duration": "MONTHLY",
        "beginDate": "2022-04-02",
        "endDate": "2026-08-19"
    };

    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const apiResponse = await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?' + queryParams).then(x => x.json())
    console.log("apiResponse:" + JSON.stringify(apiResponse));
    const items = apiResponse[0].data[0].values;

    return Object.fromEntries(items
        .filter(({year, month}) => year === currentYear || (year === currentYear - 1 && month > 10))
        .map(({year, month, value}) => [`${year}-${month}`, value]));
}

async function fetchAndChartStationPrecipitationData(stationMap, currentYear) {
    const watershedName = "Upper Colorado Watershed";
    const watershedStationIds = [602, 505, 1014, 970, 335, 415];
    const xAxis = [
        { year: currentYear - 1, month: 11 },
        { year: currentYear - 1, month: 12 },
        ...Array.from({ length: 9 }).map((_, i) => ({ year: currentYear, month: i + 1}))
    ].map(({ year, month }) => `${year}-${month}`)

    const allStationData =
        await Promise.all(
            watershedStationIds.map(stationId => goGetTheRecentStationData(currentYear, stationId))
        )
    const allStationDataByYearMonth = {}
    allStationData.forEach(dataForOneStation => {
        xAxis.forEach(yearMonth => {
            allStationDataByYearMonth[yearMonth] = allStationDataByYearMonth[yearMonth] || []
            allStationDataByYearMonth[yearMonth].push(dataForOneStation[yearMonth])
        })

    })
    const chartContext = document.querySelector('main #chart canvas');
    let cumulativeSum = 0;
    const smoosh = precipitationByStation => {
        const average = precipitationByStation.reduce((a, b) => a + b, 0) / precipitationByStation.length
        return average;
    }
    const chartData = xAxis.map(yearMonth => ({x: yearMonth, y: smoosh(allStationDataByYearMonth[yearMonth]) }));
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
    document.querySelector('#chartTitle').innerHTML = watershedName;
    document.querySelector('#chartSubtitle').innerHTML = "SNOTEL Stations: " + watershedStationIds.map(x => stationMap[x]).join(", ");
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
    const stationNameMap = await readStationMetadata();
    const currentYear = 2026;
    await fetchAndChartStationPrecipitationData(stationNameMap, currentYear);


}

main();
