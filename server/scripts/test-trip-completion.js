import React, { useState, useEffect, useRef } from 'react';

const TripCountdown = ({ trip, onTripComplete, onRefreshCabs }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState('');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Calculate remaining time based on assignment time + estimated duration
  const calculateRemainingTime = () => {
    if (!trip.assigned_at || !trip.est_duration_seconds) {
      console.log('❌ calculateRemainingTime: Missing data', { assigned_at: trip.assigned_at, est_duration_seconds: trip.est_duration_seconds });
      return 0;
    }

    const assignedTime = new Date(trip.assigned_at).getTime();
    const estimatedEndTime = assignedTime + (trip.est_duration_seconds * 1000);
    const currentTime = new Date().getTime();
    const remainingMs = estimatedEndTime - currentTime;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    
    console.log('🕐 Countdown Debug:', {
      assignedAt: trip.assigned_at,
      assignedTime: new Date(assignedTime).toLocaleString(),
      estimatedEndTime: new Date(estimatedEndTime).toLocaleString(),
      currentTime: new Date(currentTime).toLocaleString(),
      remainingMs,
      remainingSeconds,
      est_duration_seconds: trip.est_duration_seconds
    });
    
    return remainingSeconds;
  };

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

  useEffect(() => {
    if (!trip.est_duration_seconds || trip.status !== 'assigned' || !trip.assigned_at) {
      console.log('🚫 TripCountdown: Missing required data', {
        est_duration_seconds: trip.est_duration_seconds,
        status: trip.status,
        assigned_at: trip.assigned_at
      });
      return;
    }

    console.log('🚀 TripCountdown: Starting countdown for trip', trip.id);

    // Calculate initial remaining time
    const initialRemaining = calculateRemainingTime();
    console.log('⏱️ Initial remaining time:', initialRemaining, 'seconds');
    setTimeRemaining(initialRemaining);

    // If trip should already be completed, complete it immediately
    if (initialRemaining <= 0) {
      console.log('⏰ TripCountdown: Trip should already be completed, completing now');
      completeTrip();
      return;
    }

    // Start countdown timer that updates every second
    intervalRef.current = setInterval(() => {
      const remaining = calculateRemainingTime();
      console.log('⏱️ Countdown update:', remaining, 'seconds remaining');
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('⏰ Countdown finished, completing trip');
        clearInterval(intervalRef.current);
        setIsActive(false);
        completeTrip();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [trip.id, trip.est_duration_seconds, trip.status, trip.assigned_at]);

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
          ⏱️ {formatTime(timeRemaining)}
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
        <p><strong>Assigned at:</strong> {new Date(trip.assigned_at).toLocaleString()}</p>
        <p><strong>Expected completion:</strong> {new Date(new Date(trip.assigned_at).getTime() + (trip.est_duration_seconds * 1000)).toLocaleString()}</p>
        <p><strong>Current time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Debug - Time remaining:</strong> {timeRemaining} seconds</p>
        <p><strong>Debug - Raw assigned_at:</strong> {trip.assigned_at}</p>
        <p><strong>Debug - Raw est_duration_seconds:</strong> {trip.est_duration_seconds}</p>
        <p><strong>Debug - Calculated end time:</strong> {trip.assigned_at && trip.est_duration_seconds ? new Date(new Date(trip.assigned_at).getTime() + (trip.est_duration_seconds * 1000)).toLocaleString() : 'N/A'}</p>
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