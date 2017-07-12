'use strict';

var email = require('emailjs')
var access = require('./.email-access.json')


const server = email.server.connect(access);

exports.send = function(subject, text, callback)
{
	server.send({
		from: 'sysadmin@pinchito.es',
		to: 'alexfernandeznpm@gmail.com',
		subject,
		text,
	}, callback);
}

exports.test = function(callback)
{
	exports.send('test emailjs', 'Test mail for emailjs', callback);
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	exports.test(error => {
		if (error) console.error(error)
	});
}

