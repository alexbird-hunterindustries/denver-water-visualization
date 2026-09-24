#SOURCE: https://github.com/paulrayner/design-storm-2026/blob/main/scripts/SNTL_grabber.ipynb

import requests
import pandas as pd
import numpy as np

import truststore
truststore.inject_into_ssl()

# Set up the request
base = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?"
params = {
   "stationTriplets" : "938:CO:SNTL", 
    "elements" : "WTEQ",
    "duration": "DAILY",
    "beginDate": "2022-04-02",
    "endDate": "2026-08-19" # Can also do 0 for relative date ending today
}

# Execute the request
response = requests.get(base, params=params)
data = response.json()

# Print url for debugging
print(f"Requesting URL: {response.url}")

# Parse the JSON response payload into a DataFrame
values = data[0]["data"][0]["values"]
df = pd.DataFrame(values)
df["DATE"] = pd.to_datetime(df["date"])
df.set_index("DATE", inplace=True)
df = df.drop("date", axis = 1)
df = df.rename(columns={'value': 'SWE'})
df.tail()

df.to_csv(r".\data.csv")
# If still using Michigan creek, watch out for erroneous data in spring 2026. Huge, unrealistic spike in SWE. 

