import { useNavigate } from 'react-router-dom';
import { BackButton } from '../common';

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
      <BackButton to="/" className="back-button-top-left" />
      <h1 className="retro-title" data-text="mode choice">mode choice</h1>
      
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
      </div>
    </div>
  );
};

export default ModeSelection;