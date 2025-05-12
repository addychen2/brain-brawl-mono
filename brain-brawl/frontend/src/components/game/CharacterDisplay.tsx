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
    // If already in death animation or health is 0, stay in death animation permanently
    if (currentAnimation === 'death' || health <= 0) {
      setCurrentAnimation('death');
      return; // Exit early to prevent other animation changes
    }

    // Otherwise, use the animation state passed in
    setCurrentAnimation(animationState);

    // If the animation is attack or hurt, auto-revert to idle after animation completes
    if (animationState === 'attack' || animationState === 'hurt') {
      const timer = setTimeout(() => {
        // Don't revert to idle if we've switched to death in the meantime
        if (currentAnimation !== 'death') {
          setCurrentAnimation('idle');
        }
      }, animationState === 'attack' ? 800 : 500);

      return () => clearTimeout(timer);
    }
  }, [animationState, health, currentAnimation]);
  
  const containerClass = isOpponent ? 'opponent-character' : 'player-character';
  const nameClass = isOpponent ? 'opponent-character-name' : 'player-character-name';

  // Add a class for the death animation, but apply it just to the sprite
  const spriteContainerClass = `${isOpponent ? 'opponent' : 'player'}-sprite-container`;
  // Use the death animation class on the sprite itself
  const spriteClass = `character-sprite ${character}-${currentAnimation}${currentAnimation === 'death' ? ' character-dead' : ''}`;
  
  // Calculate health bar width as a percentage of 1000 max health
  const healthPercentage = Math.max(0, Math.min(100, (health / 1000) * 100));

  return (
    <div className={containerClass}>
      <div className={nameClass}>{name}</div>

      <div className={spriteContainerClass}>
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