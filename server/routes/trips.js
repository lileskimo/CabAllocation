const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/trips - Get trips for logged-in employee
router.get('/', authenticateToken, authorizeRole('employee'), async (req, res) => {
  try {
    const trips = await query(`
      SELECT t.id, t.pickup_lat, t.pickup_lon, t.dest_lat, t.dest_lon, 
             t.status, t.requested_at, t.assigned_at, t.started_at, t.completed_at,
             c.driver_name, c.vehicle_no
      FROM trips t
      LEFT JOIN cabs c ON t.cab_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.requested_at DESC
    `, [req.user.id]);
    
    res.json({
      message: 'Trips retrieved successfully',
      count: trips.rows.length,
      trips: trips.rows
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trips - Keep the test endpoint for non-authenticated access
router.get('/test', (req, res) => {
  res.json({ message: 'Trips routes working', endpoint: '/api/trips' });
});

module.exports = router; 