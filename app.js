/* global __dirname */

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const controller = require('./controller');

const PORT = (process.env.VCAP_APP_PORT || 3000);

var app = express();


//------------------------------------------------------------------------------
// Request Pre-processing & middleware
//------------------------------------------------------------------------------

// Disable potentially dangerous headers (such as X-powered-by)
app.use(helmet());

// Compress response if supported by client
app.use(compression());


//------------------------------------------------------------------------------
// Express Setup
//------------------------------------------------------------------------------

var router = express.Router();
app.use('/', router);

// Start server
console.log("Server starting on port " + PORT);
module.exports = app.listen(PORT, function (err) {
    if (err) {
        console.error("Failed to start server!");
        console.error(err);
        return process.exit(1);
    }
});


//------------------------------------------------------------------------------
// Routesa
//------------------------------------------------------------------------------

app.use('/', express.static(path.join(__dirname, 'public')));
router.get('/data', controller.getData);
router.post('/run', controller.run);