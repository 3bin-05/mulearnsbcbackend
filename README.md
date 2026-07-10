# MuLearn SBC Event Hub

A modern event management system for MuLearn School and Business Club (SBC) — built with React, TypeScript, Vite, TailwindCSS, and Firebase.

## ✨ Features

- 📅 **Event Management** — Create, track, and manage past and upcoming events
- 🔴 **Live Status Tracking** — Real-time event status indicators
- 🛠️ **Admin Dashboard** — Full admin panel for event CRUD operations
- 🏆 **Digital Credentials** — Manage and issue digital certificates
- 📱 **Responsive Design** — Works seamlessly on all screen sizes
- ⚡ **Real-time Updates** — Powered by Firebase Firestore

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 |
| Backend/DB | Firebase (Firestore, Auth) |
| Icons | Lucide React |
| Routing | React Router DOM v7 |
| Deployment | Vercel |

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mulearn-sbc-backend.git
   cd mulearn-sbc-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase project credentials in `.env`:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

   > Get these values from your [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your apps → SDK setup.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## 🏗️ Build

```bash
npm run build
```

Output is written to the `dist/` directory.

## 🌐 Deploying to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy

1. Push this repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set **Framework Preset** to `Vite`
4. Add all `VITE_*` environment variables from your `.env` file in the Vercel project settings
5. Deploy

> **Note**: The `vercel.json` file handles SPA routing — all paths are rewritten to `index.html` so React Router works correctly on direct URL access and page refresh.

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (Analytics) |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/        # Admin-specific components
│   └── layout/       # Layout components (header, footer, etc.)
├── context/          # React context providers
├── hooks/            # Custom hooks
├── pages/            # Page-level components
│   └── Admin/        # Admin dashboard pages
├── services/         # Firebase service functions
├── styles/           # Additional stylesheets
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Root component with routing
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## 📜 License

MIT
