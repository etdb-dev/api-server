'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const cfg = require('./config.json');

const _accessDefaults = require('../src/const').accessDefaults;
const noRights = _.mapValues(_accessDefaults, () => false);

let _token;

let createAccessObjectFor = (accessType) => {
  let accessValue = {};
  accessValue[accessType] = true;
  return _.assign(noRights, accessValue);
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

_testUsers.addTestUser = {
  username: 'addTestUser',
  password: 'addTestUser',
  access: {
    'readAPI': false,
    'writeAPI': false,
    'isAdmin': false,
    'manageUsers': false
  },
  noauto: true
};
_testUsers.deleteTestUser = {
  username: 'deleteTestUser',
  password: 'deleteTestUser',
  access: {
    'readAPI': false,
    'writeAPI': false,
    'isAdmin': false,
    'manageUsers': false
  }
};

let test401 = () => {
  chai.request(cfg.baseUrl).get('/auth').end((err) => {
    expect(err).to.have.status(401);
  });
};

let testMessage = (expectedMessage, resBody) => {
  expect(resBody).to.have.property('message');
  expect(expectedMessage).to.equal(resBody.message);
};

let getCredentialsFor = (accessType) => {
  let userObj = _testUsers[accessType];
  return [ userObj.username, userObj.password ];
};

let run = (route) => {
  switch (route) {
    case '/auth':
      describe('GET', () => {

        it('should deny access, when no credentials are given', test401);

        it('should respond with a JWT, if credentials are valid', () => {
          let [ name, pw ] = getCredentialsFor('readAPI');
          return chai.request(cfg.baseUrl).get('/auth').auth(name, pw).then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
            _token = res.body.token;
          });
        });
      });

      describe('POST', () => {

        it('should add a new user', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).post('/auth').auth(name, pw)
                 .send(_testUsers.addTestUser)
                 .then((res) => {
                   expect(res).to.have.status(201);
                   testMessage(`${_testUsers.addTestUser.username} has been createad`, res.body);
                   module.parent.exports.addUserToInDB('addTestUser');
                 }).catch((err) => {
                   throw err;
                 });
        });

        it('should respond with 409, when user already exists', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).post('/auth').auth(name, pw)
          .send(_testUsers.addTestUser)
          .catch((err) => {
            expect(err).to.have.status(409);
            testMessage(`user (${_testUsers.addTestUser.username}) already exists`, err.response.res.body);
          });
        });
      });
      break;

    case '/auth/:user':
      describe('PUT', () => {

        it('should update a user\'s password', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).put('/auth/' + _testUsers.addTestUser.username)
          .auth(name, pw)
          .send({ password: _testUsers.addTestUser.password })
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${_testUsers.addTestUser.username} has been updated`, res.body);
          });
        });

        it('should let unprivileged users update their own password', () => {
          let [ name, pw ] = getCredentialsFor('addTestUser');
          return chai.request(cfg.baseUrl).put('/auth/' + _testUsers.addTestUser.username)
          .auth(name, pw)
          .send({ password: _testUsers.addTestUser.password })
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${_testUsers.addTestUser.username} has been updated`, res.body);
          });
        });

        it('should deny unprivileged users updating others password', () => {
          let [ name, pw ] = getCredentialsFor('addTestUser');
          return chai.request(cfg.baseUrl).put('/auth/' + _testUsers.readAPI.username)
          .auth(name, pw)
          .send({ password: _testUsers.readAPI.password })
          .catch((err) => {
            expect(err).to.have.status(401);
          });
        });

      });

      describe('DELETE', () => {

        it('should delete a user', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl)
          .delete('/auth/' + _testUsers.deleteTestUser.username)
          .auth(name, pw)
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${_testUsers.deleteTestUser.username} has been deleted`, res.body);
          });
        });

        it('should respond with 404, when user is not found', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl)
          .delete('/auth/' + _testUsers.deleteTestUser.username)
          .auth(name, pw)
          .catch((err) => {
            expect(err).to.have.status(404);
          });
        });
      });
      break;
  }
  
};

module.exports = {
  token: _token,
  accessTypes: _.keys(_accessDefaults),
  testUsers: _testUsers,
  run: run
};
