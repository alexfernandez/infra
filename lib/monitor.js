'use strict';

const async = require('async')
const inits = require('inits')
const testing = require('testing')
const request = require('basic-request')
const log = require('./log.js')

const domains = [
	'pinchito.es',
	'infra.pinchito.es',
//	'supra.pinchito.es',
]
const CHECK_EVERY_SEC = 60


exports.start = function()
{
	exports.check()
	setInterval(exports.check, CHECK_EVERY_SEC * 1000)
}

exports.check = function(callback = report)
{
	var tasks = domains.map(domain => {
		return function(next)
		{
			request.get('http://' + domain + '/', next)
		}
	})
	async.series(tasks, callback)
}

function report(error)
{
	if (error) return log.error('Could not check domains: ' + error)
	log.info('All checks working')
}

exports.test = function(callback)
{
	testing.run(exports.check, 10000, callback);
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	inits.standalone(exports.test);
}

