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
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });


}

main();
