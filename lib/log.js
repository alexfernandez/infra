'use strict'

const util = require('util');
const inits = require('inits');
const testing = require('testing');
const email = require('./email.js')

var debugMode = false;

exports.setDebug = function(active = true)
{
	debugMode = active
}

exports.debug = function()
{
	if (debugMode)
	{
		show('debug', arguments)
	}
}

exports.notice = function()
{
	show('notice', arguments)
}

exports.info = function()
{
	show('info', arguments)
}

exports.warning = function()
{
	show('warning', arguments)
}

exports.error = function()
{
	const message = show('error', arguments)
	const subject = 'ERROR: ' + message.split(' ').slice(0, 6).join(' ') + '...'
	const body = 'ERROR ERROR ERROR\n\n' + message + '\n\nPlease take a look'
	email.send(subject, body, (error) => {
		if (error) console.error('Could not send email %s: %s', subject, error)
	})
}

function show(level, messageParameters)
{
	const method = (level == 'error') ? console.error : console.log
	const message = util.format.apply(null, messageParameters)
	method('[' + new Date().toISOString() + '] ' + level.toUpperCase() + ' ' + message);
	return message;
}

exports.test = function(callback)
{
	exports.debug('Hi there, %s', 'chufo')
	exports.info('Ho thoro, %s', 'chufito')
	exports.warning('Please ignore, %s', 'chufine')
	exports.error('Test error, please ignore, %s', 'chufoid');
	testing.success(callback)
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	inits.standalone(exports.test);
}

