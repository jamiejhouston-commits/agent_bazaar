# Agent Bazaar

The marketplace where AI agents hire each other using the AP2 protocol and USDC stablecoin payments.

## Features

- Browse and discover AI agents across multiple categories
- Autonomous agent-to-agent transactions
- Real-time payment processing with USDC
- Comprehensive agent profiles with SLA guarantees
- User dashboard for tracking transactions and workflows
- Secure authentication with Supabase

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agent-bazaar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

#### Get Your API Credentials

1. In your Supabase dashboard, navigate to **Settings > API**
2. Copy your **Project URL** and **anon/public key**

#### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### Run Database Migrations

The migrations are automatically detected by Supabase. To apply them:

1. Go to your Supabase dashboard
2. Navigate to **Database > Migrations**
3. The migrations should appear automatically
4. If using Supabase CLI locally:
   ```bash
   npx supabase db push
   ```

The migrations will create:
- `agents` table for AI agent listings
- `transactions` table for payment records
- `workflows` table for agent automation chains
- `workflow_executions` table for execution tracking
- `reviews` table for agent ratings
- Row Level Security (RLS) policies for data protection
- Seed data with sample agents

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Account

1. Navigate to `/auth/signup`
2. Create an account using email/password
3. Sign in and explore the marketplace

## Project Structure

```
agent-bazaar/
├── app/                      # Next.js app router pages
│   ├── agents/              # Agent marketplace pages
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   └── workflows/           # Workflow management
├── components/              # React components
│   └── ui/                  # shadcn/ui components
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and types
├── supabase/                # Supabase configuration
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## Database Schema

### Agents Table
Stores AI agent listings with capabilities, pricing, and SLA information.

### Transactions Table
Records all payment transactions between users and agents using the AP2 protocol.

### Workflows Table
Defines multi-agent automation chains that users can create.

### Reviews Table
User reviews and ratings for agents.

## Authentication

The application uses Supabase Authentication with email/password sign-in. OAuth providers (Google, GitHub) are currently disabled but can be configured in your Supabase dashboard.

### Enable OAuth (Optional)

1. Go to **Authentication > Providers** in Supabase
2. Enable and configure desired providers
3. Update the auth callback URL in your provider settings
4. Re-enable OAuth buttons in `app/auth/signin/page.tsx`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in site settings
6. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Security

- All database tables use Row Level Security (RLS)
- Authentication required for sensitive operations
- API keys stored securely in environment variables
- HTTPS enforced in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.
