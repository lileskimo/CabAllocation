import React, { useState } from 'react';

function Employee() {
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
      <h2>Employee Dashboard</h2>
      <p>This is the employee dashboard for managing cab requests and trips.</p>
      
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

export default Employee; 