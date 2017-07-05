'use strict';

const async = require('async')
const inits = require('inits')
const testing = require('testing')
const request = require('basic-request')
const log = require('./log.js')

let domains = [
	'pinchito.es',
	'infra.pinchito.es',
//	'supra.pinchito.es',
]
const CHECK_EVERY_SEC = 60
let down = new Map();


exports.start = function()
{
	exports.check()
	setInterval(exports.check, CHECK_EVERY_SEC * 1000)
}

exports.check = function(callback = () => {})
{
	const tasks = domains.map(domain => {
		return function(next)
		{
			return checkDomain(domain, next);
		}
	})
	async.series(tasks, callback)
}

function checkDomain(domain, callback)
{
	request.get('http://' + domain + '/', error => {
		if (error) {
			if (!down.get(domain)) {
				log.error('Website %s is DOWN: %s', domain, error);
				down.set(domain, true);
			}
			return callback();
		}
		if (down.get(domain)) {
			log.error('Website %s is UP');
		}
		return callback(null)
	})
}

function testCheck(callback)
{
	const good = 'www.google.com'
	const bad = 'chorticle.chorticle'
	domains = [good, bad]
	exports.check(() => {
		testing.assert(!down.get(good), 'Should not report %s as bad', good, callback);
		testing.assert(down.get(bad), 'Should report %s as bad', bad, callback);
		testing.success(callback);
	});
}

exports.test = function(callback)
{
	testing.run(testCheck, 10000, callback);
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	inits.standalone(exports.test);
}

