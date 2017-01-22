'use strict';

const nodeUtil = require('util');
const winston = require('winston');
const colors = require('colors/safe');
const utils = require('./utils');
const config = require('./config');
const _ = require('lodash');
const path = require('path');

/**
 * App logging
 * @module src/log
 */

/**
 * Loglevel and -color mappings
 * @type {Object}
 * @property {Object.<string, number>} levels
 * @property {Object.<string, string>} colors Colors for log levels. Keys must match keys in .levels.
 */
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    verbose: 4,
    debug: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'white',
    verbose: 'cyan',
    debug: 'magenta',
    success: 'green',
    timestamp: 'grey' // doesn't map to an actual log level
  }
};

colors.setTheme(logLevels.colors);

let log = {
  winston: null
};

/**
 * @typedef {WinstonFormatOptions} Otions passed to winston formatter
 * @property {boolean} colorize
 * @property {boolean} json
 * @property {string} level
 * @property {string} message
 * @property {object} meta
 * @property {undefined} stringify
 * @property {boolean} timestamp
 * @property {boolean} showLevel
 * @property {boolean} prettyPrint
 * @property {boolean} raw
 * @property {object} label
 * @property {boolean} logstash
 * @property {object} depth
 * @property {function} formatter
 * @property {boolean} align
 * @property {boolean} humanReadableUnhandledException
 */

/**
 * Formating factory for nicer winston CLI output
 * @param  {WinstonFormatOptions} options winston formating options
 * @return {string}
 * @see [winston readme]{@link https://github.com/winstonjs/winston#custom-log-format}
 * @example
 * formatCLI(options);
 * > '[51:56.337] [/path/filename] - debug: debug test'
 */
let formatCLI = (options) => {
  // _.keys(options).forEach((key) => console.log(` * @property {${typeof options[key]}} ${key}`));
  let hasMeta = Object.keys(options.meta).length > 0;
  let label = buildModuleTag();
  let timestamp = buildTimeStamp(config.get('stardates') || false);
  let level = colors[options.level](options.level);
  let meta = nodeUtil.inspect(options.meta);
  let message = colorize(hasMeta ? `${options.message} ${meta}` : options.message);
  return `${timestamp} [${label}] - ${level}: ${message}`;
};

/**
 * Formating factory for nice winston file system output
 * @param  {WinstonFormatOptions} options winston formating options
 * @return {string}
 * @see [winston readme]{@link https://github.com/winstonjs/winston#custom-log-format}
 * @example
 * formatFS(options);
 * > '[51:56.337] [/path/filename] - debug: debug test'
 */
let formatFS = (options) => {
  // [ISO-date] [label]
  let label = buildModuleTag();
  let level = options.level.slice(0, 1).toUpperCase();
  let isoDate = (new Date()).toISOString();
  return `[${isoDate} > ${level} < ${label}]: ${options.message}`;
};

/**
 * [buildTimeStamp description]
 * @param   {bool}   useStardates Format timestamp as Star Trek stardate (doesn't reflect time, only down to days!)
 * @returns {string} Formated timestamp
 * @example
 * // [minutes:seconds.miliseconds]
 * buildTimeStamp();
 * > '[46:39.102]'
 * buildTimeStamp(false);
 * > '[46:39.104]'
 * // [Star Trek stardate]
 * // see http://trekguide.com/Stardates.htm
 * buildTimeStamp(true);
 * > '[70312.8]'
 */
let buildTimeStamp = (useStardates) => {
  let d = new Date();
  let stamp;

  if (useStardates) {
    /* Thanks for doing the math! :)
     http://trekguide.com/
    */
    let origin = new Date('July 15, 1987 00:00:00');
    stamp = `[${Math.floor((d.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24 * 0.036525) + 410000) / 10}]`;
  } else {
    let fields = {
      mins: utils.padNumber(d.getMinutes(), 2),
      secs: utils.padNumber(d.getSeconds(), 2),
      mils: utils.padNumber(d.getMilliseconds(), 3)
    };
    stamp = `[${fields.mins}:${fields.secs}.${fields.mils}]`;
  }
  return colorize(stamp, true);
};

/**
 * Colorizes CLI output by its loglevel
 * @param  {string}  msg      Text to colorize. Allows inline coloring - see example
 * @param  {Boolean} isTstamp Use timestamp, instead of log level color
 * @return {string}           Colorized input string
 * @see [colors]{@link https://www.npmjs.com/package/colors#text-colors}
 * @example
 * // GET in red letters
 * colorize('Answering / route [c=red]GET[\\c]');
 * ~> [supported colors]{@link https://www.npmjs.com/package/colors#text-colors}
 * // works with log level mappings
 * colorize('Answering / route [c=debug]GET[\\c]');
 */
let colorize = (msg, isTstamp) => {
  let color;
  if (isTstamp) {
    color = logLevels.colors['timestamp'];
  } else {
    let inlineColorRX = /\[c\=(\w+)\](.*)\[\\c\]/g;
    let inlineColorMatch;
    if (inlineColorRX.test(msg)) {
      inlineColorRX.lastIndex = 0;

      while ((inlineColorMatch = inlineColorRX.exec(msg)) !== null) {
        msg = msg.replace(inlineColorMatch[0],
                          colors[inlineColorMatch[1]](inlineColorMatch[2]));
      }
      return msg;
    }
    color = 'reset';
  }
  return colors[color](msg);
};

/**
 * Builds [/path/filename] tag for log outputs.
 * Path/filename are derived from an error stack
 * @return {string} Either the found [/path/filename] tag or [not/found]
 */
let buildModuleTag = () => {
  let appDir = path.dirname(require.main.filename);
  let fnRX = new RegExp(`\\(?${appDir}\\/(?!node_modules)(.*)\.js(:\\d+:\\d+)\\)?`);
  Error.stackTraceLimit = config.get('stackTraceLimit') || 25;
  let stack = new Error().stack;
  stack = stack.split('\n').filter((line) => {
    return line.indexOf('buildModuleTag') === -1 &&
           line.indexOf('formatCLI') === -1 &&
           line.indexOf('formatFS') === -1;
  }).join('\n');
  let fnMatch = stack.match(fnRX);
  return fnMatch ? `/${fnMatch[1]}${config.get('longLogTags') ? fnMatch[2] : ''}` : 'not/found';
};

let registerGlobals = () => {
  _.mapKeys(logLevels.levels, (value, key) => {
    let debugLog = process.env.etdb_testing ? () => void 0 : log.winston.debug;
    let globalKey = `log${key[0].toUpperCase()}${key.slice(1)}`;
    debugLog(`Registering global.${globalKey} -> log.winston.${key}`);
    global[globalKey] = process.env.etdb_testing ? () => void 0 : log.winston[key];
  });
};

/**
 * Returns install- or default logger
 * @param  {?string} logger Name of logger to return
 * @memberOf module:src/log
 * @return {module:src/log}
 */
module.exports = (install) => {

  if (!log.winston) {
    if (install) {
      log.winston = new winston.Logger({
        levels: logLevels.levels,
        transports: [
          new (winston.transports.Console)({
            name: 'cli-install',
            level: 'debug',
            formatter: formatCLI
          }),
          new (winston.transports.File)({
            name: 'fs-install',
            level: 'info',
            colorize: false,
            filename: './install.log',
            json: false,
            tailable: true,
            formatter: formatFS
          })
        ]
      });
    } else {
      log.winston = new winston.Logger({
        levels: logLevels.levels,
        transports: [
          new (winston.transports.Console)({
            name: 'cli-default',
            level: 'debug',
            formatter: formatCLI
          }),
          new (winston.transports.File)({
            name: 'fs-default',
            level: 'info',
            colorize: false,
            filename: './logs/etdb.log',
            maxsize: 1000000,
            maxFiles: 7,
            json: false,
            tailable: true,
            zippedArchive: true,
            formatter: formatFS
          })
        ]
      });
    }
    registerGlobals();
  }
  return log.winston;
};
