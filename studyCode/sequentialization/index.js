var flow = require('nimble');

flow.series([
    function (callback) {
        setTimeout(function () {
            console.log('First');
            callback();
        }, 1000);
    },
    function (callback) {
        setTimeout(function () {
            console.log('Second');
            callback();
        }, 500);
    },
    function (callback) {
        setTimeout(function () {
            console.log('Third');
            callback();
        }, 100);
    }
]);