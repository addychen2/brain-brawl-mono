import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import Game from './components/game/Game';
import WaitingRoom from './components/game/WaitingRoom';
import Profile from './components/profile/Profile';
import Leaderboard from './components/Leaderboard';
import NotFound from './components/NotFound';
import Navbar from './components/layout/Navbar';
import './App.css';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
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
  }, []);
  
  useEffect(() => {
    // Connect to socket.io server if user is logged in
    if (user) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001');
      
      // Set up socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to server');
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
  
  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setUser(null);
    localStorage.removeItem('brainBrawlUser');
  };
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
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
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
