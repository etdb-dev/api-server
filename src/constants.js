'use strict';

(() => {

  const _ = require('lodash');

  // These are the main access levels to the API. If you want to
  // edit this list, please start with the attached test at
  // /test/server/access-request.cls.js[:15:7]!
  const _LEVELS = [ 'writeAPI', 'readAPI', 'manageUsers', 'isAdmin' ];

  // zip an object together from
  //   - levels values as keys
  //   - a new Array (len=_LEVELS.len) filled with `false` as values
  const _denyAll = _.zipObject(_LEVELS, _.fill(Array(_LEVELS.length), false));
  // create new object, fill with accDefaults.denyAll values, enable readAPI
  const _readOnly = _.assign({}, _denyAll, { readAPI: true });

  /**
   * @module src/constants
   */
  module.exports = {
    AccessLevels: _LEVELS,

    /**
     * AccessLevel templates for API access
     * @memberOf module:src/constants
     * @type {Object.<AccessRequest.AccessLevels>}
     */
    AccessDefaults: {
      denyAll: _denyAll,
      readOnly: _readOnly
    }
  };

})();
