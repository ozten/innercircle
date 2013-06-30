var fs = require('fs');
var path = require('path');

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
    cb(err, JSON.parse(data));
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
    var cpath = commentPath(slug);
    loadComments(slug, function(err, comments) {
        if (err) {
            comments = { comments: [] };
        }
        comments.comments.push(comment);
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
            cb(err, JSON.parse(data));
        }
    });
};