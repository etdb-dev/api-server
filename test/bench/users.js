'use strict';

const _ = require('lodash');

const _accessDefaults = require('../../src/constants').accessDefaults;
const noRights = _.mapValues(_accessDefaults, () => false);

let createAccessObjectFor = (accessType) => {
  let accessValue = {};
  accessValue[accessType] = true;
  return _.defaults(accessValue, noRights);
};

let _testUsers = _.reduce(_accessDefaults, (acc, val, key) => {
  let nameSalt = Math.round(Math.random() * 1000000).toString(16);
  let pwSalt = Math.round(Math.random() * 1000000).toString(16);
  acc[key] = {
    username: nameSalt + key,
    password: pwSalt + key,
    access: createAccessObjectFor(key)
  };
  return acc;
}, {});

_.assign(_testUsers, require('./json/users.json'));

module.exports = _testUsers;
