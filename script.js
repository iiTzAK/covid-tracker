// GEC FROM BROWSER
window.onload = () => {
    getCountryData();
    getHistoricalData();
};

// MAP FUNCTION TO SHOW UP THE GOOGLE API MAP
let map;
var infoWindow;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {

        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 3,
        styles: mapStyle


    });

    infoWindow = new google.maps.InfoWindow();
}

// GET THE DATA FROM API

const getCountryData = () => {
    fetch("http://localhost:3000/countries")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            showDataOnMap(data);
            showDataInTable(data);

        })
}

// GET THE DATA FROM HISTORY API
const getHistoricalData = () => {
    fetch("https://corona.lmao.ninja/v3/covid-19/historical/all?lastdays=120")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let chartData = buildChartData(data);
            buildChart(chartData);
        })
}


// CHART FOR THE HISTORY DATA
const buildChartData = (data) => {

    let chartData = [];
    for (let date in data.cases) {
        let newDataPoint = {
            x: date,
            y: data.cases[date] // key: [value]
        }

        chartData.push(newDataPoint); // push the data from the array
    }
    return chartData; // to reuse in the history and pass in the build chart
}

const buildChart = (chartData) => {
    console.log("all ok");
    var timeFormat = 'MM/DD/YY'; //Format of in which we providing the data

    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            datasets: [{
                label: 'Total No Cases',
                backgroundColor: '#1d2c4d',
                borderColor: '#1d2c4d',
                data: chartData
            }]
        },

        // Configuration options go here (graph by chart.js/ moment.js)
        options: {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return numeral(value).format('0,0');
                        }
                    }
                }]
            }
        }
    });
}


// MAKE THE DATA SHOW ON MAP FROM API
const showDataOnMap = (data) => {
    data.map((country) => {
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long,
        };

        var countryCircle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map,
            center: countryCenter,
            radius: country.casesPerOneMillion * 15,
        });

        var html = `
    <div class="info-container">
        <div class="info-flag" style="background-image: url(${country.countryInfo.flag});"
         </div>
        <div class="info-name">
            ${country.country}
        </div>
        <div class="info-confirmed">
            Total: ${country.cases}
        </div>
        <div class="info-recovered">
            Recovered: ${country.recovered}
        </div>
        <div class="info-deaths">   
            Deaths: ${country.deaths}
        </div>
    </div>
`

        var infoWindow = new google.maps.InfoWindow({
            content: html,
            position: countryCircle.center,
        });

        google.maps.event.addListener(countryCircle, "mouseover", function () {
            infoWindow.open(map);
        });

        google.maps.event.addListener(countryCircle, "mouseout", function () {
            infoWindow.close();
        });
    });
};

// SHOW DYNAMIC DATA IN TABLE
const showDataInTable = (data) => {
    var html = '';
    data.forEach((country) => {


        html += `
          <tr>
            <td>${country.country}</td>
           <td>${country.cases}</td>
           <td>${country.recovered}</td>
           <td>${country.deaths}</td>
         </tr>
          `
    })

    document.getElementById('table-data').innerHTML = html;
}