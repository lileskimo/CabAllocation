import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripMap from '../components/TripMap';
import TripCountdown from '../components/TripCountdown';
import { io } from 'socket.io-client';

function Employee() {
  const [availableCabs, setAvailableCabs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showTripRequestForm, setShowTripRequestForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  // const [locationUpdate, setLocationUpdate] = useState({
  //   lat: '',
  //   lon: ''
  // });
  const [tripRequest, setTripRequest] = useState({
    pickup_lat: '',
    pickup_lon: '',
    dest_lat: '',
    dest_lon: ''
  });
  const [mapPickupLocation, setMapPickupLocation] = useState(null);
  const [mapDestinationLocation, setMapDestinationLocation] = useState(null);
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
    fetchTrips();
  }, [navigate]);

  // useEffect(() => {
  //   const socket = io('http://localhost:4000');
  //   socket.on('cabLocationUpdate', (data) => {
  //     setAvailableCabs(prev => prev.map(cab => cab.id === data.cabId ? { ...cab, lat: data.lat, lon: data.lon, last_update: data.last_update } : cab));
  //   });
  //   socket.on('tripAssigned', (data) => {
  //     // Update trip status in state
  //     setTrips(prev =>
  //       prev.map(trip =>
  //         trip.id === data.tripId
  //           ? { ...trip, cab_id: data.cabId, status: 'assigned' }
  //           : trip
  //       )
  //     );
  //   });
  //   return () => socket.disconnect();
  // }, []);

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
      
      if (data.success) {
        setTrips(data.trips);
      } else {
        console.error('Error fetching trips:', data.error);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  // const updateCabLocation = async (e) => {
  //   e.preventDefault();
  //   if (!selectedCab) return;

  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch(`http://localhost:4000/api/cabs/${selectedCab.id}/location`, {
  //       method: 'PUT',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         lat: parseFloat(locationUpdate.lat),
  //         lon: parseFloat(locationUpdate.lon)
  //       })
  //     });

  //     const data = await response.json();
      
  //     if (data.success) {
  //       setStatus(`Cab location updated successfully!`);
  //       setShowLocationForm(false);
  //       setSelectedCab(null);
  //       setLocationUpdate({ lat: '', lon: '' });
  //       fetchAvailableCabs(); // Refresh the list
  //     } else {
  //       setStatus(`Error: ${data.error}`);
  //     }
  //   } catch (error) {
  //     setStatus(`Error: ${error.message}`);
  //   }
  // };

  const requestTrip = async (tripData) => {
    console.log('👤 Employee: requestTrip called with data:', tripData);
    
    try {
      const token = localStorage.getItem('token');
      console.log('👤 Employee: Token available:', !!token);
      
      const response = await fetch('http://localhost:4000/api/trips/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripData)
      });

      console.log('👤 Employee: Response status:', response.status);
      
      const data = await response.json();
      console.log('👤 Employee: Response data:', data);
      
      if (data.success) {
        if (data.assignedCab) {
          setStatus(`Trip requested successfully! Cab ${data.assignedCab.driver_name} assigned. ETA: ${Math.round(data.est_duration_s / 60)} minutes`);
        } else {
          setStatus(`Trip requested but no cabs available at the moment`);
        }
        setShowTripRequestForm(false);
        setShowMap(false);
        setTripRequest({ pickup_lat: '', pickup_lon: '', dest_lat: '', dest_lon: '' });
        setMapPickupLocation(null);
        setMapDestinationLocation(null);
        fetchTrips(); // Refresh trips
        fetchAvailableCabs(); // Refresh cabs
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('👤 Employee: Error in requestTrip:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleMapPickupSelect = (lat, lng) => {
    setMapPickupLocation({ lat, lng });
    setTripRequest(prev => ({ ...prev, pickup_lat: lat.toString(), pickup_lon: lng.toString() }));
  };

  const handleMapDestinationSelect = (lat, lng) => {
    setMapDestinationLocation({ lat, lng });
    setTripRequest(prev => ({ ...prev, dest_lat: lat.toString(), dest_lon: lng.toString() }));
  };

  const handleTripComplete = (tripId) => {
    // Update the trip status in local state
    setTrips(prev => 
      prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, status: 'completed' }
          : trip
      )
    );
    
    // Show success message
    setStatus('Trip completed successfully! Cab is now available again.');
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

  // const openLocationForm = (cab) => {
  //   setSelectedCab(cab);
  //   setLocationUpdate({
  //     lat: cab.lat?.toString() || '',
  //     lon: cab.lon?.toString() || ''
  //   });
  //   setShowLocationForm(true);
  // };

  // function isWithinMapBounds(lat, lon) {
  //   const epsilon = 0.0005;
  //   return Object.values(graphData.nodes).some(node =>
  //     Math.abs(node.lat - lat) < epsilon && Math.abs(node.lon - lon) < epsilon
  //   );
  // }

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
      
      <p>View all cabs, manage cab locations, and request trips. Currently showing {availableCabs.length} cabs and {trips.length} trips.</p>
      
      {/* Trip Request Options */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {/* <button 
            className="button" 
            onClick={() => {
              setShowTripRequestForm(!showTripRequestForm);
              setShowMap(false);
            }}
          >
            {showTripRequestForm ? 'Cancel Form Request' : 'Request Trip (Form)'}
          </button> */}
          <button 
            className="button" 
            onClick={() => {
              setShowMap(!showMap);
              setShowTripRequestForm(false);
            }}
            style={{ backgroundColor: showMap ? '#dc3545' : '#28a745' }}
          >
            {showMap ? 'Hide Map' : 'Request Trip (Map)'}
          </button>
        </div>
        
        {/* Map Interface */}
        {showMap && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Interactive Map - Select Your Trip Location</h3>
            <TripMap
              availableCabs={availableCabs}
              setAvailableCabs={setAvailableCabs}
              onPickupSelect={handleMapPickupSelect}
              onDestinationSelect={handleMapDestinationSelect}
              pickupLocation={mapPickupLocation}
              destinationLocation={mapDestinationLocation}
              onRequestTrip={requestTrip}
            />
          </div>
        )}
        
        {/* Form Interface
        {showTripRequestForm && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const pickupLat = parseFloat(tripRequest.pickup_lat);
            const pickupLon = parseFloat(tripRequest.pickup_lon);
            const destLat = parseFloat(tripRequest.dest_lat);
            const destLon = parseFloat(tripRequest.dest_lon);

            if (!pickupLat || !pickupLon || !destLat || !destLon) {
              setStatus('Pickup and destination are required.');
              return;
            }
            requestTrip({
              pickup_lat: pickupLat,
              pickup_lon: pickupLon,
              dest_lat: destLat,
              dest_lon: destLon
            });
          }} style={{ 
            border: '1px solid #ddd', 
            padding: '1rem', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginBottom: '1rem'
          }}>
            <h3>Request New Trip (Form)</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Pickup Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={tripRequest.pickup_lat}
                  onChange={(e) => setTripRequest({...tripRequest, pickup_lat: e.target.value})}
                  required
                  placeholder="26.47"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Pickup Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={tripRequest.pickup_lon}
                  onChange={(e) => setTripRequest({...tripRequest, pickup_lon: e.target.value})}
                  required
                  placeholder="73.12"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Destination Latitude <span style={{color:'red'}}>*</span>:</label>
                <input
                  type="number"
                  step="any"
                  value={tripRequest.dest_lat}
                  onChange={(e) => setTripRequest({...tripRequest, dest_lat: e.target.value})}
                  required
                  placeholder="26.48"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label>Destination Longitude <span style={{color:'red'}}>*</span>:</label>
                <input
                  type="number"
                  step="any"
                  value={tripRequest.dest_lon}
                  onChange={(e) => setTripRequest({...tripRequest, dest_lon: e.target.value})}
                  required
                  placeholder="73.13"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            </div>
            <button type="submit" className="button" style={{ marginTop: '1rem' }}>
              Request Trip
            </button>
          </form>
        )}*/}
      </div> 

      {/* Location Update Form
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
      )} */}
      
      {/* {/* My Trips Section */}
<div style={{ marginBottom: '2rem' }}>
  <h3>My Trips</h3>
  {trips.length > 0 ? (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[...trips]
        .slice(0,5)
        .map(trip => (
          <div key={trip.id} style={{ 
            border: '1px solid #ddd', 
            padding: '1rem', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>Trip #{trip.id}</h4>
            <p><strong>Status:</strong> <span style={{ 
              color: trip.status === 'completed' ? 'green' : 
                     trip.status === 'assigned' ? 'blue' :
                     trip.status === 'ongoing' ? 'orange' : 'gray'
            }}>{trip.status}</span></p>
            <p><strong>Pickup:</strong> {trip.pickup_lat?.toFixed(4)}, {trip.pickup_lon?.toFixed(4)}</p>
            {trip.dest_lat && (
              <p><strong>Destination:</strong> {trip.dest_lat?.toFixed(4)}, {trip.dest_lon?.toFixed(4)}</p>
            )}
            {trip.driver_name && (
              <p><strong>Driver:</strong> {trip.driver_name} ({trip.vehicle_no})</p>
            )}
            {trip.est_distance_meters && (
              <p><strong>Estimated Distance:</strong> {trip.est_distance_meters}m</p>
            )}
            {trip.est_duration_seconds && (
              <p><strong>Estimated Duration:</strong> {Math.round(trip.est_duration_seconds / 60)} minutes</p>
            )}
            <p><strong>Requested:</strong> {new Date(trip.requested_at).toLocaleString()}</p>
            {trip.status === 'assigned' && trip.est_duration_seconds && (
              <TripCountdown 
                trip={trip} 
                onTripComplete={handleTripComplete}
                onRefreshCabs={fetchAvailableCabs}
              />
            )}
          </div>
        ))}
    </div>
  ) : (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
      <h3>No trips yet</h3>
      <p>You haven't made any cab requests yet.</p>
      <p>Use the "Request Trip" button above to book a cab.</p>
    </div>
  )}
</div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>All Cabs</h3>
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
                    <p><strong>Status:</strong> <span style={{ 
                      color: cab.status === 'available' ? 'green' : 
                             cab.status === 'on_trip' ? 'orange' : 'red'
                    }}>{cab.status}</span></p>
                    <p><strong>Location:</strong> {cab.lat?.toFixed(4)}, {cab.lon?.toFixed(4)}</p>
                    <p><strong>Last Update:</strong> {new Date(cab.last_update).toLocaleString()}</p>
                  </div>
                  {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      className="button" 
                      onClick={() => openLocationForm(cab)}
                      style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                    >
                      Update Location
                    </button> 
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <h3>No cabs found</h3>
            <p>There are currently no cabs in the system.</p>
            <p>This could mean:</p>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>No cabs have been registered yet</li>
              <li>All cabs are offline</li>
              {/* <li>No cabs have been updated recently (within 5 minutes)</li> */}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={fetchAvailableCabs}>
          Refresh Cabs
        </button>
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