var fs = require('fs');
var path = require('path');

var postPath = function(slug) {
    return path.join(__dirname, '..', 'data', slug);
}

exports.savePost = function(slug, title, post, audience, created, cb) {
    created = created || new Date().getTime();
    var updated = created;
    fs.writeFile(postPath(slug), JSON.stringify({
        slug: slug,
        title: title,
        body: post,
        audience: audience,
        createdt: created,
        updatedt: updated
    }, null, 4), function(err) {
        cb(err);
    });
};

exports.loadPost = function(slug, cb) {
  fs.readFile(postPath(slug), 'utf8', function(err, data) {
    cb(err, JSON.parse(data));
  });
}

exports.slugify = function(post) {
    var slug = "error";
    if (post.posttitle) {
        slug = post.posttitle.toLowerCase().replace(' ', '_');
        slug = slug.replace(/[^a-z0-9_]/, '');
    }
    if ("error" === slug) throw new Error('Unable to slugify [' + JSON.stringify(post));
    return slug;
};