const { Pool } = require('pg');

// Common PostgreSQL connection strings to test
const connectionStrings = [
  'postgres://postgres@localhost:5432/smartcab',           // No password
  'postgres://postgres:postgres@localhost:5432/smartcab',  // postgres/postgres
  'postgres://admin:admin@localhost:5432/smartcab',        // admin/admin
  'postgres://postgres:password@localhost:5432/smartcab',  // postgres/password
];

async function testConnections() {
  console.log('Testing PostgreSQL connections...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const connString = connectionStrings[i];
    console.log(`Testing: ${connString}`);
    
    try {
      const pool = new Pool({ connectionString: connString });
      const result = await pool.query('SELECT NOW() as current_time');
      console.log(`✅ SUCCESS! Connected with: ${connString}`);
      console.log(`   Current time: ${result.rows[0].current_time}\n`);
      
      // Test if database exists
      try {
        await pool.query('SELECT COUNT(*) FROM information_schema.tables');
        console.log('   Database exists and is accessible\n');
      } catch (dbErr) {
        console.log('   Database exists but may need to be created\n');
      }
      
      await pool.end();
      return connString; // Found working connection
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('❌ No working connection found. Please check your PostgreSQL setup.');
  return null;
}

testConnections().then(workingConn => {
  if (workingConn) {
    console.log('🎯 Use this connection string in your .env file:');
    console.log(`DATABASE_URL=${workingConn}`);
  }
}); 