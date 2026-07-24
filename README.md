# Countdown

A full-stack countdown timer app — create, edit, and track countdowns with real-time remaining time. Built with Next.js 16 (App Router), Prisma 7 + PostgreSQL, and Tailwind CSS v4.

## Features

- User registration & login (JWT in httpOnly cookie)
- Create, view, edit, and delete countdowns
- Real-time remaining time display (Xd Xh Xm)
- Responsive card grid layout with expandable details

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Database:** PostgreSQL via Prisma 7 ORM
- **Auth:** bcrypt password hashing + JWT (jose) in httpOnly cookies
- **Styling:** Tailwind CSS v4
- **Validation:** Custom payload validators

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database

### Setup

```bash
cp .env.example .env
```

Edit `.env` with your database connection string and a secure JWT secret.

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev+` | Clean `.next` cache then start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── app/
│   ├── api/auth/        # Auth routes (login, register, logout, me)
│   ├── api/countdowns/  # Countdown CRUD routes
│   ├── (login)/login/   # Login / Register page
│   ├── page.tsx         # Main dashboard
│   └── layout.tsx
├── libs/                # Prisma client, JWT helpers, error handling
├── service/             # Business logic layer
├── types/               # TypeScript interfaces
├── validator/           # Request payload validation
├── prisma/schema.prisma # Database schema
├── proxy.ts             # Auth middleware (cookie → x-user-id header)
└── docs/api/            # OpenAPI specification
```
