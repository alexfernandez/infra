'use strict';

require('prototypes');
const async = require('async');
const inits = require('inits');
const median = require('median');
const testing = require('testing');
const log = require('./log.js')
const aws = require('./aws.js')

const highLoad = 90;
const lowLoad = 80;
const prefix = 'infra';
const minutes = 5;
const simulation = false;


exports.orchestrate = function(callback)
{
	getInstanceLoads((error, loads) => {
		const medianLoad = median(loads);
		log.info('Median load for %s instances is %s', loads.length, medianLoad);
		if (medianLoad > highLoad)
		{
			log.info('Median load %s above high load %s, creating instance', medianLoad, highLoad)
			if (simulation) return callback(null);
			const name = prefix + (loads.length + 1);
			aws.createInstance(name, error => {
				if (error) return callback(error);
				log.info('Created instance %s', name);
				return callback(null);
			});
		}
		else if (medianLoad < lowLoad)
		{
			log.info('Median load %s below low load %s, terminating instance', medianLoad, lowLoad)
			if (simulation) return callback(null);
			aws.getInstanceIds(prefix, (error, instanceIds) => {
				if (error) return callback(error);
				const instanceId = instanceIds.last();
				aws.terminateInstance(instanceId, error => {
					if (error) return callback(error);
					log.info('Terminated instance %s', instanceId);
					return callback(null);
				})
			});
		}
		else return callback(null);
	});
}

function getInstanceLoads(callback)
{
	aws.getInstanceIds(prefix, (error, instanceIds) => {
		if (error) return callback(error);
		var tasks = instanceIds.map(instanceId => {
			return callback => {
				aws.getCpuUsage(instanceId, minutes, callback);
			}
		});
		async.series(tasks, callback);
	});
}

function testInstanceLoad(callback)
{
	getInstanceLoads((error, loads) => {
		if (error) return testing.failure('Could not get instance loads: %s', error, callback);
		log.info('Current loads %s', loads);
		testing.success(callback)
	})
}

exports.test = function(callback)
{
	testing.run([
		testInstanceLoad,
	], 10000, callback)
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
	inits.standalone(exports.test);
}

