/*实现并行流程*/
var fs = require('fs');
var completedTasks = 0;
var tasks = [];
var wordCounts = {};
var fileDir = './textCollection';


/**
 * 当所有任务完成后，列出文件中用到的每个单词以及用了多少次
 */
function checkIfComplete() {
    completedTasks++;
    if (completedTasks == tasks.length) {
        for (var index in wordCounts) {
            console.log(index + ': ' + wordCounts[index])
        }
    }
}

/**
 * 对文本中出现的单词进行计数
 * @param text
 */
function countWordsInText(text) {
    var words = text.toString().toLowerCase().split(/\W+/).sort();
    for (var index in words) {
        var word = words[index];
        if (word) wordCounts[word] = (wordCounts[word]) ? wordCounts[word] + 1 : 1;
    }
}


fs.readdir(fileDir, function (err, files) { //查看目录下的文件
    if (err) throw err;
    for (var index in files) {//将每个文件绑定一个函数
        var task = (function (file) {
            return function () {
                fs.readFile(file, function (err, text) {
                    if (err) throw err;
                    countWordsInText(text);
                    checkIfComplete();
                })
            }
        })(fileDir + '/' + files[index]);
        tasks.push(task);
    }
    for (var task in tasks) {
        tasks[task]();
    }
});


















