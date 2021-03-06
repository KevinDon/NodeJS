/* Server */
var http = require('http'); //内置的http模块提供了http服务器和客户端功能

var fs = require('fs');//内置的fs模块提供了与文件系统相关的功能

var path = require('path');//内置的path模块提供了与文件系统路径相关的功能

var mime = require('mime'); //附加的mime模块有根据扩展名得出MIME类型的能力

var cahce = {}; //cache是用来缓存文件内容的对象

/**
 *
 *请求的文件不存在时发送404错误
 * @param response 响应对象
 */
function send404(response) {
    response.writeHead(
        404,
        {'Content-Type': 'text/plain'}
    );
    response.write('Error 404: resource not found');
    response.end();
}

/**
 * 提供文件数据服务
 * @param response  响应对象
 * @param filePath 文件路径
 * @param fileContents 文件内容
 */
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {'content-type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents)
}

/**
 * 判断静态
 * @param response 响应对象
 * @param cache 缓存对象
 * @param absPath 文件路径
 */
function serverStatic(response, cache, absPath) {
    if (cache[absPath]) { //检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {//从硬盘中读取文件
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data; //从硬盘中读取文件并返回
                        sendFile(response, absPath, data);
                    }
                })
            } else {
                send404(response);
            }
        })
    }
}

/**
 *  创建HTTP服务，用匿名函数定义对每个请求的处理行为
 */
var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';//确认返回的默认HTML文件
    } else {
        filePath = 'public' + request.url;//讲URL路径转为文件的相对路径
    }
    var absPath = './' + filePath;
    serverStatic(response, cahce, absPath);//返回静态文件
});

server.listen(3000, function () {
    console.log('Server listening on port 3000.');
})

//加载一个定制的Node模块，用来处理基于Socket.IO的服务端聊天功能
var chatServer = require('./lib/chat_server');
chatServer.listen(server);





