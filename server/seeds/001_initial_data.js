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

  // Insert cabs with sample coordinates (near Mumbai) - some recent, some older
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const cabs = await knex('cabs').insert([
    {
      driver_name: 'Rajesh Kumar',
      vehicle_no: 'MH01AB1234',
      status: 'available',
      lat: 19.0760,
      lon: 72.8777,
      last_update: now // Recent update - should appear in available
    },
    {
      driver_name: 'Amit Singh',
      vehicle_no: 'MH02CD5678',
      status: 'available',
      lat: 19.0720,
      lon: 72.8810,
      last_update: now // Recent update - should appear in available
    },
    {
      driver_name: 'Suresh Patel',
      vehicle_no: 'MH03EF9012',
      status: 'offline',
      lat: 19.0760,
      lon: 72.8777,
      last_update: tenMinutesAgo // Old update - should not appear in available
    },
    {
      driver_name: 'Vikram Sharma',
      vehicle_no: 'MH04GH3456',
      status: 'available',
      lat: 19.0780,
      lon: 72.8750,
      last_update: fiveMinutesAgo // Recent update - should appear in available
    },
    {
      driver_name: 'Deepak Verma',
      vehicle_no: 'MH05IJ7890',
      status: 'on_trip',
      lat: 19.0740,
      lon: 72.8790,
      last_update: now // Recent update but on_trip - should not appear in available
    },
    {
      driver_name: 'Rahul Mehta',
      vehicle_no: 'MH06KL2345',
      status: 'available',
      lat: 19.0800,
      lon: 72.8730,
      last_update: tenMinutesAgo // Old update - should not appear in available
    }
  ]).returning('*');

  console.log('Cabs created:', cabs.length);

  return { users, cabs };
};