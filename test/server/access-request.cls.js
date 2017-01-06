'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const AccessRequest = require('../../src/access-request.cls');
const routeLevels = require('../../src/route-access-levels.map.json');

module.exports = (accessRequestUser) => {

  describe('AccessRequest', function() {

    // dummy response object
    let testRes = {};

    /**
     * "/v0/spis": {
     *   "GET": [ "readAPI" ],
     *   // used for test
     *   "POST": [ "writeAPI" ]
     * }
     */
    let noSelfReq = {
      originalUrl: '/v0/spis',
      method: 'POST',
      tokenPayload: {
        userId: accessRequestUser._id,
        username: accessRequestUser.username,
        password: accessRequestUser.password,
        access: accessRequestUser.access
      }
    };

    /**
     * "/auth/users": {
     *   "GET": [ "manageUsers", true ]
     * }
     */
    let allowSelfReq = {
      originalUrl: '/auth/users',
      method: 'GET',
      tokenPayload: {
        userId: accessRequestUser._id,
        username: accessRequestUser.username,
        password: accessRequestUser.password,
        access: accessRequestUser.access
      }
    };

    /**
      * "/auth/*": {
      *   "PUT": [ "manageUsers", true ],
      *   // used for test
      *   "DELETE": [ "manageUsers", true ]
      * }
     */
    let wildcardReq = {
      originalUrl: '/auth/9c38a5a002739a48f427e3884',
      method: 'DELETE',
      tokenPayload: {
        userId: accessRequestUser._id,
        username: accessRequestUser.username,
        password: accessRequestUser.password,
        access: accessRequestUser.access
      }
    };

    let invalidReq = {
      originalUrl: '/very/wrong/path',
      method: 'GET',
      tokenPayload: {
        userId: accessRequestUser._id,
        username: accessRequestUser.username,
        password: accessRequestUser.password,
        access: accessRequestUser.access
      }
    };

    let allowSelfRequest = new AccessRequest(allowSelfReq, testRes);
    let noSelfRequest = new AccessRequest(noSelfReq, testRes);
    let wildcardRequest = new AccessRequest(wildcardReq, testRes);
    let invalidRequest = new AccessRequest(invalidReq, testRes);

    it('should have property #tokenData', () => {
      expect(allowSelfRequest).to.have.property('tokenData', allowSelfReq.tokenPayload);
    });

    it('should have property #userAccess', () => {
      expect(allowSelfRequest).to.have.property('userAccess', accessRequestUser.access);
    });

    it('should have property #res', () => {
      expect(allowSelfRequest).to.have.property('res');
    });

    describe('#routeAccess', () => {
      it('should return access values for a route', () => {
        expect(allowSelfRequest.routeAccess).to
        .eql(routeLevels[allowSelfReq.originalUrl][allowSelfReq.method]);

        expect(noSelfRequest.routeAccess).to
        .eql(routeLevels[noSelfReq.originalUrl][noSelfReq.method]);
      });
      it('should find wildcard- (/auth/*) for item routes (/auth/9c38a5a...) routes', () => {
        expect(wildcardRequest.routeAccess).to
        .eql(routeLevels['/auth/*'][wildcardReq.method]);
      });
      it('should be ok with invalid requests', () => {
        expect(invalidRequest.routeAccess).to.eql([ 'none', false ]);
      });
    });

    describe('#neededLevel', () => {
      it('with value \'manageUsers\' on ' + allowSelfReq.originalUrl, () => {
        expect(allowSelfRequest.neededLevel).to.be.a('string').and.equal('manageUsers');
      });
      it('with value \'writeAPI\' on ' + noSelfReq.originalUrl, () => {
        expect(noSelfRequest.neededLevel).to.be.a('string').and.equal('writeAPI');
      });
      it('should be ok with invalid requests', () => {
        expect(invalidRequest.neededLevel).to.eql('none');
      });
    });

    describe('#allowSelf', () => {
      it('with allow=true, userId=accessRequestUser._id on ' + allowSelfReq.originalUrl, () => {
        expect(allowSelfRequest.allowSelf).to.be.an('object').and.include.keys('allow', 'userId');
        expect(allowSelfRequest.allowSelf.allow).to.be.true;
        expect(allowSelfRequest.allowSelf.userId).to.equal(accessRequestUser._id);
      });

      it('with allow=false, userId=\'\' on ' + noSelfReq.originalUrl, () => {
        expect(noSelfRequest.allowSelf).to.be.an('object').and.include.keys('allow', 'userId');
        expect(noSelfRequest.allowSelf.allow).to.be.false;
        expect(noSelfRequest.allowSelf.userId).to.equal('');
      });

      it('should be ok with invalid requests', () => {
        expect(invalidRequest.allowSelf).to.eql({ allow: false, userId: '' });
      });
    });
  });
};
