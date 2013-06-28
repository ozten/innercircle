var nodeunit = require('nodeunit');

var camlistore = require('../lib/camlistore');

var uploadUrl;
module.exports = {
    'We can stat an unknown blob': function(test) {
        camlistore.stat(['sha1-0000000000000000000000000000000000000000'], function(err, statResp) {
            test.equal(statResp.stat.length, 0);
            test.done();
        });
    },
    'We can stat a known blob': function(test) {
        camlistore.stat(['sha1-896d56bf6e2bfb070c32841f92161076efeb18d0'], function(err, statResp) {
            test.equal(statResp.stat.length, 1);
            test.equal(statResp.stat[0].blobRef,
                'sha1-896d56bf6e2bfb070c32841f92161076efeb18d0');
            uploadUrl = statResp.uploadUrl;
            test.ok(uploadUrl);
            test.done();
        });
    },
    'We can upload a unknown blob': function(test) {
        camlistore.save("Hello World", function(err, data) {
            test.ok(! err);
            test.ok(data);
            test.done();
        });
    },
    'We can get our blob back': function(test) {
        var id = 'sha1-0a4d55a8d778e5022fab701977c5d840bbc486d0';
        camlistore.load(id, function(err, value) {
            test.ok(! err);
            test.equal(value, 'Hello World');
            test.done();
        });
    },
    'We can enumerate all the data': function(test) {
        camlistore.enumerate(function(err, blobRefs) {
            test.done();
        });
    }
};