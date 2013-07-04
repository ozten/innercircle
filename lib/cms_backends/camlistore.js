var fs = require('fs');
var moment = require('moment');
var path = require('path');
var sanitizer = require('sanitizer');

camlistore = require('../camlistore');

/*
  We are either adding a new post or updating it.
  To add we create a permanode
  To save we update the existing permanode
  The slug is the tag.
*/
exports.savePost = function(slug, title, post, audience, created, cb) {
    created = created || new Date().getTime();
    var updated = created;

    var content = JSON.stringify({
        slug: slug,
        title: title,
        body: post,
        audience: audience,
        createdt: created,
        updatedt: updated
    }, null, 4);

    var permanode;
    camlistore.search('tag', slug, function(err, results) {
      if (null === results.withAttr) {
        camlistore.permanode({
            name: title,
            tags: [slug]
        }, function(err, id, blobRefs) {
            if (err) throw new Error(err);
            permanode = id;
            _updatePost(permanode, content, cb);
        });
      } else if (results.withAttr.length == 1) {
        permanode = results.withAttr[0].permanode;
        _updatePost(permanode, content, cb);
      } else {
        throw new Error('Should have been 1 or 0 permandodes...');
      }
    });
};

var _updatePost = function(permanode, content, cb) {
    camlistore.save(content, function(err, blobRef, data) {
        if (err) return cb(err);
        camlistore.attr(permanode, 'camliContent', blobRef, function(err, id) {
            cb(err, permanode);
        });
    });



};

exports.loadPost = function(slug, cb) {
    camlistore.search('tag', slug, function(err, results) {
      if (err) return cb(err);
      var permanodes = [];
      if (results.withAttr) {
        results.withAttr.forEach(function(item) {
            if (item.permanode) permanodes.push(item.permanode);
        });
      }
      var found = false;
      Object.keys(results.meta).forEach(function(blobRef) {
        // Skip metadata about the permanode
        if (!found && permanodes.indexOf(blobRef) === -1) {
            // Probably the current value of the post
            found = true;
            camlistore.load(blobRef, function(err, id, value) {
                var post = JSON.parse(value);
                // TODO
                // loadComments(slug, function(err, comments) {
                if (!err) {
                    // post.comments = comments;
                    return cb(null, post);
                }
            });
        }
        if (false === found) cb("Unable to find " + slug);
      });
  });
};
/*
    console.log('lookign in ', postPath(slug));
    fs.readFile(postPath(slug), 'utf8', function(err, data) {
        if (err) return cb(err);
        var post = JSON.parse(data);
        loadComments(slug, function(err, comments) {
            if (!err) {
                console.log("Adding comments");
                post.comments = comments.comments;
  */

/**
 * comment - JavaScript Object
*/
exports.addComment = function(slug, comment, cb) {

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