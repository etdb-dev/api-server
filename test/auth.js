'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const cfg = require('./config.json');

const testUsers = require('./bench/users');
const helper = require('./helper');

let testMessage = helper.testMessage;
let test401 = helper.test401;
let testId = helper.testId;

let getCredentialsFor = (accessType) => {
  let userObj = testUsers[accessType];
  return [ userObj.username, userObj.password ];
};

let getIdOf = (username) => {
  let userDoc = module.parent.exports.testUsersInDB.filter((doc) => {
    return doc.username.includes(username);
  })[0];
  return userDoc._id;
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
          });
        });
      });

      describe('POST', () => {

        it('should add a new user', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).post('/auth').auth(name, pw)
                 .send(testUsers.addTestUser)
                 .then((res) => {
                   expect(res).to.have.status(201);
                   testMessage(`${testUsers.addTestUser.username} has been createad`, res.body);
                   module.parent.exports.addUserToInDB('addTestUser');
                   testId('userId', res.body);
                 }).catch((err) => {
                   if (err.status === 409) {
                     err.message = err.message + ' (user already exists)';
                   }
                   throw err;
                 });
        });

        it('should respond with 409, when user already exists', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).post('/auth').auth(name, pw)
          .send(testUsers.addTestUser)
          .catch((err) => {
            expect(err).to.have.status(409);
            testMessage(`user (${testUsers.addTestUser.username}) already exists`, err.response.res.body);
            testId('userId', err.response.res.body);
          });
        });
      });
      break;

    case '/auth/:userId':
      describe('PUT', () => {

        it('should update a user\'s password', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl).put('/auth/' + getIdOf('addTestUser'))
          .auth(name, pw)
          .send({ password: testUsers.addTestUser.password })
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${testUsers.addTestUser.username} has been updated`, res.body);
          });
        });

        it('should let unprivileged users update their own password', () => {
          let [ name, pw ] = getCredentialsFor('addTestUser');
          return chai.request(cfg.baseUrl).put('/auth/' + getIdOf('addTestUser'))
          .auth(name, pw)
          .send({ password: testUsers.addTestUser.password })
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${testUsers.addTestUser.username} has been updated`, res.body);
          });
        });

        it('should deny unprivileged users updating others password', () => {
          let [ name, pw ] = getCredentialsFor('addTestUser');
          return chai.request(cfg.baseUrl).put('/auth/' + getIdOf('readAPI'))
          .auth(name, pw)
          .send({ password: testUsers.readAPI.password })
          .catch((err) => {
            expect(err).to.have.status(401);
          });
        });

      });

      describe('DELETE', () => {

        it('should delete a user', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl)
          .delete('/auth/' + getIdOf('deleteTestUser'))
          .auth(name, pw)
          .then((res) => {
            expect(res).to.have.status(200);
            testMessage(`${testUsers.deleteTestUser.username} has been deleted`, res.body);
          });
        });

        it('should respond with 404, when user is not found', () => {
          let [ name, pw ] = getCredentialsFor('manageUsers');
          return chai.request(cfg.baseUrl)
          .delete('/auth/' + getIdOf('deleteTestUser'))
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
  run: run
};
