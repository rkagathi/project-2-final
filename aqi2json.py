import os
import sys
from datetime import datetime, timedelta
from os.path import expanduser
import urllib.request
import pandas as pd

def aqi2json():

    # Current date and hour
    date_now = datetime.now().strftime("%Y-%m-%d")
    hour_now = datetime.now().strftime("%H")
    date_yes = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    # API parameters
    options = {}
    options["url"] = "https://airnowapi.org/aq/data/"
    options["start_date"] = date_yes
    options["start_hour_utc"] = hour_now
    options["end_date"] = date_now
    options["end_hour_utc"] = hour_now
    options["parameters"] = "o3,pm25"
    options["bbox"] = "-87.752304,41.738267,-87.503738,41.966378"
    options["data_type"] = "b"
    options["format"] = "application/json"
    options["ext"] = "json"
    options["api_key"] = "864981FC-7610-40F2-B28B-BBF789659C9F"
    options["verbose"] = "1"

    # API request URL
    REQUEST_URL = options["url"] \
                  + "?startdate=" + options["start_date"] \
                  + "t" + options["start_hour_utc"] \
                  + "&enddate=" + options["end_date"] \
                  + "t" + options["end_hour_utc"] \
                  + "&parameters=" + options["parameters"] \
                  + "&bbox=" + options["bbox"] \
                  + "&datatype=" + options["data_type"] \
                  + "&format=" + options["format"] \
                  + "&verbose=" + options["verbose"] \
                  + "&api_key=" + options["api_key"]

    try:
        # Request AirNowAPI data
        print("Requesting AirNowAPI data...")

        # User's home directory.
        # home_dir = expanduser("~")
        home_dir = '.'
        download_file_name = "db/AirNowAPI." + options["ext"]
        # "db/AirNowAPI" + datetime.now().strftime("_%Y%M%d%H%M%S." + options["ext"])
        download_file = os.path.join(home_dir, download_file_name)

        # Perform the AirNow API data request
        api_data = urllib.request.URLopener()
        api_data.retrieve(REQUEST_URL, download_file)

        # Download complete
        print("Download URL: %s" % REQUEST_URL)
        print("Download File: %s" % download_file)

        # Load json file
        aqi_data = pd.read_json(download_file)

    except Exception as e:
        print("Unable perform AirNowAPI request. %s" % e)
        # sys.exit(1)
        aqi_data = []

    return aqi_data

if __name__ == "__main__":
    main()