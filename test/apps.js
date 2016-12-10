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

        it('should refuse to add when app (name) already exists', () => {
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send({
              name: 'testApp',
              publisher: 'ETdb tests',
              store_url: 'http://play.google.com/testApp'
            }).catch((err) => {
              expect(err).to.have.status(409);
              testMessage('testApp already exists', err.response.res.body);
            });
        });

        it('should refuse to add when mandatory fields are missing', () => {
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send({}).catch((err) => {
              expect(err).to.have.status(400);
              testMessage('Please provide values for all mandatory fields!', err.response.res.body);
              expect(err.response.res.body.missing).to.eql(['name', 'publisher', 'store_url']);
            });
        });

      });
      break;
  }
};

module.exports = {
  run: run
};
