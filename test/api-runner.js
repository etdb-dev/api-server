'use strict';
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const authTests = require('./auth');
//const appsTests = require('./apps');

describe('Server', () => {
  it('should be running', done => {
    require('fs').stat('./pid', (err, stats) => {
      expect(err).to.equal(null, 'Please run the server (npm start) before testing the API!\n');
      expect(stats.isFile()).to.be.true;
      done();
    });
  });
  it('should accept temporary test users', (done) => {
    done();
  });
});

authTests.run();
//appsTests();
