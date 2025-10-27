# Replicate API Setup for Neural Artist Pro

## Overview
Neural Artist Pro uses Replicate's Stable Diffusion XL (SDXL) model to generate high-quality AI images based on user prompts.

## Getting Your Replicate API Token

### Step 1: Create Replicate Account
1. Go to https://replicate.com
2. Click **Sign Up** (top right)
3. Sign up with GitHub, Google, or email
4. ✅ Free tier available: $0.006/second of generation time (~$0.18 per image)

### Step 2: Get API Token
1. After signing in, go to https://replicate.com/account/api-tokens
2. Click **Create token**
3. Give it a name: `agent-bazaar-neural-artist`
4. Click **Create**
5. **Copy the token** - it starts with `r8_`
6. ⚠️ Save it somewhere safe - you won't be able to see it again!

Example token format:
```
r8_ABcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
```

## Adding to Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Navigate to https://vercel.com/dashboard
2. Select your project: **agent-bazaar**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add New Variable
1. Click **Add New**
2. Enter:
   - **Name:** `REPLICATE_API_TOKEN`
   - **Value:** [paste your token from Step 2 above]
   - **Environments:** Select all 3: Production, Preview, Development
3. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **...** menu → **Redeploy**
4. Wait ~2 minutes for deployment to complete

## Testing Neural Artist Pro

### Step 1: Navigate to Agent
1. Go to your site: https://agent-bazaar-*.vercel.app
2. Click **Agents** in navigation
3. Find **Neural Artist Pro**
4. Click **View Details**

### Step 2: Execute Agent
1. Click **Execute Agent** button
2. Connect your wallet (MetaMask, Rainbow, or WalletConnect)
3. Ensure you're on **Polygon network**
4. Enter a custom prompt in the **Image Prompt** field:
   - Example: "a futuristic city with neon lights and flying vehicles, cyberpunk style, 4k"
5. Check "I agree to terms and conditions"
6. Click **Pay** button
7. Approve USDC payment in MetaMask (~$0.032 USDC)

### Step 3: Wait for Generation
- Payment confirms on blockchain (~5 seconds)
- Replicate generates image (~20-30 seconds)
- Auto-redirects to transaction results page
- **Image displays** with download link

## What the Agent Does

1. **Receives User Prompt**
   - User enters: "a dragon flying over a medieval castle"

2. **Calls Replicate SDXL Model**
   - Model: `stability-ai/sdxl`
   - Parameters:
     - Width: 1024px
     - Height: 1024px
     - Inference steps: 25
     - Guidance scale: 7.5
     - Negative prompt: "ugly, blurry, low quality"

3. **Generates High-Quality Image**
   - 1024x1024 resolution
   - Professional quality
   - Photorealistic or artistic style

4. **Stores Results**
   - Image URL saved to `transaction.output_data.image_url`
   - Prompt saved for reference
   - Transaction status: `completed`

5. **Displays to User**
   - Full-size image preview
   - Download link
   - View on external URL

## Cost Breakdown

### Replicate Costs (per image)
- SDXL model: ~$0.006/second
- Generation time: ~25-30 seconds
- **Cost per image: ~$0.15-0.18**

### Agent Bazaar Fee
- User pays: $0.032 USDC
- Platform receives: $0.032 USDC
- Net margin: $0.032 - $0.18 = **-$0.15 loss per transaction**

⚠️ **Note:** Current pricing is for testing. Adjust agent pricing to $0.25-0.50 USDC for profitability.

## Troubleshooting

### Error: "Replicate API token not configured"
- **Fix:** Add `REPLICATE_API_TOKEN` to Vercel environment variables
- Redeploy after adding

### Error: "Failed to generate image"
- **Check:** Replicate account has credits
- **Check:** API token is valid (not expired/revoked)
- **Check:** Vercel logs for detailed error

### Image Not Displaying
- **Check:** Transaction status is `completed` in Supabase
- **Check:** `output_data.image_url` exists in transaction record
- **Check:** Replicate URL is accessible (not expired)

### Prompt Validation Failed
- **Check:** User entered a prompt (not empty)
- **Check:** Prompt is at least 3 characters long
- Default prompt used if user leaves it blank

## Upgrading Pricing

To make Neural Artist profitable:

1. Update agent pricing in Supabase `agents` table:
```sql
UPDATE agents
SET pricing = jsonb_set(pricing, '{base_price}', '0.25')
WHERE name = 'Neural Artist Pro';
```

2. Recommended pricing:
   - Base: $0.25 USDC (covers Replicate + margin)
   - Premium: $0.50 USDC (faster generation)

## Security Notes

✅ **Safe:**
- API token only used server-side
- Never exposed to client/browser
- Service role bypasses RLS for transaction updates

⚠️ **Monitor:**
- Replicate usage dashboard
- Monthly billing
- Rate limits (default: 5 requests/second)

---

**Status:** Neural Artist Pro is production-ready after adding REPLICATE_API_TOKEN ✅
