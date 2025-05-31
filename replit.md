# Lottery dApp - Replit Development Guide

## Overview

This is a decentralized lottery application built with a modern full-stack architecture. The app allows users to purchase lottery tickets using cryptocurrency on different blockchain networks (Sepolia testnet and SCAI network), with automatic draws and prize distribution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for lottery operations
- **Development**: Hot reload with Vite middleware integration

### Database & ORM
- **Database**: PostgreSQL (configured for production)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Development**: In-memory storage adapter for rapid prototyping

## Key Components

### Database Schema
The application uses four main tables:
- **lottery_rounds**: Manages lottery rounds with timing, prize amounts, and network information
- **tickets**: Individual ticket records with ownership and purchase details
- **transactions**: Blockchain transaction tracking for purchases and wins
- **users**: User profiles with spending/winning statistics

### Web3 Integration
- **Provider Support**: MetaMask and TrustWallet integration
- **Networks**: Sepolia testnet and SCAI network support
- **Smart Contracts**: Ethereum-compatible lottery contract interactions
- **Transaction Handling**: Gas estimation and transaction status tracking

### Core Features
- **Ticket Grid**: Visual 50-ticket lottery interface with real-time availability
- **Wallet Connection**: Multi-wallet support with network switching
- **User Dashboard**: Personal ticket history and transaction tracking
- **Purchase Flow**: Modal-based ticket purchasing with gas estimation
- **Countdown Timer**: Real-time countdown to lottery draw

## Data Flow

1. **User Authentication**: Web3 wallet connection establishes user identity
2. **Lottery State**: Frontend fetches current round data from `/api/lottery/current/:network`
3. **Ticket Purchase**: User selects ticket → Modal opens → Gas estimation → Blockchain transaction → Database update
4. **Real-time Updates**: TanStack Query automatically refetches data after mutations
5. **Network Switching**: Frontend updates network context and refetches network-specific data

## External Dependencies

### Blockchain Libraries
- **ethers.js**: Ethereum blockchain interaction
- **@neondatabase/serverless**: PostgreSQL adapter (production ready)

### UI Framework
- **@radix-ui/***: Accessible UI primitive components
- **@tanstack/react-query**: Server state management
- **class-variance-authority**: Type-safe component variants
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **drizzle-orm**: Type-safe database ORM
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend with hot reload
- **Database**: Uses in-memory storage for quick iteration
- **Vite Integration**: Backend serves frontend through Vite middleware

### Production
- **Build Process**: `npm run build` creates optimized frontend bundle and server bundle
- **Database**: Requires PostgreSQL connection via `DATABASE_URL` environment variable
- **Server**: `npm run start` runs production Express server
- **Static Assets**: Frontend build served from `dist/public`

### Replit Configuration
- **Modules**: Node.js 20, Web development, PostgreSQL 16
- **Deployment**: Autoscale deployment target
- **Port Configuration**: Internal port 5000 mapped to external port 80
- **Environment**: PostgreSQL provisioning handled automatically

### Database Management
- **Schema Deployment**: `npm run db:push` applies schema changes to database
- **Migration Tracking**: Drizzle generates migration files in `./migrations`
- **Type Safety**: Database schema types auto-generated and shared between frontend/backend

## Notes

The application is architected for both development speed and production scalability. The in-memory storage allows for rapid prototyping, while the Drizzle/PostgreSQL setup provides production-grade data persistence. The Web3 integration supports multiple networks and wallets, making it flexible for different blockchain deployments.