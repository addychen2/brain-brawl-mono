// Sound utility for Brain Brawl

// Paths to sound files
const soundPaths = {
  ding: '/sounds/ding.wav',
  themeSong: '/sounds/themesong.wav',
  success: '/sounds/success!.wav',
  success2: '/sounds/success2!.wav',
  success3: '/sounds/success3!.wav',
  hit: '/sounds/hit!.wav',
  wrong: '/sounds/wrong!.wav',
  gameOver: '/sounds/gameover.wav',
  readySetGo: '/sounds/readysetgo!.wav',
};

// Store audio elements to control them later
const audioElements: Record<string, HTMLAudioElement> = {};

// Background music element
let bgMusic: HTMLAudioElement | null = null;

/**
 * Initialize the sound system
 */
export const initSoundSystem = () => {
  console.log('Initializing sound system...');
  
  // Pre-create audio elements for all sounds
  Object.entries(soundPaths).forEach(([key, path]) => {
    console.log(`Loading sound: ${key} from path: ${path}`);
    try {
      const audio = new Audio(path);
      
      // Log load events for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log(`Sound loaded successfully: ${key}`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Error loading sound ${key} from ${path}:`, e);
      });
      
      audioElements[key] = audio;
      
      // Configure background music separately
      if (key === 'themeSong') {
        audio.loop = true;
        audio.volume = 0.3; // Lower volume for background music
        bgMusic = audio;
      }
      
      // Preload the audio
      audio.load();
    } catch (error) {
      console.error(`Failed to create audio element for ${key}:`, error);
    }
  });
  
  console.log('Sound system initialized with sounds:', Object.keys(audioElements).join(', '));
};

/**
 * Play a sound effect
 * @param sound - The name of the sound to play
 * @param volume - Optional volume (0.0 to 1.0)
 * @param loop - Whether to loop the sound
 * @param ignoreMute - Whether to ignore the mute setting
 */
export const playSound = (
  sound: keyof typeof soundPaths, 
  volume = 1.0, 
  loop = false,
  ignoreMute = false
) => {
  // Special handling for themeSong (it's controlled by music mute setting)
  const isMusicSound = sound === 'themeSong';
  const shouldMute = isMusicSound ? musicMuted : soundEffectsMuted;
  
  // If sounds are muted and we're not ignoring mute setting, do nothing
  if (shouldMute && !ignoreMute) {
    console.log(`Not playing ${isMusicSound ? 'music' : 'sound'} ${sound} because ${isMusicSound ? 'music is' : 'sounds are'} muted`);
    return;
  }
  
  console.log(`Attempting to play ${isMusicSound ? 'music' : 'sound'}: ${sound}`);
  
  // Try playing from the cached audio elements first
  const cachedAudio = audioElements[sound];
  if (cachedAudio) {
    try {
      cachedAudio.currentTime = 0; // Reset to start
      cachedAudio.volume = volume;
      cachedAudio.loop = loop;
      cachedAudio.muted = shouldMute && !ignoreMute;
      
      cachedAudio.play().catch(error => {
        console.error(`Failed to play cached ${isMusicSound ? 'music' : 'sound'}: ${sound}`, error);
        // Fall back to direct play
        playDirectSound(sound, ignoreMute);
      });
    } catch (e) {
      console.error(`Error playing cached ${isMusicSound ? 'music' : 'sound'}: ${sound}`, e);
      // Fall back to direct play
      playDirectSound(sound, ignoreMute);
    }
  } else {
    // If not in cache, play directly
    console.warn(`${isMusicSound ? 'Music' : 'Sound'} not cached: ${sound}. Trying direct play...`);
    playDirectSound(sound, ignoreMute);
  }
};

/**
 * Play a sound multiple times in sequence
 * @param sound - The name of the sound to play
 * @param times - Number of times to play
 * @param delay - Delay between plays in milliseconds
 */
export const playSoundMultiple = (sound: keyof typeof soundPaths, times: number, delay: number) => {
  if (times <= 0) return;
  
  playSound(sound);
  
  if (times > 1) {
    setTimeout(() => {
      playSoundMultiple(sound, times - 1, delay);
    }, delay);
  }
};

// Track if background music has been started
let bgMusicStarted = false;

// Separate mute states for sound effects and music
let soundEffectsMuted = false;
let musicMuted = false;

/**
 * Start the background music if it's not already playing
 * @returns {boolean} Whether the music was started (or was already playing)
 */
export const startBackgroundMusic = () => {
  // If music is already playing or starting, don't restart it
  if (bgMusicStarted) {
    console.log('Background music already started, not starting again');
    return true;
  }
  
  // If the audio element is playing, consider it started
  if (bgMusic && !bgMusic.paused) {
    console.log('Background music already playing, not starting again');
    bgMusicStarted = true;
    return true;
  }
  
  console.log('Attempting to start background music');
  if (bgMusic) {
    // Mark as started before playing to prevent double starts
    bgMusicStarted = true;
    
    // Set the muted state based on music mute setting
    bgMusic.muted = musicMuted;
    
    // Try to play directly
    bgMusic.play()
      .then(() => {
        console.log('Background music started successfully!');
      })
      .catch(error => {
        // Reset flag if playback fails
        bgMusicStarted = false;
        console.warn('Failed to autoplay background music - will try again on next user interaction', error);
        
        // Add a user interaction handler to start music
        const startMusic = () => {
          if (bgMusicStarted) return;
          
          console.log('Starting background music from user interaction');
          bgMusicStarted = true; // Set flag before trying to play
          
          if (bgMusic) {
            bgMusic.muted = musicMuted;
            bgMusic.play()
              .then(() => {
                console.log('Background music started from user interaction');
                
                // Remove the event listeners after first successful play
                document.removeEventListener('click', startMusic);
                document.removeEventListener('keydown', startMusic);
              })
              .catch(error => {
                bgMusicStarted = false; // Reset flag if it fails again
                console.error('Failed to play background music even with user interaction', error);
              });
          }
        };
        
        // Most browsers require user interaction to play audio
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
      });
    
    return true;
  } else {
    console.error('Background music element not found');
    return false;
  }
};

/**
 * Stop the background music
 */
export const stopBackgroundMusic = () => {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusicStarted = false;
  }
};

/**
 * Pause the background music
 */
export const pauseBackgroundMusic = () => {
  if (bgMusic) {
    bgMusic.pause();
  }
};

/**
 * Resume the background music
 */
export const resumeBackgroundMusic = () => {
  if (bgMusic) {
    bgMusic.play().catch(error => {
      console.warn('Failed to resume background music', error);
    });
  }
};

/**
 * Set the volume of the background music
 * @param volume - Volume level (0.0 to 1.0)
 */
export const setBackgroundMusicVolume = (volume: number) => {
  if (bgMusic) {
    bgMusic.volume = Math.max(0, Math.min(1, volume));
  }
};

/**
 * Set the mute state for all sounds and music
 * @param muted - Whether everything should be muted
 * @deprecated Use setSoundEffectsMuted and setMusicMuted instead
 */
export const setMuted = (muted: boolean) => {
  soundEffectsMuted = muted;
  musicMuted = muted;
  
  // Apply mute state to all sound effects except bgMusic
  Object.entries(audioElements).forEach(([key, audio]) => {
    if (key !== 'themeSong') {
      audio.muted = muted;
    }
  });
  
  // Apply mute state to background music
  if (bgMusic) {
    bgMusic.muted = muted;
  }
};

/**
 * Set the mute state for sound effects only
 * @param muted - Whether sound effects should be muted
 */
export const setSoundEffectsMuted = (muted: boolean) => {
  soundEffectsMuted = muted;
  
  // Apply mute state to all sound effects except bgMusic
  Object.entries(audioElements).forEach(([key, audio]) => {
    if (key !== 'themeSong') {
      audio.muted = muted;
    }
  });
};

/**
 * Set the mute state for music only
 * @param muted - Whether music should be muted
 */
export const setMusicMuted = (muted: boolean) => {
  musicMuted = muted;
  
  // Apply mute state to music
  if (bgMusic) {
    bgMusic.muted = muted;
  }
  
  // Also mute the themeSong if it's in audioElements
  if (audioElements['themeSong']) {
    audioElements['themeSong'].muted = muted;
  }
};

/**
 * Check if sounds are currently muted (global setting)
 * @deprecated Use isSoundEffectsMuted and isMusicMuted instead
 * @returns Whether all sounds are muted
 */
export const isMuted = (): boolean => {
  return soundEffectsMuted && musicMuted;
};

/**
 * Check if sound effects are currently muted
 * @returns Whether sound effects are muted
 */
export const isSoundEffectsMuted = (): boolean => {
  return soundEffectsMuted;
};

/**
 * Check if music is currently muted
 * @returns Whether music is muted
 */
export const isMusicMuted = (): boolean => {
  return musicMuted;
};

/**
 * Play a sound directly without using the audioElements cache
 * This is useful for debugging or for testing sounds directly
 * @param soundName - The name of the sound to play
 * @param ignoreMute - Whether to ignore the mute setting
 */
export const playDirectSound = (
  soundName: keyof typeof soundPaths, 
  ignoreMute = false
) => {
  // Special handling for themeSong (it's controlled by music mute setting)
  const isMusicSound = soundName === 'themeSong';
  const shouldMute = isMusicSound ? musicMuted : soundEffectsMuted;
  
  // If sounds are muted and we're not ignoring mute, do nothing
  if (shouldMute && !ignoreMute) {
    console.log(`Not playing direct ${isMusicSound ? 'music' : 'sound'} ${soundName} because ${isMusicSound ? 'music is' : 'sounds are'} muted`);
    return;
  }
  
  const path = soundPaths[soundName];
  console.log(`Attempting to play ${isMusicSound ? 'music' : 'sound'} directly: ${soundName} from path: ${path}`);
  
  try {
    const audio = new Audio(path);
    audio.volume = 1.0;
    audio.muted = shouldMute && !ignoreMute;
    
    audio.addEventListener('canplaythrough', () => {
      console.log(`Direct ${isMusicSound ? 'music' : 'sound'} ${soundName} can play through`);
      audio.play().catch(e => console.error(`Direct play failed for ${soundName}:`, e));
    });
    
    audio.addEventListener('playing', () => {
      console.log(`Direct ${isMusicSound ? 'music' : 'sound'} ${soundName} is now playing`);
    });
    
    audio.addEventListener('error', (e) => {
      console.error(`Error loading direct ${isMusicSound ? 'music' : 'sound'} ${soundName}:`, e);
    });
    
    audio.load();
  } catch (error) {
    console.error(`Failed to create direct audio element for ${soundName}:`, error);
  }
};