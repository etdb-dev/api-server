'use strict';

const routeLevels = require('./route-access-levels.map.json');

/**
 * @class AccessRequest Used to verify access rights on API requests.
 */
class AccessRequest {

  /**
   * @typedef AccessLevels
   * @description No levels grant other levels implicitly, except isAdmin; i.e. a user with `writeAPI=true` can't automatically also read the API.
   * @memberOf AccessRequest
   * @static
   * @property {bool} writeAPI    Grants write access to the API.
   * @property {bool} readAPI     Grants read access to the API.
   * @property {bool} manageUsers Users of the `manageUsers` level can create/edit/delete other users.
   * @property {bool} isAdmin     Setting this value to `true` grants access to all API functions, overriding all other set levels.
   */

  /**
   * Takes an object with request data and returns a new AccessRequest object.
   * @param  {Object}             data
   * @param  {Express.Request}    data.req         Express req of the handled request.
   * @param  {Express.Response}   data.res         Express res of the handled request.
   * @param  {String}             data.neededLevel AccessLevel the request needs granted.
   * @param  {?ObjectId}          data.allowSelf   Mongo ObjectId, identifying user to allow editing/listing own data.
   * @throws {TypeError}          If !data.req || !data.res || !data.neededLevel
   * @return {AccessRequest}
   */
  constructor(req, res) {

    if (!req || !res) {
      throw new TypeError('Both req and res are required.');
    }

    /**
     * The data stored in the request's JSON Web Token.
     * @type {TokenPayload}
     */
    this.tokenData = req.tokenPayload;
    /**
     * Access data of the user sending the request.
     * @type {AccessLevels}
     */
    this.userAccess = this.tokenData.access;
    /**
     * Express req object of the request.
     * @type {Express.Request}
     */
    this.req = req;
    /**
     * Express res object of the request.
     * @type {Express.Response}
     */
    this.res = res;
    /**
     * AccessLevel needed to grant access to the requested API function.
     * @type {String}
     */
    this._neededLevel = '';
    /**
     * MongoDB ObjectId, identifying a user. This can be used to allow users access to their own data, e.g. edit user information.
     * @type {?String}
     */
    this._allowSelf = false;
  }

  get neededLevel() {
    if (this._neededLevel !== '') {
      return this._neededLevel;
    }
    let originalUrl = this.req.originalUrl;
    let methods = routeLevels[originalUrl];
    if (!methods) {
      let lastSlashIdx = originalUrl.lastIndexOf('/') + 1;
      if (lastSlashIdx < originalUrl.length) {
        let routeUrl = originalUrl.slice(0, lastSlashIdx) + '*';
        methods = routeLevels[routeUrl];
      }
    }
    this._neededLevel = methods ? methods[this.req.method] || 'none' : 'none';
    return this._neededLevel;
  }

}

module.exports = AccessRequest;
