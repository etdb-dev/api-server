'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const testUsers = require('./testusers');
const cfg = require('./config.json');

let testMessage = (expectedMessage, resBody) => {
  expect(resBody).to.have.property('message');
  expect(expectedMessage).to.equal(resBody.message);
};

let run = (route) => {

  switch(route) {
    case '/v1/apps':
      describe('POST', () => {
        it('should add a new app', () => {
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send({
              name: 'testApp',
              publisher: 'ETdb tests',
              store_url: 'http://play.google.com/testApp'
            }).then((res) => {
              expect(res).to.have.status(201);
              testMessage('testApp has been createad', res.body);
            });
        });
      });
      break;
  }
};

module.exports = {
  run: run
};
