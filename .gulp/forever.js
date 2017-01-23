'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const forever = require('forever');
const path = require('path');

const PLUGIN_NAME = 'gulp-forever';
const FOREVER_CONFIG_DEFAULTS = {
  'uid': 'etdb-api-dev',
  'sourceDir': '/var/wwn/etdb/api-server',
  'append': false,
  'watch': true,
  'watchDirectory': '/var/wwn/etdb/api-server/src',
  'watchIgnore': null,
  'pidFile': '/var/wwn/etdb/api-server/.dev/api-server.pid',
  'logFile': '/var/wwn/etdb/api-server/.dev/api-server.log'
};

class GulpForever {

  constructor(cfgPaths) {

    if (cfgPaths instanceof Array) {
      this.configs = cfgPaths.reduce((acc, path) => {
        let cfg = require(path.resolve(path));
        if (acc[cfg.uid]) {
          throw new PluginError(PLUGIN_NAME, 'Forever configs must have unique `uid`s.');
        }
        acc[cfg.uid] = cfg;
      }, {});
    } else if (typeof cfgPaths === 'string') {
      let cfg = require(path.resolve(cfgPaths));
      this.configs = { [ cfg.uid ]: cfg };
    } else {
      throw new PluginError(PLUGIN_NAME, 'Please provide a path (or paths as array) to a forever config file.');
    }

    forever.load({
      loglength: 20,
      stream: true
    });
  }

  startDaemon(uid) {
    if (!this.configs[uid]) {
      throw new PluginError(PLUGIN_NAME, `No configuration for uid ${uid} loaded.`);
    }
    forever.startDaemon('etdb.js', this.configs[uid]);
    this.list().then((procs) => console.log(procs));
  }

  stop(uids) {
    return new Promise((resolve) => {
      if (uids === 'all') {
        return forever.stopAll(false).on('stopAll', resolve);
      }
      if (typeof uids === 'string') {
        uids = [ uids ];
      }

      let stopsDone = 0;
      let stoppedProcs = {};

      let done = (targetUid, procs) => {
        stopsDone++;
        if (procs.length > 0) {
          stoppedProcs[targetUid] = procs;
        }
        if (stopsDone === uids.length) {
          resolve({ n: stopsDone, procs: stoppedProcs});
        }
      };

      this.isRunning(uids).then((procs) => {
        if (procs.length === 0) {
          throw new PluginError(PLUGIN_NAME, `No process for ${uids} running.`);
        }
        for (let uid of uids) {
          forever.stop(uid).on('stop', (stopped) => done(uid, stopped));
        }
      });

    });
  }

  list() {
    return new Promise((resolve, reject) => {
      forever.list(false, (err, procs) => {
        if (err) {
          return reject(new PluginError(PLUGIN_NAME, err.message));
        }
        resolve(procs);
      });
    });
  }

  isRunning(uids) {
    if (!uids) {
      return this.list();
    }
    return this.list().then((procs) => {
      let targetProcs = (procs || []).filter((procMeta) => uids.indexOf(procMeta.uid) > -1);
      return targetProcs;
    });
  }

  tail(uid, cb) {
    if (!this.configs[uid]) {
      throw new PluginError(PLUGIN_NAME, `No configuration for uid ${uid} loaded.`);
    }

    forever.tail(this.configs[uid].file, { stream: true }, (err, data) => {
      if (err) {
        return setTimeout(() => this.tail(uid, cb), 2000);
      }
      cb(data);
    });
  }
}

module.exports = GulpForever;
