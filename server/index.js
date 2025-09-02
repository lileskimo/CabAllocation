require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // 1. Import Server class
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cabs', require('./routes/cabs'));
app.use('/api/trips', require('./routes/trips'));

const server = http.createServer(app);

// 2. Create a new socket.io server instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// 4. Set up a 'connection' event listener
io.on('connection', (socket) => {
  // 5. Log when a client connects
  console.log('socket connected', socket.id);

  // 6. Log when a client disconnects
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });

  // 7. Listen for 'joinTripRoom' event
  socket.on('joinTripRoom', (tripId) => {
    // 8. Join the room and log it
    socket.join(`trip_${tripId}`);
    console.log(`Socket ${socket.id} joined room trip_${tripId}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };