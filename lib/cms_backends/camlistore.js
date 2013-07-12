var fs = require('fs');
var moment = require('moment');
var path = require('path');
var sanitizer = require('sanitizer');

var camjson = require('../camjson');
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
                _createPostMetadata(permanode, content, cb);

            });

        } else if (results.withAttr.length == 1) {

            permanode = results.withAttr[0].permanode;
            _updatePost(permanode, content, cb);

        } else {
            throw new Error('Should have been 1 or 0 permandodes...');
        }
    });
};

var _createPostMetadata = function(postPremanode, content, cb) {
    _updatePost(postPremanode, content, function(err, postBlobRef, data) {
        if (err) return cb(err);
        var metadata = camjson({
            camliType: "ICBlogPost",
            post: postBlobRef,
            comments: null
        });
        camlistore.save(metadata, function(err, metaBlobRef, data) {
            camlistore.attr(postPremanode, 'camliContent', metaBlobRef, function(err, id) {
                cb(err, postPremanode);
            });
        });

    });
};

var _updatePost = function(permanode, content, cb) {

    camlistore.save(content, function(err, blobRef, data) {
        cb(err, blobRef, data);
    });
};

exports.loadPost = function(slug, cb) {

    var found = false;
    camlistore.search('tag', slug, function(err, results) {
        if (err) return cb(err);
        var permanodes = [];
        if (results.withAttr) {
            results.withAttr.forEach(function(item) {
                if (item.permanode) permanodes.push(item.permanode);
            });
        }
        Object.keys(results.meta).forEach(function(blobRef) {
            // Skip metadata about the permanode
            if (false === found && permanodes.indexOf(blobRef) === -1) {
                // Probably the current value of the post
                found = true;
                camlistore.load(blobRef, function(err, id, value) {
                    var postMeta = JSON.parse(value);
                    if (!err) {
                        // TODO
                        // loadComments(slug, function(err, comments) {
                        // post.comments = comments;
                        if (!postMeta.post) throw new Error('Expected blobRef for post');
                        camlistore.load(postMeta.post, function(err, id, post) {
                            return cb(err, JSON.parse(post));
                        });
                    }
                });
            }
        });
        if (false === found) cb("Unable to find " + slug);
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

    loadComments(slug, function(err, oldComments) {
        var comments;
        if (err) {
            comments = {
                comments: []
            };
        } else {
            comments = {
                comments: oldComments
            };
        }
        comments.comments.push(comment);

        var found = false;
        camlistore.search('tag', slug, function(err, results) {
            if (err) return cb(err);
            var permanodes = [];
            if (results.withAttr) {
                results.withAttr.forEach(function(item) {
                    if (item.permanode) permanodes.push(item.permanode);
                });
            }
            console.log('tag=', slug, 'got====', results);
            Object.keys(results.meta).forEach(function(blobRef) {
                // Skip metadata about the permanode
                if (false === found && permanodes.indexOf(blobRef) === -1) {
                    // Probably the current value of the post
                    console.log('/y//y/y FOUND true');
                    found = true;

                    camlistore.load(blobRef, function(err, id, value) {
                        var postMeta = JSON.parse(value);

                        if (!err) {
                            if (postMeta.comments) {
                                camlistore.load(postMeta.comments, function(err, id, post) {
                                    // AOK TODO
                                    console.log('AOK were goig to save this updated metadata right here');
                                    console.log(post);
                                    throw new Error('TODO again');
                                    //return cb(err, JSON.parse(post));
                                });
                            } else {
                                console.log('/x/x/x creating permanode for comments');
                                camlistore.permanode({
                                    name: 'Comments_' + slug,
                                    tags: ['commets']
                                }, function(err, commentsId, blobRefs) {
                                    console.log('/z/z/z/z callback');
                                    console.log(err, commentsId, blobRefs);
                                    if (err) throw new Error(err);

                                    console.log('commentsId=', commentsId);

                                    postMeta.comments = commentsId;

                                    console.log(postMeta);

                                    var metadata = camjson(postMeta);

                                    camlistore.save(metadata, function(err, metaBlobRef, data) {

                                        // Update comment permanode in postMetadata
                                        camlistore.attr(permanodes[0], 'camliContent', metaBlobRef, function(err, id) {
                                            var comments = {
                                                comments: [comment]
                                            };
                                            camlistore.save(comments, function(err, commentsBlobRef, data) {

                                                camlistore.attr(commentsId, 'camliContent', commentsBlobRef, function(err, id) {
                                                    cb(err, id, comments);
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                        }
                    });
                }
            });
            if (false === found) cb("Unable to find " + slug);
        });
    });
};

exports.loadComments = loadComments = function(slug, cb) {
    //1 Look up ICBlogPost permanode
    //2 Get current post metadata
    //3 Get comments permanode
    //4 If null, create permanode
    //5 If attribute camliContent exists - read in contents
    //6 Write all contents to a blob
    //7 Update camliContent on commentsPermanode
    //8 Update comments pointer in postMetadata
    var found = false;
    camlistore.search('title', 'Comments_' + slug, function(err, results) {

        if (err) return cb(err);
        var permanodes = [];
        if (results.withAttr) {
            results.withAttr.forEach(function(item) {
                if (item.permanode) permanodes.push(item.permanode);
            });
        }
        console.log(results);
        Object.keys(results.meta).forEach(function(blobRef) {
            // Skip metadata about the permanode
            if (false === found && permanodes.indexOf(blobRef) === -1) {
                // Probably the current value of the post
                found = true;

                camlistore.load(blobRef, function(err, id, value) {
                    if (err) {
                        cb(err);
                    } else {
                        var postMeta = JSON.parse(value);
                        console.log(postMeta);
                        cb(null, postMeta);
                    }
                });
            }
        });

        if (false === found) cb("Unable to find " + slug);
    });
    /*

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
*/
};