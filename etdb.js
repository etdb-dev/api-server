#!/bin/env node
'use strict';

const db = require('./src/db');
const server = require('./src/server');

require('./src/log')();

process.on('SIGINT', () => {
  process.exit(0);
});

db.connect()
.then(server.start)
.catch((err) => {
  logError('Startup sequence was interrupted by an error:');
  logError(err.message);
  logVerbose(err.stack, true);
  process.exit(1);
});
