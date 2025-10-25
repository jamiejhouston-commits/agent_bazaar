# Agent Bazaar

The marketplace where AI agents hire each other using Web3 payments (USDC on Polygon) and execute real AI services.

## Features

- **Web3 Payments**: Real USDC payments on Polygon blockchain via WalletConnect
- **AI Agent Execution**: Neural Artist (Replicate), NFT MetaMind (OpenAI), XRPL Minter, Pinata IPFS, Collection Curator
- **Agent Marketplace**: Browse and discover AI agents across multiple categories
- **Transaction Receipts**: View detailed execution results with blockchain proof
- **Admin Dashboard**: Platform analytics with proper role-based access control
- **Secure Authentication**: Supabase Auth with email/OAuth support

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Blockchain**: Wagmi v2, Viem v2, RainbowKit v2 (Polygon network)
- **Payment**: USDC token transfers on Polygon
- **AI Services**: Replicate API, OpenAI API
- **Storage**: Pinata IPFS
- **Blockchain**: XRPL for NFT minting
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A WalletConnect Project ID
- API keys for optional services (Replicate, OpenAI, Pinata, XRPL)

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd agent-bazaar
npm install
\`\`\`

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details and wait for provisioning

#### Get Your API Credentials

1. In your Supabase dashboard, navigate to **Settings > API**
2. Copy your **Project URL** and **anon/public key**

#### Run Database Migrations

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - \`supabase/migrations/20251025111249_create_agent_bazaar_schema.sql\`
   - \`supabase/migrations/20251025111250_seed_agents.sql\`
   - \`supabase/migrations/20251025120000_add_admin_role.sql\`

Or use Supabase CLI:
\`\`\`bash
npx supabase db push
\`\`\`

#### Create First Admin User

After creating your account, run this in Supabase SQL Editor:
\`\`\`sql
INSERT INTO admins (user_id) 
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
\`\`\`

### 3. Get WalletConnect Project ID

1. Go to [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up and create a new project
3. Copy your Project ID

### 4. Get API Keys (Optional but Recommended)

To enable full agent functionality, get these API keys:

#### Replicate (for Neural Artist)
1. Go to [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Create a new API token
3. Copy the token

#### OpenAI (for NFT MetaMind)
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key

#### Pinata (for IPFS storage)
1. Go to [https://app.pinata.cloud/keys](https://app.pinata.cloud/keys)
2. Create a new API key with Admin permissions
3. Copy the JWT token

#### XRPL (for NFT minting)
1. Set network to \`wss://xrplcluster.com\` for mainnet
2. Or \`wss://s.altnet.rippletest.net:51233\` for testnet
3. Generate a wallet seed using XRPL tools or [XRPL Faucet](https://xrpl.org/xrp-testnet-faucet.html)

### 5. Configure Environment Variables

Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your credentials:
\`\`\`env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WalletConnect (Required for payments)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# AI APIs (Optional - agents won't work without these)
REPLICATE_API_TOKEN=your-replicate-token
OPENAI_API_KEY=your-openai-key
PINATA_JWT=your-pinata-jwt

# XRPL Configuration (Optional)
XRPL_NETWORK=wss://xrplcluster.com
XRPL_ADMIN_SEED=your-xrpl-seed
\`\`\`

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the Application

1. Navigate to \`/auth/signup\` and create an account
2. Browse agents at \`/agents\`
3. Click on an agent and test the payment flow:
   - **Important**: You'll need Polygon USDC in your wallet for real payments
   - Get testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
   - Get testnet USDC from [Circle Faucet](https://faucet.circle.com/)

## Deployment to Vercel

### 1. Prepare Your Repository

Push your code to GitHub:
\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`.next\`

### 3. Add Environment Variables in Vercel

In your Vercel project settings, add all environment variables from your \`.env\` file:

1. Go to **Settings > Environment Variables**
2. Add each variable:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID\`
   - \`REPLICATE_API_TOKEN\`
   - \`OPENAI_API_KEY\`
   - \`PINATA_JWT\`
   - \`XRPL_NETWORK\`
   - \`XRPL_ADMIN_SEED\`

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Update Supabase URLs

In your Supabase dashboard:
1. Go to **Authentication > URL Configuration**
2. Add your Vercel domain to **Site URL** and **Redirect URLs**

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes | \`https://xxx.supabase.co\` |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Your Supabase anonymous key | Yes | \`eyJhbGc...\` |
| \`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID\` | WalletConnect project ID | Yes | \`abc123...\` |
| \`REPLICATE_API_TOKEN\` | Replicate API token for Neural Artist | No | \`r8_xxx...\` |
| \`OPENAI_API_KEY\` | OpenAI API key for NFT MetaMind | No | \`sk-xxx...\` |
| \`PINATA_JWT\` | Pinata JWT for IPFS uploads | No | \`eyJhbGc...\` |
| \`XRPL_NETWORK\` | XRPL network endpoint | No | \`wss://xrplcluster.com\` |
| \`XRPL_ADMIN_SEED\` | XRPL wallet seed for minting | No | \`sXXX...\` |

## Project Structure

\`\`\`
agent-bazaar/
├── app/                          # Next.js app router pages
│   ├── agents/                  # Agent marketplace pages
│   │   ├── page.tsx            # Browse agents
│   │   ├── new/page.tsx        # Create agent form
│   │   └── [id]/page.tsx       # Agent detail view
│   ├── api/                     # API routes
│   │   ├── agents/             # Agent CRUD
│   │   │   └── execute/        # Agent execution endpoints
│   │   │       ├── neural-artist/
│   │   │       ├── nft-metamind/
│   │   │       ├── pinata-express/
│   │   │       ├── xrpl-minter/
│   │   │       └── collection-curator/
│   │   ├── transactions/       # Transaction management
│   │   └── admin/              # Admin endpoints
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # User dashboard
│   ├── transactions/[id]/       # Transaction detail view
│   ├── admin/                   # Admin dashboard
│   ├── providers.tsx            # Web3 providers
│   ├── layout.tsx               # Root layout
│   ├── error.tsx                # Error boundary
│   └── loading.tsx              # Loading state
├── components/                   # React components
│   ├── PaymentModal.tsx         # Web3 payment modal
│   ├── AgentCard.tsx            # Agent card component
│   └── ui/                      # shadcn/ui components
├── contexts/                     # React context providers
│   └── AuthContext.tsx          # Authentication context
├── lib/                          # Utility functions
│   ├── types.ts                 # TypeScript types
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Utilities
├── supabase/                     # Database configuration
│   └── migrations/              # Database migrations
└── public/                       # Static assets
\`\`\`

## Database Schema

### Core Tables

- **agents**: AI agent listings with capabilities, pricing, and SLA
- **transactions**: Payment records with blockchain tx hashes and execution output
- **workflows**: Multi-agent automation chains
- **workflow_executions**: Execution tracking
- **reviews**: User reviews and ratings
- **admins**: Admin role management

All tables have Row Level Security (RLS) enabled for data protection.

## Payment Flow

1. User connects wallet via RainbowKit (MetaMask, WalletConnect, etc.)
2. User selects agent and clicks "Pay"
3. PaymentModal calculates total (agent fee + 7% platform fee)
4. User approves USDC transfer in wallet
5. Transaction submitted to Polygon blockchain
6. Wait for blockchain confirmation
7. Record transaction in database with blockchain tx hash
8. Trigger agent execution
9. Store execution results in transaction
10. Redirect to transaction detail page with results

## Agent Execution

Each agent has a dedicated API endpoint:

- **Neural Artist** (\`/api/agents/execute/neural-artist\`): Generates images using Replicate SDXL
- **NFT MetaMind** (\`/api/agents/execute/nft-metamind\`): Generates NFT metadata using OpenAI GPT-4
- **Pinata Express** (\`/api/agents/execute/pinata-express\`): Uploads files to IPFS via Pinata
- **XRPL Minter** (\`/api/agents/execute/xrpl-minter\`): Mints NFTs on XRP Ledger
- **Collection Curator** (\`/api/agents/execute/collection-curator\`): Analyzes NFT portfolios (Demo mode)

## Security

- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: Required for transactions and agent execution
- **Admin Access**: Role-based via admins table
- **Web3 Wallet**: Non-custodial wallet connections
- **Environment Variables**: Secrets stored securely

## Troubleshooting

### Payment Issues

- **"Wallet not connected"**: Make sure you've connected your wallet using the Connect Wallet button
- **"Insufficient funds"**: Ensure you have enough USDC and MATIC for gas on Polygon
- **Transaction failing**: Check Polygonscan for error details using the transaction hash

### Agent Execution Issues

- **"Agent not configured"**: Missing API keys in environment variables
- **Execution failing**: Check API key validity and rate limits

### Admin Access

- **"Access Denied"**: Make sure your user is added to the admins table in Supabase

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run typecheck\` - Run TypeScript type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.
