/**
 * API wrapper for Camlistore (camlistore.org).
 */

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
            cb(err);
        } else {
            console.log(res);
            if (0 === res.stat.length) {
                console.log("Uploading data");
                upload(res.uploadUrl, id, object, cb);
            } else {
                console.log("We've already got it");
                cb(null, object);
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
        console.log(res);
        console.log(data);
        cb(null, data);
    });
};

exports.get = get = function(blobRef, cb) {
    var url = 'http://localhost:3179/bs/camli/' + blobRef;
    restler.get(url).on('complete', function(result) {
        cb(null, result);
    });
};

exports.enumerate = enumerate = function(cb) {
    var url = 'http://localhost:3179/bs/camli/enumerate-blobs';
    restler.get(url).on('complete', function(result) {
        result = JSON.parse(result);

        result.blobs.forEach(function(blob, i) {

            var blobRef = blob.blobRef;
            get(blob.blobRef, function(err, data) {
                console.log(blobRef);
                console.log(data);
                console.log('======================');
            });

            if (i >= result.blobs.length - 1) {
                setTimeout(function() {
                    cb(null, result);
                }, 2000);

            }

        });


    });
};