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
      setError('please enter both username and password');
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
      setError(err.response?.data?.message || 'failed to login. please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      userId: 'demo123',
      username: 'DemoUser',
      message: 'Demo login successful'
    };
    onLogin(demoUser);
    navigate('/');
  };
  
  return (
    <div className="retro-content">
      <h1 className="retro-title">login</h1>
      
      <div className="retro-menu">
        {error && <div className="retro-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="retro-form">
          <div className="retro-form-group">
            <label htmlFor="username">username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="enter your username"
              disabled={isLoading}
              className="retro-input"
            />
          </div>
          
          <div className="retro-form-group">
            <label htmlFor="password">password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="enter your password"
              disabled={isLoading}
              className="retro-input"
            />
          </div>
          
          <button type="submit" className="retro-button" disabled={isLoading}>
            {isLoading ? 'logging in...' : 'login'}
          </button>
          
          <div className="retro-auth-options">
            <p>don't have an account?</p>
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="retro-button"
            >
              register
            </button>
          </div>
          
          <button 
            type="button"
            onClick={handleDemoLogin}
            className="retro-button retro-demo-button"
          >
            quick demo login
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="retro-button"
          >
            back to home
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;