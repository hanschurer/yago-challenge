# Fintech Card Management System

A full-stack card management system inspired by Privacy.com, built with Node.js, Express, TypeScript, Drizzle ORM, Zod, PostgreSQL, and React.

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database

## Getting Started

### 1. Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Copy `.env.example` (or just `.env` if created)
    - Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.
      ```
      DATABASE_URL="postgres://username:password@localhost:5432/your_database"
      ```
4.  Run Database Migrations:
    ```bash
    npm run db:generate
    npm run db:migrate
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:3000`.
    _Note: On first run, if the database is empty, the Dashboard will automatically seed it with demo data._

### 2. Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development, server:
    ```bash
    npm run dev
    ```
    The application will run on `http://localhost:5173`.

## Features

- **Dashboard**: Real-time overview of spending, active cards, and recent transactions.
- **Card Management**: Create unlimited virtual cards, set spending limits, and freeze/unfreeze cards instantly.
- **Transactions**: View detailed transaction history, filter by card, and upload receipts.
- **Security**: Mock implementation of card masking and status controls.

## Design

Built with a premium dark-mode aesthetic using vanilla CSS variables and glassmorphism effects for a modern, high-quality user experience.
