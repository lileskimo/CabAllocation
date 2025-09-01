import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different cab statuses
const createCabIcon = (status) => {
  let color;
  switch (status) {
    case 'available':
      color = '#28a745'; // Green
      break;
    case 'on_trip':
      color = '#ffc107'; // Yellow/Orange
      break;
    case 'offline':
      color = '#dc3545'; // Red
      break;
    default:
      color = '#6c757d'; // Gray
  }

  return L.divIcon({
    className: 'cab-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 12px;
    ">🚗</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map click handler component
function MapClickHandler({ onLocationSelect, isLocationSelectionMode }) {
  useMapEvents({
    click: (e) => {
      if (isLocationSelectionMode) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function AdminMap({ 
  cabs, 
  onCabUpdate, 
  onStatusChange,
  onLocationUpdate,
  selectedCab,
  setSelectedCab,
  onCreateCab 
}) {
  const [mapCenter, setMapCenter] = useState([26.4725, 73.1075]); // Optimized center for IIT Jodhpur graph coverage
  const [isLocationSelectionMode, setIsLocationSelectionMode] = useState(false);
  const [editingCab, setEditingCab] = useState(null);
  const [newLocation, setNewLocation] = useState(null);

  // Update map center when selected cab changes
  useEffect(() => {
    if (selectedCab && selectedCab.lat && selectedCab.lon) {
      setMapCenter([selectedCab.lat, selectedCab.lon]);
    }
  }, [selectedCab]);

  const handleLocationSelect = (lat, lng) => {
    if (editingCab) {
      setNewLocation({ lat, lng });
      setIsLocationSelectionMode(false);
    }
  };

  const handleCabClick = (cab) => {
    setSelectedCab(cab);
    setEditingCab(null);
    setNewLocation(null);
  };

  const handleEditLocation = (cab) => {
    setEditingCab(cab);
    setIsLocationSelectionMode(true);
    setNewLocation(null);
  };

  const confirmLocationUpdate = async () => {
    if (editingCab && newLocation) {
      try {
        await onLocationUpdate(editingCab.id, newLocation.lat, newLocation.lng);
        setEditingCab(null);
        setNewLocation(null);
        setIsLocationSelectionMode(false);
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const cancelLocationEdit = () => {
    setEditingCab(null);
    setNewLocation(null);
    setIsLocationSelectionMode(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#28a745';
      case 'on_trip': return '#ffc107';
      case 'offline': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '250px',
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Cab Management</h4>
        
        {isLocationSelectionMode && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '4px',
            border: '1px solid #2196f3'
          }}>
            <strong>Location Selection Mode</strong><br/>
            Click on the map to set new location for {editingCab?.driver_name}
          </div>
        )}

        {newLocation && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '4px',
            border: '1px solid #ffc107'
          }}>
            <strong>New Location:</strong><br/>
            Lat: {newLocation.lat.toFixed(6)}<br/>
            Lng: {newLocation.lng.toFixed(6)}
            <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
              <button
                onClick={confirmLocationUpdate}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Confirm
              </button>
              <button
                onClick={cancelLocationEdit}
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
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedCab && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <h5 style={{ margin: '0 0 10px 0' }}>{selectedCab.driver_name}</h5>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Vehicle:</strong> {selectedCab.vehicle_no}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Status:</strong> 
              <span style={{ color: getStatusColor(selectedCab.status) }}>
                {selectedCab.status}
              </span>
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Location:</strong><br/>
              {selectedCab.lat?.toFixed(6)}, {selectedCab.lon?.toFixed(6)}
            </p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
              <strong>Last Update:</strong><br/>
              {new Date(selectedCab.last_update).toLocaleString()}
            </p>
            
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <select 
                value={selectedCab.status}
                onChange={(e) => onStatusChange(selectedCab.id, e.target.value)}
                style={{ 
                  padding: '5px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '12px'
                }}
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="offline">Offline</option>
              </select>
              
              <button
                onClick={() => handleEditLocation(selectedCab)}
                disabled={isLocationSelectionMode}
                style={{
                  padding: '5px 10px',
                  backgroundColor: isLocationSelectionMode ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLocationSelectionMode ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Edit Location
              </button>
            </div>
          </div>
        )}

        {/* Cab Status Legend */}
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#28a745' }}>●</span> Available
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#ffc107' }}>●</span> On Trip
          </div>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#dc3545' }}>●</span> Offline
          </div>
        </div>
      </div>

      {/* Cab List */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '300px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>All Cabs ({cabs.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cabs.map(cab => (
            <div 
              key={cab.id} 
              onClick={() => handleCabClick(cab)}
              style={{ 
                padding: '8px',
                borderRadius: '4px',
                border: selectedCab?.id === cab.id ? '2px solid #007bff' : '1px solid #ddd',
                backgroundColor: selectedCab?.id === cab.id ? '#e3f2fd' : '#f8f9fa',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                {cab.driver_name}
              </div>
              <div style={{ color: '#666', marginBottom: '3px' }}>
                {cab.vehicle_no}
              </div>
              <div style={{ 
                color: getStatusColor(cab.status),
                fontWeight: 'bold',
                fontSize: '11px'
              }}>
                {cab.status}
              </div>
            </div>
          ))}
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
        <MapClickHandler 
          onLocationSelect={handleLocationSelect} 
          isLocationSelectionMode={isLocationSelectionMode} 
        />

        {/* Cab Markers */}
        {cabs.map(cab => (
          <Marker
            key={cab.id}
            position={[cab.lat, cab.lon]}
            icon={createCabIcon(cab.status)}
            eventHandlers={{
              click: () => handleCabClick(cab)
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{cab.driver_name}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Vehicle:</strong> {cab.vehicle_no}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Status:</strong> 
                  <span style={{ color: getStatusColor(cab.status) }}>
                    {cab.status}
                  </span>
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Location:</strong><br/>
                  {cab.lat?.toFixed(6)}, {cab.lon?.toFixed(6)}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Last Update:</strong><br/>
                  {new Date(cab.last_update).toLocaleString()}
                </p>
                
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <select 
                    value={cab.status}
                    onChange={(e) => onStatusChange(cab.id, e.target.value)}
                    style={{ 
                      padding: '3px', 
                      borderRadius: '3px', 
                      border: '1px solid #ddd',
                      fontSize: '11px'
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="offline">Offline</option>
                  </select>
                  
                  <button
                    onClick={() => handleEditLocation(cab)}
                    style={{
                      padding: '3px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    Edit Location
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* New Location Preview Marker */}
        {newLocation && (
          <Marker
            position={[newLocation.lat, newLocation.lng]}
            icon={L.divIcon({
              className: 'new-location-marker',
              html: `<div style="
                background-color: #007bff;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
              ">📍</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div>
                <h4>New Location</h4>
                <p>Lat: {newLocation.lat.toFixed(6)}</p>
                <p>Lng: {newLocation.lng.toFixed(6)}</p>
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
        background: 'rgba(255,255,255,0.95)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <strong>Instructions:</strong><br/>
        • Click on cab markers to select<br/>
        • Use dropdown to change status<br/>
        • Click "Edit Location" to move cab<br/>
        • Green = Available, Yellow = On Trip, Red = Offline<br/>
        • Blue rectangle shows graph coverage area
      </div>

      {/* Create New Cab Button */}
      <button
        onClick={() => {
          setIsLocationSelectionMode(true);
          setEditingCab(null); // Not editing, creating
          setNewLocation(null);
        }}
        style={{
          padding: '5px 10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          marginBottom: '10px',
          position: 'absolute',
          top: '10px',
          right: '320px',
          zIndex: 1000
        }}
      >
        Create New Cab
      </button>

      {/* Confirm New Cab Location Button - Shown only when creating new cab */}
      {newLocation && !editingCab && (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              onCreateCab(newLocation.lat, newLocation.lng);
              setNewLocation(null);
              setIsLocationSelectionMode(false);
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Confirm New Cab Location
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminMap;
