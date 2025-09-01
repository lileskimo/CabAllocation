const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Graph = require('../utils/Graph');
const AStarAllocation = require('../strategies/AStarAllocation');
const TripService = require('../services/TripService');
const graph = require('../utils/iit_jodhpur_graph.json');

// function isWithinMapBounds(lat, lon) {
//   const epsilon = 0.0005;
//   // Use Object.values to get an array of node objects
//   return Object.values(graph.nodes).some(node =>
//     Math.abs(node.lat - lat) < epsilon && Math.abs(node.lon - lon) < epsilon
//   );
// }

const router = express.Router();

// Initialize graph and services
let graphInstance = null;
let tripService = null;

// Initialize graph and services on startup
async function initializeServices() {
  try {
    graphInstance = await Graph.loadFromFile('./utils/iit_jodhpur_graph.json');
    const allocationStrategy = new AStarAllocation(graphInstance);
    tripService = new TripService(allocationStrategy);
    console.log('✅ Graph and TripService initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
}

// Initialize on module load
initializeServices();

// POST /api/trips/request - Request a new trip with cab allocation
router.post('/request', authenticateToken, authorizeRole('employee'), async (req, res) => {
  try {
    const { pickup_lat, pickup_lon, dest_lat, dest_lon } = req.body;

    // Validate required fields
    if (!pickup_lat || !pickup_lon) {
      return res.status(400).json({ 
        success: false, 
        error: 'Pickup coordinates are required' 
      });
    }

    // Validate coordinate ranges
    if (pickup_lat < -90 || pickup_lat > 90 || pickup_lon < -180 || pickup_lon > 180) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid pickup coordinates' 
      });
    }

    if (dest_lat && (dest_lat < -90 || dest_lat > 90 || dest_lon < -180 || dest_lon > 180)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid destination coordinates' 
      });
    }

    // Check if services are initialized
    if (!tripService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Trip service is not available' 
      });
    }

    // Check map bounds
    if (!pickup_lat || !pickup_lon || !dest_lat || !dest_lon) {
  return res.status(400).json({ success: false, error: 'Pickup and destination are required.' });
}

    // Create trip request
    const result = await tripService.createTripRequest(
      req.user.id,
      pickup_lat,
      pickup_lon,
      dest_lat,
      dest_lon
    );

    if (result.assignedCab) {
      res.status(201).json({
        success: true,
        tripId: result.tripId,
        assignedCab: result.assignedCab,
        est_distance_m: result.est_distance_m,
        est_duration_s: result.est_duration_s,
        status: result.status
      });
    } else {
      res.status(200).json({
        success: true,
        tripId: result.trip.id,
        assignedCab: null,
        est_distance_m: null,
        est_duration_s: null,
        status: 'requested',
        message: 'Trip requested but no cabs available at the moment'
      });
    }

  } catch (error) {
    console.error('Error creating trip request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/trips - Get trips for logged-in employee
router.get('/', authenticateToken, authorizeRole('employee'), async (req, res) => {
  try {
    const trips = await query(`
      SELECT t.id, t.pickup_lat, t.pickup_lon, t.dest_lat, t.dest_lon, 
             t.status, t.requested_at, t.assigned_at, t.started_at, t.completed_at,
             t.est_distance_meters, t.est_duration_seconds,
             c.driver_name, c.vehicle_no
      FROM trips t
      LEFT JOIN cabs c ON t.cab_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.requested_at DESC
    `, [req.user.id]);
    
    res.json({
      success: true,
      count: trips.rows.length,
      trips: trips.rows
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/trips - Keep the test endpoint for non-authenticated access
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Trips routes working', 
    endpoint: '/api/trips',
    graphLoaded: graphInstance !== null
  });
});

// GET /api/trips/:id - Get specific trip details
router.get('/:id', authenticateToken, authorizeRole('employee'), async (req, res) => {
  try {
    const tripId = req.params.id;
    
    const result = await query(`
      SELECT t.*, c.driver_name, c.vehicle_no
      FROM trips t
      LEFT JOIN cabs c ON t.cab_id = c.id
      WHERE t.id = $1 AND t.user_id = $2
    `, [tripId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Trip not found' 
      });
    }

    res.json({
      success: true,
      trip: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;