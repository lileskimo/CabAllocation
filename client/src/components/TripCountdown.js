import React, { useState, useEffect, useRef } from 'react';

const TripCountdown = ({ trip, onTripComplete, onRefreshCabs }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState('');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!trip.est_duration_seconds || trip.status !== 'assigned') {
      return;
    }

    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining(trip.est_duration_seconds - Math.floor((Date.now() - new Date(trip.assigned_at).getTime()) / 1000));
    }, 1000);

    // Set timeout to complete trip when duration expires
    timeoutRef.current = setTimeout(() => {
      completeTrip();
    }, (trip.est_duration_seconds || 0) * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [trip.id, trip.est_duration_seconds, trip.status]);

  const completeTrip = async () => {
    try {
      setStatus('Completing trip...');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/trips/${trip.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('Trip completed successfully!');
        setIsActive(false);
        
        // Notify parent components
        if (onTripComplete) onTripComplete(trip.id);
        if (onRefreshCabs) onRefreshCabs();
        
        // Clear timers
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (trip.status !== 'assigned' || !trip.est_duration_seconds) {
    return null;
  }

  return (
    <div style={{
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      marginBottom: '1rem'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>
        🚗 Trip in Progress - {trip.driver_name} ({trip.vehicle_no})
      </h4>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
          {timeRemaining <= 0 
  ? "⏱️" 
  : `⏱️ ${formatTime(timeRemaining)}`}

        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          remaining
        </div>
      </div>
      
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        <p><strong>Pickup:</strong> {trip.pickup_lat?.toFixed(4)}, {trip.pickup_lon?.toFixed(4)}</p>
        {trip.dest_lat && (
          <p><strong>Destination:</strong> {trip.dest_lat?.toFixed(4)}, {trip.dest_lon?.toFixed(4)}</p>
        )}
        <p><strong>Estimated Duration:</strong> {Math.round(trip.est_duration_seconds / 60)} minutes</p>
        <p><strong>Distance:</strong> {trip.est_distance_meters}m</p>
      </div>
      
      {isActive && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="button" 
            onClick={completeTrip}
            style={{ backgroundColor: '#28a745' }}
          >
            Complete Trip Now
          </button>
        </div>
      )}
      
      {status && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          borderRadius: '4px',
          backgroundColor: status.includes('Error') ? '#f8d7da' : '#d4edda',
          color: status.includes('Error') ? '#721c24' : '#155724',
          fontSize: '0.9rem'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TripCountdown;