var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function (server) {
    io = socketio.listen(server);//启动IO服务器，允许它搭载在已有的HTTP服务器上
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {//定义每个用户连接的处理逻辑
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);//在用户连接上来时赋予其访问名
        joinRoom(socket, 'Kevin');//在用户连接上来时把他放入到聊天室Kevin里

        /**
         * 处理用户的消息、更名，以及聊天室的创建和变更
         */
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        //用户发出请求时，向其提供已经被占用的聊天室列表
        socket.on('rooms', function () {
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        //用户断开连接后清除逻辑
        handleClientDisconnection(socket, nickNames, namesUsed);
    })
};

/**
 * 生成昵称
 * @param socket 连接用户对象
 * @param guestNumber 访问人数纪录
 * @param nickNames 昵称
 * @param namesUsed 存储已使用的昵称
 * @returns {*} 返回目前连接数
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest' + guestNumber; //生成新昵称
    nickNames[socket.id] = name; //把用户昵称跟客户端ID关联上

    //让用户知道他们的昵称
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    //存放已经被占用的昵称
    namesUsed.push(name);

    //增加用来生成昵称的计数器
    return guestNumber + 1;
}

/**
 * 加入房间时提示的信息
 * @param socket
 * @param room
 */

function joinRoom(socket, room) {

    socket.join(room);//让用户进入房间

    currentRoom[socket.id] = room; //纪录用户当前房间

    socket.emit('joinResult', {room: room}); //让用户知道他们进入了新房间

    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.' //让房间里的其他用户知道有新用户进入了房间
    })

    var usersInRoom = io.sockets.clients(room); //确定有哪些用户在这个房间里

    //汇总当前房间里的所有用户
    if (usersInRoom.length > 1) {
        var userInRoomSummary = 'Users currently in ' + room + ': ';
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0) {
                    userInRoomSummary += ', ';
                }
                userInRoomSummary += nickNames[userSocketId];
            }
        }
        userInRoomSummary += '.';
        socket.emit('message', {text: userInRoomSummary});//将房间里其他用户汇总发送个当前用户
    }
}

/**
 * 更新请求的处理逻辑
 * @param socket
 * @param nickNames
 * @param namesUsed
 */
function handleNameChangeAttempts(socket, nickNames, namesUsed) {

    socket.on('nameAttempt', function (name) { //添加nameAttempt事件监听器

        if (name.indexOf('Guest') == 0) { //昵称不能yiGuest开头
            socket.emit('nameResult', {
                success: false,
                message: 'Names cannot begin with "Guest".'
            })
        } else {
            if (namesUsed.indexOf(name) == -1) { //如果昵称没注册上就注册
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete  namesUsed[previousNameIndex];//删除之前的昵称让其他用户可以使用
                socket.emit('nameResult', {
                    success: true,
                    name: name
                })
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + ' is now known as ' + name + '.'
                })
            } else {
                socket.emit('nameResult', { //如果昵称被占用。给客户端发送信息
                    success: false,
                    message: 'That name is already in use'
                })
            }

        }
    })
}

/**
 * 发送信息
 * @param socket
 */
function handleMessageBroadcasting(socket) {
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        })
    })
}

/**
 * 创建信房间
 * @param socket
 */
function handleRoomJoining(socket) {
    socket.on('join', function (room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom)
    })
}

/**
 * 用户断开连接
 * @param socket
 */
function handleClientDisconnection(socket) {
    socket.on('disconnect', function () {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    })
}






















