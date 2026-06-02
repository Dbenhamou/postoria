# Postoria — Setup Guide

## 1. Supabase — créer les tables

1. Va sur https://supabase.com → ton projet `postoria`
2. Clique sur **SQL Editor** → **New query**
3. Colle le contenu de `supabase-schema.sql` et clique **Run**

---

## 2. Installer et lancer en local

Ouvre Terminal dans le dossier `postoria/` :

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 — l'app tourne !

---

## 3. Déployer sur Vercel

### 3a. Créer le repo GitHub

```bash
git init
git add .
git commit -m "init postoria"
```

Crée un repo sur github.com puis :

```bash
git remote add origin https://github.com/TON_USERNAME/postoria.git
git push -u origin main
```

### 3b. Importer sur Vercel

1. Va sur https://vercel.com → **Add New Project**
2. Importe ton repo GitHub `postoria`
3. Dans **Environment Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ymfhprtowcdosqorphhc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_ZK0BEE0I4Hzj5OgakQjSbg_vrA7j-xW` |
| `ANTHROPIC_API_KEY` | Ta clé complète sk-ant-... |
| `NEWS_API_KEY` | `1fe23530aefd4860acbaadae5f038d41` |
| `CRON_SECRET` | Un mot de passe de ton choix (ex: `postoria2025`) |

4. Clique **Deploy** → l'app est en ligne 🚀

---

## 4. Activer le cron job (refresh 7h00)

Dans les settings de ton projet Vercel → **Cron Jobs** → il sera détecté automatiquement via `vercel.json`.

---

## Prochaines étapes

- Phase 2 : Générateur visuel avec DA Postoria
- Phase 3 : Auto-post LinkedIn API
