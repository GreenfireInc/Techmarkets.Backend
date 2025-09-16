# TechMarkets Supabase Backend

A comprehensive backend implementation for TechMarkets, a cryptocurrency-denominated marketplace for electronic devices with depreciation tracking. Built on Supabase with multi-method authentication including wallet-based sign-in.

## 🚀 Overview

TechMarkets is a marketplace that tracks the depreciation rate of electronic devices, allowing users to buy and sell those devices exclusively in cryptocurrency. This repository contains the Supabase backend implementation with:

- **Multi-method Authentication**: Wallet (Tezos) + Email/Google
- **PostgreSQL Database**: Complete schema for marketplace operations
- **Edge Functions**: Custom API endpoints for business logic
- **Real-time Features**: Live updates and notifications
- **Smart Contract Integration**: Ready for blockchain integration

## 📋 Features

### Authentication System
- **Wallet Authentication**: Sign in with Tezos wallet using SIWT (Sign in with Tezos)
- **Traditional Auth**: Email/password and Google OAuth
- **Account Linking**: Link multiple authentication methods to one account
- **Security**: JWT tokens, session management, and replay attack prevention

### Database Schema
- **User Profiles**: Extended user data with verification status
- **Categories**: Hierarchical product categorization
- **Listings**: Product listings with images and metadata
- **Transactions**: Purchase tracking with smart contract integration
- **Depreciation Data**: Device value tracking over time

### API Endpoints
- Authentication and user management
- Listing CRUD operations
- Transaction processing
- Depreciation data management
- Smart contract integration

## 🛠️ Tech Stack

- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth + Custom SIWT implementation
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Runtime**: Deno (for Edge Functions)
- **Blockchain**: Tezos integration ready

## 📁 Project Structure

```
techmarkets-supabase/
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── functions/               # Edge Functions
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── index.ts        # Main auth function
│   │   │   └── @siwt/          # SIWT implementation
│   │   └── _shared/            # Shared utilities
│   └── migrations/             # Database migrations
│       ├── 20250806224921_siwt-nonces.sql
│       ├── 20250916032755_profiles.sql
│       ├── 20250916032852_categories.sql
│       ├── 20250916032936_listings.sql
│       └── 20250916033025_transactions.sql
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## 🗄️ Database Schema

### Core Tables

#### `profiles` (extends auth.users)
```sql
- id: UUID (references auth.users)
- user_type: 'buyer' | 'seller' | 'admin'
- wallet_address: TEXT (unique)
- verification flags: google_verified, seller_verified
- personal info: firstname, lastname, address, etc.
- social links: instagram, twitter, linkedin, website
- crypto addresses: lunc_address, xtz_address
- location: what3words, pluscode
- profile_image_url: TEXT
```

#### `categories`
```sql
- id: UUID (primary key)
- name: TEXT (category name)
- slug: TEXT (unique URL slug)
- description: TEXT
- parent_id: UUID (self-reference for hierarchy)
```

#### `listings`
```sql
- id: UUID (primary key)
- seller_id: UUID (references auth.users)
- category_id: UUID (references categories)
- title, description: TEXT
- make, model: TEXT
- condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
- price: NUMERIC
- currency: 'usd' | 'xtz'
- status: 'active' | 'sold' | 'removed' | 'pending'
- smart_contract_listing_id: TEXT
```

#### `listing_images`
```sql
- id: UUID (primary key)
- listing_id: UUID (references listings)
- image_url, image_path: TEXT
- is_primary: BOOLEAN
- sort_order: INTEGER
```

#### `transactions`
```sql
- id: UUID (primary key)
- listing_id: UUID (references listings)
- buyer_id, seller_id: UUID (references auth.users)
- amount: DECIMAL(18,8)
- currency: TEXT
- smart_contract_tx_hash: TEXT
- status: 'pending' | 'paid' | 'shipped' | 'completed' | 'disputed' | 'cancelled'
- shipping_address: JSONB
- tracking_number: TEXT
```

#### `siwt_nonces`
```sql
- id: UUID (primary key)
- nonce: TEXT (unique)
- address: TEXT
- status: 'pending' | 'used' | 'expired'
- created_at, expires_at, used_at: TIMESTAMP
```

## 🔐 Authentication Flow

### Wallet Authentication (SIWT)
1. User connects Tezos wallet
2. Signs authentication message with wallet
3. Custom Edge Function validates signature
4. Creates or retrieves user account
5. Returns JWT token for API access

### Traditional Authentication
- Standard Supabase email/password flow
- Google OAuth integration
- Account linking between methods

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techmarkets-supabase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   npm run sb:start
   ```

4. **Apply database migrations**
   ```bash
   npx supabase db reset
   ```

### Available Scripts

```bash
# Supabase Management
npm run sb:start      # Start local Supabase
npm run sb:stop       # Stop local Supabase
npm run sb:status     # Check Supabase status
npm run sb:db:list    # List databases
npm run sb:db:create  # Create new database
npm run sb:db:drop    # Drop database
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/wallet` - Authenticate with wallet signature
- `POST /auth/link-wallet` - Link wallet to existing account
- `POST /auth/verify-seller` - Verify seller requirements
- `GET /auth/profile` - Get current user profile

### Listings
- `GET /listings` - Get all active listings (with filters)
- `GET /listings/:id` - Get specific listing
- `POST /listings` - Create new listing (sellers only)
- `PUT /listings/:id` - Update listing (owner only)
- `DELETE /listings/:id` - Remove listing (owner only)
- `POST /listings/:id/images` - Upload listing images

### Transactions
- `POST /transactions` - Initialize purchase
- `GET /transactions/:id` - Get transaction details
- `PUT /transactions/:id/ship` - Mark as shipped (seller only)
- `PUT /transactions/:id/complete` - Mark as completed

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the supabase directory:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SIWT Configuration
SIWT_DOMAIN=your_domain.com
SIWT_STATEMENT=Sign in to TechMarkets

# Optional: External Services
OPENAI_API_KEY=your_openai_key
SENDGRID_API_KEY=your_sendgrid_key
```

### Supabase Configuration
The `supabase/config.toml` file contains all local development settings:
- Database configuration (PostgreSQL 17)
- Authentication settings
- Storage configuration
- Edge Functions runtime settings

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Nonce System**: Prevents replay attacks in wallet auth
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request handling

## 📊 Database Policies

### Row Level Security (RLS)
- Users can only view/update their own profiles
- Anyone can view active listings
- Sellers can manage their own listings
- Users can view their own transactions
- Service role has full access to nonces table

## 🚧 Smart Contract Integration

The system is designed to integrate with Tezos smart contracts for:
- Listing creation and management
- Escrow-based transactions
- Automated dispute resolution
- Platform fee collection

### Planned Contract Functions
- `createListing()` - Store listing metadata on-chain
- `purchaseItem()` - Handle payment escrow
- `markShipped()` - Update shipping status
- `completePurchase()` - Release funds to seller
- `disputeTransaction()` - Initiate dispute resolution

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries on frequently accessed fields
- **Image CDN**: Automatic image optimization and delivery
- **Real-time Updates**: WebSocket connections for live data
- **Connection Pooling**: Efficient database connections

## 🧪 Development

### Local Development
1. Start Supabase: `npm run sb:start`
2. Access Supabase Studio: http://localhost:54333
3. View API docs: http://localhost:54331/rest/v1/
4. Test Edge Functions: http://localhost:54321/functions/v1/

### Testing
- Use Supabase Studio for database testing
- Test Edge Functions with curl or Postman
- Verify authentication flows with wallet integration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 🔗 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [SIWT (Sign in with Tezos) Specification](https://github.com/airgap-it/siwt)
- [Tezos Documentation](https://tezos.com/developers/)
- [Implementation Guide](../techmarkets-directory-issue/docs/ImplementationGuide.md)

## 🆘 Support

For questions and support:
- Check the [Implementation Guide](../techmarkets-directory-issue/docs/ImplementationGuide.md)
- Review Supabase documentation
- Open an issue in this repository

---

**Note**: This is a backend implementation. The frontend application would be in a separate repository and would consume these APIs.
