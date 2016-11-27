# UpGraph

UpGraph will periodically crawl the UPSU website to generate a list of society membership numbers. By default, this is done every midnight.

UpGraph also serves a single page public site featuring an interactive graph of this information and controls for toggling each society.

## API
UpGraph exposes a RESTful API with two routes:
```
GET /data Returns an array of society membership numbers (see below for format)
POST /run Crawl the UPSU website immediatly
```

### Data format
Society data returned by the API will be an array of objects, with a date property, 
and a key for each society (name as appears on UPSU website), the value for which is the societies membership count as of that date.

## Setup
Currently UpGraph saves data to file directly, so no databse setup is required.

If desired, the default port can be changed in app.js.
If hosting using cloud foundary, the environment specified port will be used.

To install, simply move the project files to the desired directory and run the following commands using node:
```
$ npm install
$ npm start
```
If you wish to carry over data from a previous install, copy the old data.json file into the new directory.
