var nodeunit = require('nodeunit');

var camliCms = require('../lib/cms_backends/camlistore');

var slug = 'first_post' + new Date().getTime();
var permanode;
module.exports = {
    'We can save a new blog post': function(test) {
        var title = 'First Post',
            post = 'This is a really well written peice of prose.',
            audience = 'People of Earth',
            created = new Date();

        camliCms.savePost(slug, title, post, audience, created, function(err, id) {
            test.ok(!err);
            test.ok(id);
            permanode = id;
            test.done();
        });
    },
    'We can load an existing post': function(test) {
        camliCms.loadPost(slug, function(err, post) {
            test.ok(!err);
            test.ok(post);
            test.equal(post.slug, slug);
            test.equal(post.title, 'First Post');
            test.equal(post.body, 'This is a really well written peice of prose.');
            test.equal(post.audience, 'People of Earth');
            test.done();
        });
    },
    /*'We can add comments': function(test) {
        camliCms.addComment(slug, "You suck!", cb) {
    },*/
    'We can update an existing post': function(test) {
        var newTitle = 'A First Post',
            newBody = 'Is hard to write';

        camliCms.savePost(slug, newTitle,
            newBody, 'People of Earth', new Date(), function(err, id) {
            test.ok(!err);
            test.equal(permanode, id);

            camliCms.loadPost(slug, function(err, post) {
                test.ok(!err);
                test.ok(post);
                test.equal(post.slug, slug);
                test.equal(post.title, newTitle);
                test.equal(post.body, newBody);
                test.equal(post.audience, 'People of Earth');
                test.done();
            });
        });
    }
};