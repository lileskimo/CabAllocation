import React, { useState } from 'react';

function Admin() {
  const [status, setStatus] = useState('');

  const testBackend = async () => {
    try {
      const response = await fetch('/');
      const data = await response.json();
      setStatus(`Backend is working! Status: ${data.status}, Time: ${data.time}`);
    } catch (error) {
      setStatus(`Error connecting to backend: ${error.message}`);
    }
  };

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <p>This is the admin dashboard for managing users, cabs, and system settings.</p>
      
      <button className="button" onClick={testBackend}>
        Test Backend Connection
      </button>
      
      {status && (
        <div className={`status ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default Admin; 