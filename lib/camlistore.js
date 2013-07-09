/**
 * API wrapper for Camlistore (camlistore.org).

  High Level

  Low Level
  * GET a blob by id
  * PUT a blob by id
  * LIST all blobs
 */

var child_process = require('child_process');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var qs = require('qs');
var restler = require('restler');
var url = require('url');

/**
 * Saves data.
 * id - string - GUID
 * object - An object or primitive. Must be able to be
 *    searilized by JSON.stringify
 * cb - function(err) err will be null unless we
 *    were unable to save or update the object
 */
exports.save = function(object, cb) {
    if (typeof object === 'object') {
        object = JSON.stringify(object);
    }
    var sha1 = crypto.createHash('sha1')
        .update(object)
        .digest('hex');

    var id = "sha1-" + sha1;
    stat([id], function(err, res) {
        if (err) {
            cb(err, id);
        } else {
            //console.log(res);
            if (0 === res.stat.length) {
                //console.log("Uploading data");
                upload(res.uploadUrl, id, object, cb);
            } else {
                //console.log("We've already got it");
                cb(null, id, object);
            }
        }
    });
};

/**
 * Loads data
 */
exports.load = function(id, cb) {
    get(id, cb);
};

/* Low level Camlistore API below */
exports.stat = stat = function(blobrefs, cb) {
    var data = {
        camliversion: 1
    };
    blobrefs.forEach(function(blobref, i) {
        data['blob' + (i + 1)] = blobref;
    });
    var query = qs.stringify(data);
    var options = {
        port: 3179,
        method: 'GET',
        host: 'localhost',
        path: '/bs/camli/stat?' + query
    };
    var text = "";
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            text += chunk;
        });
        res.on('end', function() {
            cb(null, JSON.parse(text));
        });
    });
    req.on('error', function(e) {
        console.error(e);
        cb(e);
    });
    req.end();
};

exports.upload = upload = function(uploadUrl, id, object, cb) {
    var uri = url.parse(uploadUrl);
    var data = {};
    data[id] = object;
    restler.post(uploadUrl, {
        multipart: true,
        data: data
    }).on('complete', function(data, res) {
        //console.log(res);
        //console.log(data);
        cb(null, id, data);
    });
};

exports.get = get = function(blobRef, cb) {
    var url = 'http://localhost:3179/bs/camli/' + blobRef;
    restler.get(url).on('complete', function(result) {
        cb(null, blobRef, result);
    });
};

exports.enumerate = enumerate = function(cb) {
    var url = 'http://localhost:3179/bs/camli/enumerate-blobs';
    restler.get(url).on('complete', function(result) {
        result = JSON.parse(result);

        result.blobs.forEach(function(blob, i) {

            var blobRef = blob.blobRef;
            get(blob.blobRef, function(err, blobRef, data) {
                //console.log(blobRef);
                //console.log(data);
                //console.log('======================');
            });

            if (i >= result.blobs.length - 1) {
                setTimeout(function() {
                    cb(null, result);
                }, 2000);
            }
        });
    });
};

/**
 * Create a new permanode in the Camlistore
 * opts - Optional arguments
 *   name - string - Name of the permanode
 *   tags - array of strings - List of Tags
 */
exports.permanode = permanode = function(opts, cb) {
    var args = ['permanode'];
    if (opts.name) {
        args.push('-name=' + opts.name);
    }
    if (opts.tags) {
        args.push('-tag=' + opts.tags.join(','));
    }

    console.log('camput permanode about to be called');

    var camput = child_process.spawn('/Users/shout/Projects/camlistore/bin/camput',
        args);

    console.log('wiring up response');

    var blobRef;
    var blobRefs = [];
    camput.stdout.on('data', function(data) {
        console.log('== AOK data=', data.toString('utf8'));
        // First blobRef is the permanode
        if (!blobRef) {
            blobRef = data.toString('utf8').trim();
            // Following blobRefs are metadata (name, tag, etc)
        } else {
            blobRefs.push(data.toString('utf8').trim());
        }
    });
    camput.stderr.on('data', function(data) {
        console.log('camput ERROR');
        console.error('camput ERROR: ' + data);
    });
    camput.on('error', function(err) {
        console.log('CAMPUT ERROR=', err);
    });
    camput.on('close', function(exitCode) {
        console.log('CAMPUT close', blobRef, blobRefs);
        if (0 !== exitCode) {
            console.error("camput - Bad exit code " + exitCode);
        }
        cb(null, blobRef, blobRefs);
    });
};

exports.attr = attr = function(permanodeRef, name, value, cb) {
    var args = ['attr', permanodeRef, name, value];
    var camput = child_process.spawn('/Users/shout/Projects/camlistore/bin/camput',
        args);

    var blobRef;
    camput.stdout.on('data', function(data) {
        if (!blobRef) {
            blobRef = data.toString('utf8').trim();
        } else {
            throw new Error('camput attr more output than expected!');
        }

    });
    camput.stderr.on('data', function(data) {
        console.error('camput ERROR: ' + data);
    });
    camput.on('close', function(exitCode) {
        if (0 !== exitCode) {
            console.error("camput - Bad exit code " + exitCode);
        }
        cb(null, blobRef);
    });
};

exports.search = search = function(field, value, cb) {
    var url = 'http://localhost:3179/my-search/camli/search/permanodeattr?' +
        'signer=sha1-839b2a77818840dc8d52339b87a951992dc32e04' +
        '&attr=' + field +
        '&value=' + value +
        '&fuzzy=false&max=100&thumbnails=100';

    var raw = "";
    var req = http.get(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            raw += chunk;
        });
        res.on('end', function() {
            cb(null, JSON.parse(raw));
        });
    });
    req.on('error', function(e) {
        cb(e);
    });
};