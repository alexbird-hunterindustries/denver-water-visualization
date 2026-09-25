async function main() {
    const params = {
        "stationTriplets" : "938:CO:SNTL",
        "elements" : "WTEQ",
        "duration": "MONTHLY",
        "beginDate": "2022-04-02",
        "endDate": "2026-08-19"
    }
    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const apiResponse = await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?' + queryParams).then(x => x.json())
    const items = apiResponse[0].data[0].values

    console.log(items)
    const preTag = document.createElement('pre')
    preTag.innerHTML = JSON.stringify(items, null, 2)
    const containerElement = document.querySelector('main #raw-data');
    containerElement.innerHTML = '';
    containerElement.appendChild(preTag)

    const ctx = document.querySelector('main #chart canvas');

    items.map(({ year, month, value }) => console.log({ year, month, value }))
    const chartData = items.map(({ year, month, value }) => ({x: `${year}-${month}`, y: value }))

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Stuff',
                data: chartData
            }]
        }
    });


}

main();
