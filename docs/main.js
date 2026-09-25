async function main() {
    console.log('hello, world')
    const params = {
        "stationTriplets" : "938:CO:SNTL",
        "elements" : "WTEQ",
        "duration": "MONTHLY",
        "beginDate": "2022-04-02",
        "endDate": "2026-08-19"
    }
    const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
    const data = await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?' + queryParams).then(x => x.json())
    items = data[0].data[0].values

    console.log(items)
    const preTag = document.createElement('pre')
    preTag.innerHTML = JSON.stringify(items, null, 2)
    const containerElement = document.querySelector('main #raw-data');
    containerElement.innerHTML = '';
    containerElement.appendChild(preTag)

    const ctx = document.querySelector('main #chart canvas');

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Stuff',
                data: [{x: '2016-12-25', y: 20}, {x: '2016-12-26', y: 10}]
            }]
        }
    });


}

main();
