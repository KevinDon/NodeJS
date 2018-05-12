var http = require('http');
var express = require('express');
var app = express();

http.createServer(function (request, response) {

    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});
    // var postData = '';
    // request.setEncoding('utf8');
    // request.on('data', function(chunk){
    //     postData += chunk;
    // })
    // //侦听请求的end事件
    // request.on('end', function(){
    //     response.end(postData);
    // })

    // 发送响应数据 "Hello World"
    response.end('Hello World\n');
}).listen(8008);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8008/');