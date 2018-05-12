/**
 * 简单的流程中实行串行化流程控制
 */
var fs = require('fs');
var request = require('request');
var htmlparser = require('htmlparser');
var configFilename = './rss_feeds.txt';


/**
 * 检车RSS文件是否存在
 */
function checkForRSSFile() {
    fs.exists(configFilename, function (exists) {
        if (!exists) return next(new Error('Miss RSS file ' + configFilename));
        next(null, configFilename);
    })
}

/**
 * 从预订源的URL数据中随机获取一个
 * @param configFilename
 */
function readRSSFile(configFilename) {
    fs.readFile(configFilename, function (err, feedList) {
        if (err) return next(err);
        feedList = feedList.toString().replace(/^\s+|\s+$/g, '').split('\n');
        var random = Math.floor(Math.random() * feedList.length);
        next(null, feedList[random]);
    })
}

/**
 * 向预订源发送请求
 * @param feedUrl
 */
function downloadRSSFeed(feedUrl) {
    request({uri: feedUrl}, function (err, res, body) {
        if (err) return next(err);
        if (res.statusCode != 200) return next(new Error('Abnormal response status code'));
        next(null, body)
    })
}

function parseRSSFeed(rss) {
    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rss);
    if (!handler.dom.items.length) return next(new Error('No RSS items found'));
    var item = handler.dom.items.shift();
    console.log(item.title);
    console.log(item.link);
}

var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
];

/**
 * 负责执行任务的NEXT函数
 * @param err
 * @param reslut
 */
function next(err, result) {
    if (err) throw err;

    var currentTask = tasks.shift();
    if (currentTask) {
        currentTask(result);
    }
}

next();


