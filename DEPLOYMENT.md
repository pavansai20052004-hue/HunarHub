# HunarHub Deployment Checklist

## Required Services

- Neon Postgres database
- Backend host: Render or Railway
- Frontend host: Vercel

## Backend

Use the `backend` directory as the service root.

```bash
npm ci
npm start
```

Required environment variables:

```bash
NODE_ENV=production
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_strong_32_plus_character_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_MAX=250
DB_POOL_MAX=10
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_12_plus_character_admin_password
ADMIN_NAME=HunarHub Admin
```

Health check path:

```bash
/health
```

The health check returns `200` only when the API can see an active Postgres connection.

## Frontend

Use the `frontend` directory as the project root.

```bash
npm ci
npm run build
```

Required environment variable:

```bash
VITE_API_URL=https://your-backend-domain/api
```

Vercel output directory:

```bash
dist
```

## Release Verification

Run these commands before every deployment:

```bash
cd backend
npm test
npm audit --audit-level=high
```

```bash
cd frontend
npm test
npm run build
npm audit --audit-level=high
```

After deployment, open `/health` on the backend and confirm the frontend can log in, register, browse entrepreneurs, send a request, and update request status.
