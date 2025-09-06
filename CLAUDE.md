# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habicker is a React Native habit tracking application built with Expo. The project uses a dual backend architecture supporting both Supabase and PocketBase for different deployment scenarios.

## Architecture

### Frontend (React Native + Expo)
- **Framework**: React Native 0.79.2 with Expo 53
- **Routing**: Expo Router with typed routes
- **State Management**: React Query (@tanstack/react-query) for server state
- **Authentication**: Supabase Auth with Apple, Google, and GitHub OAuth providers
- **UI Components**: React Native Paper, custom themed components
- **Forms**: React Hook Form with Zod validation
- **Navigation**: Tab-based navigation with authenticated/unauthenticated route groups

### Backend Options
1. **Supabase** (Primary): PostgreSQL with real-time subscriptions, auth, and edge functions
2. **PocketBase** (Alternative): Go-based backend with embedded SQLite

### Key Directories
- `frontend/app/` - Expo Router file-based routing
- `frontend/components/` - Reusable UI components with theming
- `frontend/lib/` - Utilities, hooks, context providers, and constants
- `supabase/` - Database migrations, functions, and configuration
- `pocketbase/` - Go backend with custom PocketBase setup

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run web version
npm test             # Run Jest tests with watch mode
```

### Backend Development

#### Supabase
```bash
cd supabase
supabase start       # Start local Supabase stack (requires Docker)
supabase stop        # Stop local services
supabase db reset    # Reset database to latest migration
supabase functions serve  # Serve edge functions locally
```

**Local Supabase URLs:**
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

#### PocketBase
```bash
cd pocketbase
go run main.go       # Start PocketBase server
make deploy          # Deploy to Fly.io
```

## Authentication Configuration

The app supports multiple OAuth providers:
- **Apple Sign-In**: Configured for iOS with bundle ID `com.westmorelandcreative.habitz`
- **Google OAuth**: Requires `SUPABASE_AUTH_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_GOOGLE_SECRET`
- **GitHub OAuth**: Requires `SUPABASE_AUTH_GITHUB_CLIENT_ID` and `SUPABASE_AUTH_GITHUB_SECRET`

## Code Organization Patterns

### Route Structure
- `app/(auth)/` - Authentication screens (login, signup)
- `app/(app)/` - Main application screens (home, create-habit, etc.)
- `app/_layout.tsx` - Root layout with providers
- `app/index.tsx` - Entry point with auth state routing

### Component Patterns
- Use `Themed.tsx` components for consistent theming
- Custom hooks in `lib/hooks/` for reusable logic
- Context providers in `lib/context/` for global state
- Type-safe utilities with TypeScript throughout

### Database Patterns
- Supabase migrations in `supabase/migrations/`
- Row Level Security (RLS) policies for data access
- Real-time subscriptions for live updates
- Edge functions for server-side logic

## Testing

- **Framework**: Jest with Expo preset
- **Location**: Tests in `components/__tests__/`
- **Command**: `npm test` (runs in watch mode)

## Environment Configuration

### Required Environment Variables
- `SUPABASE_AUTH_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_GOOGLE_SECRET` 
- `SUPABASE_AUTH_GITHUB_CLIENT_ID`
- `SUPABASE_AUTH_GITHUB_SECRET`
- `OPENAI_API_KEY` (for Supabase AI features)

### VS Code Configuration
- Deno support enabled for Supabase functions
- TypeScript formatting configured for Deno in function files
- Supabase functions use Deno runtime, not Node.js

## Deployment

### Frontend
- **Platform**: Expo Application Services (EAS)
- **Config**: `eas.json` for build and submit configuration
- **Updates**: Over-the-air updates via Expo Updates

### Backend
- **Supabase**: Managed hosting with production database
- **PocketBase**: Deployed to Fly.io using Docker

## Key Dependencies

- **React Query**: Server state management and caching
- **Date-fns**: Date manipulation and timezone handling
- **React Native Paper**: Material Design components
- **Expo Router**: File-based routing system
- **Moti**: Animations and transitions
- **React Native Calendars**: Calendar components for habit tracking