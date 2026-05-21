const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

// App ko export kiya taaki server.js isko use kar sake
module.exports = app;