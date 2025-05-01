import { Link } from 'react-router-dom';

interface HomeProps {
  user: any | null;
}

const Home = ({ user }: HomeProps) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Brain Brawl</h1>
        <p className="subtitle">Test your knowledge in exciting 1v1 trivia battles!</p>
        
        {user ? (
          <div className="cta-buttons">
            <Link to="/waiting-room" className="primary-button">
              Find a Match
            </Link>
            <Link to="/profile" className="secondary-button">
              View Profile
            </Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/login" className="primary-button">
              Login to Play
            </Link>
            <Link to="/register" className="secondary-button">
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>How to Play</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Challenge Your Knowledge</h3>
            <p>Answer trivia questions from various categories and test your knowledge against other players.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Battles</h3>
            <p>Compete head-to-head in real-time trivia battles. Be fast and accurate to earn more points!</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Climb the Leaderboard</h3>
            <p>Win matches to earn points and climb the global leaderboard. Become the ultimate Brain Brawl champion!</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>View detailed stats of your performance and see how you stack up against other players.</p>
          </div>
        </div>
      </div>
      
      <div className="categories-section">
        <h2>Trivia Categories</h2>
        <p>Challenge yourself across a wide range of knowledge areas:</p>
        
        <div className="categories-grid">
          <div className="category-item">History</div>
          <div className="category-item">Science</div>
          <div className="category-item">Geography</div>
          <div className="category-item">Entertainment</div>
          <div className="category-item">Sports</div>
          <div className="category-item">Arts</div>
          <div className="category-item">Technology</div>
          <div className="category-item">Food & Drink</div>
        </div>
      </div>
      
      {!user && (
        <div className="join-now-section">
          <h2>Ready to Test Your Knowledge?</h2>
          <p>Create an account and start battling other trivia enthusiasts right away!</p>
          <Link to="/register" className="primary-button">
            Join Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;