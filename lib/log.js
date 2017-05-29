'use strict'

const inits = require('inits');
const testing = require('testing');
const email = require('./email.js')

var debugMode = false;

exports.setDebug = function(active = true)
{
	debugMode = active
}

exports.debug = function(message)
{
	if (debugMode)
	{
		show('DEBUG', message)
	}
}

exports.info = function(message)
{
	show('INFO', message)
}

exports.warning = function(message)
{
	show('WARNING', message)
}

exports.error = function(message, callback = (error) => {if (error) console.error('Could not send email: ' + error)})
{
	show('ERROR', message)
	const subject = 'ERROR: ' + message.split(' ').slice(0, 6).join(' ') + '...'
	const body = 'ERROR ERROR ERROR\n\n' + message + '\n\nPlease take a look'
	email.send(subject, body, callback)
}

function show(level, message)
{
	var method = (level == 'ERROR') ? console.error : console.log
	method('[' + new Date().toISOString() + '] ' + level + ' ' + message);
}

exports.test = function(callback)
{
	exports.debug('Hi there')
	exports.info('Ho thoro')
	exports.warning('Please ignore')
	exports.error('Test error, please ignore', (error) => {
		if (error) return testing.failure(error)
		testing.success(callback)
	})
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	inits.standalone(exports.test);
}

