'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;

const AccessRequest = require('../../src/access-request.cls');

module.exports = (accessRequestUser) => {

  describe('AccessRequest', function() {
    const _data = {
      req: {
        tokenPayload: {
          userId: accessRequestUser._id,
          username: accessRequestUser.username,
          password: accessRequestUser.password,
          access: accessRequestUser.access
        }
      },
      res: 'foo',
      neededLevel: 'isAdmin',
      allowSelf: accessRequestUser._id
    };

    let testRequest = new AccessRequest(_data);

    it('should have property tokenData', () => {
      expect(testRequest).to.have.property('tokenData', _data.req.tokenPayload);
    });

    it('should have property userAccess', () => {
      expect(testRequest).to.have.property('userAccess', accessRequestUser.access);
    });

    it('should have property res', () => {
      expect(testRequest).to.have.property('res', 'foo');
    });

    it('should have property neededLevel', () => {
      expect(testRequest).to.have.property('neededLevel', _data.neededLevel);
    });

    it('should have property allowSelf', () => {
      expect(testRequest).to.have.property('allowSelf', _data.allowSelf);
    });

  });
};
