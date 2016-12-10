'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;

const db = require('../src/db');
const User = db.user;
const authController = require('../src/controller/auth');
require('../src/log')();

const testUsers = require('./testusers');
const authTests = require('./auth');
const appsTests = require('./apps');

let _testUsersInDB = [];

let setTokenFor = (accessType) => {
  let targetUser = testUsers[accessType];
  targetUser.token = authController.signToken({
    username: targetUser.username,
    access: targetUser.access
  });
};

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
        authTests.run('/auth');
      });

      describe('/auth/:user', () => {
        authTests.run('/auth/:user');
      });

      describe('/v1/apps', () => {
        appsTests.run('/v1/apps');
      });
    });
  });

};

let setup = () => {
  return db.connect().then(() => {
    _.forOwn(testUsers, (userData) => !userData.noauto ? _testUsersInDB.push(new User(userData)) : void 0);
    User.create(_testUsersInDB).then((docs) => {
      expect(docs.length).to.equal(_testUsersInDB.length);
      _.each(testUsers, (user, key) => setTokenFor(key));
    });
  });
};

let cleanup = () => {
  describe('Cleanup', () => {
    it('should delete all test users', () => {
      let testUser_ids = _.map(_testUsersInDB, (user) => user._id);
      return User.remove({ _id: { $in: testUser_ids } }).then((delCmd) => {
        expect(delCmd.result.ok).to.equal(1);
        expect(delCmd.result.n).to.equal(_testUsersInDB.length - 1);
      });
    });
  });
};

runTests();

module.exports = {
  testUsersInDB: _testUsersInDB,
  addUserToInDB: (name) => {
    User.findOne({ username: name }).then((userDoc) => {
      _testUsersInDB.push(userDoc);
    });
  }
};
