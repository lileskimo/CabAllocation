import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [cabs, setCabs] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token || user.role !== 'admin') {
      setStatus('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }

    fetchCabs();
  }, [navigate]);

  const fetchCabs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/cabs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setCabs(data.cabs);
        setStatus(`Successfully loaded ${data.count} cabs`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:4000/');
      const data = await response.json();
      setStatus(`Backend is working! Status: ${data.status}, Time: ${data.time}`);
    } catch (error) {
      setStatus(`Error connecting to backend: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <h2>Admin Dashboard</h2>
        <p>Loading cabs...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Admin Dashboard</h2>
        <button className="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <p>Manage cabs and system settings. Currently showing {cabs.length} cabs.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Cabs List</h3>
        {cabs.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {cabs.map(cab => (
              <div key={cab.id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>{cab.driver_name}</h4>
                <p><strong>Vehicle:</strong> {cab.vehicle_no}</p>
                <p><strong>Status:</strong> <span style={{ 
                  color: cab.status === 'available' ? 'green' : 
                         cab.status === 'on_trip' ? 'orange' : 'red'
                }}>{cab.status}</span></p>
                <p><strong>Location:</strong> {cab.lat?.toFixed(4)}, {cab.lon?.toFixed(4)}</p>
                <p><strong>Last Update:</strong> {new Date(cab.last_update).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No cabs found.</p>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={fetchCabs}>
          Refresh Cabs
        </button>
        <button className="button" onClick={testBackend}>
          Test Backend Connection
        </button>
      </div>
      
      {status && (
        <div className={`status ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default Admin; 