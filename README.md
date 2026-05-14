# HunarHub

HunarHub is a full-stack local services marketplace with role-based dashboards for customers, entrepreneurs, and admins. It helps customers discover skilled local entrepreneurs, send service requests, and track request progress while entrepreneurs manage profiles and incoming work.

## Stack

- Frontend: React, Vite, React Router, Axios, Vitest
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Tooling: npm scripts, environment-based configuration, production builds

## Features

- JWT authentication with customer and entrepreneur registration
- Role-protected customer, entrepreneur, and admin dashboards
- Entrepreneur profile creation, approval, discovery, and filtering
- Service request workflow with accepted, rejected, and completed states
- Modern responsive UI with accessible focus states and polished dashboard layouts
- Clean repository setup with ignored secrets and dependency folders

## Local Setup

```bash
cd backend
npm install
copy .env.example .env
npm start
```

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend runs on `http://localhost:3000` unless that port is busy. Backend runs on `http://localhost:5000`.

## Environment

Backend `.env`:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
FRONTEND_URL=http://localhost:3000
```

Frontend `.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Quality Checks

```bash
cd frontend
npm run build
npm test
npm audit --audit-level=high
```

```bash
cd backend
npm audit --audit-level=high
```

## Deployment

Recommended recruiter demo setup:

- Frontend: Vercel, root directory `frontend`, build command `npm run build`, output directory `dist`
- Backend: Render or Railway, root directory `backend`, build command `npm install`, start command `npm start`
- Database: MongoDB Atlas connection string in `MONGO_URI`

Production environment variables:

Backend:

```bash
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Frontend:

```bash
VITE_API_URL=https://your-backend-service-url/api
```

After both services are live, update `FRONTEND_URL` on the backend to the final Vercel URL and redeploy/restart the backend.

## Author

Pavan Sai
