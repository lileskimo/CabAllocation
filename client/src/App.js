import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
        <nav className="nav">
          <Link to="/">Home</Link>
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
            </>
          )}
        </nav>
        
        <div className="container">
          <Routes>
            <Route path="/" element={
              <div className="page">
                <h1>Smart Cab Allocation System</h1>
                <p>Welcome to the Smart Cab Allocation System.</p>
                {!isAuthenticated ? (
                  <p>Please <Link to="/login">login</Link> to access your dashboard.</p>
                ) : (
                  <p>Welcome back, {user?.name}! You can access your dashboard from the navigation above.</p>
                )}
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