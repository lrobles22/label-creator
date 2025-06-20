// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siadbmrmkmwwakbbvoka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYWRibXJta213d2FrYmJ2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjY5NDUsImV4cCI6MjA2NTgwMjk0NX0.LcdnEWK9CJY9lG9JuT0XPNEOecOi5WDH5EcfriPdtPE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
