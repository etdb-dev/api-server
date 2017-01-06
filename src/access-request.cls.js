'use strict';

const routeLevels = require('./route-access-levels.map.json');

/**
 * @version 0.1.0
 * @class AccessRequest Used to verify access rights on API requests.
 */
class AccessRequest {

  /**
   * @version 0.1.0
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
   * @version 0.1.0
   * @typedef AllowSelf
   * @description AllowSelf values of an AccessRequest instance.  
   *              Exposed by {@link AccessRequest#allowSelf}
   * @memberOf AccessRequest
   * @static
   * @property {Boolean} active  Whether this request's route
   *                             offers access to `self` functions
   * @property {String}  userId  **MongoDB ObjectId, identifying the user owning
   *                             the request's JTW.**  
   *                             Always an empty string (`''`), whenever .active
   *                             is `false`.
   */

  /**
   * @version 0.1.0
   * @description
   * Takes Express Request and Response objects and returns a new AccessRequest object for the request.
   * @param  {Express.Request}    req  Express req of the handled request.
   * @param  {Express.Response}   res  Express res of the handled request.
   * @throws {TypeError}          If !req || !res
   * @return {AccessRequest}
   */
  constructor(req, res) {

    if (!req || !res) {
      throw new TypeError('Both req and res are required.');
    }

    /**
     * @version 0.1.0
     * @description
     * Express req object of the request.
     * @name  req
     * @instance
     * @memberOf AccessRequest
     * @type {Express.Request}
     */
    this.req = req;
    /**
     * @version 0.1.0
     * @description
     * Express res object of the request.
     * @name  res
     * @instance
     * @memberOf AccessRequest
     * @type {Express.Response}
     */
    this.res = res;
    /**
     * @version 0.1.0
     * @description
     * The data stored in the request's JSON Web Token.
     * @name  tokenData
     * @instance
     * @memberOf AccessRequest
     * @type {TokenPayload}
     */
    this.tokenData = req.tokenPayload;
    /**
     * @version 0.1.0
     * @description
     * MongoDB ObjectId of token owning user
     * @name  userId
     * @instance
     * @memberOf AccessRequest
     * @type {string}
     */
    this.userId = this.tokenData.userId;
    /**
     * @version 0.1.0
     * @description
     * Access data of the user sending the request.
     * @name  userAccess
     * @instance
     * @memberOf AccessRequest
     * @type {AccessLevels}
     */
    this.userAccess = this.tokenData.access;

    this._routeAccess;
    this._neededLevel = '';
    this._allowSelf;
  }

  /**
   * @version 0.1.0
   * @description
   * **AccessLevel needed to grant access to the requested API function.**  
   * Gets neededLevel from /src/route-access-levels.map.json.
   * @name neededLevel
   * @instance
   * @memberOf AccessRequest
   * @type {String}
   */
  get neededLevel() {
    if (this._neededLevel === '') {
      this._neededLevel = this.routeAccess[0] || 'none';
    }
    return this._neededLevel;
  }

  /**
   * @version 0.1.0
   * @description
   * **Defines whether this request can edit user owned data or not.**
   * @name allowSelf
   * @instance
   * @memberOf AccessRequest
   * @type {AccessRequest.AllowSelf}
   */
  get allowSelf() {
    if (!this._allowSelf) {
      this._allowSelf = {
        allow: this.routeAccess[1],
        userId: this.routeAccess[1] ? this.userId : ''
      };
    }
    return this._allowSelf;
  }

  /**
   * @version 0.1.0
   * @description
   * Raw access information for the request's route
   * @name  routeAccess
   * @instance
   * @memberOf AccessRequest
   * @type {Array.<string, Boolean>}
   */
  get routeAccess() {
    if (!this._routeAccess) {
      let oUrl = this.req.originalUrl;
      let reqMethod = this.req.method;
      let accessDataDefault = [ 'none', false ];

      let methods = routeLevels[oUrl] || routeLevels[wildcardRoute(oUrl)];
      let accessData = methods ? methods[reqMethod] : accessDataDefault;

      if (!(accessData instanceof Array)) {
        accessData = accessDataDefault;
      } else if (accessData.length === 1) {
        accessData.push(false);
      }
      this._routeAccess = accessData;
    }
    return this._routeAccess;
  }

}

/**
 * @version 0.1.0
 * @description
 * Takes a url string and replaces item-urls (e.g. `/v0/apps/appIdHere039fa23sf...`)
 * with wildcard-urls (e.g. `/v0/apps/*`), used in the [access-levels map](https://github.com/etdb-dev/api-server/blob/feature/AccessRequest/src/route-access-levels.map.json).
 * @memberOf AccessRequest
 * @inner
 * @param  {string} routeUrl Url string, for example req.originalUrl of an AccessRequest.
 * @return {string}          wildcarded url or empty string
 */
let wildcardRoute = (routeUrl) => {
  // find last index of '/' in url;
  // add 1, 'cause we need the '/' itself, too
  let lastSlashIdx = routeUrl.lastIndexOf('/') + 1;
  // if last '/' is not at the end, cut url after it and concat '*'
  // otherwise return empty string
  return lastSlashIdx < routeUrl.length ? routeUrl.slice(0, lastSlashIdx) + '*' : '';
};

module.exports = AccessRequest;
