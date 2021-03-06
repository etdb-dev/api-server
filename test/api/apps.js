'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const testUsers = require('../bench/users');
const cfg = require('../config.json');
const helper = require('../helper');

let testMessage = helper.testMessage;
let testId = helper.testId;

let _appsInDB = [];

let run = (route) => {

  switch(route) {
    case '/v0/apps':
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
              testId('appId', res.body);
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
              testId('appId', err.response.res.body);
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

      describe('GET', () => {

        it('should get a list of all apps', () => {
          return chai.request(cfg.baseUrl)
            .get(route)
            .set('x-access-token', testUsers.readAPI.token)
            .then((res) => {
              testMessage('applist', res.body);
              expect(res.body.apps).to.be.an.instanceof(Array);
              expect(res.body.apps[0]).to.have.property('name');
              expect(res.body.apps[0]).to.have.property('publisher');
              expect(res.body.apps[0]).to.have.property('store_url');
              _appsInDB.push(_.find(res.body.apps, [ 'name', 'testApp' ]));
            });
        });

      });
      break;
    case '/v0/apps/:appId':
      describe('GET', () => {

        it('should get the data for one app', () => {
          return chai.request(cfg.baseUrl)
            .get(route.replace(':appId', _appsInDB[0]._id))
            .set('x-access-token', testUsers.readAPI.token)
            .then((res) => {
              testMessage('applist', res.body);
              expect(res.body.apps).to.be.an.instanceof(Array);
              expect(res.body.apps.length).to.equal(1);
              expect(res.body.apps[0]).to.have.property('name');
              expect(res.body.apps[0]).to.have.property('publisher');
              expect(res.body.apps[0]).to.have.property('store_url');
            });
        });

      });

      describe('PUT', () => {

        it('should update the data of one app', () => {
          let updateData = {
            name: 'testAppChanged',
            publisher: '/v0/app/:appId PUT test',
            store_url: 'https://play.updated.com'
          };
          return chai.request(cfg.baseUrl)
            .put(route.replace(':appId', _appsInDB[0]._id))
            .set('x-access-token', testUsers.writeAPI.token)
            .send(updateData)
            .then((res) => {
              testMessage('testApp has been updated', res.body);
              testId('appId', res.body);
              let received = res.body.updated;
              delete received._id;
              expect(received).to.eql(updateData);
            });
        });

      });

      describe('DELETE', () => {

        it('should delete an app', () => {
          return chai.request(cfg.baseUrl)
            .delete(route.replace(':appId', _appsInDB[0]._id))
            .set('x-access-token', testUsers.writeAPI.token)
            .then((res) => {
              testMessage('testAppChanged has been deleted', res.body);
            });
        });

      });
      break;
  }
};

module.exports = {
  run: run
};
