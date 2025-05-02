import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import CharacterSelection from './CharacterSelection';

interface WaitingRoomProps {
  socket: Socket | null;
  user: any;
}

const WaitingRoom = ({ socket, user }: WaitingRoomProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('blue');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for match found event
    socket.on('match_found', (data) => {
      console.log('Match found:', data);
      // Navigate to the game room
      navigate(`/game/${data.gameId}`);
    });
    
    return () => {
      // Clean up event listener
      socket.off('match_found');
    };
  }, [socket, navigate]);
  
  useEffect(() => {
    let timer: number | null = null;
    
    if (isSearching) {
      timer = window.setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSearching]);
  
  const handleStartSearch = () => {
    if (!socket) {
      setError('Connection to server lost. Please refresh and try again.');
      return;
    }
    
    setIsSearching(true);
    setSearchTime(0);
    setError('');
    
    // Save character selection to localStorage and send to server
    localStorage.setItem('selectedCharacter', selectedCharacter);
    socket.emit('join_waiting_room', { userId: user.userId, character: selectedCharacter });
  };
  
  const handleCancelSearch = () => {
    setIsSearching(false);
    
    // Implement cancel logic if needed
    // For simplicity, we'll just leave it as setting isSearching to false
  };
  
  // Format search time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="waiting-room-container">
      <h1>Find a Match</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="search-status">
        {isSearching ? (
          <>
            <div className="searching-animation">
              <div className="pulse"></div>
            </div>
            <p className="searching-text">Searching for opponents...</p>
            <p className="search-time">Time elapsed: {formatTime(searchTime)}</p>
            
            <button 
              onClick={handleCancelSearch}
              className="cancel-button"
            >
              Cancel Search
            </button>
          </>
        ) : (
          <>
            <div className="waiting-image">
              <span role="img" aria-label="Brain icon" className="brain-icon">
                🧠
              </span>
            </div>
            
            <CharacterSelection 
              onSelect={setSelectedCharacter} 
              selectedCharacter={selectedCharacter} 
            />
            
            <p className="waiting-text">
              Ready to test your knowledge? Select your character and click below to find an opponent!
            </p>
            
            <button 
              onClick={handleStartSearch}
              className="primary-button"
            >
              Find Opponent
            </button>
          </>
        )}
      </div>
      
      <div className="game-info">
        <h2>Game Rules</h2>
        <ul>
          <li>Each game consists of 10 trivia questions</li>
          <li>You have 20 seconds to answer each question</li>
          <li>Answer correctly to earn points</li>
          <li>The faster you answer, the more points you earn</li>
          <li>The player with the highest score at the end wins</li>
        </ul>
      </div>
    </div>
  );
};

export default WaitingRoom;