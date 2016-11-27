
var defaultSocNumber = 10; // When page loads, show only this many societies

var chart, data, data, societies;

window.addEventListener('load', function () {
    ajax("GET", "data", null, init);
});

function init(response, status) {
    if (status >= 400 || !response)
        return console.error('Data request failed');

    data = response;
    societies = getSocs(defaultSocNumber);

    drawGraph();
    drawToggles();
}

function getSocs(limit) {
    var socs = Object.keys(data[0]);
    socs.splice(socs.indexOf("date"), 1);
    if (limit && socs.length > limit)
        socs = socs.slice(0, limit);
    //console.log('Societies: ' + socs);
    return socs;
}

function selectAll() {
    societies = getSocs();
    drawToggles();
    drawGraph();
}

/**
 * Removes elem from arr if present, othewise adds elem to arr
 */
function invertMembership(elem, arr) {
    var pos = arr.indexOf(elem);
    if (pos >= 0) {
        arr.splice(pos, 1);
    } else {
        arr.push(elem);
    }
}

function toggleSoc(soc) {
    invertMembership(soc, societies);
    drawGraph();
}

function toggleAll() {
    var all = getSocs();
    all.forEach(function (soc, i) {
        var toggle = document.getElementById('toggle' + i);
        toggle.checked = !toggle.checked;
        invertMembership(soc, societies);
    });
    drawGraph();
}

function drawToggles() {

    var socs = getSocs();
    var toggles = document.getElementById('toggles');
    toggles.innerHTML = '';

    // Create a checkbox, inside a label, inside an li for each society
    for (var i = 0; i < socs.length; i++) {
        var soc = socs[i];
        var socSize = data[[data.length - 1]][soc];
        var li = document.createElement('li');
        var label = document.createElement('label');
        var cb = document.createElement('input');
        cb.id = "toggle" + i;
        cb.type = 'checkbox';
        if (societies.indexOf(socs[i]) >= 0)
            cb.checked = 'true';
        cb.onclick = toggleSoc.bind(null, soc);
        label.innerHTML = soc + ' (' + socSize + ' members)';
        label.insertBefore(cb, label.firstChild);
        li.appendChild(label);
        toggles.appendChild(li);
    }
}

function drawGraph() {

    var graphs = [];
    //console.log(data);
    //onsole.log(societies);

    // Define lines to draw on graph
    societies.forEach(function (socName, i) {
        graphs.push({
            "id": "g" + i,
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "bulletSize": 5,
            "hideBulletsCount": 50,
            "lineThickness": 2,
            "title": socName,
            "useLineColorForBulletBorder": true,
            "valueField": socName,
            "balloonText": "<span style='font-size:1.2em;'>[[title]] : [[value]]</span>"
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