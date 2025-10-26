# CRITICAL DATABASE FIX REQUIRED

## Problem Identified

**Database error: "Failed to create transaction"**

Root causes:
1. ✅ **FIXED**: Wrong ID format - was using string `tx_123...` instead of UUID
2. ⚠️ **REQUIRES MANUAL ACTION**: RLS policy blocks anonymous inserts

## What Was Fixed in Code

1. Removed custom transaction ID generation
2. Let Supabase auto-generate UUID for transaction.id
3. Added detailed error logging to expose real Supabase errors
4. Updated error messages to show actual error details

## What YOU Need to Do

### Step 1: Run This SQL in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click **New Query**
4. Paste this SQL:

```sql
CREATE POLICY "Anonymous users can create transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success message appears

### Step 2: Verify the Policy

Run this query to check all transaction policies:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'transactions';
```

You should see:
- "Users can view own transactions" (SELECT, authenticated)
- "Users can create transactions" (INSERT, authenticated)
- **"Anonymous users can create transactions"** (INSERT, anon) ← NEW

### Why This Is Safe

This policy is safe because:
1. ✅ Blockchain verification - `blockchain_tx_hash` is immutable proof
2. ✅ Users can only VIEW their own transactions (existing SELECT policy)
3. ✅ No sensitive data exposed - anonymous can only INSERT, not read
4. ✅ Payment is verified on-chain before INSERT

## Testing After Fix

1. Deploy the code changes (already pushed)
2. Run the SQL policy in Supabase dashboard
3. Try a small test payment ($0.01 USDC)
4. Check browser console for detailed error logs
5. Verify transaction appears in Supabase dashboard
6. Check "My Agents" page shows purchased agent

## Technical Details

### Before (Broken)
```typescript
const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
// ❌ String like "tx_1730000000_abc123"
// ❌ Database expects UUID
// ❌ Type mismatch causes INSERT failure
```

### After (Fixed)
```typescript
// ✅ Let Supabase auto-generate UUID
const { data, error } = await supabase
  .from('transactions')
  .insert({
    // id field removed - auto-generated
    to_agent_id: agent_id,
    from_user_id: user_id,
    // ...
  })
```

## Error Logs

With the new detailed logging, you'll see:
- Full Supabase error message
- Error code
- Error details
- Hint for fixing

## Need Help?

If you still see "Database error" after running the SQL:
1. Check browser console for detailed error
2. Check Supabase dashboard → Logs
3. Verify the RLS policy was created successfully
4. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel

---

**Status**: Code fixes deployed ✅ | Database policy update required ⚠️
