class Cab {
  constructor(id, driverName, lat, lon, status, lastUpdate, vehicleNo = null) {
    this.id = id;
    this.driverName = driverName;
    this.lat = lat;
    this.lon = lon;
    this.status = status;
    this.lastUpdate = lastUpdate;
    this.vehicleNo = vehicleNo;
  }

  isAvailable() {
    // Check if cab is available and updated within last 5 minutes
    const now = new Date();
    const lastUpdateTime = new Date(this.lastUpdate);
    const timeDiffSeconds = (now - lastUpdateTime) / 1000;
    
    return this.status === 'available' && timeDiffSeconds < 300;
  }

  // Create Cab instance from database row
  static fromDbRow(row) {
    return new Cab(
      row.id,
      row.driver_name,
      row.lat,
      row.lon,
      row.status,
      row.last_update,
      row.vehicle_no
    );
  }

  // Convert to plain object for JSON response
  toJSON() {
    return {
      id: this.id,
      driver_name: this.driverName,
      lat: this.lat,
      lon: this.lon,
      status: this.status,
      last_update: this.lastUpdate,
      vehicle_no: this.vehicleNo
    };
  }
}

module.exports = Cab;
