var webmention = require('./webmention_send');

var links = /<a [^>]*href="([^"]*)"[^>]*>/g;

module.exports = function(postLink, body) {
    console.log('For ', postLink);
  var m;
  while((m = links.exec(body)) !== null) {
    console.log('doing webmention on ', m[1]);
    webmention(postLink, m[1]);
  }
  console.log(m);
  console.log(body);
};