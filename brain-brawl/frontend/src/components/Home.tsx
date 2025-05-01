import { Link, useNavigate } from 'react-router-dom';

interface HomeProps {
  user: any | null;
  retroMode?: boolean;
  toggleRetroMode?: () => void;
}

const Home = ({ user, retroMode = true }: HomeProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('brainBrawlUser');
    window.location.href = '/';
  };
  
  // Always render in retro mode
  return (
    <div className="retro-content">
      <h1 className="retro-title">brain brawl</h1>
      
      {/* Login status indicator */}
      <div className="retro-login-status">
        {user ? (
          <div className="retro-login-info">
            <span>logged in as: {user.username}</span>
            <button onClick={handleLogout} className="retro-small-button">
              logout
            </button>
          </div>
        ) : (
          <div className="retro-login-info">
            <span>not logged in</span>
            <button onClick={() => navigate('/login')} className="retro-small-button">
              login
            </button>
          </div>
        )}
      </div>
      
      <div className="retro-menu">
        <button onClick={() => window.location.href = '/mode-selection'} className="retro-button">
          mode choice
        </button>
        <button onClick={() => window.location.href = '/leaderboard'} className="retro-button">
          leaderboard
        </button>
        <button className="retro-button">
          instructions
        </button>
        <button className="retro-button">
          customize character
        </button>
        <button className="retro-button">
          settings
        </button>
      </div>
    </div>
  );
};

export default Home;