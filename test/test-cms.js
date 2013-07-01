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
  },
  "Slugify with multiple spaces does the right thing": function(test) {
    var post = {
      posttitle: 'Hello cruel world!'
    };
    test.equal(cms.slugify(post), 'hello_cruel_world');
    test.done();
  }
};