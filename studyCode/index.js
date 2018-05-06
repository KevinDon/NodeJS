var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
    if (request.url == '/') {
        fs.readFile('./titles.json', function (err, data) {
            if (err) {
                console.error(err);
                response.end('Server Error');
            } else {
                var titles = JSON.parse(data.toString());
                fs.readFile('./index.html', function (err, data) {
                    if (err) {
                        console.error(err);
                        response.end('Server Error');
                    } else {
                        var tmpl = data.toString();
                        console.log(titles)
                        var html = tmpl.replace('%', titles.join('<li></li>'));
                        response.writeHead(200,
                            {
                                'Content-Type': 'text/html'
                            }
                        )
                        response.end(html);
                    }
                })
            }
        })
    }
}).listen(8000, "127.0.0.1");