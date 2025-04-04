import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/*
import { config } from 'dotenv';
config();
*/

export const supabase = createClient("https://esrkdaokgokznnqzgwrg.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcmtkYW9rZ29rem5ucXpnd3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODc4NTQsImV4cCI6MjA1NzA2Mzg1NH0.j90oO9dnsVN7tVP6xabrz-xcmR13R9dn0gmgnyLem4k")