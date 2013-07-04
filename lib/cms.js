var fs = require('fs');
var moment = require('moment');
var path = require('path');
var sanitizer = require('sanitizer');

var backend;

/* General Utilities */
exports.slugify = function(post) {
    var slug = "error";
    if (post.posttitle) {
        slug = post.posttitle.toLowerCase().replace(/ /g, '_');
        slug = slug.replace(/[^a-z0-9_]/g, '');
    }
    if ("error" === slug) throw new Error('Unable to slugify [' + JSON.stringify(post));
    return slug;
};

// TODO rename to init or something
exports.setDataDirectory = function(options) {
    backend = require('./cms/' + options.storage);

    if (options.path)
        backend.setDataDirectory(options.path);
};

/* Interface to backends */

exports.savePost = function(slug, title, post, audience, created, cb) {
    return backend.savePost(slug, title, post, audience, created, cb);
};

exports.loadPost = function(slug, cb) {
    return backend.loadPost(slug, cb);
};

exports.addComment = function(slug, comment, cb) {
    return backend.addComment(slug, comment, cb);
};

exports.loadComments = loadComments = function(slug, cb) {
    return backend.loadComments(slug, cb);
};