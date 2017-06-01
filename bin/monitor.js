'use strict';

const inits = require('inits')
const monitor = require('../lib/monitor.js')

inits.standalone(monitor.start)

