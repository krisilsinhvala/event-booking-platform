# Eventora

Eventora is a production-style MERN event booking platform with public event discovery, email OTP authentication, user bookings, admin event management, booking moderation, and analytics.

## Stack

- React, Vite, React Router, Axios, Tailwind CSS, React Toastify, Lucide React
- Node.js, Express, Mongoose, MongoDB Atlas
- JWT authentication, bcrypt password hashing, Nodemailer email delivery

## Project Structure

```text
backend/     Express REST API, models, services, middleware, uploads
frontend/    Vite React application and responsive UI
```

## Requirements

- Node.js 20 or newer
- MongoDB Atlas database
- SMTP account for OTP and booking emails

## Installation

From the repository root:

```powershell
cd backend
npm.cmd install

cd ..\frontend
npm.cmd install
```

PowerShell users may need `npm.cmd` because local execution policy can block `npm.ps1`.

## Environment Setup

Create the backend environment file:

```powershell
cd backend
Copy-Item .env.example .env
```

Set real values in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventora
JWT_SECRET=use-a-long-random-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=Eventora <no-reply@example.com>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-admin-password
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Never commit `.env` files or real credentials.

The frontend uses `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Google OAuth Configuration (Google Cloud Console)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. In **APIs & Services > OAuth consent screen**:
   - Choose **External** user type.
   - Fill in App Name: `Eventora`, support email, and developer email.
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
3. In **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Eventora Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (local development)
     - `http://localhost:5000`
     - `https://YOUR-FRONTEND.onrender.com` (Render static site origin - no trailing slash)
   - **Authorized redirect URIs**:
     - `http://localhost:5173`
     - `https://YOUR-FRONTEND.onrender.com`
4. Copy the generated **Client ID** to `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).
5. For Render deployment, add these environment variables in the Render Dashboard under Environment variables for each service.


## Create the Admin Account

After MongoDB is configured:

```powershell
cd backend
npm.cmd run seed:admin
```

The seed is non-destructive and does not create a duplicate account for an existing email.

## Run Locally

Start the backend in Terminal 1:

```powershell
cd backend
npm.cmd run dev
```

Start the frontend in Terminal 2:

```powershell
cd frontend
npm.cmd run dev
```

Open `http://localhost:5173`.

Backend health check:

```text
http://localhost:5000/api/health
```

## Production Build

```powershell
cd frontend
npm.cmd run build
npm.cmd run preview
```

Run the backend in production with:

```powershell
cd backend
$env:NODE_ENV="production"
npm.cmd start
```

The backend requires a real `MONGODB_URI` and `JWT_SECRET` before it starts.

## Main API Groups

```text
/api/auth       Registration, login, email OTP, password reset
/api/events     Public event search, filters, and details
/api/bookings   User booking, verification, history, cancellation
/api/users      Profile and password settings
/api/admin      Admin events, bookings, moderation, analytics
```

## User Workflows

1. Register and verify the email OTP.
2. Log in and browse published events.
3. Select tickets and request a booking.
4. Verify the booking OTP.
5. Review or cancel bookings from the dashboard.

## Admin Workflows

1. Sign in with the seeded admin account.
2. Create, edit, publish, or delete events.
3. Review pending bookings.
4. Approve or reject bookings.
5. Monitor users, events, bookings, statuses, and confirmed revenue from analytics.

## Validation Commands

```powershell
cd backend
npm.cmd audit --omit=dev
node --input-type=module -e "import app from './app.js'; console.log('Backend loaded:', app._router.stack.length > 0)"

cd ..\frontend
npm.cmd run build
```

The current codebase has been validated with the frontend production build, backend module loading, protected route checks, and dependency audits.

## Deployment Notes

- Use MongoDB Atlas network access rules for the deployed backend IP.
- Configure all environment variables in the hosting provider, never in source control.
- Serve the frontend build through a static host or CDN.
- Deploy the backend as a Node.js service with a persistent process manager.
- Set `CLIENT_URL` to the deployed frontend origin.
- Configure SMTP TLS and verify the sender address before production email delivery.
- Use HTTPS in production.
- Uploaded event media is stored under `backend/uploads/` locally and ignored by Git. Use object storage for horizontally scaled production deployments.
