# Dependencies
import pandas as pd
import requests
import sys
if sys.version_info[0] < 3: 
    from StringIO import StringIO
else:
    from io import StringIO
from flask import (
    Flask,
    render_template,
    request, 
    redirect,
    jsonify)
from flask_sqlalchemy import SQLAlchemy
from aqi2json import aqi2json
import pymongo
from datetime import datetime, timedelta
import json

# Flask Setup
app = Flask(__name__)

# Database Setup
# The database URI
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/aqi.sqlite"
db = SQLAlchemy(app)

# Create connection variable
# conn = 'mongodb://localhost:27017'
# conn = 'mongodb://trafficaquser:taq1234@ds133202.mlab.com:33202/trafficaq'
conn = 'mongodb://trafficaquser:taq1234@ds233452.mlab.com:33452/trafficaq'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.
# db = client.traffic_db
mdb = client.trafficaq

# Drops collection if available to remove duplicates
mdb.trafficAQ.drop()

class AQI(db.Model):
    __tablename__ = 'aqi'

    id = db.Column(db.Integer, primary_key=True)
    Latitude = db.Column(db.String)
    Longitude = db.Column(db.String)
    UTC = db.Column(db.String)
    Parameter = db.Column(db.String)
    Unit = db.Column(db.String)
    Value = db.Column(db.Float)
    AQI = db.Column(db.Integer)
    SiteName = db.Column(db.String)
    
    def __repr__(self):
        return '<AQI %r>' % (self.name)

# Create database table before any request
@app.before_first_request
def setup():
    # Recreate database each time for demo
    db.drop_all()
    db.create_all()

# Flask Routes
@app.route("/")
def index():
    """Render Home Page."""
    return render_template("index.html")

@app.route("/index", methods=["GET", "POST"])
def homeback():
    """Render Home Page."""
    return render_template("index.html")

@app.route('/traffic')
def traffic():
    return render_template('traffic.html')

@app.route("/api_aqi_24")
def api_aqi_24():
    """Return aqi data"""

    # Fetch aqi data for the last 24 hours
    aqi_data = aqi2json()
    df = aqi_data.loc[aqi_data['SiteName']=="Cicero2"]

    # Add aqi data to the database
    times = []
    aqis = []
    for index, row in df.iterrows():
        new_entry = AQI(
          Latitude = row['Latitude'],
          Longitude = row['Longitude'],
          UTC = row['UTC'],
          Parameter = row['Parameter'],
          Unit = row['Unit'],
          Value = row['Value'],
          AQI = row['AQI'],
          SiteName = row['SiteName'],
        )
        db.session.add(new_entry)
        db.session.commit()
        times.append(row['UTC'])
        aqis.append(row['AQI'])

    # Generate the plot trace
    plot_trace = {
        "x": times,
        "y": aqis,
        "type": "bar",
        "name": "hourly AQI",
        # "mode": 'lines+markers',
        "marker": {
            # "color": "#2077b4",
            "color": 'rgb(9,56,125)',
            # "symbol": "hexagram"
        },
        # "line": {
        #     "color": "#17BECF"
        # },
        "text": "hourly AQI",
    }
    return jsonify(plot_trace)

@app.route("/api_aqi_historic")
def api_aqi_historic():
    """Return historical air quality data"""

    # API URL
    aqUrl = "https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=81102&bdate=20180601&edate=20180608&state=17&county=031"
    print(aqUrl)

    # Fetch data from API
    response = requests.get(aqUrl)
    html_string = StringIO(response.text)
    df = pd.read_csv(html_string, sep=",")
    aqData = json.loads(df.to_json(orient='records'))

    # Store in database
    mdb.aqHistoric.insert_many(aqData)

    aqData = json.loads(df.to_json(orient='records'))
    # data = json.dumps(aqData, indent=2, separators=(', ', ': '))
    # return render_template('api_aqi_historic.html', data=data)
    return jsonify(aqData)

@app.route("/api_traffic_24")
def api_traffic_24():
    """Return real-time traffic data for the past 24 hours"""

    # Time strings
    time_now = datetime.now().strftime("'%Y-%m-%dT%H:%M:%S'")
    time_24 = (datetime.now() - timedelta(days=1)).strftime("'%Y-%m-%dT%H:%M:%S'")

    # Base URL for traffic segment data
    baseURL = "https://data.cityofchicago.org/resource/sxs8-h27x.json?"

    # Compile URL for traffic segment data within past 24 hours
    trafficUrl = f"{baseURL}$where=time between {time_24} and {time_now} and speed>0&$select=avg(start_latitude),avg(start_longitude),avg(end_latitude),avg(end_longitude),avg(speed),segment_id,sum(bus_count)&$group=segment_id&$limit=25000"

    # Fetch data from API
    response = requests.get(trafficUrl)
    trafficData = response.json()

    # Store in database
    mdb.traffic24Hours.insert_many(trafficData)

    trafficData = response.json()
    # data = json.dumps(trafficData, indent=2, separators=(', ', ': '))
    # return render_template('api_traffic_24.html', data=data)
    return jsonify(trafficData)

@app.route("/historic_d3")
def historic_d3():
    return render_template("historic_d3.html")

@app.route("/historic_index")
def historic_index():
    return render_template("historic_index.html")

@app.route("/historical", methods=["GET", "POST"])
def historical():
    
    # return render_template("historical.html", iframe="https://teabraham.github.io/Assignments/aqidash/")
    return render_template("historical.html")


if __name__ == '__main__':
    app.run(debug=True)