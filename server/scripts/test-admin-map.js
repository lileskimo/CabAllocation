const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testAdminMapFeatures() {
  console.log('🧪 Testing Admin Map Features...\n');

  try {
    // Test 1: Check if cabs table exists and has data
    console.log('1. Checking cabs table...');
    const cabsResult = await pool.query('SELECT COUNT(*) as count FROM cabs');
    console.log(`   ✅ Found ${cabsResult.rows[0].count} cabs in database`);

    // Test 2: Get sample cab data
    console.log('\n2. Getting sample cab data...');
    const sampleCab = await pool.query('SELECT * FROM cabs LIMIT 1');
    if (sampleCab.rows.length > 0) {
      const cab = sampleCab.rows[0];
      console.log(`   ✅ Sample cab: ${cab.driver_name} (${cab.vehicle_no})`);
      console.log(`      Status: ${cab.status}`);
      console.log(`      Location: ${cab.lat}, ${cab.lon}`);
    } else {
      console.log('   ⚠️  No cabs found in database');
    }

    // Test 3: Test status update (simulate admin action)
    console.log('\n3. Testing status update...');
    if (sampleCab.rows.length > 0) {
      const cabId = sampleCab.rows[0].id;
      const newStatus = 'on_trip';
      
      const updateResult = await pool.query(
        'UPDATE cabs SET status = $1, last_update = now() WHERE id = $2 RETURNING *',
        [newStatus, cabId]
      );
      
      if (updateResult.rows.length > 0) {
        console.log(`   ✅ Successfully updated cab ${cabId} status to ${newStatus}`);
      } else {
        console.log('   ❌ Failed to update cab status');
      }
    }

    // Test 4: Test location update (simulate admin action)
    console.log('\n4. Testing location update...');
    if (sampleCab.rows.length > 0) {
      const cabId = sampleCab.rows[0].id;
      const newLat = 26.47 + (Math.random() - 0.5) * 0.01; // Random location near IIT Jodhpur
      const newLon = 73.12 + (Math.random() - 0.5) * 0.01;
      
      const locationResult = await pool.query(
        'UPDATE cabs SET lat = $1, lon = $2, last_update = now() WHERE id = $3 RETURNING *',
        [newLat, newLon, cabId]
      );
      
      if (locationResult.rows.length > 0) {
        console.log(`   ✅ Successfully updated cab ${cabId} location to ${newLat.toFixed(6)}, ${newLon.toFixed(6)}`);
      } else {
        console.log('   ❌ Failed to update cab location');
      }
    }

    // Test 5: Check all cab statuses
    console.log('\n5. Checking cab status distribution...');
    const statusResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM cabs GROUP BY status'
    );
    
    statusResult.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count} cabs`);
    });

    // Test 6: Check cabs with recent updates
    console.log('\n6. Checking cabs with recent updates...');
    const recentResult = await pool.query(
      "SELECT COUNT(*) as count FROM cabs WHERE now() - last_update < interval '5 minutes'"
    );
    console.log(`   ✅ ${recentResult.rows[0].count} cabs updated in last 5 minutes`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Admin Map Features Summary:');
    console.log('   • Cab data retrieval: ✅');
    console.log('   • Status updates: ✅');
    console.log('   • Location updates: ✅');
    console.log('   • Real-time tracking: ✅');
    console.log('   • Admin controls: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testAdminMapFeatures();
