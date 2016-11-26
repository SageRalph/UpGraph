const request = require('request-promise') // Easy to use http requests
const cheerio = require('cheerio') // Basically jQuery for node
//const fs = require('fs-jetpack') // Super easy/sync fs access
const moment = require('moment') // Anything related to time
const lodash = require('lodash')

// basic options needed
const baseOpts = {
    url: null,
    transform: cheerio.load
}

// Function that sets the url on a new baseOpts object
const newReq = url => Object.assign(
    {},
    baseOpts,
    { url }
)

// Send a request to the membership page
module.exports = function(){
    return request(newReq('https://membership.upsu.net/'))

	// When it's done...
	.then ($ => {
            const links = []
            $('body > div > div:nth-child(3) > div > div > div > a')
                    .each(function () {
                            links.push($(this).attr('href')) // Put all of the soc page links into an array
                    })

            // Send a request for ALL of those
            return Promise.all(links.map(l => request(newReq(l))))
	})

	// When all the requests for the other pages are done...
	.then(pages =>
            pages
                // Turn each page into an object of...
                .map($ => ({
                        members:
                        $('#top > div.container > div > div > div > div:nth-child(2) > h3 > span').html() // Society Members
                        || $('#top > div.container > div > div > div > div > h3 > span').html(), // OR Social Group Members
                        name: $('#top > div.container > div > div > h2').text() // Name of Society
                }))
                // Then format them nicely
                .map(m => ({
                        members: parseInt(/^(\d+)/.exec(m.members.trim())[1],10),
                        name: m.name.trim(),
                }))
	)

	// Finally write all that data to a timestamped file
	.then(data => {
            var sortedList = lodash.sortBy(data,['members','name'])
            var reversed = lodash.reverse(sortedList)
            //fs.write(`./${moment().format('DDMMYYYY-HHmmss')}-out.json`, reversed)
            return reversed
        })
}
