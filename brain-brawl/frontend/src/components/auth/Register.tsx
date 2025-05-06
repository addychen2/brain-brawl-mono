import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface RegisterProps {
  onRegister: (user: any) => void;
}

const Register = ({ onRegister }: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !confirmPassword) {
      setError('please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        username,
        password
      });
      
      const userData = response.data;
      
      onRegister(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'failed to register. please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="retro-content">
      <h1 className="retro-title">register</h1>
      
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
              placeholder="choose a username"
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
              placeholder="choose a password"
              disabled={isLoading}
              className="retro-input"
            />
          </div>
          
          <div className="retro-form-group">
            <label htmlFor="confirm-password">confirm password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm your password"
              disabled={isLoading}
              className="retro-input"
            />
          </div>
          
          <button type="submit" className="retro-button" disabled={isLoading}>
            {isLoading ? 'registering...' : 'register'}
          </button>
          
          <div className="retro-auth-options">
            <p>already have an account?</p>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="retro-button"
            >
              login
            </button>
          </div>
          
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

export default Register;