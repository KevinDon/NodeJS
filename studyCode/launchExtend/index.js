var fs = require('fs'), watchDir = './watch', processedDir = './done', events = require('events'),
    util = require('util')

function Watcher(watchDir, processedDir) {
    this.watchDir = watchDir;
    this.processedDir = processedDir;
}

util.inherits(Watcher, events.EventEmitter);

Watcher.prototype.watch = function () {  // 扩展EventEmitter添加处理文件的方法
    var watcher = this; //保存watcher对象的引用，以便在readdir中使用
    fs.readdir(this.watchDir, function (err, files) {
        console.log(files);
        if (err) throw err;
        for (var index in files) {
            watcher.emit('process', files[index]); //处理watch目录下的所有文件
        }
    })
};

Watcher.prototype.start = function () {//添加开始监控方法
    var watcher = this;
    fs.watch(watchDir, function () {
        console.log('NO');
        watcher.watch();
    })
};


var watcher = new Watcher(watchDir, processedDir);

watcher.on('process', function process(file) {
    console.log(file);
    var watchFile = this.watchDir + '/' + file;
    var processedFile = this.processedDir + '/' + file.toLowerCase();
    fs.rename(watchFile, processedFile, function (err) {
        if (err) throw err;
    })
});

watcher.start();