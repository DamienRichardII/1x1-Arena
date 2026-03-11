
const SUPABASE_URL  = 'https://vgtrpglogwipocatubmq.supabase.co';   
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndHJwZ2xvZ3dpcG9jYXR1Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjAzMzMsImV4cCI6MjA4ODc5NjMzM30.q_IZiX6v7T8IIwNkNgCHkBTolBoAIVZp9ehqHMoJXq4'; // ← remplace

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
