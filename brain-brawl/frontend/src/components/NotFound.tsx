import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Looks like the page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="primary-button">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;