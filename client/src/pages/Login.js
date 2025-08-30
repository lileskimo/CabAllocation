import React, { useState } from 'react';

function Login() {
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
      <h2>Login Page</h2>
      <p>This is a placeholder login page for the Smart Cab Allocation System.</p>
      
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

export default Login; 