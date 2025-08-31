const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('trips').del();
  await knex('cabs').del();
  await knex('users').del();

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const employeePasswordHash = await bcrypt.hash('employee123', 10);

  // Insert users
  const users = await knex('users').insert([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      role: 'admin'
    },
    {
      name: 'Employee User',
      email: 'employee@example.com',
      password_hash: employeePasswordHash,
      role: 'employee'
    }
  ]).returning('*');

  console.log('Users created:', users.length);

  // Insert cabs with sample coordinates (near IIT Jodhpur) - most recent for testing
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
  const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const cabs = await knex('cabs').insert([
    {
      driver_name: 'Rajesh Kumar',
      vehicle_no: 'MH01AB1234',
      status: 'available',
      lat: 26.47,
      lon: 73.12,
      last_update: now // Very recent - should be available for trips
    },
    {
      driver_name: 'Amit Singh',
      vehicle_no: 'MH02CD5678',
      status: 'available',
      lat: 26.471,
      lon: 73.121,
      last_update: oneMinuteAgo // Recent - should be available for trips
    },
    {
      driver_name: 'Suresh Patel',
      vehicle_no: 'MH03EF9012',
      status: 'offline',
      lat: 26.472,
      lon: 73.122,
      last_update: tenMinutesAgo // Old update - should not appear in available
    },
    {
      driver_name: 'Vikram Sharma',
      vehicle_no: 'MH04GH3456',
      status: 'available',
      lat: 26.473,
      lon: 73.123,
      last_update: threeMinutesAgo // Recent - should be available for trips
    },
    {
      driver_name: 'Deepak Verma',
      vehicle_no: 'MH05IJ7890',
      status: 'on_trip',
      lat: 26.474,
      lon: 73.124,
      last_update: now // Recent update but on_trip - should not appear in available
    },
    {
      driver_name: 'Rahul Mehta',
      vehicle_no: 'MH06KL2345',
      status: 'available',
      lat: 26.475,
      lon: 73.125,
      last_update: now // Very recent - should be available for trips
    }
  ]).returning('*');

  console.log('Cabs created:', cabs.length);

  return { users, cabs };
};