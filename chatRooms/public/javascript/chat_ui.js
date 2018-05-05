/**
 * 处理可疑文本
 * @param message
 * @returns {jQuery}
 */
function divEscapedContentElement(message) {
    return $('<div></div>').text(message)
}

/**
 * 显示授信的文本
 * @param message
 * @returns {jQuery}
 */
function divSystemContentElement(message) {
    return $('<div></div>').html('<li>' + message + '</li>');
}

/**
 * 处理原始的用户输入
 * @param chatApp
 * @param socket
 */
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    if (message.charAt(0) == '/') { //如果用户输入的内容一斜杠(/)开头，将其作为聊天命令
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    } else {
        chatApp.sendMessage($('#room').text(), message);//将非命令输入广播给其他用户
        $('#message').append(divEscapedContentElement(message));
        $('#message').scrollTop($('#message').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

var socket = io.connect();
$(document).ready(function () {
    var chatApp = new Chat(socket);
    socket.on('nameResult', function (result) { //尝试更名结果
        var message;

        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#message').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function (result) { //显示变更房间结果
        $('#room').text(result.room);
        $('#message').append(divSystemContentElement('Room changed.'));
    });

    socket.on('message', function (message) { //显示接收到的信息
        var newElement = $('<div></div>').text(message.text);
        $('#message').append(newElement);
    })

    socket.on('rooms', function (rooms) { //显示可用房间列表
        $('#room-list').empty();
        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        $('#room-list div').click(function () {
            console.log('ok');
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        })
    });


    //定期请求可用房间
    setInterval(function () {
        socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();
    $('#send-form').submit(function () { //提交表单可以发送聊天信息
        console.log('send')
        processUserInput(chatApp, socket);
        return false;
    })
});














