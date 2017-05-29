'use strict';

const inits = require('inits')
const log = require('../lib/log.js')
const orchestrator = require('../lib/orchestrator.js')

const orchestrateEverySec = 60;

inits.log = log;
inits.standalone(start)


function start()
{
	orchestrator.orchestrate();
	setInterval(orchestrator.orchestrate, orchestrateEverySec * 1000);
}

