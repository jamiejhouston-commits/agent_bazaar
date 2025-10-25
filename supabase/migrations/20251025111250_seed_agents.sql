/*
  # Seed Agent Bazaar with Initial Agents

  1. Sample Data
    - Inserts 5 diverse AI agents across different categories
    - Each agent has realistic pricing, capabilities, and metadata
    - Agents include: Neural Artist Pro, NFT MetaMind, Pinata Express, XRPL Minter, Collection Curator

  2. Categories Covered
    - Creative: Neural Artist Pro (AI art generation)
    - Blockchain: NFT MetaMind (NFT analysis), XRPL Minter (XRPL NFT creation)
    - Storage: Pinata Express (IPFS storage)
    - Data: Collection Curator (NFT collection management)

  3. Notes
    - All agents set to 'online' status for immediate availability
    - Pricing ranges from $0.02 to $0.15 per task
    - Each agent has unique capabilities tailored to their function
    - Avatar URLs use stock photos from Pexels
*/

INSERT INTO agents (
  name,
  description,
  category,
  pricing,
  capabilities,
  rating,
  total_executions,
  status,
  owner_id,
  api_endpoint,
  avatar_url,
  sla
) VALUES
(
  'Neural Artist Pro',
  'Advanced AI for generating stunning artwork and designs using state-of-the-art neural networks. Specializes in photorealistic renders, abstract art, and custom style transfers.',
  'creative',
  '{"per_task": 0.05, "per_hour": 2.50, "currency": "USDC", "volume_discounts": [{"min": 100, "price": 0.04}, {"min": 500, "price": 0.03}]}'::jsonb,
  '["Image Generation", "Style Transfer", "Concept Art", "Logo Design", "Photo Enhancement", "Character Design"]'::jsonb,
  4.8,
  1247,
  'online',
  NULL,
  'https://api.neuralagent.ai/v1',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  '{"response_time_ms": 3000, "uptime_pct": 99.5}'::jsonb
),
(
  'NFT MetaMind',
  'Intelligent NFT analysis agent that provides deep insights into collection trends, rarity rankings, and market opportunities. Perfect for traders and collectors.',
  'blockchain',
  '{"per_task": 0.08, "per_hour": 4.00, "currency": "USDC", "volume_discounts": [{"min": 50, "price": 0.06}]}'::jsonb,
  '["Rarity Analysis", "Price Prediction", "Trait Comparison", "Floor Price Tracking", "Wash Trade Detection", "Collection Analytics"]'::jsonb,
  4.9,
  856,
  'online',
  NULL,
  'https://api.nftmetamind.io/analyze',
  'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg',
  '{"response_time_ms": 2000, "uptime_pct": 99.8}'::jsonb
),
(
  'Pinata Express',
  'Lightning-fast IPFS pinning service with automatic replication and CDN distribution. Ensures your NFT metadata and assets are always accessible.',
  'storage',
  '{"per_task": 0.02, "per_hour": 1.00, "currency": "USDC", "notes": "Per GB stored per month"}'::jsonb,
  '["IPFS Pinning", "CDN Distribution", "Metadata Hosting", "Asset Replication", "Gateway Access", "CID Management"]'::jsonb,
  4.7,
  3421,
  'online',
  NULL,
  'https://api.pinata-express.io/store',
  'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg',
  '{"response_time_ms": 500, "uptime_pct": 99.9}'::jsonb
),
(
  'XRPL Minter',
  'Specialized agent for minting NFTs on the XRP Ledger. Handles batch minting, royalty configuration, and metadata optimization for XRPL NFTs.',
  'blockchain',
  '{"per_task": 0.15, "per_hour": 8.00, "currency": "USDC", "volume_discounts": [{"min": 10, "price": 0.12}, {"min": 100, "price": 0.10}]}'::jsonb,
  '["XRPL NFT Minting", "Batch Operations", "Royalty Setup", "Metadata Generation", "Transfer Handling", "Burn Operations"]'::jsonb,
  4.6,
  592,
  'online',
  NULL,
  'https://api.xrpl-minter.com/mint',
  'https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg',
  '{"response_time_ms": 5000, "uptime_pct": 99.2}'::jsonb
),
(
  'Collection Curator',
  'Automated NFT collection management and curation tool. Organizes, tags, and maintains your NFT portfolio across multiple blockchains.',
  'data',
  '{"per_task": 0.03, "per_hour": 1.50, "currency": "USDC"}'::jsonb,
  '["Portfolio Tracking", "Auto-Tagging", "Multi-Chain Support", "Valuation Reports", "Sale Alerts", "Collection Insights"]'::jsonb,
  4.8,
  1834,
  'online',
  NULL,
  'https://api.collection-curator.ai/manage',
  'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  '{"response_time_ms": 1500, "uptime_pct": 99.7}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
