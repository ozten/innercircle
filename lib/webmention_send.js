var http;
var url = require('url');
var qs = require('qs');

function post(ourSource, theirTarget, webmentionUrl) {
    var options = url.parse(webmentionUrl);
    options.method = 'POST';

    postBody = qs.stringify({
        source: ourSource,
        target: theirTarget
    });

    options.headers = {
        "Content-Length": postBody.length,
        "Content-Type": "application/x-www-form-urlencoded"
    };
    console.log("Doing webmention send to ", webmentionUrl);
    console.log(options);
    if ('http:' === options.protocol) {
        http = require('http');
    } else {
        http = require('https');
    }
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('WEBMENTION response: ', chunk);
        });
        res.on('end', function() {
            console.log('Finished sending webmention');
        });
    });
    req.write(postBody);
    req.end();
};

module.exports = function(ourSource, theirTarget) {
    var mention = true;


    var options = url.parse(theirTarget);
    if ('http:' === options.protocol) {
        http = require('http');
    } else {
        http = require('https');
    }
    console.log('webmention send options=', options);
    var body = "";
    var req = http.request(options, function(res) {
        Object.keys(res.headers).forEach(function(header) {
            //Link: <http://news.indiewebcamp.com/webmention>; rel="http://webmention.org/"
            if ('link' === header.toLowerCase()) {
                var val = res.headers[header].split(';')[0];
                var webmentionUrl = val.trim().substring(1, val.trim().length - 1);
                if (mention) {
                    mention = false;
                    post(ourSource, theirTarget, webmentionUrl);
                }
            }
        });
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function(){
            //<link href="http://enclave:3677/webmention" rel="http://webmention.org/" />
            var links = /<link ([^>]*)>/g;
            var m;
            while((m = links.exec(body)) !== null) {
                if (m[1].indexOf('rel="http://webmention.org') !== -1) {
                    var href = /.*href="([^"]*)".*/;
                    var m2 = href.exec(m[1]);
                    if (m2) {
                        if (mention) {
                            mention = false;
                            post(ourSource, theirTarget, m2[1]);
                        }
                    }
                }
            }
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    req.end();
};