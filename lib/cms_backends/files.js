var fs = require('fs');
var moment = require('moment');
var path = require('path');
var sanitizer = require('sanitizer');

var backend = 'files';
var _dataDir = 'data';

exports.setDataDirectory = function(path) {
    if (!! path)
        _dataDir = path;
    else
        throw new Error('Expected path in options, found none.');
};

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
        if (err) return cb(err);
        var post = JSON.parse(data);
        loadComments(slug, function(err, comments) {
            if (!err) {

                post.comments = comments.comments;

            }
            cb(null, post);
        });
    });
};

exports.addComment = function(slug, comment, cb) {

    var cpath = commentPath(slug);
    loadComments(slug, function(err, comments) {
        if (err) {
            comments = {
                comments: []
            };
        }
        comments.comments.push(comment);

        fs.writeFile(cpath, JSON.stringify(comments, null, 4), function(err) {
            cb(err, comment);
        });
    });
};

exports.loadComments = loadComments = function(slug, cb) {
    var cpath = commentPath(slug);

    fs.readFile(cpath, 'utf8', function(err, data) {
        if (err) {
            cb(err);
        } else {
            var comments = JSON.parse(data);
            comments.comments.forEach(function(comment, i) {
                // Comments are syndicated from other people's sites...
                // Do not trust!
                comments.comments[i].properties.content =
                    sanitizer.sanitize(comments.comments[i].properties.content);
                if (comments.comments[i].properties.published) {
                    var d = new Date(comments.comments[i].properties.published);
                    comments.comments[i].properties.published = moment(d).calendar();
                }
            });
            cb(err, comments);
        }
    });
};

/* Path Helper methods */

var postPath = function(slug) {
    if (_dataDir[0] == '/') {
        return path.join(_dataDir, 'posts', slug + '.json');
    } else {
        return path.join(__dirname, 'posts', '..', _dataDir, slug + '.json');
    }
};

var commentPath = function(slug) {
    if (_dataDir[0] == '/') {
        return path.join(_dataDir, 'comments', slug + '.json');
    } else {
        return path.join(__dirname, '..', _dataDir, 'comments', slug + '.json');
    }
};