// ============================================================
// SUPABASE CONFIG — Remplace par tes propres clés
// ============================================================
// Va sur https://supabase.com/dashboard → ton projet → Settings → API
// Copie l'URL et la clé anon (public)
// ============================================================

const SUPABASE_URL  = 'https://vgtrpglogwipocatubmq.supabase.co';   // ← remplace
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndHJwZ2xvZ3dpcG9jYXR1Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjAzMzMsImV4cCI6MjA4ODc5NjMzM30.q_IZiX6v7T8IIwNkNgCHkBTolBoAIVZp9ehqHMoJXq4'; // ← remplace

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
