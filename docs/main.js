async function goGetTheRecentWeatherData(currentYear, stationId) {
    const params = {
        "dataset": "daily-summaries",
        "stations": "USC00051071",
        "startDate": "2025-11-01",
        "endDate": "2026-09-30",
        "dataTypes": "TMAX",
        "format": "json",
        "units": "standard"
    };

    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const apiResponse = await fetch('https://www.ncei.noaa.gov/access/services/data/v1?' + queryParams).then(x => x.json())
    console.log("weather apiResponse:" + JSON.stringify(apiResponse));

    // return Object.fromEntries(items
    //     .filter(({year, month}) => year === currentYear || (year === currentYear - 1 && month > 10))
    //     .map(({year, month, value}) => [`${year}-${month}`, value]));
}


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
    const chartData = xAxis.map(yearMonth => ({x: yearMonth, y: average(allStationDataByYearMonth[yearMonth]) }));
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
    const stationMap = Object.fromEntries(apiResponse
        .sort((lhs, rhs) => lhs.stationId - rhs.stationId)
        .map(({stationId, name}) => [stationId, name]))

    return stationMap;
}

async function main() {
    await goGetTheRecentWeatherData(2026);
    const stationNameMap = await readStationMetadata();
    const currentYear = 2026;
    await fetchAndChartStationPrecipitationData(stationNameMap, currentYear);


}

main();

function average(precipitationByStation) {
    return precipitationByStation.reduce((a, b) => a + b, 0) / precipitationByStation.length;
}