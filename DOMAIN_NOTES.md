Manual process produces a PDF, e.g. https://www.denverwater.org/sites/default/files/water-watch-report.pdf

https://upload.wikimedia.org/wikipedia/commons/1/10/Moffat_collection_system_project-_Final_environmental_impact_statement-_Appendix_H-_Hydrologic_data_and_PACSM_output_-_USACE-p16021coll7-749.pdf?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original

## Data Sources

SNOTEL API docs - https://wcc.sc.egov.usda.gov/awdbRestApi/v3/api-docs

### Retrieving SNOTEL data

```javascript
const params = {
    "stationTriplets" : "938:CO:SNTL",
    "elements" : "WTEQ",
    "duration": "DAILY",
    "beginDate": "2022-04-02",
    "endDate": "2026-08-19"
}
const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
await fetch('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?' + queryParams).then(x => x.json())

```
