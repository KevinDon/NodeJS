var http = require('http');

http.createServer(function (require, response) {
    var url = 'http://www.baidu.com';
    var body = '<p>Redirecting to <a href="' + url + '">' + url + '</a></p>';
    response.setHeader('Location', url);
    response.setHeader('Content-Length', body.length);
    response.setHeader('Content-type', 'text/html');
    response.statusCode = 302;
    response.end(body);
}).listen(3000);