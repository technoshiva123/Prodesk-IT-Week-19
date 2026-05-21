require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const ticketHandlers = require('./sockets/ticketHandler');

const server = http.createServer(app);
const io = initSocket(server);

io.on('connection', (socket) => {
    console.log(`User connected to system: ${socket.id}`);
    ticketHandlers(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Concurrency server running on port ${PORT}`);
});