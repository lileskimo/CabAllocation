import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStatus(`Login successful! Welcome ${data.user.name}`);
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/employee');
          }
        }, 1000);
      } else {
        setStatus(`Login failed: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="page">
      <h2>Login</h2>
      <p>Enter your credentials to access the Smart Cab Allocation System.</p>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          className="button" 
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginBottom: '2rem' }}>
        <h4>Login Information:</h4>
        <p>Use your registered email and password to access the system.</p>
        <p>
          Don't have an account?{' '}
          <button 
            className="btn-link" 
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit'
            }}
          >
            Create Account
          </button>
        </p>
      </div>
      
      <button className="button" onClick={testBackend}>
        Test Backend Connection
      </button>
      
      {status && (
        <div className={`status ${status.includes('Error') || status.includes('failed') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default Login; 