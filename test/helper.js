'use strict';

const chai = require('chai');
const expect = chai.expect;

const cfg = require('./config.json');

let helper = {};

helper.testMessage = (expectedMessage, resBody) => {
  expect(resBody).to.have.property('message');
  expect(expectedMessage).to.equal(resBody.message);
};

helper.test401 = () => {
  chai.request(cfg.baseUrl).get('/auth').end((err) => {
    expect(err).to.have.status(401);
  });
};

helper.testId = (fieldName, resBody) => {
  expect(resBody).to.have.property(fieldName);
  expect(resBody[fieldName]).to.match(/^[\da-f]{24}$/);
};

module.exports = helper;
