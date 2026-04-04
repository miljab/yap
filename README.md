# Yap

A Twitter-like social media clone, currently a work in progress.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend:** Express, TypeScript, Prisma, PostgreSQL
- **Auth:** JWT + refresh tokens, OAuth (Google, GitHub)
- **Storage:** Cloudinary (image uploads)

## Features (WIP)

- User signup/login (email + OAuth)
- Create, edit, and delete posts with images
- Nested comments/replies
- Like posts and comments
- Follow/unfollow users
- Notifications (likes, comments, follows)
- User profiles with avatars and bios
- Search

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Cloudinary account (for image uploads)

### Backend

```bash
cd backend
npm install
# configure .env (DATABASE_URL, JWT secrets, OAuth credentials, Cloudinary keys)
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# configure .env (API base URL)
npm run dev
```

## Project Structure

```
yap/
├── backend/          # Express API
│   ├── controllers/
│   ├── routers/      # auth, post, comment, user
│   ├── services/
│   ├── middleware/
│   ├── prisma/       # DB schema & migrations
│   └── __tests__/
└── frontend/         # React SPA
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── api/
    │   ├── hooks/
    │   └── ...
    └── __tests__/
```

## Notes

This project is under active development. Structure, features, and APIs are subject to change.
