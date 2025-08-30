const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/cabs - Get all cabs (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const cabs = await query(`
      SELECT id, driver_name, vehicle_no, status, lat, lon, last_update 
      FROM cabs 
      ORDER BY last_update DESC
    `);
    
    res.json({
      message: 'Cabs retrieved successfully',
      count: cabs.rows.length,
      cabs: cabs.rows
    });
  } catch (error) {
    console.error('Error fetching cabs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cabs - Keep the test endpoint for non-authenticated access
router.get('/test', (req, res) => {
  res.json({ message: 'Cabs routes working', endpoint: '/api/cabs' });
});

module.exports = router; 