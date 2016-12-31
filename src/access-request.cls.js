'use strict';

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
   * @param  {?ObjectId}           data.allowSelf   Mongo ObjectId, identifying user to allow editing/listing own data.
   * @return {AccessRequest}
   */
  constructor(data) {
    let { req, res, neededLevel, allowSelf } = data;

    if (!req || !res || !neededLevel) {
      throw new TypeError('Values for req, res and neededLevel are required.');
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
     * Express res object of the request.
     * @type {Express.Response}
     */
    this.res = res;
    /**
     * AccessLevel needed to grant access to the requested API function.
     * @type {String}
     */
    this.neededLevel = neededLevel;
    /**
     * MongoDB ObjectId, identifying a user. This can be used to allow users access to their own data, e.g. edit user information.
     * @type {?String}
     */
    this.allowSelf = allowSelf;
  }

}

module.exports = AccessRequest;
