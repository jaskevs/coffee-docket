# Coffee Docket App - Development Context

## App Overview
Coffee purchase tracking system with customer and admin roles.

## Key Components Structure
- `/pages` or `/app` - Main application pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and Supabase client
- `/types` - TypeScript type definitions
- `/hooks` - Custom React hooks

## Database Schema (Supabase)
- customers: id, first_name, last_name, email, coffee_balance, etc.
- transactions: id, customer_id, type, coffee_count, amount, etc.
- menu_items: id, name, category, base_price, etc.
- menu_sizes: id, name, price_modifier, etc.
- menu_addons: id, name, price_modifier, etc.

## User Roles
1. **Customer**: View balance, transaction history, update settings
2. **Admin**: Manage customers, process transactions, menu management

## Key Features
- Real-time balance updates
- Email notifications via MailerSend
- Mobile-first responsive design
- Admin search with 450+ customer support
- Menu management with price modifiers

## Common Tasks
- UI improvements and styling fixes
- New feature development
- Bug fixes and optimizations
- Database query optimizations
- Component refactoring