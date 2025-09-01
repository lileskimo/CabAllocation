require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// placeholder routes files (to be created later)
app.use('/api/auth', require('./routes/auth')); // create simple router files that export express.Router()
app.use('/api/cabs', require('./routes/cabs'));
app.use('/api/trips', require('./routes/trips'));

// socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };