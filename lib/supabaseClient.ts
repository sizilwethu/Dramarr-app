import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dyywyvrrzqfsoibtwhuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eXd5dnJyenFmc29pYnR3aHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTExOTMsImV4cCI6MjA3OTkyNzE5M30.qOqM3NxqTJuggz5vi1CwOxUgKtkP76lDRcj__U6YShk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
