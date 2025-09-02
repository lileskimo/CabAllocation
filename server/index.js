require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const pinoHttp = require('pino-http');

// Monitoring helpers
const logger = require('./monitoring/logger');
const { metricsMiddleware } = require('./monitoring/metrics');

const app = express();
app.use(cors());
app.use(express.json());

// --- Monitoring ---
app.use(pinoHttp({ logger }));     // request logging in JSON
app.use(metricsMiddleware);        // exposes /metrics
app.get('/healthz', (req, res) => res.status(200).send('ok')); // health endpoint

// Dev logs (kept morgan for quick human-readable logs)
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cabs', require('./routes/cabs'));
app.use('/api/trips', require('./routes/trips'));

const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });

  socket.on('joinTripRoom', (tripId) => {
    socket.join(`trip_${tripId}`);
    console.log(`Socket ${socket.id} joined room trip_${tripId}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
