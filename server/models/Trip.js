class Trip {
  constructor(
    id = null,
    userId,
    pickupLat,
    pickupLon,
    destLat = null,
    destLon = null,
    status = 'requested',
    cabId = null,
    requestedAt = null,
    assignedAt = null,
    startedAt = null,
    completedAt = null,
    estDistanceMeters = null,
    estDurationSeconds = null
  ) {
    this.id = id;
    this.userId = userId;
    this.pickupLat = pickupLat;
    this.pickupLon = pickupLon;
    this.destLat = destLat;
    this.destLon = destLon;
    this.status = status;
    this.cabId = cabId;
    this.requestedAt = requestedAt || new Date();
    this.assignedAt = assignedAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.estDistanceMeters = estDistanceMeters;
    this.estDurationSeconds = estDurationSeconds;
  }

  // Create Trip instance from database row
  static fromDbRow(row) {
    return new Trip(
      row.id,
      row.user_id,
      row.pickup_lat,
      row.pickup_lon,
      row.dest_lat,
      row.dest_lon,
      row.status,
      row.cab_id,
      row.requested_at,
      row.assigned_at,
      row.started_at,
      row.completed_at,
      row.est_distance_meters,
      row.est_duration_seconds
    );
  }

  // Convert to plain object for JSON response
  toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      pickup_lat: this.pickupLat,
      pickup_lon: this.pickupLon,
      dest_lat: this.destLat,
      dest_lon: this.destLon,
      status: this.status,
      cab_id: this.cabId,
      requested_at: this.requestedAt,
      assigned_at: this.assignedAt,
      started_at: this.startedAt,
      completed_at: this.completedAt,
      est_distance_meters: this.estDistanceMeters,
      est_duration_seconds: this.estDurationSeconds
    };
  }

  // Convert to database row format
  toDbRow() {
    return {
      user_id: this.userId,
      pickup_lat: this.pickupLat,
      pickup_lon: this.pickupLon,
      dest_lat: this.destLat,
      dest_lon: this.destLon,
      status: this.status,
      cab_id: this.cabId,
      requested_at: this.requestedAt,
      assigned_at: this.assignedAt,
      started_at: this.startedAt,
      completed_at: this.completedAt,
      est_distance_meters: this.estDistanceMeters,
      est_duration_seconds: this.estDurationSeconds
    };
  }
}

module.exports = Trip;
