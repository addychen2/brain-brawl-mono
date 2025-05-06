import { Link, useNavigate } from 'react-router-dom';
import { playSound } from '../../utils/soundUtils';

interface NavbarProps {
  user: any | null;
  onLogout: () => void;
}

// Custom Link component that plays a sound when clicked
const SoundLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const handleClick = () => {
    playSound('ding');
  };
  
  return (
    <Link to={to} onClick={handleClick}>
      {children}
    </Link>
  );
};

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    playSound('ding');
    // Call the parent app's logout function
    onLogout();
    // Force a page reload for consistent state reset
    window.location.href = '/login';
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <SoundLink to="/">
          <h1>Brain Brawl</h1>
        </SoundLink>
      </div>
      
      <div className="navbar-menu">
        <ul className="navbar-links">
          <li>
            <SoundLink to="/">Home</SoundLink>
          </li>
          <li>
            <SoundLink to="/leaderboard">Leaderboard</SoundLink>
          </li>
          {user ? (
            <>
              <li>
                <SoundLink to="/profile">Profile</SoundLink>
              </li>
              <li>
                <SoundLink to="/waiting-room">Play Now</SoundLink>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <SoundLink to="/login">Login</SoundLink>
              </li>
              <li>
                <SoundLink to="/register">Register</SoundLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;