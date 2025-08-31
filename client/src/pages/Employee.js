import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Employee() {
  const [availableCabs, setAvailableCabs] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [locationUpdate, setLocationUpdate] = useState({
    lat: '',
    lon: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is employee
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token || user.role !== 'employee') {
      setStatus('Access denied. Employee privileges required.');
      navigate('/login');
      return;
    }

    fetchAvailableCabs();
  }, [navigate]);

  const fetchAvailableCabs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/cabs/available', {
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
      
      if (data.success) {
        setAvailableCabs(data.data);
        setStatus(`Found ${data.data.length} available cabs`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCabLocation = async (e) => {
    e.preventDefault();
    if (!selectedCab) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/cabs/${selectedCab.id}/location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: parseFloat(locationUpdate.lat),
          lon: parseFloat(locationUpdate.lon)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(`Cab location updated successfully!`);
        setShowLocationForm(false);
        setSelectedCab(null);
        setLocationUpdate({ lat: '', lon: '' });
        fetchAvailableCabs(); // Refresh the list
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
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

  const openLocationForm = (cab) => {
    setSelectedCab(cab);
    setLocationUpdate({
      lat: cab.lat?.toString() || '',
      lon: cab.lon?.toString() || ''
    });
    setShowLocationForm(true);
  };

  if (isLoading) {
    return (
      <div className="page">
        <h2>Employee Dashboard</h2>
        <p>Loading available cabs...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Employee Dashboard</h2>
        <button className="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <p>View available cabs and manage cab locations. Currently showing {availableCabs.length} available cabs.</p>
      
      {/* Location Update Form */}
      {showLocationForm && selectedCab && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '1rem', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          marginBottom: '2rem'
        }}>
          <h3>Update Cab Location</h3>
          <p><strong>Driver:</strong> {selectedCab.driver_name} ({selectedCab.vehicle_no})</p>
          <form onSubmit={updateCabLocation}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={locationUpdate.lat}
                  onChange={(e) => setLocationUpdate({...locationUpdate, lat: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={locationUpdate.lon}
                  onChange={(e) => setLocationUpdate({...locationUpdate, lon: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="button">
                Update Location
              </button>
              <button 
                type="button" 
                className="button" 
                onClick={() => {
                  setShowLocationForm(false);
                  setSelectedCab(null);
                  setLocationUpdate({ lat: '', lon: '' });
                }}
                style={{ backgroundColor: '#666' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Available Cabs</h3>
        {availableCabs.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {availableCabs.map(cab => (
              <div key={cab.id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4>{cab.driver_name}</h4>
                    <p><strong>Vehicle:</strong> {cab.vehicle_no}</p>
                    <p><strong>Status:</strong> <span style={{ color: 'green' }}>{cab.status}</span></p>
                    <p><strong>Location:</strong> {cab.lat?.toFixed(4)}, {cab.lon?.toFixed(4)}</p>
                    <p><strong>Last Update:</strong> {new Date(cab.last_update).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      className="button" 
                      onClick={() => openLocationForm(cab)}
                      style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                    >
                      Update Location
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <h3>No available cabs</h3>
            <p>There are currently no cabs available for booking.</p>
            <p>This could mean:</p>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>All cabs are currently on trips</li>
              <li>Cabs are offline</li>
              <li>No cabs have been updated recently (within 5 minutes)</li>
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={fetchAvailableCabs}>
          Refresh Available Cabs
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

export default Employee; 