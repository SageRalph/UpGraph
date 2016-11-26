
var chart, data, data, societies;

window.addEventListener('load', function () {
    ajax("GET", "data", null, init);
});

function init(response, status) {
    if (status >= 400 || !response)
        return console.error('Data request failed');
//    console.log('INIT - Recieved:');
//    console.log(response);

    data = response;
    societies = Object.keys(data[0]);
    societies.splice(societies.indexOf("date"), 1);
    //console.log('Societies: ' + societies);

    drawGraph();
    drawToggles();
}


function toggleSoc(soc) {
    console.log('Toggling: ' + soc);

    // Update societies array
    var pos = societies.indexOf(soc);
    console.log(pos);
    if (pos >= 0) {
        societies.splice(pos, 1);
    } else {
        societies.push(soc);
    }

    drawGraph();
}

function drawToggles() {
    console.log("Drawing toggles");
    var toggles = document.createElement('ol');
    for (var i = 0; i < societies.length; i++) {
        var soc = societies[i];
        var socSize = data[[data.length - 1]][soc];
        var li = document.createElement('li');
        var label = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = 'true';
        cb.onclick = toggleSoc.bind(null, soc);
        label.innerHTML = soc + ' (' + socSize + ' members)';
        label.insertBefore(cb, label.firstChild);
        li.appendChild(label);
        toggles.appendChild(li);
    }
    document.body.appendChild(toggles);
}

function drawGraph() {

    console.log("Drawing graph");

    var graphs = [];
    console.log(data);
    console.log(societies);

    // Define lines to draw on graph
    societies.forEach(function (socName, i) {
        graphs.push({
            "id": "g" + i,
            "balloon": {
                "drop": true,
                "adjustBorderColor": false,
                "color": "#ffffff"
            },
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "bulletSize": 5,
            "hideBulletsCount": 50,
            "lineThickness": 2,
            "title": "red line",
            "useLineColorForBulletBorder": true,
            "valueField": socName,
            "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
        });
    });


    // Draw graph
    chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "theme": "light",
        "marginRight": 40,
        "marginLeft": 40,
        "autoMarginOffset": 20,
        "mouseWheelZoomEnabled": true,
        "dataDateFormat": "YYYY-MM-DD",
        "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth": true
            }],
        "balloon": {
            "borderThickness": 1,
            "shadowAlpha": 0
        },
        "graphs": graphs,
        "chartScrollbar": {
            "graph": "g1",
            "oppositeAxis": false,
            "offset": 30,
            "scrollbarHeight": 80,
            "backgroundAlpha": 0,
            "selectedBackgroundAlpha": 0.1,
            "selectedBackgroundColor": "#888888",
            "graphFillAlpha": 0,
            "graphLineAlpha": 0.5,
            "selectedGraphFillAlpha": 0,
            "selectedGraphLineAlpha": 1,
            "autoGridCount": true,
            "color": "#AAAAAA"
        },
        "chartCursor": {
            "pan": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha": 1,
            "cursorColor": "#258cbb",
            "limitToGraph": "g1",
            "valueLineAlpha": 0.2,
            "valueZoomable": true
        },
        "valueScrollbar": {
            "oppositeAxis": false,
            "offset": 50,
            "scrollbarHeight": 10
        },
        "categoryField": "date",
        "categoryAxis": {
            "parseDates": true,
            "dashLength": 1,
            "minorGridEnabled": true
        },
        "export": {
            "enabled": true
        },
        "dataProvider": data
    });

    chart.addListener("rendered", zoomChart);

    zoomChart();
}
function zoomChart() {
    chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
}




/**
 * Sends an ajax request of type {mode} to {uri} with payload {data}, 
 * then calls {callback} with the response, request status and {parameters}.
 * If {data} is null or undefined, the request will be sent with no payload.
 * 
 * @param {String} mode
 * @param {String} uri
 * @param {Object} data
 * @param {Function} callback
 * @param {Object} parameters
 */
function ajax(mode, uri, data, callback) {
    var request = new XMLHttpRequest();
    request.onload = function () {
        var response = request.responseText;
        if (response !== "") {
            try {
                response = JSON.parse(response);
            } catch (e) {
            }
        }
        if (callback) callback(response, request.status);
    };
    request.open(mode, uri, true);
    request.setRequestHeader('Content-Type', 'application/json');
    data ? request.send(JSON.stringify(data)) : request.send();
}