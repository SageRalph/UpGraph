const jsonfile = require('jsonfile');
const schedule = require('node-schedule');
const crawl = require('./crawl');

const TESTING = false;

// Data stored in file for now
const DATAPATH = './data.json';

var data = [];
try {
    data = TESTING ? require('./testdata.json') : require(DATAPATH);
} catch (ex) {
    console.error(ex);
}


// Run every midnight
schedule.scheduleJob({ hour: 00, minute: 00 }, function () {
    crawl().then(save);
});


exports.getData = function (req, res, next) {

    // Default to all data
    var d = data;

    // Restrict to this academic year if desired
    if (req.query.recent) {
        var cuttoffDate = termStartDate();
        d = data.filter(r => new Date(r.date) >= cuttoffDate);
    }

    res.json(d);
    next();
};


/**
 * Returns the data of the most recent 1st of August
 * i.e. The start of the current academic year 
 */
function termStartDate() {
    var now = new Date();
    var year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return new Date(year, 7, 1); // 1st of August
}


// TODO - Handle errors / failed crawling
exports.run = function (req, res, next) {
    return crawl().then(function (newData) {
        save(newData);
        res.status(204); // No Content
        return next();
    });
};

function save(crawled) {
    if (!Array.isArray(crawled))
        return console.error('Crawling failed!\nProduced: ' + crawled);

    var newData = { date: new Date() };
    crawled.forEach(soc => newData[soc.name] = soc.members);

    data.push(newData);

    console.log('New data added:');
    console.log(newData);

    jsonfile.writeFile(DATAPATH, data, function (err) {
        console.log(err ? 'Error saving data:' : 'Data saved to file');
        if (err) console.error(err);
    });
}

