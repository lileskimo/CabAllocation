const Trip = require('../models/Trip');
const Cab = require('../models/Cab');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class TripService {
  constructor(allocationStrategy) {
    this.allocationStrategy = allocationStrategy;
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Load graph JSON file
    const graphPath = path.join(__dirname, '../utils/iit_jodhpur_graph.json');
    const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));

    this.nodes = graphData.nodes;  // {id: {lat, lon}}
    this.edges = graphData.edges;  // adjacency list
  }

  // Haversine distance in meters
  haversine(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Find nearest node from graph
  findNearestNode(lat, lon) {
    let nearestId = null;
    let nearestNode = null;
    let minDist = Infinity;

    for (const [nodeId, coords] of Object.entries(this.nodes)) {
      const d = this.haversine(lat, lon, coords.lat, coords.lon);
      if (d < minDist) {
        minDist = d;
        nearestId = nodeId;
        nearestNode = coords;
      }
    }
    return { id: nearestId, ...nearestNode };
  }

  async createTripRequest(userId, pickup_lat, pickup_lon, dest_lat, dest_lon) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Snap pickup and destination to nearest graph nodes
      const nearestPickup = this.findNearestNode(pickup_lat, pickup_lon);
      const nearestDest = this.findNearestNode(dest_lat, dest_lon);

      // Create trip with status "requested"
      const trip = new Trip(
        null,
        userId,
        nearestPickup.lat,
        nearestPickup.lon,
        nearestDest.lat,
        nearestDest.lon,
        'requested'
      );

      // Insert trip into database
      const tripResult = await client.query(
        `INSERT INTO trips (user_id, pickup_lat, pickup_lon, dest_lat, dest_lon, status, requested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          trip.userId,
          trip.pickupLat,
          trip.pickupLon,
          trip.destLat,
          trip.destLon,
          trip.status,
          trip.requestedAt
        ]
      );

          const createdTrip = Trip.fromDbRow(tripResult.rows[0]);

      // Get available cabs
      const cabsResult = await client.query(
        `SELECT * FROM cabs 
         WHERE status = 'available' `
        // AND now() - last_update < interval '5 minutes'`
      );

      let cabs = cabsResult.rows.map(row => Cab.fromDbRow(row));

      // Snap each cab to its nearest node
   cabs = cabs.map(cab => {
  const nearestNode = this.findNearestNode(cab.lat, cab.lon);
  cab.lat = nearestNode.lat;
  cab.lon = nearestNode.lon;
  cab.nodeId = nearestNode.id; // extra field if needed
  return cab;  // still a Cab instance
});



      // Assign cab using strategy
      const assignment = this.allocationStrategy.assignCab(createdTrip, cabs);

      if (!assignment) {
        await client.query('COMMIT');
        return {
          trip: createdTrip,
          assignedCab: null,
          est_distance_m: null,
          est_duration_s: null,
          status: 'failed'
        };
      }

      // Update trip with cab assignment
      const assignedAt = new Date();
      const directDistance = this.haversine(
      createdTrip.pickupLat,
      createdTrip.pickupLon,
      createdTrip.destLat,
      createdTrip.destLon
      );

      const estDistanceMeters = Math.round(assignment.distance + directDistance);
      const estDurationSeconds = Math.round(directDistance / 8.33 + assignment.eta);

      const updatedTripResult = await client.query(
        `UPDATE trips 
         SET cab_id = $1, status = $2, assigned_at = $3, 
             est_distance_meters = $4, est_duration_seconds = $5
         WHERE id = $6
         RETURNING *`,
        [
          assignment.cab.id,
          'assigned',
          assignedAt,
          estDistanceMeters,
          estDurationSeconds,
          createdTrip.id
        ]
      );

      const updatedTrip = Trip.fromDbRow(updatedTripResult.rows[0]);

      // Update cab status to "on_trip"
      await client.query(
        `UPDATE cabs 
         SET status = 'on_trip', last_update = now()
         WHERE id = $1`,
        [assignment.cab.id]
      );

      await client.query('COMMIT');

      return {
        tripId: updatedTrip.id,
        assignedCab: assignment.cab.toJSON(),
        est_distance_m: estDistanceMeters,
        est_duration_s: estDurationSeconds,
        status: 'assigned'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createTripRequest:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getTripsByUserId(userId) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM trips WHERE user_id = $1 ORDER BY requested_at DESC`,
        [userId]
      );

      return result.rows.map(row => Trip.fromDbRow(row));
    } catch (error) {
      console.error('Error getting trips by user ID:', error);
      throw error;
    }
  }

  async getTripById(tripId) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM trips WHERE id = $1`,
        [tripId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Trip.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error('Error getting trip by ID:', error);
      throw error;
    }
  }

  async completeTrip(tripId, userId) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get the trip, verify ownership and status, and lock the row for update
      const tripResult = await client.query(
        `SELECT * FROM trips WHERE id = $1 AND user_id = $2 FOR UPDATE`,
        [tripId, userId]
      );

      if (tripResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Trip not found or access denied' };
      }

      const trip = Trip.fromDbRow(tripResult.rows[0]);

      // Check if trip can be completed
      if (trip.status !== 'assigned') {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: `Trip cannot be completed. Current status: ${trip.status}`,
        };
      }

      // Snap destination to nearest node
      const nearestDest = this.findNearestNode(trip.destLat, trip.destLon);

      // Update trip status
      const updatedTripResult = await client.query(
        `UPDATE trips 
         SET status = 'completed', completed_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [tripId]
      );

      const updatedTrip = Trip.fromDbRow(updatedTripResult.rows[0]);
      let updatedCab = null;

      // Update cab to nearest node coordinates
      if (updatedTrip.cabId) {
        const cabResult = await client.query(
          `UPDATE cabs 
           SET lat = $1, lon = $2, status = 'available', last_update = NOW()
           WHERE id = $3 RETURNING *`,
          [nearestDest.lat, nearestDest.lon, updatedTrip.cabId]
        );
        if (cabResult.rows.length > 0) {
          updatedCab = Cab.fromDbRow(cabResult.rows[0]);
        }
      }

      await client.query('COMMIT');

      return {
        success: true,
        trip: updatedTrip.toJSON(),
        cab: updatedCab ? updatedCab.toJSON() : null,
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in completeTrip:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = TripService;
