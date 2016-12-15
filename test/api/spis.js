'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const testSPIs = require('../bench/json/spis.json');
const testUsers = require('../bench/users');
const cfg = require('../config.json');
const helper = require('../helper');

let testMessage = helper.testMessage;

let addedIds = [];

let run = (route) => {

  switch(route) {

    case '/v0/spis':
      describe('POST', () => {

        it('should add a new SPI', () => {
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send(testSPIs[0])
            .then((res) => {
              expect(res).to.have.status(201);
              testMessage('Gimme-Their-Data Inc. has been added', res.body);
              expect(res.body).to.have.property('added');
              addedIds.push(res.body.added._id);
            });
        });
        it('should respond with 400 when error occurs', () => {
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send({
              Iam: 'totally bogus',
              reallyBogus: true
            })
            .catch((err) => {
              expect(err).to.have.status(400);
              testMessage('Malformed request body', err.response.body);
              expect(err.response.body.err).to.exist;
            });
        });
      });
      break;
  }

};

module.exports = {
  run: run
};
