import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/auth/login`, {
        username,
        password
      });
      
      const userData = response.data;
      
      onLogin(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Brain Brawl</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
      
      {/* For demo purposes, add a quick login option */}
      <div className="demo-login">
        <button 
          onClick={() => {
            const demoUser = {
              userId: 'demo123',
              username: 'DemoUser',
              message: 'Demo login successful'
            };
            onLogin(demoUser);
            navigate('/');
          }}
          className="secondary-button"
        >
          Quick Demo Login
        </button>
      </div>
    </div>
  );
};

export default Login;