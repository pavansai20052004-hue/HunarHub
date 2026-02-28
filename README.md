# HunarHub
Skill Development & Talent Connect Platform

------------------------------------------------------------

## Project Overview

HunarHub is a full-stack web application designed to connect skilled individuals with opportunities. 
The platform allows users to showcase their skills, explore opportunities, and interact through a structured frontend and backend system.

This project demonstrates full-stack development using a separate frontend and backend architecture with proper CORS handling for both localhost and production environments.

------------------------------------------------------------

## Tech Stack

Frontend:
- HTML
- CSS
- JavaScript
- Fetch API

Backend:
- Node.js
- Express.js
- REST API
- CORS Configuration
- Environment Variables (.env)

Database:
- MongoDB (if connected)

Deployment:
- Frontend Hosting (Netlify / Vercel)
- Backend Hosting (Render / Railway / Node Hosting)

------------------------------------------------------------

## Project Structure

HunarHub/
│
├── backend/        Backend server and API routes
├── frontend/       Frontend UI files
│
└── README.md

------------------------------------------------------------

## Features

- Full-stack architecture (Frontend + Backend)
- RESTful API integration
- CORS configured for localhost and production
- Modular project structure
- Environment variable support
- Deployment-ready configuration

------------------------------------------------------------

## How It Works

1. User interacts with the frontend interface.
2. Frontend sends requests to backend APIs.
3. Backend processes the request.
4. Database (if used) stores or retrieves data.
5. Response is returned and displayed on frontend.

------------------------------------------------------------

## Installation & Setup

1. Clone the repository:

git clone https://github.com/your-username/HunarHub.git
cd HunarHub

2. Setup Backend:

cd backend
npm install

3. Create a .env file inside backend folder:

PORT=5000
MONGO_URL=your_mongodb_connection_string

4. Start Backend Server:

node server.js

5. Setup Frontend:

Open frontend folder and run using Live Server
OR deploy using Netlify/Vercel

------------------------------------------------------------

## Learning Outcomes

- Built a complete full-stack application
- Implemented proper CORS handling
- Managed backend API routing
- Connected frontend with backend
- Understood deployment configuration
- Fixed real-world production issues

------------------------------------------------------------

## Future Improvements

- Add user authentication (JWT)
- Add profile management
- Add skill-based filtering system
- Add admin dashboard
- Improve UI with animations and responsiveness

------------------------------------------------------------

## Author

Pavan Sai
Full Stack Developer | MERN Stack Enthusiast
