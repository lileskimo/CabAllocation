const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

async function testTripRequest() {
  console.log('🧪 Testing Trip Request Endpoint...\n');

  try {
    // Create a test JWT token for an employee user
    const testUser = {
      id: 11, // Use the real user ID we just created
      email: 'employee@test.com',
      role: 'employee'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET || 'changeme');
    
    console.log('✅ Test token created');
    
    // Test trip request data
    const tripData = {
      pickup_lat: 26.47,
      pickup_lon: 73.12,
      dest_lat: 26.48,
      dest_lon: 73.13
    };
    
    console.log('📤 Sending trip request with data:', tripData);
    
    // Make request to trip endpoint using built-in http module
    const postData = JSON.stringify(tripData);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/trips/request',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`📥 Response status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          console.log('📥 Response data:', JSON.stringify(responseData, null, 2));
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Trip request test completed successfully!');
          } else {
            console.log('❌ Trip request test failed');
          }
        } catch (error) {
          console.log('❌ Failed to parse response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Check if server is running first
function checkServer() {
  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/',
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server is running');
      testTripRequest();
    } else {
      console.log('❌ Server is not responding properly');
    }
  });
  
  req.on('error', (error) => {
    console.log('❌ Server is not running or not accessible');
    console.log('Please start the server first with: node index.js');
  });
  
  req.end();
}

// Run the test
checkServer();
