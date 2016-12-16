'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const testSPIs = require('../bench/json/spis.json');
const testUsers = require('../bench/users');
const cfg = require('../config.json');
const helper = require('../helper');

let testMessage = helper.testMessage;

let run = (route) => {

  switch(route) {

    case '/v0/spis':
      describe('POST', () => {

        it('should add a new SPI', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .post(route)
            .set('x-access-token', testUsers.writeAPI.token)
            .send(testSPIs[0])
            .then((res) => {
              expect(res).to.have.status(201);
              testMessage('Gimme-Their-Data Inc. has been added', res.body);
              expect(res.body).to.have.property('added');
              testSPIsInDB.push(res.body.added);
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

      describe('GET', () => {
        it('should return a list of all SPIs', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .get(route)
            .set('x-access-token', testUsers.readAPI.token)
            .then((res) => {
              expect(res).to.have.status(200);
              testMessage('list of all SPIs', res.body);
              expect(res.body).to.have.property('spis');
              expect(_.findIndex(res.body.spis, [ '_id', testSPIsInDB[0]._id ])).to.be.above(-1);
            });
        });
      });
      break;

    case '/v0/spis/:name':
      describe('GET', () => {
        it('should return data for SPI with :name', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .get(route.replace(':name', testSPIsInDB[0].name))
            .set('x-access-token', testUsers.readAPI.token)
            .then((res) => {
              expect(res).to.have.status(200);
              testMessage('data for ' + testSPIsInDB[0].name, res.body);
              expect(res.body.spis[0]._id).to.eql(testSPIsInDB[0]._id);
            });
        });
      });

      describe('PUT', () => {
        it('should update an SPI', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .put(route.replace(':name', testSPIsInDB[0].name))
            .set('x-access-token', testUsers.writeAPI.token)
            .send({
              protocol: 'HTTP',
              encrypted: false,
              endpoint_url: 'http://data.blackhole.com'
            })
            .then((res) => {
              let updatedSPI = res.body.updated;
              expect(res).to.have.status(200);
              testMessage(testSPIsInDB[0].name + ' has been updated', res.body);
              expect(updatedSPI._id).to.equal(testSPIsInDB[0]._id);
              expect(updatedSPI.protocol).to.equal('HTTP');
              expect(updatedSPI.encrypted).to.be.false;
              expect(updatedSPI.endpoint_url).to.equal('http://data.blackhole.com');
            });
        });
      });
      break;
  }

};

module.exports = {
  run: run
};
