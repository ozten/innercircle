var nodeunit = require('nodeunit');

var camlistore = require('../lib/camlistore');

var helloWorldBlobRef = 'sha1-0a4d55a8d778e5022fab701977c5d840bbc486d0';
var goodByeWorldBlobRef = 'sha1-4ae609c41c9ff1670fe57f4df6a7d8c422977e78';
var testTag = 'test-' + new Date().getTime();
var uploadUrl;
var permanode;

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
        camlistore.save("Hello World", function(err, id, data) {
            test.ok(!err);
            test.equal(id, helloWorldBlobRef);
            test.ok(data);
            test.done();
        });
    },
    'We can get our blob back': function(test) {
        camlistore.load(helloWorldBlobRef, function(err, id, value) {
            test.ok(!err);
            test.equal(value, 'Hello World');
            test.done();
        });
    },
    'We can make a permanode': function(test) {
        camlistore.permanode({
            name: 'Unit Test',
            tags: ['unittest', testTag]
        }, function(err, id, blobRefs) {
            test.ok(!err);
            test.ok(id);
            permanode = id;
            console.log('SAVING', permanode);
            test.done();
        });
    },
    'We can associate Hello World with our permanode': function(test) {
        camlistore.attr(permanode, 'camliContent', helloWorldBlobRef, function(err, id) {
            test.ok(id);
            test.done();
        });
    },
    'We can get back Hello World content based on attributes': function(test) {
        camlistore.search('tag', testTag, function(err, results) {
            console.log(results);
            var sawHelloWorld = false;
            test.ok(results);
            test.ok(results.withAttr);
            test.ok(results.meta);
            Object.keys(results.meta).forEach(function(blobRef) {
                if (blobRef === helloWorldBlobRef) {
                    sawHelloWorld = true;
                }
            });
            test.ok(sawHelloWorld);
            test.done();
        });
    },
    'We can alter our permanode and it changes the search results': function(test) {
        camlistore.save("Goodbye, Cruel World", function(err, id, data) {
            test.ok(!err);
            test.equal(id, goodByeWorldBlobRef);
            test.ok(data);

            camlistore.attr(permanode,
                'camliContent', goodByeWorldBlobRef, function(err, id) {
                test.ok(!err);
                test.ok(id);

                camlistore.search('tag', testTag, function(err, results) {
                    console.log(results);
                    var sawHelloWorld = false;
                    var sawGoodbyeWorld = false;
                    test.ok(results);
                    test.ok(results.withAttr);
                    test.ok(results.meta);
                    Object.keys(results.meta).forEach(function(blobRef) {
                        if (blobRef === helloWorldBlobRef) {
                            sawHelloWorld = true;
                        }
                        if (blobRef === goodByeWorldBlobRef) {
                            sawGoodbyeWorld = true;
                        }

                    });
                    test.ok(sawGoodbyeWorld);
                    // Old data shouldn't be in results
                    test.equal(sawHelloWorld, false);
                    test.done();
                });
            });
        });
    },
    'We can enumerate all the data': function(test) {
        camlistore.enumerate(function(err, blobRefs) {
            test.ok(blobRefs.blobs.length > 0);
            test.done();
        });
    }
};