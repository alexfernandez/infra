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
const minInstances = 1;
const simulation = true;


exports.orchestrate = function()
{
	orchestrateNow(error => {
		if (error) console.error('Could not orchestrate: %s', error)
	})
}

function orchestrateNow(callback)
{
	getInstanceLoads((error, loads) => {
		if (error) return callback(error);
		const medianLoad = median(loads);
		log.info('Median load for %s instances is %s', loads.length, medianLoad);
		sendLoad(medianLoad);
		if (shouldCreate(loads, medianLoad))
		{
			return createInstance(loads.length + 1, callback)
		}
		else if (shouldTerminate(loads, medianLoad))
		{
			return terminateInstance(callback)
		}
		else return callback(null);
	});
}

function getInstanceLoads(callback)
{
	aws.getInstanceIds(prefix, (error, instanceIds) => {
		if (error) return callback(error);
		if (!instanceIds.length) return callback(null, [0])
		var tasks = instanceIds.map(instanceId => {
			return next => {
				aws.getCpuUsage(instanceId, minutes, next);
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

function sendLoad(medianLoad)
{
	aws.sendCustomMetrics([medianLoad], 'infra.pinchito.es', error => {
		if (error) return log.warning('Could not send load');
		log.info('Stored load');
	});
}

function shouldCreate(loads, medianLoad)
{
	if (medianLoad >= highLoad)
	{
		log.info('Median load %s above high load %s, creating instance', medianLoad, highLoad)
		return true;
	}
	return false;
}

function shouldTerminate(loads, medianLoad)
{
	const predictedLoad = medianLoad * loads.length / (loads.length - 1)
	log.info('Predicted load for %s instances is %s', loads.length - 1, predictedLoad);
	if (predictedLoad < lowLoad)
	{
		log.info('Predicted load %s below low load %s, terminating instance', medianLoad, lowLoad)
		return true;
	}
	return false
}

function createInstance(order, callback)
{
	if (simulation)
	{
		log.info('Simulation mode is on; not creating');
		return callback(null);
	}
	const name = prefix + order
	aws.createInstance(name, error => {
		if (error) return callback(error);
		log.info('Created instance %s', name);
		return callback(null);
	});
}

function terminateInstance(callback)
{
	if (simulation)
	{
		log.info('Simulation mode is on; not terminating');
		return callback(null);
	}
	aws.getInstanceIds(prefix, (error, instanceIds) => {
		if (error) return callback(error);
		if (instanceIds.length <= minInstances)
		{
			log.info('Will not terminate instance from %s below min %s', instanceIds.length, minInstances)
			return callback(null)
		}
		const instanceId = instanceIds.last();
		aws.terminateInstance(instanceId, error => {
			if (error) return callback(error);
			log.info('Terminated instance %s', instanceId);
			return callback(null);
		})
	});
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

