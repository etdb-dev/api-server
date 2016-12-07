'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const cfg = require('./config.json');

const accessDefaults = require('../src/const').accessDefaults;
const noRights = _.mapValues(accessDefaults, (value) => {

  return false;
});

let authTests = {
  token: '',
  accessTypes: _.keys(accessDefaults),
  testUser: {}
};

authTests.createAccessObjectFor = (accessType) => {
  let accessValue = {};
  accessValue[accessType] = true;
  return _.assign(noRights, accessValue);
};

authTests.testUser = _.reduce(accessDefaults, (acc, val, key) => {
  let nameSalt = Math.round(Math.random() * 1000000).toString(16);
  let pwSalt = Math.round(Math.random() * 1000000).toString(16);
  acc[key] = {
    username: nameSalt + key,
    password: pwSalt + key,
    access: authTests.createAccessObjectFor(key)
  };
  return acc;
}, authTests.testUser);

authTests.test401 = (done) => {
  chai.request(cfg.baseUrl).get('/auth').end((err) => {
    expect(err).to.have.status(401);
    done();
  });
};

authTests.testMessage = (expectedMessage, resBody) => {
  expect(resBody).to.have.property('message');
  expect(expectedMessage).to.equal(resBody.message);
};

authTests.getCredentialsFor = (accessType) => {
  let userObj = authTests.testUser[accessType];
  return [ userObj.username, userObj.password ];
};

authTests.run = () => {
  describe('/auth', () => {
    describe('GET', () => {

      it('should deny access, when no credentials are given', authTests.test401);

      it('should respond with a JWT, if credentials are valid', (done) => {
        let [ name, pw ] = authTests.getCredentialsFor('readAPI');
        chai.request(cfg.baseUrl)
        .get('/auth')
        .auth(name, pw)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          authTests.token = res.body.token;
          done();
        });
      });
    });

    describe('POST', () => {

      it('should deny access, when no credentials are given', authTests.test401);

      it('should add a new user', (done) => {
        chai.request(cfg.baseUrl)
        .post('/auth')
        .auth('bobby', 'bobby')
        .send(authTests.testUser)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          authTests.testMessage(`${authTests.testUser.username} has been createad`, res.body);
          done();
        });
      });

      it('should respond with 409, when user already exists', (done) => {
        chai.request(cfg.baseUrl)
        .post('/auth')
        .auth('bobby', 'bobby')
        .send(authTests.testUser)
        .end((err, res) => {
          expect(err).to.not.be.null;
          expect(res).to.have.status(409);
          authTests.testMessage(`user (${authTests.testUser.username}) already exists`, res.body);
          done();
        });
      });
    });
  });

  describe('/auth/:user', () => {
    describe('PUT', () => {

      it('should deny access, when no credentials are given', authTests.test401);

      it('should update a user\'s password', (done) => {
        chai.request(cfg.baseUrl)
        .put('/auth/' + authTests.testUser.username)
        .auth('bobby', 'bobby')
        .send({ password: authTests.testUser.password })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          authTests.testMessage(`Password for ${authTests.testUser.username} has been updated`, res.body);
          done();
        });
      });
    });

    describe('DELETE', () => {

      it('should deny access, when no credentials are given', authTests.test401);

      it('should delete a user', (done) => {
        chai.request(cfg.baseUrl)
        .delete('/auth/' + authTests.testUser.username)
        .auth('bobby', 'bobby')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          authTests.testMessage(`${authTests.testUser.username} has been deleted`, res.body);
          done();
        });
      });

      it('should respond with 404, when user is not found', (done) => {
        chai.request(cfg.baseUrl)
        .delete('/auth/' + authTests.testUser.username)
        .auth('bobby', 'bobby')
        .end((err, res) => {
          expect(err).to.not.be.null;
          expect(res).to.have.status(404);
          done();
        });
      });
    });
  });
};

module.exports = authTests;
