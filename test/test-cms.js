var nodeunit = require('nodeunit');

var cms = require('../lib/cms');

module.exports = {
  'We can slugify a post title': function(test) {
    var post = {
      posttitle: 'Hello World!'
    };
    test.equal(cms.slugify(post), 'hello_world');
    test.done();
  },
  "We throw if we can't slugify": function(test) {
    var post = {
      postbody: 'Hello World!'
    };

    try {
      cms.slugify(post);
      test.fail('We should throw');
    } catch (e) {
      test.ok(true);
    }
    test.done();
  }
};