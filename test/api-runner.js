'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-http'));

const db = require('../src/db');
const User = require('../src/db/user');
const authTests = require('./auth');
require('../src/log')();
//const appsTests = require('./apps');

describe('Server', () => {

  it('should be running', done => {
    require('fs').stat('./pid', (err, stats) => {
      expect(err).to.equal(null, 'Please run the server (npm start) before testing the API!\n');
      expect(stats.isFile()).to.be.true;
      done();
    });
  });

  it('should create temporary test users', done => {
    db.connect().then(() => {
      let testUsers = authTests.testUsers;
      let users = [];
      _.forOwn(testUsers, (val, key) => users.push(new User(val)));
      User.create(users).then((docs) => {
        expect(docs.length).to.equal(users.length);
        done();
      }).catch(done);
    });
  });

});

// authTests.run();
//appsTests();
