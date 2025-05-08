import { useNavigate } from 'react-router-dom';
import { playSound } from '../utils/soundUtils';

interface HomeProps {
  user: any | null;
  retroMode?: boolean;
  toggleRetroMode?: () => void;
}

const Home = ({ user }: HomeProps) => {
  const navigate = useNavigate();
  
  const handleButtonClick = (path: string) => {
    playSound('ding');
    navigate(path); // Use navigate instead of window.location to avoid page reload
  };
  
  const handleLogout = () => {
    playSound('ding');
    // Force a page reload to ensure app state is completely reset
    localStorage.removeItem('brainBrawlUser');
    window.location.href = '/';
  };
  
  // Always render in retro mode
  return (
    <div className="retro-content">
      <h1 className="retro-title" data-text="brain brawl">brain brawl</h1>
      
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
            <button onClick={() => {
              playSound('ding');
              navigate('/login');
            }} className="retro-small-button">
              login
            </button>
          </div>
        )}
      </div>
      
      <div className="retro-menu">
        <button onClick={() => handleButtonClick('/mode-selection')} className="retro-button">
          mode choice
        </button>
        <button onClick={() => handleButtonClick('/leaderboard')} className="retro-button">
          leaderboard
        </button>
        <button onClick={() => handleButtonClick('/sound-test')} className="retro-button">
          sound test
        </button>
      </div>
    </div>
  );
};

export default Home;