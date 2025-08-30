import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Employee() {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

    fetchTrips();
  }, [navigate]);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/trips', {
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
        setTrips(data.trips);
        setStatus(`Successfully loaded ${data.count} trips`);
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
        <h2>Employee Dashboard</h2>
        <p>Loading trips...</p>
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
      
      <p>View and manage your cab trips. Currently showing {trips.length} trips.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>My Trips</h3>
        {trips.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>Trip #{trip.id}</h4>
                <p><strong>Status:</strong> <span style={{ 
                  color: trip.status === 'completed' ? 'green' : 
                         trip.status === 'ongoing' ? 'orange' : 'blue'
                }}>{trip.status}</span></p>
                <p><strong>Pickup:</strong> {trip.pickup_lat?.toFixed(4)}, {trip.pickup_lon?.toFixed(4)}</p>
                {trip.dest_lat && (
                  <p><strong>Destination:</strong> {trip.dest_lat?.toFixed(4)}, {trip.dest_lon?.toFixed(4)}</p>
                )}
                {trip.driver_name && (
                  <p><strong>Driver:</strong> {trip.driver_name} ({trip.vehicle_no})</p>
                )}
                <p><strong>Requested:</strong> {new Date(trip.requested_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <h3>No trips yet</h3>
            <p>You haven't made any cab requests yet.</p>
            <p>This is expected since we haven't implemented trip creation yet.</p>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={fetchTrips}>
          Refresh Trips
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