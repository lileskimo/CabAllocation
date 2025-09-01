import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Map click handler component
function MapClickHandler({ onLocationSelect, mode }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng, mode);
    },
  });
  return null;
}

function TripMap({ 
  availableCabs, 
  setAvailableCabs, // <-- add this prop
  onPickupSelect, 
  onDestinationSelect, 
  pickupLocation, 
  destinationLocation,
  onRequestTrip 
}) {
  const [mapCenter, setMapCenter] = useState([26.4725, 73.1075]); // Optimized center for IIT Jodhpur graph coverage
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [mode, setMode] = useState('pickup'); // 'pickup' or 'destination'

  // Update map center when locations change
  useEffect(() => {
    if (pickupLocation) {
      setMapCenter([pickupLocation.lat, pickupLocation.lon]);
    }
  }, [pickupLocation]);

  const handleLocationSelect = (lat, lng, currentMode) => {
    if (currentMode === 'pickup') {
      setSelectedPickup({ lat, lng });
      onPickupSelect(lat, lng);
    } else {
      setSelectedDestination({ lat, lng });
      onDestinationSelect(lat, lng);
    }
  };

  // Button click handler
  const handleRequestTrip = () => {
    if (!pickupLocation || !destinationLocation) return;
    onRequestTrip({
      pickup_lat: pickupLocation.lat,
      pickup_lon: pickupLocation.lng,
      dest_lat: destinationLocation.lat,
      dest_lon: destinationLocation.lng
    });
  };

  // Socket.io effect for real-time cab location updates
  useEffect(() => {
    const socket = io('http://localhost:4000');
    socket.on('cabLocationUpdate', (data) => {
      setAvailableCabs(prev =>
        prev.map(cab =>
          cab.id === data.cabId
            ? { ...cab, lat: data.lat, lon: data.lon, last_update: data.last_update }
            : cab
        )
      );
    });
    socket.on('tripAssigned', (data) => {
      // Optionally update trip status in state
    });
    return () => socket.disconnect();
  }, [setAvailableCabs]);

  // const clearLocations = () => {
  //   setSelectedPickup(null);
  //   setSelectedDestination(null);
  //   onPickupSelect(null, null);
  //   onDestinationSelect(null, null);
  // };

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Map Controls</h4>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="radio"
              name="mode"
              checked={mode === 'pickup'}
              onChange={() => setMode('pickup')}
              style={{ marginRight: '5px' }}
            />
            Select Pickup Location
          </label>
          <label style={{ display: 'block' }}>
            <input
              type="radio"
              name="mode"
              checked={mode === 'destination'}
              onChange={() => setMode('destination')}
              style={{ marginRight: '5px' }}
            />
            Select Destination Location
          </label>
        </div>

        {selectedPickup && (
          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <strong>Pickup:</strong> {selectedPickup.lat.toFixed(4)}, {selectedPickup.lng.toFixed(4)}
          </div>
        )}

        {selectedDestination && (
          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <strong>Destination:</strong> {selectedDestination.lat.toFixed(4)}, {selectedDestination.lng.toFixed(4)}
          </div>
        )}

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRequestTrip}
            disabled={!selectedPickup || !selectedDestination}
            style={{
              padding: '5px 10px',
              backgroundColor: (selectedPickup && selectedDestination) ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (selectedPickup && selectedDestination) ? 'pointer' : 'not-allowed',
              fontSize: '12px'
            }}
          >
            Request Trip
          </button>
          {/* <button
            onClick={clearLocations}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear
          </button> */}
        </div>
      </div>

      {/* Available Cabs Info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '250px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Available Cabs</h4>
        <div style={{ fontSize: '12px' }}>
          {availableCabs.length > 0 ? (
            <div>
              <div style={{ marginBottom: '5px' }}>
                <span style={{ color: '#28a745' }}>●</span> {availableCabs.length} cabs available
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {availableCabs.map(cab => (
                  <div key={cab.id} style={{ 
                    padding: '3px 0', 
                    borderBottom: '1px solid #eee',
                    fontSize: '11px'
                  }}>
                    <strong>{cab.driver_name}</strong><br/>
                    {cab.vehicle_no}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: '#dc3545' }}>
              No cabs available
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        bounds={[[26.446, 73.085], [26.499, 73.130]]}
        maxBounds={[[26.446, 73.085], [26.499, 73.130]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Graph Coverage Area Indicator */}
        <Rectangle
          bounds={[[26.446, 73.085], [26.499, 73.130]]}
          pathOptions={{
            color: '#007bff',
            weight: 2,
            fillColor: '#007bff',
            fillOpacity: 0.1,
            interactive: false
          }}
        />

        {/* Map click handler */}
        <MapClickHandler onLocationSelect={handleLocationSelect} mode={mode} />

        {/* Available Cabs Markers */}
        {availableCabs.map(cab => (
          <Marker
            key={cab.id}
            position={[cab.lat, cab.lon]}
            icon={createCustomIcon('#28a745')}
          >
            <Popup>
              <div>
                <h4>{cab.driver_name}</h4>
                <p><strong>Vehicle:</strong> {cab.vehicle_no}</p>
                <p><strong>Status:</strong> Available</p>
                <p><strong>Last Update:</strong> {new Date(cab.last_update).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pickup Location Marker */}
        {selectedPickup && (
          <Marker
            position={[selectedPickup.lat, selectedPickup.lng]}
            icon={createCustomIcon('#007bff')}
          >
            <Popup>
              <div>
                <h4>Pickup Location</h4>
                <p>Lat: {selectedPickup.lat.toFixed(4)}</p>
                <p>Lng: {selectedPickup.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Location Marker */}
        {selectedDestination && (
          <Marker
            position={[selectedDestination.lat, selectedDestination.lng]}
            icon={createCustomIcon('#dc3545')}
          >
            <Popup>
              <div>
                <h4>Destination</h4>
                <p>Lat: {selectedDestination.lat.toFixed(4)}</p>
                <p>Lng: {selectedDestination.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px'
      }}>
        <strong>Instructions:</strong><br/>
        • Click on the map to set pickup location<br/>
        • Switch to "Destination" mode to set destination<br/>
        • Both pickup and destination are required<br/>
        • Green dots = Available cabs<br/>
        • Blue dot = Pickup location<br/>
        • Red dot = Destination<br/>
      </div>
    </div>
  );
}

export default TripMap;
