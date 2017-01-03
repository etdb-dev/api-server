'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;

const db = require('../src/db');
const User = db.user;
const App = db.app;
const SPI = db.spi;
const authController = require('../src/controller/auth');
require('../src/log')();

const testUsers = require('./bench/users');

const authTests = require('./api/auth');
const appsTests = require('./api/apps');
const spiTests = require('./api/spis');

let _testUsersInDB = [];
let _testSPIsInDB = [];

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

      describe('/auth/:userId', () => {
        authTests.run('/auth/:userId');
      });

      describe('/v0/apps', () => {
        appsTests.run('/v0/apps');
      });
      describe('/v0/apps/:appId', () => {
        appsTests.run('/v0/apps/:appId');
      });

      describe('/v0/spis', () => {
        spiTests.run('/v0/spis');
      });
      describe('/v0/spis/:spiId', () => {
        spiTests.run('/v0/spis/:spiId');
      });
    });
  });

};

let setup = () => {
  return db.connect().then(() => {
    _.forOwn(testUsers, (userData) => !userData.noauto ? _testUsersInDB.push(new User(userData)) : void 0);
    return User.create(_testUsersInDB).then((docs) => {
      expect(docs.length).to.equal(_testUsersInDB.length);
      _.each(testUsers, (user, key) => setTokenFor(key));
    });
  });
};

let cleanup = () => {
  describe('Cleanup', () => {
    it('Delete all test users', () => {
      let testUser_ids = _.map(_testUsersInDB, (user) => user._id);
      return User.remove({ _id: { $in: testUser_ids } }).then((delCmd) => {
        expect(delCmd.result.ok).to.equal(1);
        expect(delCmd.result.n).to.equal(_testUsersInDB.length - 1);
      });
    });
    it('Delete all test apps', () => {
      return App.remove({ name: new RegExp('^testApp.*') }).then((delCmd) => {
        expect(delCmd.result.ok).to.equal(1);
      });
    });
    it('Delete all test SPIs', () => {
      if (_testSPIsInDB.length === 0) return new Promise((resolve) => resolve());
      let testSPI_ids = _.map(_testSPIsInDB, (spi) => spi._id);
      return SPI.remove({ _id: { $in: testSPI_ids } }).then((delCmd) => {
        expect(delCmd.result.ok).to.equal(1);
        expect(delCmd.result.n).to.equal(testSPI_ids.length);
      });
    });
  });
};

runTests();

module.exports = {
  testUsersInDB: _testUsersInDB,
  testSPIsInDB: _testSPIsInDB,
  addUserToInDB: (name) => {
    User.findOne({ username: name }).then((userDoc) => {
      _testUsersInDB.push(userDoc);
    });
  }
};
