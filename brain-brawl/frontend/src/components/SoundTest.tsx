import React from 'react';
import { playSound, playDirectSound, startBackgroundMusic, stopBackgroundMusic } from '../utils/soundUtils';

const SoundTest = () => {
  const handlePlayDing = () => {
    console.log("Playing ding sound");
    playSound('ding');
  };

  const handlePlayDirectDing = () => {
    console.log("Playing ding directly");
    playDirectSound('ding');
  };

  const handleStartMusic = () => {
    console.log("Starting background music");
    startBackgroundMusic();
  };

  const handleStopMusic = () => {
    console.log("Stopping background music");
    stopBackgroundMusic();
  };

  const handlePlayHit = () => {
    console.log("Playing hit sound");
    playSound('hit');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sound Test Panel</h2>
      <p>Click the buttons below to test sounds:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handlePlayDing}
          style={{ padding: '10px', margin: '5px' }}
        >
          Play Ding Sound
        </button>
        
        <button 
          onClick={handlePlayDirectDing}
          style={{ padding: '10px', margin: '5px' }}
        >
          Play Ding Directly
        </button>
        
        <button 
          onClick={handleStartMusic}
          style={{ padding: '10px', margin: '5px' }}
        >
          Start Background Music
        </button>
        
        <button 
          onClick={handleStopMusic}
          style={{ padding: '10px', margin: '5px' }}
        >
          Stop Background Music
        </button>
        
        <button 
          onClick={handlePlayHit}
          style={{ padding: '10px', margin: '5px' }}
        >
          Play Hit Sound
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>Debug Information:</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default SoundTest;