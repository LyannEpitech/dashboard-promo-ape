# Dashboard Promo APE

Dashboard de suivi des étudiants Epitech via l'API GitHub.

## Architecture

```
Frontend (React + TypeScript + Tailwind)
    ↕
Backend (Node.js + Express)
    ↕
GitHub API (Organisation Epitech)
```

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, Passport.js |
| Auth | GitHub OAuth |
| Charts | Recharts |

## Installation

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

Créer un fichier `.env` dans le dossier `backend`:

```env
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret
SESSION_SECRET=votre_session_secret
FRONTEND_URL=http://localhost:5173
```

## User Stories

- US1: Authentification GitHub
- US2: Vue d'ensemble promo
- US3: Vue détaillée étudiant
- US4: Alerte d'inactivité
- US5: Alerte rush last-minute
- US6: Webhook vers OpenClaw
- US7: Vue transversale par projet
- US8: Export des données

## Auteur

Lyann Bourlon
