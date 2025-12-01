# Healthcare Patient Journey Management System

## Overview

This is a healthcare management platform that connects patients, doctors, and administrators through a subscription-based care pathway system. Patients subscribe to healthcare plans that provide access to specific medical services, and their treatment journey is tracked through customizable steps. The platform includes real-time messaging between patients and doctors, comprehensive admin controls for managing users, plans, and services, and role-based dashboards for all user types.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing:**
- React with TypeScript for type-safe component development
- Wouter for client-side routing (lightweight SPA router)
- SPA (Single Page Application) architecture with index.html serving all routes
- Special middleware configuration to prevent 404 errors on page refresh by serving index.html for non-API routes

**State Management:**
- Zustand with persistence middleware for global state management
- Stores user authentication, subscriptions, messages, plans, and services
- TanStack Query (React Query) for server state management and caching
- Custom query client with infinite stale time and disabled refetch on window focus

**UI Components:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library (New York style variant)
- Tailwind CSS v4 with custom design tokens and CSS variables
- Custom theme system supporting light/dark modes
- Recharts for data visualization in admin dashboards

**Design System:**
- CSS custom properties for theming (background, foreground, primary, secondary, etc.)
- Custom font stack: "Outfit" and "Plus Jakarta Sans" from Google Fonts
- Responsive breakpoints with mobile-first approach
- Custom logo component with configurable sizes and slogan display

### Backend Architecture

**Server Framework:**
- Express.js as the web server
- TypeScript with ES modules
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves static files from the `public` directory
- Request/response logging middleware for API endpoints

**API Structure:**
- RESTful API design with `/api` prefix for all endpoints
- Authentication endpoints: `/api/auth/login`, `/api/auth/register`
- Resource endpoints for users, subscriptions, messages, services, plans, and steps
- Middleware ensures API routes are processed before SPA fallback

**Authentication & Authorization:**
- Simple password-based authentication (stored in plain text - suitable for MVP/development)
- Role-based access control with three roles: patient, doctor, admin
- Session state managed client-side through Zustand persist
- Each role has dedicated dashboard routes with role-specific features

### Data Storage

**Database:**
- PostgreSQL database via Neon serverless
- Drizzle ORM for type-safe database operations
- WebSocket connection using the `ws` package for serverless compatibility
- Database migrations managed through Drizzle Kit

**Schema Design:**
- `users`: Stores user profiles with role (patient/doctor/admin), credentials, and optional medical info
- `plans`: Healthcare subscription plans with pricing, features, and allowed service IDs
- `services`: Medical services categorized by type (consultation/test/specialist)
- `subscriptions`: Links users to plans with status tracking and doctor notes
- `steps`: Individual journey steps within subscriptions, including status, type, and scheduling
- `messages`: Chat messages between patients and doctors with timestamps

**Data Flow:**
- Client-side storage layer (`server/storage.ts`) provides abstraction over database operations
- Seed data mechanism for initial setup with sample users, plans, and services
- All database operations use async/await with proper error handling

### External Dependencies

**Core Dependencies:**
- `@neondatabase/serverless`: PostgreSQL connection for serverless environments
- `drizzle-orm`: Type-safe ORM with schema validation
- `drizzle-zod`: Automatic Zod schema generation from Drizzle schemas
- `zod`: Runtime type validation for API requests
- `express`: Web server framework
- `react` & `react-dom`: UI library
- `wouter`: Lightweight routing library
- `zustand`: State management with persistence

**UI & Styling:**
- `@radix-ui/*`: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- `tailwindcss`: Utility-first CSS framework (v4+)
- `class-variance-authority`: Type-safe variant styles
- `clsx` & `tailwind-merge`: Conditional class name utilities
- `lucide-react`: Icon library
- `recharts`: Chart components for data visualization

**Development Tools:**
- `vite`: Build tool and dev server
- `tsx`: TypeScript execution for server
- `esbuild`: Production bundler for server code
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal

**Deployment:**
- Vercel deployment configuration with rewrites for SPA routing
- Build outputs to `public` directory
- Excludes API routes from SPA fallback using explicit rewrite rules