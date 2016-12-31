'use strict';

const db = require('../src/db');
const User = db.user;

const dbTests = require('./server/db');
const accessRequestTests = require('./server/access-request.cls');
const accessRequestUser = require('./bench/json/users.json').accessRequestUser;
const constantsTests = require('./server/constants');

const _testDocuments = {};

require('../src/log')();

let setup = () => {
  return db.connect()
    .then((new User(accessRequestUser)).save)
    .then((userDoc) => {
      _testDocuments.accessRequestUser = userDoc;
      return;
    });
};

let cleanup = () => {
  return _testDocuments.accessRequestUser.remove();
};

describe('ETdb api-server', () => {

  before(setup);
  after(cleanup);

  describe('Database Models', function() {
    it('', () => {
      dbTests();
    });
  });

  describe('Classes/Constants', function() {
    it('', () => {
      accessRequestTests(_testDocuments.accessRequestUser);
    });
    it('', () => {
      constantsTests();
    });
  });

});
