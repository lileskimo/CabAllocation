import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Employee from './pages/Employee';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/employee">Employee</Link>
          <Link to="/admin">Admin</Link>
        </nav>
        
        <div className="container">
          <Routes>
            <Route path="/" element={
              <div className="page">
                <h1>Smart Cab Allocation System</h1>
                <p>Welcome to the Smart Cab Allocation System. Use the navigation above to access different sections.</p>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 