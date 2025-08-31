const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestCabs() {
  console.log('🚗 Creating test cabs...\n');

  try {
    // Test cab data - locations around IIT Jodhpur
    const testCabs = [
      {
        driver_name: 'John Driver',
        vehicle_no: 'RJ-14-AB-1234',
        lat: 26.47,
        lon: 73.12,
        status: 'available'
      },
      {
        driver_name: 'Sarah Driver',
        vehicle_no: 'RJ-14-CD-5678',
        lat: 26.48,
        lon: 73.13,
        status: 'available'
      },
      {
        driver_name: 'Mike Driver',
        vehicle_no: 'RJ-14-EF-9012',
        lat: 26.46,
        lon: 73.11,
        status: 'available'
      }
    ];

    for (const cab of testCabs) {
      const result = await pool.query(
        `INSERT INTO cabs (driver_name, vehicle_no, lat, lon, status, last_update)
         VALUES ($1, $2, $3, $4, $5, now())
         RETURNING *`,
        [cab.driver_name, cab.vehicle_no, cab.lat, cab.lon, cab.status]
      );
      
      console.log(`✅ Created cab: ${cab.driver_name} (${cab.vehicle_no})`);
    }

    console.log('\n🎉 All test cabs created successfully!');
    
    // Show all cabs
    const allCabs = await pool.query('SELECT * FROM cabs ORDER BY id');
    console.log('\n📋 All cabs in database:');
    allCabs.rows.forEach(cab => {
      console.log(`   ID: ${cab.id} | ${cab.driver_name} | ${cab.vehicle_no} | ${cab.status} | ${cab.lat}, ${cab.lon}`);
    });

  } catch (error) {
    console.error('❌ Error creating test cabs:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the script
createTestCabs();
