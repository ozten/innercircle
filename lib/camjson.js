/* Camlistore schema must be serialized in a specific way */

/**
 * ver - number - camliVersion defaults to 1
 */
module.exports = function(obj, ver) {
  var rv = JSON.stringify(obj, null, 2);
  ver = ver || 1;

  rv = '{"camliVersion": ' + ver + ',' + rv.substring(1);
  return rv;
};