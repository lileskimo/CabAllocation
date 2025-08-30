const { query } = require('../db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful!');
    console.log('Current time from DB:', result.rows[0].current_time);
    
    // Count cabs
    const cabCount = await query('SELECT COUNT(*) FROM cabs');
    console.log('Cabs count:', cabCount.rows[0].count);
    
    // Count users
    const userCount = await query('SELECT COUNT(*) FROM users');
    console.log('Users count:', userCount.rows[0].count);
    
    // Show sample data
    const cabs = await query('SELECT driver_name, vehicle_no, status FROM cabs LIMIT 3');
    console.log('Sample cabs:', cabs.rows);
    
    const users = await query('SELECT name, email, role FROM users');
    console.log('Users:', users.rows);
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase(); 