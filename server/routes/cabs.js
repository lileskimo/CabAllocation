const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/cabs
 * Admin only - list all cabs
 */
router.get('/', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cabs ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/cabs/available
 * Any logged-in user - list available & recent cabs
 */
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM cabs
       WHERE status = 'available'`
      //  AND now() - last_update < interval '5 minutes'`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/cabs
 * Admin only - create a new cab
 */
router.post('/', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const { driver_name, vehicle_no, lat, lon } = req.body;
    if (!driver_name || !vehicle_no) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    const result = await pool.query(
      `INSERT INTO cabs (driver_name, vehicle_no, status, lat, lon, last_update)
       VALUES ($1,$2,'available',$3,$4,now())
       RETURNING *`,
      [driver_name, vehicle_no, lat || null, lon || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PUT /api/cabs/:id/location
 * Any logged-in user (driver/simulator) - update cab location
 */
router.put('/:id/location', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Missing coordinates' });
    }
    const result = await pool.query(
      `UPDATE cabs
       SET lat=$1, lon=$2, last_update=now()
       WHERE id=$3
       RETURNING *`,
      [lat, lon, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cab not found' });
    }

    // Find the ongoing trip for this cab
    const tripResult = await pool.query(
      `SELECT * FROM trips WHERE cab_id = $1 AND status IN ('assigned', 'enroute', 'ongoing') ORDER BY assigned_at DESC LIMIT 1`,
      [id]
    );
    if (tripResult.rows.length > 0) {
      const trip = tripResult.rows[0];
      // Calculate remaining time (replace with your actual logic)
      const timeRemaining = trip.est_duration_seconds || 0;
      const tripStatus = trip.status;
      const io = req.app.get('io');
      io.to(`trip_${trip.id}`).emit('trip:update', {
        newDriverLocation: { lat, lng: lon },
        timeRemaining,
        tripStatus
      });
    }

    // Emit real-time update for cab location (all clients)
    req.app.get('io').emit('cabLocationUpdate', {
      cabId: id,
      lat,
      lon,
      last_update: result.rows[0].last_update
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PUT /api/cabs/:id/status
 * Admin only - update cab status
 */
router.put('/:id/status', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['available', 'on_trip', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const result = await pool.query(
      `UPDATE cabs
       SET status=$1, last_update=now()
       WHERE id=$2
       RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cab not found' });
    }
    // If status is updated to 'available', try to assign pending trips
    if (status === 'available') {
      const pendingTrips = await pool.query(
        `SELECT * FROM trips WHERE status = 'pending' ORDER BY requested_at ASC`
      );
      for (const trip of pendingTrips.rows) {
        // You may want to check location compatibility here
        await pool.query(
          `UPDATE trips SET cab_id = $1, status = 'assigned' WHERE id = $2`,
          [id, trip.id]
        );
        // Optionally: break after assigning one trip per cab
        break;
      }
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PUT /api/cabs/:id/admin-location
 * Admin only - update cab location (admin override)
 */
router.put('/:id/admin-location', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Missing coordinates' });
    }
    const result = await pool.query(
      `UPDATE cabs
       SET lat=$1, lon=$2, last_update=now()
       WHERE id=$3
       RETURNING *`,
      [lat, lon, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cab not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;