
var defaultSocNumber = 10; // When page loads, show only this many societies

var chart, data, data, societies;

window.addEventListener('load', function () {
    ajax("GET", "data", null, init);
});

/**
 * Callback for society data request.
 * Instantiates data-based user interface components.
 */
function init(response, status) {
    if (status >= 400 || !response)
        return console.error('Data request failed');

    data = response;
    societies = getSocs(defaultSocNumber);

    drawGraph();
    listSocs();
}

/**
 * Returns a list of current societies, up to limit (or all if not set).
 */
function getSocs(limit) {
    var socs = Object.keys(data[0]);
    socs.splice(socs.indexOf("date"), 1);
    if (limit && socs.length > limit)
        socs = socs.slice(0, limit);
    //console.log('Societies: ' + socs);
    return socs;
}

/**
 * Sets all societies to be displayed on the graph
 */
function selectAll() {
    societies = getSocs();
    listSocs();
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

/**
 * Inverts whether soc should be displayed on the graph.
 */
function toggleSoc(soc) {
    invertMembership(soc, societies);
    drawGraph();
}

/**
 * Inverts the list of societies to be displayed on the graph.
 */
function toggleAll() {
    var all = getSocs();
    all.forEach(function (soc, i) {
        var toggle = document.getElementById('toggle' + i);
        toggle.checked = !toggle.checked;
        invertMembership(soc, societies);
    });
    drawGraph();
}

/**
 * Updates the tbody 'socs' with a list of all current societies,
 * their current membership numbers, membership trends over the last
 * day and week, and an option for toggling them on the graph.
 */
function listSocs() {
    var socs = getSocs();
    var tbody = document.getElementById('socs');

    // Remove any existing rows (excluding table headers)
    tbody.innerHTML = "";

    // Add a row for each society
    for (var i = 0; i < socs.length; i++) {
        var soc = socs[i];
        var row = document.createElement('tr');
        row.appendChild(td(soc));               // Society name
        row.appendChild(td(socSize(soc)));      // Current membership
        row.appendChild(td(socGrowth(soc, 7))); // 7 day growth
        row.appendChild(td(socGrowth(soc, 1))); // 1 day growth

        // Checkbox for toggling on graph
        var cb = document.createElement('input');
        cb.id = "toggle" + i;
        cb.type = 'checkbox';
        if (societies.indexOf(soc) >= 0)
            cb.checked = 'true';
        cb.onclick = toggleSoc.bind(null, soc);
        row.appendChild(td(cb));

        tbody.appendChild(row);
    }
}

/**
 * Returns a td element containing content.
 * If content is an object, it will be appended as a child.
 */
function td(content) {
    var td = document.createElement('td');
    if (typeof content === 'object') {
        td.appendChild(content);
    } else {
        td.innerHTML = content;
    }
    return td;
}

/**
 * Returns the total membership of soc.
 * If daysAgo is specified, the value from that date will be returned.
 * If soc is not found, will return 0
 * 
 * Note: This assumes all items in data are one day 
 * apart and that there are no missing intervals.
 */
function socSize(soc, daysAgo) {
    var dl = data.length;
    if (!daysAgo || daysAgo === 0) {
        return data[[dl - 1]][soc] || 0;
    }
    var i = daysAgo + 1;
    return dl >= i ? data[[dl - i]][soc] || 0 : 0;
}

/**
 * Returns the number of new members of soc over a period of days.
 */
function socGrowth(soc, days) {
    return socSize(soc) - socSize(soc, days);
}

/**
 * Generates and draws a graph of society membership over time.
 * Only selected societies (members of the societies array) will be drawn.
 */
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