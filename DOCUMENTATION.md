# Coffee Docket - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Core Components](#core-components)
6. [Authentication System](#authentication-system)
7. [API Services](#api-services)
8. [User Interfaces](#user-interfaces)
9. [Development Setup](#development-setup)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [Features](#features)
13. [Code Structure](#code-structure)
14. [Troubleshooting](#troubleshooting)

## Overview

Coffee Docket is a modern coffee balance tracking system built with Next.js, React, and Supabase. It manages coffee credits for customers, allowing administrators to track coffee purchases, balance management, and customer transactions in a clean, minimal interface.

### Key Concepts
- **Coffee Credit System**: Integer-based coffee count (not monetary)
- **Admin Management**: Full CRUD operations for customers and menu items
- **Customer Portal**: Self-service balance checking and transaction history
- **Real-time Updates**: Live balance updates and transaction tracking

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │    Database     │
│                 │    │                 │    │                 │
│ React Components│◄──►│   Next.js API   │◄──►│   Supabase      │
│ Context/State   │    │   Routes        │    │   PostgreSQL    │
│ UI Components   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
```
User Action → React Component → Supabase Service → Database → Real-time Update
```

## Technology Stack

### Frontend
- **Next.js 15.2.4**: React framework with App Router
- **React 19**: UI library with modern hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Icon library

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Database Schema

### Tables

#### `customers`
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  coffee_balance INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  notification_low_balance BOOLEAN DEFAULT true,
  notification_topup BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  admin_id UUID,
  type VARCHAR NOT NULL, -- 'topup', 'serve', 'refund'
  coffee_count INTEGER NOT NULL,
  amount DECIMAL,
  drink_name VARCHAR,
  size_name VARCHAR,
  addons TEXT[],
  discount_amount DECIMAL DEFAULT 0,
  notes TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `menu_items`
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  base_price DECIMAL NOT NULL,
  category VARCHAR,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `menu_sizes`
```sql
CREATE TABLE menu_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  display_name VARCHAR,
  price_modifier DECIMAL DEFAULT 0,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `menu_addons`
```sql
CREATE TABLE menu_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price_modifier DECIMAL DEFAULT 0,
  category VARCHAR,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Core Components

### 1. Authentication Context (`contexts/auth-context.tsx`)
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

**Purpose**: Manages user authentication state across the application
**Key Features**:
- JWT token management
- Session persistence
- Email-optional customer support
- Admin vs customer role handling

### 2. Admin Dashboard (`components/dashboard/admin-dashboard.tsx`)
**Purpose**: Central hub for administrators to manage customers and view statistics

**Key Features**:
- Customer search and management
- Real-time statistics dashboard
- Recent activity tracking
- Navigation to menu management and transactions

**Mobile Optimizations**:
- Responsive grid layout
- Touch-friendly customer cards
- Slide-up animations for results
- Mobile-first search interface

### 3. Customer Details Modal (`components/dashboard/customer-details-modal.tsx`)
**Purpose**: Comprehensive customer management interface

**Tabs Structure**:
- **Overview**: Coffee balance display with large serve button
- **Transactions**: Complete transaction history with filtering
- **Top Up**: Bulk coffee purchase with menu selection
- **Details**: Read-only customer information view

**Key Features**:
- Real-time balance updates
- Coffee serving (1-click deduction)
- Bulk coffee purchases with pricing
- Transaction history with smart filtering

### 4. Customer Edit Modal (`components/dashboard/customer-edit-modal.tsx`)
**Purpose**: Customer profile editing and management

**Features**:
- Profile information editing
- Email authentication setup
- Notification preferences
- Customer deletion with confirmation
- Mobile-responsive layout

### 5. Customer Dashboard (`components/dashboard/customer-dashboard.tsx`)
**Purpose**: Self-service portal for customers

**Features**:
- Clean coffee balance display
- Personal transaction history
- Responsive design with subtle animations
- Error handling and loading states

### 6. Supabase Service (`lib/supabase-service.ts`)
**Purpose**: Centralized database operations and business logic

**Key Methods**:
```typescript
class SupabaseService {
  // Customer Management
  getCustomers(): Promise<Customer[]>
  getCustomer(id: string): Promise<Customer | null>
  getCustomerByEmail(email: string): Promise<Customer | null>
  createCustomer(customer: Partial<Customer>): Promise<Customer>
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>
  deleteCustomerCompletely(id: string): Promise<void>
  
  // Authentication Management
  sendAuthInvitation(email: string, userData: object): Promise<{success: boolean, error?: string}>
  removeCustomerAuthentication(customerId: string): Promise<void>
  
  // Transaction Management
  getTransactions(customerId?: string): Promise<Transaction[]>
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>
  
  // Menu Management
  getMenuItems(): Promise<MenuItem[]>
  getMenuSizes(): Promise<MenuSize[]>
  getMenuAddons(): Promise<MenuAddon[]>
  
  // Statistics
  getStatistics(): Promise<CustomerStats>
}
```

## Authentication System

### Admin Authentication
- Standard email/password authentication
- JWT token-based sessions
- Service role permissions for admin operations

### Customer Authentication
- Optional email-based authentication
- Admin can create customers with or without email
- Email authentication setup via invitation system
- Password reset flow for customer onboarding

### Permission Levels
```typescript
// Admin permissions (full access)
- Customer CRUD operations
- Menu management
- Transaction management
- Authentication management

// Customer permissions (read-only)
- View own balance
- View own transaction history
- Profile information access
```

## API Services

### Supabase Configuration (`lib/supabase.ts`)
```typescript
// Regular client (anon key)
export async function getSupabaseClient()

// Admin client (service role key)  
export async function getSupabaseAdminClient()
```

### Key Service Methods

#### Customer Operations
```typescript
// Get customer by ID or email
const customer = await supabaseService.getCustomer(id)
const customer = await supabaseService.getCustomerByEmail(email)

// Update coffee balance
await supabaseService.updateCustomer(id, { balance: newBalance })

// Create transaction
await supabaseService.createTransaction({
  customerId: id,
  type: 'serve', // 'topup', 'serve', 'refund'
  coffeeCount: 1,
  description: 'Coffee served'
})
```

#### Authentication Operations
```typescript
// Send authentication invitation
const result = await supabaseService.sendAuthInvitation(email, {
  firstName: 'John',
  lastName: 'Doe'
})

// Remove authentication
await supabaseService.removeCustomerAuthentication(customerId)
```

## User Interfaces

### Admin Interface Features
- **Dashboard**: Customer grid with search, statistics, recent activity
- **Customer Management**: Full CRUD with modal-based editing
- **Menu Management**: Coffee items, sizes, and addons management
- **Transaction History**: Complete audit trail with filtering
- **Real-time Updates**: Live balance and transaction updates

### Customer Interface Features
- **Balance Display**: Large, clear coffee count with status indicators
- **Transaction History**: Personal transaction log with filtering
- **Profile Management**: Basic profile information
- **Responsive Design**: Mobile-optimized layouts

### Design System
- **Color Palette**: Clean grays with coffee-themed accents
- **Typography**: Modern sans-serif with clear hierarchy
- **Components**: shadcn/ui-based consistent design system
- **Animations**: Subtle, meaningful animations for better UX
- **Accessibility**: WCAG-compliant color contrasts and keyboard navigation

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation Steps
```bash
# Clone repository
git clone [repository-url]
cd coffee-docket

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations (if any)
# Set up database schema in Supabase

# Start development server
npm run dev
```

### Development Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Environment Variables

### Required Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment-Specific Settings
```env
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment

### Vercel Deployment (Recommended)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

### Database Setup
1. Create Supabase project
2. Run database schema setup
3. Configure Row Level Security (RLS)
4. Set up authentication policies

## Features

### Core Features
- ✅ Coffee credit management (integer-based)
- ✅ Customer profile management
- ✅ Transaction tracking and history
- ✅ Admin dashboard with statistics
- ✅ Real-time balance updates
- ✅ Mobile-responsive design
- ✅ Email authentication (optional)
- ✅ Menu management system
- ✅ Bulk coffee purchases
- ✅ Customer search and filtering

### Advanced Features
- ✅ Modal-based editing interfaces
- ✅ Smooth animations and transitions
- ✅ Error handling and loading states
- ✅ Clean, minimal design system
- ✅ Admin vs customer role separation
- ✅ Transaction filtering and sorting
- ✅ Notification preferences
- ✅ Customer deletion with auth cleanup

## Code Structure

```
coffee-docket/
├── app/                          # Next.js app router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # Dashboard components
│   │   ├── admin-dashboard.tsx  # Main admin interface
│   │   ├── customer-dashboard.tsx # Customer self-service
│   │   ├── customer-details-modal.tsx # Customer management
│   │   ├── customer-edit-modal.tsx # Customer editing
│   │   └── customer-transaction-history.tsx
│   └── ui/                      # Base UI components (shadcn/ui)
├── contexts/                    # React contexts
│   └── auth-context.tsx         # Authentication state
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
│   ├── supabase.ts             # Supabase client setup
│   ├── supabase-service.ts     # Database operations
│   └── utils.ts                # Helper utilities
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

### Component Hierarchy
```
App Layout
├── AuthContext Provider
    ├── Admin Dashboard (Admin Users)
    │   ├── Customer Search
    │   ├── Customer Cards Grid
    │   ├── Statistics Panel
    │   ├── Recent Activity
    │   ├── Customer Details Modal
    │   └── Customer Edit Modal
    └── Customer Dashboard (Customer Users)
        ├── Balance Display
        ├── Transaction History
        └── Profile Section
```

## Troubleshooting

### Common Issues

#### 1. Authentication Issues
```typescript
// Issue: User not authenticated
// Check: Verify Supabase keys in environment variables
// Check: Ensure user exists in auth.users table

// Issue: Admin permissions denied
// Solution: Use service role key for admin operations
const adminClient = await getSupabaseAdminClient()
```

#### 2. Database Connection Issues
```typescript
// Issue: Supabase client not available
// Check: Environment variables are set correctly
// Check: Supabase URL and keys are valid

// Debug: Check client initialization
console.error("Supabase environment variables not configured")
```

#### 3. Email Authentication Issues
```typescript
// Issue: Email invitations not sent
// Check: SUPABASE_SERVICE_ROLE_KEY is configured
// Check: Email service is enabled in Supabase

// Issue: Users not receiving emails
// Check: Supabase email templates are configured
// Check: SMTP settings in Supabase dashboard
```

#### 4. Transaction Issues
```typescript
// Issue: Balance not updating
// Check: Customer ID is valid
// Check: Transaction type is correct ('serve', 'topup', 'refund')

// Issue: Real-time updates not working
// Check: Supabase real-time is enabled
// Check: Proper event listeners are set up
```

### Performance Optimization

#### 1. Database Queries
- Use proper indexes on frequently queried columns
- Implement pagination for large result sets
- Use select() to limit returned columns

#### 2. Component Optimization
```typescript
// Use React.memo for expensive components
const CustomerCard = React.memo(({ customer, onClick }) => {
  // Component logic
})

// Implement proper dependency arrays in useEffect
useEffect(() => {
  loadData()
}, [customerId]) // Only re-run when customerId changes
```

#### 3. State Management
- Minimize unnecessary re-renders
- Use local state for UI-only concerns
- Implement proper error boundaries

### Deployment Issues

#### 1. Build Errors
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Clean build
rm -rf .next
npm run build
```

#### 2. Environment Variables
- Ensure all required environment variables are set
- Check for typos in variable names
- Verify Supabase keys are correct

#### 3. Database Schema
- Ensure all tables are created
- Check that RLS policies are configured
- Verify foreign key relationships

---

## Contributing

### Development Workflow
1. Create feature branch from main
2. Make changes with proper TypeScript types
3. Test thoroughly on both mobile and desktop
4. Run linting and type checking
5. Submit pull request with detailed description

### Code Standards
- Use TypeScript for all new code
- Follow existing component patterns
- Implement proper error handling
- Add appropriate loading states
- Ensure mobile responsiveness

### Testing Guidelines
- Test all CRUD operations
- Verify authentication flows
- Check mobile responsiveness
- Test error scenarios
- Validate form inputs

---

*This documentation is maintained alongside the codebase. Please update it when making significant changes to the system.*