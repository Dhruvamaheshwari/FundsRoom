# FundsRoom Enterprise Operations Portal

A modern, high-density ERP and CRM operations portal built for enterprise workflow management. The application facilitates full lifecycle tracking of customers, products, inventory ledgers, and sales challans with strict Role-Based Access Control (RBAC).

## Default Roles & Login

If you seeded the database using the provided seed script, you can log in using these default accounts (Password for all: `password123`):
- **Admin:** admin@example.com
- **Sales:** sales@example.com
- **Warehouse:** warehouse@example.com
- **Accounts:** accounts@example.com

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Minimalist/Shadcn-inspired UI)
- **Icons:** Lucide React
- **Language:** TypeScript

### Backend
- **Framework:** Node.js with Express
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **Validation:** Zod
- **Language:** TypeScript

## Key Features

- **Role-Based Access Control (RBAC):** Distinct roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) with specialized permissions and views.
- **Customer Management:** Track retail, wholesale, and distributor leads. Monitor statuses and follow-up activities.
- **Product Catalog:** Manage SKUs, pricing, and categorizations.
- **Inventory Ledger:** Real-time tracking of all stock movements (IN/OUT) with reasons, exact quantities, and the user who authorized the change.
- **Sales Challans:** Create and confirm order fulfillments. Automatically deducts stock and maintains atomic consistency with the inventory ledger.
- **Secure Authentication:** Robust JWT-based authentication system safeguarding all API endpoints.

## Project Structure

The project is structured as a full-stack monorepo:

```
FundsRoom/
├── backend/          # Node.js + Express API server
│   ├── prisma/       # Prisma schema and seed data
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── package.json
└── frontend/         # React SPA
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL running locally or remotely

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fundsroom"
   JWT_SECRET="your_super_secret_key"
   PORT=5000
   ```
4. Run Prisma migrations and generate the client:
   ```bash
   npx prisma migrate dev
   npm run prisma:generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (if any API URL configuration is required):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```


## Deployment Instructions

### Deploying the Backend (Render / Railway)
1. Ensure your backend code is pushed to a GitHub repository.
2. Link the repository to your hosting provider.
3. Configure the **Build Command**: `npm install && npm run prisma:generate && npm run build`
4. Configure the **Start Command**: `npm run migrate:deploy && npm start`
5. Set the required environment variables:
   - `DATABASE_URL` (Your production PostgreSQL URL)
   - `JWT_SECRET` (A strong, random string)
   - `PORT` (Provided by the host or default 5000)
   - `FRONTEND_URL` (The deployed URL of your Vercel frontend for CORS)

### Deploying the Frontend (Vercel)
1. Push your frontend code to GitHub.
2. Import the project in Vercel.
3. Set the Framework Preset to **Vite**.
4. Set the **Build Command**: `npm run build`
5. Configure the environment variable:
   - `VITE_API_URL` (The URL of your deployed backend)
6. Deploy!

## License
This project is proprietary and confidential.
