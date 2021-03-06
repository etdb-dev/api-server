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

    case '/v0/spis/:spiId':

      describe('GET', () => {
        it('should return data for SPI with :spiId', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .get(route.replace(':spiId', testSPIsInDB[0]._id))
            .set('x-access-token', testUsers.readAPI.token)
            .then((res) => {
              expect(res).to.have.status(200);
              testMessage('data for ' + testSPIsInDB[0].name, res.body);
              expect(res.body.spis[0]._id).to.eql(testSPIsInDB[0]._id);
            });
        });
        it('should return 404 when no SPI with :spiId is found', () => {
          return chai.request(cfg.baseUrl)
            .get(route.replace(':spiId', 'aaaaaaaaaaaaaaaaaaaaaaaa'))
            .set('x-access-token', testUsers.readAPI.token)
            .catch((err) => {
              expect(err).to.have.status(404);
            });
        });
        it('should return 400 when :spiId is not an ObjectId (format check)', () => {
          return chai.request(cfg.baseUrl)
            .get(route.replace(':spiId', 'I\'m totally wrong'))
            .set('x-access-token', testUsers.readAPI.token)
            .catch((err) => {
              expect(err).to.have.status(400);
            });
        });
      });

      describe('PUT', () => {
        it('should update SPI with :spiId', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .put(route.replace(':spiId', testSPIsInDB[0]._id))
            .set('x-access-token', testUsers.writeAPI.token)
            .send({
              name: 'UpdatedSPI',
              protocol: 'HTTP',
              encrypted: false,
              endpoint_url: 'http://data.blackhole.com',
              blah: 'test'
            })
            .then((res) => {
              let updatedSPI = res.body.updated;
              expect(res).to.have.status(200);
              _.assign(testSPIsInDB[0], updatedSPI);
              testMessage(testSPIsInDB[0].name + ' has been updated', res.body);
              expect(updatedSPI._id).to.equal(testSPIsInDB[0]._id);
              expect(updatedSPI.name).to.equal('UpdatedSPI');
              expect(updatedSPI.protocol).to.equal('HTTP');
              expect(updatedSPI.encrypted).to.be.false;
              expect(updatedSPI.endpoint_url).to.equal('http://data.blackhole.com');
            });
        });
        it('should return 404 when no SPI with :spiId is found', () => {
          return chai.request(cfg.baseUrl)
            .put(route.replace(':spiId', 'aaaaaaaaaaaaaaaaaaaaaaaa'))
            .set('x-access-token', testUsers.writeAPI.token)
            .send({ shouldnt: 'matter' })
            .catch((err) => {
              expect(err).to.have.status(404);
            });
        });
      });

      describe('DELETE', () => {
        it('should delete SPI with :spiId', () => {
          let testSPIsInDB = module.parent.exports.testSPIsInDB;
          return chai.request(cfg.baseUrl)
            .delete(route.replace(':spiId', testSPIsInDB[0]._id))
            .set('x-access-token', testUsers.writeAPI.token)
            .then((res) => {
              expect(res).to.have.status(200);
              testMessage(testSPIsInDB[0].name + ' has been deleted', res.body);
              testSPIsInDB.shift();
            });
        });
        it('should return 404 when no SPI with :spiId is found', () => {
          return chai.request(cfg.baseUrl)
            .delete(route.replace(':spiId', 'aaaaaaaaaaaaaaaaaaaaaaaa'))
            .set('x-access-token', testUsers.writeAPI.token)
            .catch((err) => {
              expect(err).to.have.status(404);
            });
        });
      });
      break;
  }

};

module.exports = {
  run: run
};
