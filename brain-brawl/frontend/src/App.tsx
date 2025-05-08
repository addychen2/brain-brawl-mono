import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import Game from './components/game/Game';
import WaitingRoom from './components/game/WaitingRoom';
import ModeSelection from './components/game/ModeSelection';
import PracticeMode from './components/game/PracticeMode';
import Profile from './components/profile/Profile';
import Leaderboard from './components/Leaderboard';
import NotFound from './components/NotFound';
// Keeping import but marked as used via reference below
import type { default as NavbarType } from './components/layout/Navbar';
import SoundTest from './components/SoundTest';
import { MuteControls } from './components/common';
import { initSoundSystem, startBackgroundMusic } from './utils/soundUtils';
import './App.css';
import './RetroTheme.css';

// These variables persist across component renders
let soundInitializedGlobal = false;
let bgMusicPlayingGlobal = false;

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Using refs and globals to track initialization state
  const soundInitialized = useRef(soundInitializedGlobal);
  const musicPlaying = useRef(bgMusicPlayingGlobal);
  
  // Only initialize and start sounds once per app session
  useEffect(() => {
    if (!soundInitializedGlobal) {
      console.log('App mounted, initializing sound system for the first time');
      initSoundSystem();
      soundInitializedGlobal = true;
      soundInitialized.current = true;
      
      // Start background music with a slight delay to ensure initialization
      setTimeout(() => {
        if (!bgMusicPlayingGlobal) {
          console.log('Starting background music after initialization');
          startBackgroundMusic();
          bgMusicPlayingGlobal = true;
          musicPlaying.current = true;
        }
      }, 500);
    }
    
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('brainBrawlUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user data');
        localStorage.removeItem('brainBrawlUser');
      }
    }
    
    // Setup user interaction listener to enable audio - only once
    const enableAudio = () => {
      console.log('User interaction detected, enabling audio');
      // Create and play a silent audio element to unlock audio
      const silentAudio = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==");
      silentAudio.play().catch(e => console.error("Could not play silent audio:", e));
      
      // Remove event listener after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    document.removeEventListener('click', enableAudio); // Immediately remove to prevent duplicates
    document.addEventListener('click', enableAudio); 
    
    document.addEventListener('keydown', enableAudio);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    }
  }, []);
  
  useEffect(() => {
    // Connect to socket.io server if user is logged in
    if (user) {
      // Always use the provided IP address, never fall back to localhost
      const newSocket = io(import.meta.env.VITE_BACKEND_URL);
      
      // Set up socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to server:', import.meta.env.VITE_BACKEND_URL);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
      
      setSocket(newSocket);
      
      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);
  
  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('brainBrawlUser', JSON.stringify(userData));
  };
  
  // Used in NavbarType component
  const _handleLogout = () => {
    console.log('Logging out user');
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    // Clear user state
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem('brainBrawlUser');
    
    // Update UI immediately without navigation
    // The component calling this will handle navigation if needed
  };
  
  // We've gone back to a simpler approach with page reloads for logout
  // This ensures all state is completely reset, even though it restarts the music
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Always use retro mode
  const retroMode = true;
  
  // Handle play test sound (and start background music) on mount
  const handleAppClick = () => {
    // Play a silent ding to enable audio on iOS/Safari
    const audio = new Audio('/sounds/ding.wav');
    audio.volume = 0.01;
    audio.play().catch(e => console.error("Could not play initial ding:", e));
    
    // Start background music
    startBackgroundMusic();
  };

  return (
    <Router>
      <div className="app retro-mode" onClick={handleAppClick}>
        {/* Add mute controls in the top right corner */}
        <MuteControls />
        
        {/* Hide navbar in retro mode */}
        <main className="retro-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            <Route 
              path="/game/:gameId" 
              element={
                <ProtectedRoute>
                  <Game socket={socket} user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/waiting-room" 
              element={
                <ProtectedRoute>
                  <WaitingRoom socket={socket} user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mode-selection" 
              element={
                retroMode ? (
                  <ModeSelection user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/practice" 
              element={
                retroMode ? (
                  <PracticeMode />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/sound-test" element={<SoundTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
