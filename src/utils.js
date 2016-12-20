'use strict';

const fs = require('fs');

var utils = {};

utils.walk = function(dir, done) {
  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err) {
      return done(err);
    }
    var pending = list.length;
    if (!pending) {
      return done(null, results);
    }
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          utils.walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          results.push(file);
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

utils.padNumber = (n, digits) => {
  let pad = Array(digits).fill('0').join('');
  return pad.substring(0, digits - n.toString().length) + n;
};

// http://stackoverflow.com/a/722732
utils.traverse = (obj, prefix, func) => {
  for (var i in obj) {
    func.apply(this, [ i, obj[i], prefix ]);
    if (obj[i] !== null && typeof obj[i] === 'object') {
      //going on step down in the object tree!!
      utils.traverse(obj[i], prefix + i, func);
    }
  }
};

// http://stackoverflow.com/a/8809472
utils.generateUUID = () => {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

utils.isObjectId = (id) => /^[\da-f]{24}$/.test(id);

module.exports = utils;
