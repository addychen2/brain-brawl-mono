import { useState, useEffect } from 'react';

interface CharacterDisplayProps {
  character: string;
  isOpponent?: boolean;
  name: string;
  animationState?: 'idle' | 'attack' | 'hurt' | 'death';
  health?: number;
}

const CharacterDisplay = ({ 
  character = 'blue', 
  isOpponent = false, 
  name,
  animationState = 'idle',
  health = 1000
}: CharacterDisplayProps) => {
  const [currentAnimation, setCurrentAnimation] = useState(animationState);
  
  // Update animation when animationState prop changes
  useEffect(() => {
    setCurrentAnimation(animationState);
    
    // If the animation is attack or hurt, auto-revert to idle after animation completes
    // For death animation, don't revert back
    if ((animationState === 'attack' || animationState === 'hurt') && health > 0) {
      const timer = setTimeout(() => {
        setCurrentAnimation('idle');
      }, animationState === 'attack' ? 800 : 500);
      
      return () => clearTimeout(timer);
    }
    
    // If health is 0 or less, show death animation regardless of the current animation state
    if (health <= 0 && currentAnimation !== 'death') {
      setCurrentAnimation('death');
    }
  }, [animationState, health, currentAnimation]);
  
  const containerClass = isOpponent ? 'opponent-character' : 'player-character';
  const nameClass = isOpponent ? 'opponent-character-name' : 'player-character-name';
  const spriteClass = `character-sprite ${character}-${currentAnimation}`;
  
  // Calculate health bar width as a percentage of 1000 max health
  const healthPercentage = Math.max(0, Math.min(100, (health / 1000) * 100));

  return (
    <div className={containerClass}>
      <div className={nameClass}>{name}</div>

      <div className={`${isOpponent ? 'opponent' : 'player'}-sprite-container`}>
        <div className={spriteClass}></div>
      </div>

      {/* Health bar using SpriteSheetTest styling */}
      <div className="health-bar-container">
        <div className="health-bar">
          <div
            className="health-bar__value"
            style={{
              '--health-percent': `${healthPercentage}%`
            } as React.CSSProperties}
          ></div>
        </div>
        <div className="health-text">{health}/1000</div>
      </div>
    </div>
  );
};

export default CharacterDisplay;