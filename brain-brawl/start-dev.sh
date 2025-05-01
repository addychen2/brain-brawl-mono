#!/bin/bash

# Start backend in the background
echo "Starting backend server..."
cd backend && npm run dev &

# Wait a moment for the backend to start
sleep 2

# Start frontend
echo "Starting frontend server..."
cd frontend && npm run dev