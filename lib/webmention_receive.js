/* Webmention related code
http://indiewebcamp.com/webmention
*/

var microformats = require('microformat-node');
var url = require('url');

var cms = require('./cms');

module.exports = function(theirSource, ourTarget, cb) {
    var slug = url.parse(ourTarget).path;
    console.log(slug);
    // Does target exist?
    cms.loadPost(slug, function(err, post) {
        console.log('loadPost callback', err, post);
        if (err) return cb(err);
        var options = {
            logLevel: 4
        };
        // Does source exist and mention us?
        var mentionsUs = false;
        var comment = {};
        microformats.parseUrl(theirSource, options, function(err, data) {
            console.log(JSON.stringify(data));
            if (!data.items) return cb(null, "Expected items, found none");
            data.items.forEach(function(item) {
                if (item.properties) {
                    if (item.properties.content) {
                        if (item.properties.content.indexOf(ourTarget)) {
                            mentionsUs = true;
                            comment = item;
                            comment.sourceUrl = theirSource;
                            comment.postUrl = ourTarget;
                        }
                    }
                }
            });
            if (mentionsUs) {
                cms.addComment(slug, comment, cb);
            } else {
                cb("No mention of " + ourTarget + "found", data);
            }
        });
    });
}