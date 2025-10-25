const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rtpnyomhdirrwbtxqumt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cG55b21oZGlycndidHhxdW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjMwMDIsImV4cCI6MjA3Njk5OTAwMn0.ALnCPm2c0ORSWYPTH8QH6BeTcENrTC2uB-xRKmvGSk8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('agents').select('*');

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found', data.length, 'agents');
      console.log('Agents:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testConnection();
