'use strict';

const consts = require('../../src/constants');
const chai = require('chai');
const expect = chai.expect;

module.exports = () => {
  describe('src/constants', () => {
    let _accessLevels = [ 'writeAPI', 'readAPI', 'manageUsers', 'isAdmin' ];
    let _denyAll = {
      writeAPI: false,
      readAPI: false,
      manageUsers: false,
      isAdmin: false
    };
    let _readOnly = {
      writeAPI: false,
      readAPI: true,
      manageUsers: false,
      isAdmin: false
    };

    it('should have AccessLevels', () => {
      expect(consts.AccessLevels).to.exist.and.eql(_accessLevels);
    });
    it('should have a denyAll access template', () => {
      expect(consts.AccessDefaults.denyAll).to.exist.and.eql(_denyAll);
    });
    it('should have a readOnly access template', () => {
      expect(consts.AccessDefaults.readOnly).to.exist.and.eql(_readOnly);
    });

  });
};
