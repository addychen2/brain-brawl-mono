# Brain Brawl - Multiplayer Trivia Game

Brain Brawl is an interactive multiplayer trivia game where players can test their knowledge against each other in real-time 1v1 battles.

## Features

- Real-time multiplayer trivia battles
- User authentication and profiles
- Matchmaking system for finding opponents
- Diverse question categories from general knowledge
- Score tracking and leaderboards
- Game history tracking
- Rematch functionality

## Tech Stack

- **Frontend**: React with TypeScript (Vite)
- **Backend**: Express.js with Socket.io
- **Database**: MongoDB (optional)
- **API**: Open Trivia Database for questions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd brain-brawl
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory (use `.env.example` as a template):
```bash
cp backend/.env.example backend/.env
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd frontend
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` to use the application.

## Game Rules

- Each game consists of 10 trivia questions
- You have 20 seconds to answer each question
- Answer correctly to earn points
- The faster you answer, the more points you earn
- The player with the highest score at the end wins

## Project Structure

```
brain-brawl/
├── backend/            # Express server
│   ├── src/
│   │   ├── models/     # Data models
│   │   ├── routes/     # API routes
│   │   ├── server.ts   # Server entry point
│   │   └── socket.ts   # Socket.io setup
│   ├── .env.example    # Environment variables example
│   └── package.json    # Backend dependencies
├── frontend/           # React client (Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.tsx     # Main application component
│   │   └── index.css   # Global styles
│   └── package.json    # Frontend dependencies
└── README.md           # This file
```

## Deployment

### Backend
1. Build the TypeScript code:
```bash
cd backend
npm run build
```

2. Start the server:
```bash
npm start
```

### Frontend
1. Build the frontend:
```bash
cd frontend
npm run build

# for production view on local
npm run preview
```

2. Deploy the `dist` directory to your web server or hosting service.

## License

[MIT](LICENSE)
