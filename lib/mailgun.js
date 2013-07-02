/* Wrapper for sending Emails via Mailgun over HTTP */

var restler = require('restler');

module.exports = function(emails, argv) {
    var emailData = {
        from: argv.f,
        to: emails[0],
        subject: argv.s,
        text: argv.b
    };
    console.log(emailData);
    restler.post(argv['mailgun-api-url'], {
        multipart: true,
        username: 'api',
        password: argv['mailgun-api-key'],
        data: emailData
    }).on('complete', function(data) {
        console.log('Finished');
        console.log(data);
    });
};