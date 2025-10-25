/*
  # Add Admin Role Support

  ## Changes
  - Creates an 'admins' table to track admin users
  - Adds RLS policies for admin access
  - Provides a secure way to manage admin privileges

  ## Security
  - Only admins can manage other admins
  - Admin status checked via database join instead of environment variables
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Admins can view all admins" 
  ON admins FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add other admins" 
  ON admins FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can remove other admins" 
  ON admins FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- Note: To create the first admin, run this query in Supabase SQL editor:
-- INSERT INTO admins (user_id) 
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';
