const Trip = require('../models/Trip');
const Cab = require('../models/Cab');
const { Pool } = require('pg');
// const Graph = require('../utils/Graph');
// const graphData = require('../utils/iit_jodhpur_graph.json');
// const graph = new Graph(graphData);

// function calculateETA(cabLat, cabLon, pickupLat, pickupLon, destLat, destLon) {
//   // Use your AStarAllocation or Graph to get time estimates
//   // For example, assume 1 min per edge for simplicity
//   const toPickup = graph.shortestPathTime(cabLat, cabLon, pickupLat, pickupLon); // implement this
//   const toDestination = graph.shortestPathTime(pickupLat, pickupLon, destLat, destLon); // implement this
//   return toPickup + toDestination;
// }

class TripService {
  constructor(allocationStrategy) {
    this.allocationStrategy = allocationStrategy;
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  async createTripRequest(userId, pickup_lat, pickup_lon, dest_lat, dest_lon) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create trip with status "requested"
      const trip = new Trip(
        null,
        userId,
        pickup_lat,
        pickup_lon,
        dest_lat,
        dest_lon,
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
         WHERE status = 'available' 
         AND now() - last_update < interval '5 minutes'`
      );

      const cabs = cabsResult.rows.map(row => Cab.fromDbRow(row));

      // Assign cab using strategy
      const assignment = this.allocationStrategy.assignCab(createdTrip, cabs);

      if (!assignment) {
        await client.query('COMMIT');
        return {
          trip: createdTrip,
          assignedCab: null,
          est_distance_m: null,
          est_duration_s: null,
          status: 'requested'
        };
      }

      // Update trip with cab assignment
      const assignedAt = new Date();
      const estDistanceMeters = Math.round(assignment.distance);
      const estDurationSeconds = Math.round(assignment.eta);

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

      // // Notify that a trip has been assigned
      // req.app.get('io').emit('tripAssigned', {
      //   tripId: updatedTrip.id,
      //   cabId: assignment.cab.id,
      //   userId: updatedTrip.userId
      // });

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
}

module.exports = TripService;
