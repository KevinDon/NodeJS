var http = require('http');
var options = {
    host: 'www.baidu.com',
    port: 80,
    path: '/upload',
    method: 'post'
};
var request = http.request(options, function (response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    })
    response.on('end', function () {

    });
})
request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
})

request.write('data\n');
request.write('data\n');
request.end();
