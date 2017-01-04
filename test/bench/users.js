'use strict';

const _ = require('lodash');

const constants = require('../../src/constants');

let createAccessObjectFor = (accessLevel) => _.defaults({ [accessLevel]: true },
                                                        constants.AccessDefaults.denyAll);

let _testUsers = _.reduce(constants.AccessLevels, (users, username) => {
  let nameSalt = Math.round(Math.random() * 1000000).toString(16);
  let pwSalt = Math.round(Math.random() * 1000000).toString(16);
  let accessObject = createAccessObjectFor(username);

  accessObject.test = true;

  users[username] = {
    username: nameSalt + username,
    password: pwSalt + username,
    access: accessObject
  };

  return users;
}, {});

_.assign(_testUsers, require('./json/users.json'));

module.exports = _testUsers;
