var clients = [];
var http = require("http");
var fs = require("fs");

var httpServer = http.createServer(function(request, response) {
    fs.readFile(__dirname + "/index.html", "utf8", function(error, content) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.end(content);
    });
}).listen(process.env.PORT || 1337);

var io = require("./socket.io").listen(httpServer);

io.sockets.on("connection", function(socket) {

    socket.on('join', function(nick, callback) {
        socket.nick = nick;
        clients.push(nick);
        socket.broadcast.emit("user-joined", nick, clients.length);
        callback(true, clients, clients.length);
    });

    socket.on("chat", function(message) {
        if (socket.nick && message) {
            io.sockets.emit("chat", {sender: socket.nick, message: message});
        }
    });

    socket.on("disconnect", function() {
        if (socket.nick) {
            clients.splice(clients.indexOf(socket.nick), 1);
            io.sockets.emit("user-left", socket.nick, clients.length);
        }
    });

});