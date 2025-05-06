import { useNavigate } from 'react-router-dom';
import { playSound } from '../../utils/soundUtils';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

/**
 * A reusable back button component that can either go to a specific route or go back in history
 * 
 * @param to - Optional path to navigate to. If not provided, will use history.back()
 * @param label - Optional button text. Defaults to "back"
 * @param className - Optional additional CSS class
 */
const BackButton = ({ to, label = 'back', className = '' }: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Play ding sound when button is clicked
    playSound('ding');
    
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back one step in history
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`back-button ${className}`}
      aria-label="Go back"
    >
      {label}
    </button>
  );
};

export default BackButton;