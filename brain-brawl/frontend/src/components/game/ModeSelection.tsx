import { useNavigate } from 'react-router-dom';

interface ModeSelectionProps {
  user: any | null;
}

const ModeSelection = ({ user }: ModeSelectionProps) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="retro-content">
      <h1 className="retro-title">mode choice</h1>
      
      <div className="retro-menu">
        <button 
          onClick={() => handleNavigate('/practice')} 
          className="retro-button"
        >
          practice mode
        </button>
        <button 
          onClick={() => handleNavigate('/waiting-room')} 
          className="retro-button"
        >
          multiplayer
        </button>
        <button 
          onClick={() => handleNavigate('/')} 
          className="retro-button"
        >
          back to home
        </button>
      </div>
    </div>
  );
};

export default ModeSelection;