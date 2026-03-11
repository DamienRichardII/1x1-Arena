# 🏟️ 1X1 ARENA — Configuration Supabase

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New Project**
2. Note ton **URL** et ta **clé anon (public)**
3. Colle-les dans `js/supabase-config.js`

---

## 2. Créer la table `inscriptions`

Va dans **SQL Editor** et exécute :

```sql
-- Table des inscriptions Arena Tournament
CREATE TABLE inscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT NOT NULL,
  age INTEGER NOT NULL,
  ville TEXT NOT NULL,
  taille_cm INTEGER NOT NULL,
  poids_kg INTEGER NOT NULL,
  pseudo TEXT,
  video_url TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX idx_inscriptions_email ON inscriptions(email);
CREATE INDEX idx_inscriptions_created ON inscriptions(created_at DESC);

-- Row Level Security
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut s'inscrire (INSERT)
CREATE POLICY "Inscription publique"
  ON inscriptions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique : lecture admin uniquement (via service_role ou authenticated)
-- Pour l'admin panel côté client, on autorise aussi anon en lecture
-- (la page admin est protégée par mot de passe côté front)
CREATE POLICY "Lecture inscriptions"
  ON inscriptions
  FOR SELECT
  TO anon
  USING (true);
```

---

## 3. Edge Function — Email de confirmation stylisé

### 3a. Installer Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref TON_PROJECT_REF
```

### 3b. Créer la fonction
```bash
supabase functions new send-confirmation
```

### 3c. Coller ce code dans `supabase/functions/send-confirmation/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!; // ou utilise un autre service SMTP

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { prenom, nom, email, pseudo } = await req.json();
    const displayName = pseudo || `${prenom} ${nom}`;

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#05060a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05060a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;">

        <!-- HEADER -->
        <tr><td align="center" style="padding-bottom:24px;">
          <img src="https://TON-DOMAINE.vercel.app/assets/Logo-1x1.png" width="60" height="60" alt="1X1 Arena" style="display:block;"/>
        </td></tr>

        <!-- GRADIENT LINE -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#ff2dbd,#23d5ff);border-radius:2px;"></td></tr>

        <!-- MAIN CARD -->
        <tr><td style="padding:32px 28px;background:rgba(15,16,22,0.95);border:1px solid rgba(255,255,255,0.08);border-radius:0 0 16px 16px;">

          <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
            Bienvenue dans l'Arène
          </h1>

          <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
            Salut <strong style="color:#ffffff;">${displayName}</strong>,<br/>
            Ton inscription à l'<strong style="background:linear-gradient(90deg,#ff2dbd,#23d5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Arena Tournament</strong> est bien confirmée.
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;">STATUT</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#22c55e;">✓ Inscription confirmée</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">
            Tu recevras les détails du tournoi (date, lieu, catégorie) par email avant l'événement. Prépare-toi, l'arène t'attend.
          </p>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="border-radius:999px;background:linear-gradient(90deg,rgba(255,45,189,0.3),rgba(35,213,255,0.25));border:1px solid rgba(255,255,255,0.15);">
                <a href="https://TON-DOMAINE.vercel.app/arena-tournament.html" target="_blank" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                  Voir Arena Tournament →
                </a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- GRADIENT LINE BOTTOM -->
        <tr><td style="height:2px;background:linear-gradient(90deg,#ff2dbd,#23d5ff);border-radius:2px;margin-top:24px;"></td></tr>

        <!-- FOOTER -->
        <tr><td align="center" style="padding:24px 0;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.6;">
            1X1 ARENA — La première ligue de 1 contre 1<br/>
            <a href="https://instagram.com" style="color:rgba(255,255,255,0.45);text-decoration:none;">Instagram</a> •
            <a href="https://tiktok.com" style="color:rgba(255,255,255,0.45);text-decoration:none;">TikTok</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Envoi via Resend (ou remplace par ton service SMTP)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "1X1 Arena <noreply@ton-domaine.com>",
        to: [email],
        subject: "✓ Inscription confirmée — 1X1 Arena Tournament",
        html: htmlEmail,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
```

### 3d. Configurer la clé API Resend
```bash
supabase secrets set RESEND_API_KEY=re_XXXXXXXXXX
```

### 3e. Déployer
```bash
supabase functions deploy send-confirmation --no-verify-jwt
```

---

## 4. Alternative : Email via Database Trigger (sans Edge Function)

Si tu préfères utiliser le système natif de Supabase Auth (gratuit) :

1. Va dans **Authentication → Email Templates → Confirm Signup**
2. Remplace le template par le HTML de l'email ci-dessus
3. Utilise `{{ .ConfirmationURL }}` pour le lien de confirmation

Mais cette méthode ne marche que pour les utilisateurs Auth de Supabase, pas pour une table custom.

---

## 5. Alternative simple : Resend via webhook Supabase

1. Va dans **Database → Webhooks**
2. Crée un webhook sur `INSERT` de la table `inscriptions`
3. Pointe vers ton Edge Function URL

---

## RÉSUMÉ des étapes

| # | Action | Où |
|---|--------|----|
| 1 | Créer projet Supabase | supabase.com |
| 2 | Coller URL + clé dans `supabase-config.js` | Code |
| 3 | Exécuter le SQL | SQL Editor |
| 4 | Déployer Edge Function `send-confirmation` | CLI |
| 5 | Configurer Resend (ou SMTP) | Secrets |
| 6 | Remplacer `TON-DOMAINE` dans l'email | Code |
| 7 | Remplacer les liens Instagram/TikTok | Code |
