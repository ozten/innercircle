/**
 * An id is a basic component of Enclave and Camlistore.
 * It is the stable identifier that never changes.
 * It can be opaque (mention:23423ae324) or
 * human friendly (email:shout@ozten.com)
 *
 * Schema:
 *  - 
 */



module.exports = function(aProtocol, identifier) {

  if (! identifier) {
      var parts = aProtocol.split(':');

      if (parts.length <= 1) throw new Error('Malformed id[' + aProtocol + ']');

      aProtocol = parts[0];
      identifier = parts.slice(1).join('');
  }

  var that = {
      protocol: function() { return aProtocol; },
      value: function() { return identifier; }
  }
  return that;
};