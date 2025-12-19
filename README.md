# Messaging App (React + Express + TypeScript)

Full-stack messaging app with a React/Vite frontend and an Express/Socket.IO API, both migrated to TypeScript. Frontend deploys to Vercel, API deploys to Render.

## Stack
- Frontend: React 18, Vite, TypeScript, Tailwind, Formik/Yup, Axios, Socket.IO client.
- Backend: Express, TypeScript, Mongoose/MongoDB, JWT auth, Multer + Cloudinary, Socket.IO server, rate limiting.

## Local Development
1) Install dependencies
```bash
cd client && npm install
cd ../api && npm install
```
2) Environment variables
- `client/.env` (copy from `client/.env.example`):
  - `VITE_API_BASE_URL` (e.g., `http://localhost:8080/api`)
  - `VITE_SOCKET_URL` (e.g., `http://localhost:8080`)
- `api/.env` (not committed):
  - `MONGO_URI`
  - `JWT_SEC_KEY`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLIENT_URL` (e.g., `http://localhost:5173`)
  - `PORT` (default 8080)
3) Run dev servers
```bash
# API
cd api
npm run dev

# Client (in a separate shell)
cd client
npm run dev
```

## Scripts
- Client: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`
- API: `npm run dev` (ts-node/nodemon), `npm run build`, `npm start` (compiled)

## Deployment
- Client → Vercel (GitHub Action: `.github/workflows/vercel-client.yml`). Secrets required: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Set envs in Vercel (`VITE_API_BASE_URL`, `VITE_SOCKET_URL`).
- API → Render (config: `render.yaml`, workflow: `.github/workflows/render-api.yml`). Render env vars: `CLIENT_URL`, `MONGO_URI`, `JWT_SEC_KEY`, `CLOUDINARY_*`, `PORT`, `NODE_ENV=production`. GitHub secrets for the workflow: `RENDER_API_KEY`, `RENDER_API_SERVICE_ID`.

## Notes
- Env files are git-ignored; do not commit secrets.
- Socket base URLs are centralized in `client/src/config/env.ts`.
- API entry: `api/src/server.ts`; Express app: `api/src/app.ts`.
