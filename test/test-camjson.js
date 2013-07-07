var nodeunit = require('nodeunit');

var camjson = require('../lib/camjson.js');

module.exports = {
    'We can serialize like Camlistore does': function(test) {
        var c = camjson({
            camliType: 'ICBlog',
            metadata: 'sha1-0a4d55a8d778e5022fab701977c5d840bbc486d0'
        });
        test.equal(c, [
            '{"camliVersion": 1,',
            '  "camliType": "ICBlog",',
            '  "metadata": "sha1-0a4d55a8d778e5022fab701977c5d840bbc486d0"',
            '}'
        ].join('\n'));
        test.done();
    }
};