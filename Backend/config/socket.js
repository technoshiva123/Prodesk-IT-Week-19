const { Server } = require('socket.io')

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            method: ["GET", "POST"],
            credentials: true
        }
    });
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized !");
    }
    return io;
}

module.exports = { initSocket, getIO }