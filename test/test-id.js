var nodeunit = require('nodeunit');

var Id = require('../lib/id');

module.exports = {
    'We can create an id explicitly': function(test) {
        var id = new Id('email', 'shout@ozten.com');
        test.ok(id);
	test.equal(id.protocol(), 'email');
	test.equal(id.value(), 'shout@ozten.com');
	test.done();
    },
    'We can create an id from data': function(test) {
	var id = new Id('email:shout@ozten.com');
	test.equal(id.protocol(), 'email');
	test.equal(id.value(), 'shout@ozten.com');
	test.done();
    }
};