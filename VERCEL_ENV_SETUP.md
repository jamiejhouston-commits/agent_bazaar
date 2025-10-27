# VERCEL ENVIRONMENT VARIABLE SETUP REQUIRED

## Critical: Add Service Role Key

The payment system now uses Supabase service role to bypass RLS policies.

### Steps to Add Environment Variable:

1. **Get Service Role Key from Supabase:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to: **Project Settings** → **API**
   - Scroll to **Project API keys**
   - Copy the **`service_role`** secret key (NOT the anon key!)
   - ⚠️ This key has admin privileges - keep it secret!

2. **Add to Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project (agent-bazaar)
   - Go to: **Settings** → **Environment Variables**
   - Click **Add New**
   - Enter:
     - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
     - **Value:** [paste the service_role key from step 1]
     - **Environments:** Production, Preview, Development (select all)
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click on latest deployment
   - Click **...** menu → **Redeploy**
   - ✅ The service role key will now be available

### Why This Is Needed:

The previous approach used anonymous client which was blocked by RLS policies.
The service role key has admin access and bypasses all RLS policies, allowing
the API to insert transactions directly.

This is safe because:
- ✅ Service role key is only used server-side in API routes
- ✅ Never exposed to client/browser
- ✅ Blockchain verification ensures payment legitimacy
- ✅ API validates all inputs before database insertion

### Testing After Setup:

1. Wait for Vercel deployment to complete (~2 minutes)
2. Try making a payment on the site
3. Payment should now complete successfully
4. Transaction should appear in "My Agents" page
5. Check Supabase dashboard to verify transaction record

---

**Status:** Code deployed ✅ | Environment variable required ⚠️
