'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;

const db = require('../src/db');
const User = db.user;
require('../src/log')();

const authTests = require('./auth');
//const appsTests = require('./apps');

let testUsersInDB = [];

let runTests = () => {

  return new Promise((resolve, reject) => {
    describe('ETdb API v1', () => {

      before(setup);
      after(cleanup);

      describe('Server', () => {

        it('should be running', done => {
          require('fs').stat('./pid', (err, stats) => {
            expect(err).to.equal(null, 'Please run the server (npm start) before testing the API!\n');
            expect(stats.isFile()).to.be.true;
            done();
          });
        });

      });

      describe('/auth', () => {
        authTests.run();
      });
      
    });
  });

};

let setup = () => {
  db.connect().then(() => {
    let testUsers = authTests.testUsers;
    _.forOwn(testUsers, (userData) => !userData.noauto ? testUsersInDB.push(new User(userData)) : void 0);
    User.create(testUsersInDB).then((docs) => {
      expect(docs.length).to.equal(testUsersInDB.length);
    });
  });
};

let cleanup = () => {
  return new Promise((resolve, reject) => {
    let testUser_ids = _.map(testUsersInDB, (user) => user._id);
    return User.remove({ _id: { $in: testUser_ids } })
    .then(resolve)
    .catch(reject);
  });
};

runTests();
