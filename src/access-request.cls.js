'use strict';

class AccessRequest {
  constructor(data) {
    let { req, res, accessType, allowSelf } = data;
    this.tokenData = req.tokenPayload;
    this.userAccess = this.tokenData.access;
    this.res = res;
    this.accessType = accessType;
    this.allowSelf = allowSelf;
  }

}

module.exports = AccessRequest;
