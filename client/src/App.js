import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Employee from './pages/Employee';
import Admin from './pages/Admin';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="nav">
          <Link to="/"><b>FleetWise</b></Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span style={{ color: 'white', padding: '0.5rem 1rem' }}>
                Welcome, {user?.name} ({user?.role})
              </span>
            </>
          )}
          {isAuthenticated && (
            <>
              {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
              {user?.role === 'employee' && <Link to="/employee">Employee Dashboard</Link>}
              <button onClick={handleLogout} style={{ marginLeft: '1rem', background: '#ff4d4d', border: 'none', color: 'white', padding: '0.4rem 0.8rem', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
            </>
          )}
        </nav>
        
        {/* Pages */}
        <div className="container">
          <Routes>
            <Route path="/" element={
              <div className="page">
                <h1>FleetWise – Smart Cab Allocation</h1>
                <p>
                  Welcome to <strong>FleetWise</strong>, your intelligent B2B cab allocation 
                  and fleet management system. We help businesses optimize cab usage, reduce 
                  wait times, and improve employee travel experience.
                </p>
                
                {!isAuthenticated ? (
                  <div>
                    <p><strong>Get started:</strong></p>
                    <ul>
                      <li><Link to="/login">Login</Link> if you already have an account.</li>
                      <li><Link to="/register">Register</Link> to create a new account.</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p>
                      Welcome back, <strong>{user?.name}</strong>!  
                      Access your dashboard using the navigation above.
                    </p>
                  </div>
                )}

                <hr style={{ margin: '2rem 0' }} />
                <h2>Why FleetWise?</h2>
                <ul>
                  <li>⚡ <strong>Smart Allocation</strong> – Uses advanced algorithms to match employees with the nearest available cabs.</li>
                  <li>📍 <strong>Real-Time Tracking</strong> – Monitor trip progress and status live.</li>
                  <li>📊 <strong>Admin Dashboard</strong> – Complete control over cab availability, trip history, and fleet performance.</li>
                  <li>👨‍💼 <strong>Employee Friendly</strong> – Easy request system, accurate ETAs, and seamless ride experience.</li>
                </ul>

                <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>
                  FleetWise – Because your business deserves smarter rides.
                </p>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
