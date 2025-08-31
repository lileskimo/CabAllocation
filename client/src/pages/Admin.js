import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMap from '../components/AdminMap';

function Admin() {
  const [cabs, setCabs] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [newCab, setNewCab] = useState({
    driver_name: '',
    vehicle_no: '',
    lat: '',
    lon: ''
  });
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
      
      if (data.success) {
        setCabs(data.data);
        setStatus(`Successfully loaded ${data.data.length} cabs`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createCab = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/cabs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driver_name: newCab.driver_name,
          vehicle_no: newCab.vehicle_no,
          lat: newCab.lat ? parseFloat(newCab.lat) : null,
          lon: newCab.lon ? parseFloat(newCab.lon) : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('Cab created successfully!');
        setShowCreateForm(false);
        setNewCab({ driver_name: '', vehicle_no: '', lat: '', lon: '' });
        fetchCabs(); // Refresh the list
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const updateCabStatus = async (cabId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/cabs/${cabId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(`Cab status updated to ${newStatus}`);
        fetchCabs(); // Refresh the list
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const updateCabLocation = async (cabId, lat, lon) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/cabs/${cabId}/admin-location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lon })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(`Cab location updated successfully`);
        fetchCabs(); // Refresh the list
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="button" 
            onClick={() => setShowMap(!showMap)}
            style={{ backgroundColor: showMap ? '#28a745' : '#007bff' }}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      <p>Manage cabs and system settings. Currently showing {cabs.length} cabs.</p>
      
      {/* Create Cab Form */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="button" 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ marginBottom: '1rem' }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Cab'}
        </button>
        
        {showCreateForm && (
          <form onSubmit={createCab} style={{ 
            border: '1px solid #ddd', 
            padding: '1rem', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginBottom: '1rem'
          }}>
            <h3>Create New Cab</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Driver Name:</label>
                <input
                  type="text"
                  value={newCab.driver_name}
                  onChange={(e) => setNewCab({...newCab, driver_name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Vehicle Number:</label>
                <input
                  type="text"
                  value={newCab.vehicle_no}
                  onChange={(e) => setNewCab({...newCab, vehicle_no: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={newCab.lat}
                  onChange={(e) => setNewCab({...newCab, lat: e.target.value})}
                  placeholder="19.0760"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={newCab.lon}
                  onChange={(e) => setNewCab({...newCab, lon: e.target.value})}
                  placeholder="72.8777"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            </div>
            <button type="submit" className="button" style={{ marginTop: '1rem' }}>
              Create Cab
            </button>
          </form>
        )}
      </div>

      {/* Map Interface */}
      {showMap && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Cab Management Map</h3>
          <AdminMap
            cabs={cabs}
            onStatusChange={updateCabStatus}
            onLocationUpdate={updateCabLocation}
            selectedCab={selectedCab}
            setSelectedCab={setSelectedCab}
          />
        </div>
      )}
      
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4>{cab.driver_name}</h4>
                    <p><strong>Vehicle:</strong> {cab.vehicle_no}</p>
                    <p><strong>Status:</strong> <span style={{ 
                      color: cab.status === 'available' ? 'green' : 
                             cab.status === 'on_trip' ? 'orange' : 'red'
                    }}>{cab.status}</span></p>
                    <p><strong>Location:</strong> {cab.lat?.toFixed(4)}, {cab.lon?.toFixed(4)}</p>
                    <p><strong>Last Update:</strong> {new Date(cab.last_update).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select 
                      value={cab.status}
                      onChange={(e) => updateCabStatus(cab.id, e.target.value)}
                      style={{ padding: '0.25rem' }}
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>
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