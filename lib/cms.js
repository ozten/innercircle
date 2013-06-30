var fs = require('fs');
var moment = require('moment');
var path = require('path');
var sanitizer = require('sanitizer');

var _dataDir = 'data';

exports.setDataDirectory = function(path) {
    _dataDir = path;
};

var postPath = function(slug) {
    if (_dataDir[0] == '/') {
        return path.join(_dataDir, slug);
    } else {
        return path.join(__dirname, '..', _dataDir, slug);
    }

};

var commentPath = function(slug) {
    if (_dataDir[0] == '/') {
        return path.join(_dataDir, 'comments', slug);
    } else {
        return path.join(__dirname, '..', _dataDir, 'comments', slug);
    }
};

exports.savePost = function(slug, title, post, audience, created, cb) {
    created = created || new Date().getTime();
    var updated = created;
    console.log("Writing to", postPath(slug));
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
    console.log('lookign in ', postPath(slug));
    fs.readFile(postPath(slug), 'utf8', function(err, data) {
        if (err) return cb(err);
        var post = JSON.parse(data);
        loadComments(slug, function(err, comments) {
            if (!err) {
                console.log("Adding comments");
                post.comments = comments.comments;
                console.log(post);
            }
            cb(null, post);
        });
    });
};

exports.slugify = function(post) {
    var slug = "error";
    if (post.posttitle) {
        slug = post.posttitle.toLowerCase().replace(' ', '_');
        slug = slug.replace(/[^a-z0-9_]/, '');
    }
    if ("error" === slug) throw new Error('Unable to slugify [' + JSON.stringify(post));
    return slug;
};

exports.addComment = function(slug, comment, cb) {
    console.log('addComment called');
    var cpath = commentPath(slug);
    loadComments(slug, function(err, comments) {
        if (err) {
            comments = {
                comments: []
            };
        }
        comments.comments.push(comment);
        console.log('Writing to ', cpath);
        fs.writeFile(cpath, JSON.stringify(comments, null, 4), function(err) {
            cb(err, comment);
        });
    });
};

exports.loadComments = loadComments = function(slug, cb) {
    var cpath = commentPath(slug);
    console.log('lookign in ', cpath);
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