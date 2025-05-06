import { useState, useEffect } from 'react';
import { 
  setMuted,
  setSoundEffectsMuted,
  setMusicMuted,
  isSoundEffectsMuted,
  isMusicMuted,
  setBackgroundMusicVolume 
} from '../../utils/soundUtils';

// Keys for storing mute preferences in localStorage
const SOUND_EFFECTS_MUTE_STORAGE_KEY = 'brainBrawl_soundEffectsMuted';
const MUSIC_MUTE_STORAGE_KEY = 'brainBrawl_musicMuted';

// Shared button styles/classes
const buttonBaseClass = "mute-button";

/**
 * A button for muting/unmuting sound effects
 */
export const SoundEffectsMuteButton = () => {
  // Initialize from localStorage or default to current state
  const getSavedMuteState = (): boolean => {
    const saved = localStorage.getItem(SOUND_EFFECTS_MUTE_STORAGE_KEY);
    return saved ? saved === 'true' : isSoundEffectsMuted();
  };

  const [muted, setMutedState] = useState(getSavedMuteState());

  // Apply saved mute state on component mount
  useEffect(() => {
    const savedMuted = getSavedMuteState();
    setSoundEffectsMuted(savedMuted);
    setMutedState(savedMuted);
  }, []);

  // Toggle mute/unmute when clicked
  const toggleMute = () => {
    const newMutedState = !muted;
    
    // Update component state
    setMutedState(newMutedState);
    
    // Update sound system
    setSoundEffectsMuted(newMutedState);
    
    // Save preference to localStorage
    localStorage.setItem(SOUND_EFFECTS_MUTE_STORAGE_KEY, String(newMutedState));
  };

  return (
    <button 
      onClick={toggleMute}
      className={`${buttonBaseClass} sound-effects-mute-button`}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      title={muted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
};

/**
 * A button for muting/unmuting music
 */
export const MusicMuteButton = () => {
  // Initialize from localStorage or default to current state
  const getSavedMuteState = (): boolean => {
    const saved = localStorage.getItem(MUSIC_MUTE_STORAGE_KEY);
    return saved ? saved === 'true' : isMusicMuted();
  };

  const [muted, setMutedState] = useState(getSavedMuteState());

  // Apply saved mute state on component mount
  useEffect(() => {
    const savedMuted = getSavedMuteState();
    setMusicMuted(savedMuted);
    setMutedState(savedMuted);
    setBackgroundMusicVolume(savedMuted ? 0 : 0.3);
  }, []);

  // Toggle mute/unmute when clicked
  const toggleMute = () => {
    const newMutedState = !muted;
    
    // Update component state
    setMutedState(newMutedState);
    
    // Update sound system
    setMusicMuted(newMutedState);
    
    // Adjust background music volume
    setBackgroundMusicVolume(newMutedState ? 0 : 0.3);
    
    // Save preference to localStorage
    localStorage.setItem(MUSIC_MUTE_STORAGE_KEY, String(newMutedState));
  };

  return (
    <button 
      onClick={toggleMute}
      className={`${buttonBaseClass} music-mute-button`}
      aria-label={muted ? "Unmute music" : "Mute music"}
      title={muted ? "Unmute music" : "Mute music"}
    >
      {muted ? "♪̷" : "♪"}
    </button>
  );
};

/**
 * Combined mute controls component that shows both buttons
 */
const MuteControls = () => {
  return (
    <div className="mute-controls">
      <SoundEffectsMuteButton />
      <MusicMuteButton />
    </div>
  );
};

/**
 * Legacy MuteButton component for backward compatibility
 * @deprecated Use SoundEffectsMuteButton and MusicMuteButton instead
 */
const MuteButton = () => {
  // Initialize from localStorage
  const getSavedMuteState = (): boolean => {
    const soundEffectsMuted = localStorage.getItem(SOUND_EFFECTS_MUTE_STORAGE_KEY) === 'true';
    const musicMuted = localStorage.getItem(MUSIC_MUTE_STORAGE_KEY) === 'true';
    return soundEffectsMuted && musicMuted;
  };

  const [muted, setMutedState] = useState(getSavedMuteState());

  // Apply saved mute state on component mount
  useEffect(() => {
    const savedMuted = getSavedMuteState();
    setMuted(savedMuted);
    setMutedState(savedMuted);
    setBackgroundMusicVolume(savedMuted ? 0 : 0.3);
  }, []);

  // Toggle mute/unmute when clicked
  const toggleMute = () => {
    const newMutedState = !muted;
    
    // Update component state
    setMutedState(newMutedState);
    
    // Update sound system
    setMuted(newMutedState);
    
    // Adjust background music volume
    setBackgroundMusicVolume(newMutedState ? 0 : 0.3);
    
    // Save preferences to localStorage
    localStorage.setItem(SOUND_EFFECTS_MUTE_STORAGE_KEY, String(newMutedState));
    localStorage.setItem(MUSIC_MUTE_STORAGE_KEY, String(newMutedState));
  };

  return (
    <button 
      onClick={toggleMute}
      className={buttonBaseClass}
      aria-label={muted ? "Unmute all sounds" : "Mute all sounds"}
      title={muted ? "Unmute all sounds" : "Mute all sounds"}
    >
      {muted ? "M" : "♪"}
    </button>
  );
};

export default MuteControls;