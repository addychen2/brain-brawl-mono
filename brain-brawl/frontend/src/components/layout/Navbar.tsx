import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>Brain Brawl</h1>
        </Link>
      </div>
      
      <div className="navbar-menu">
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/leaderboard">Leaderboard</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/waiting-room">Play Now</Link>
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
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;