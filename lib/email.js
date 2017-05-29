'use strict';

var email = require('emailjs')
var inits = require('inits')


const server = email.server.connect({
	user: 'AKIAIZIZXWCCIW6FZJSA',
	password: 'AmIzIMHEt7sK2A7JPBNOBtic9rA1fUVGfB3JBlOU/UuB',
	host: 'email-smtp.eu-west-1.amazonaws.com',
	ssl: true,
});

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
	inits.standalone(exports.test);
}

