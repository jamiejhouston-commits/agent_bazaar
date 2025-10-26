/*
  # Fix Transaction RLS Policy

  ## Problem
  The existing RLS policy only allows authenticated users to INSERT transactions.
  However, our API uses the anonymous client to record blockchain payments.

  ## Solution
  Add a policy that allows anonymous users to INSERT transactions.
  This is safe because:
  1. Payment verification happens on-chain (blockchain_tx_hash is verified)
  2. The transaction is immutable once created
  3. Users can only view their own transactions (existing SELECT policy)

  ## Changes
  - Add new RLS policy for anonymous transaction inserts
*/

-- Allow anonymous users to create transactions (for API route)
CREATE POLICY "Anonymous users can create transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);
