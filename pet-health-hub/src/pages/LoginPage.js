import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // Track active tab
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize navigate hook

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Redirect to homepage after successful login
      navigate('/'); // Redirect to the homepage route
    } catch (error) {
      console.log('Login failed:', error.message);
      alert('Invalid email or password.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      alert('Registration successful. Please log in.');
      setActiveTab('login'); // Switch to login tab
    } catch (error) {
      console.error('Registration failed:', error.message);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-image">
          <div className="placeholder">Picture of dog / cat here</div>
        </div>
        <div className="login-form-container">
          <div className="login-header">
            <h1>Welcome!</h1>
            <p>Let's get started.</p>
          </div>
          <div className="login-tabs">
            <button
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => handleTabSwitch('login')}
            >
              Log In
            </button>
            <button
              className={activeTab === 'signup' ? 'active' : ''}
              onClick={() => handleTabSwitch('signup')}
            >
              Sign Up
            </button>
          </div>
          {activeTab === 'login' ? (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="yours@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">Log In</button>
            </form>
          ) : (
            <form className="signup-form" onSubmit={handleSignup}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="yours@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="signup-button">Sign Up</button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;