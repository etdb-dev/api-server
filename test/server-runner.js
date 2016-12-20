'use strict';

const db = require('../src/db');

const dbTests = require('./server/db');

require('../src/log')();

describe('Database models', () => {

  let connect = () => {
    return db.connect();
  };

  before(connect);

  describe('Database Model', () => {
    it('should ', () => {
      return dbTests();
    });
  });

});
