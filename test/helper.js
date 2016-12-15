'use strict';

const chai = require('chai');
const expect = chai.expect;

let helper = {};

helper.testMessage = (expectedMessage, resBody) => {
  expect(resBody).to.have.property('message');
  expect(expectedMessage).to.equal(resBody.message);
};

module.exports = helper;
