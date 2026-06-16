# PAIDE Manager — V0

Plateforme de gestion institutionnelle pour le réseau PAIDE.

## Stack
- **Frontend** : React 18 + Vite
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Style** : CSS-in-JS (inline styles)

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir VITE_SUPABASE_ANON_KEY dans .env

# 3. Lancer en développement
npm run dev

# 4. Build production
npm run build
```

## Configuration Supabase

### Étape 1 : Exécuter les SQL
Dans Supabase Dashboard > SQL Editor, exécuter dans cet ordre :
1. `sql/01_schema.sql` — Crée toutes les tables
2. `sql/02_rls.sql` — Active la sécurité par rôle
3. `sql/03_seed.sql` — Triggers et fonctions utilitaires

### Étape 2 : Créer l'admin national
Dans Supabase Dashboard > Authentication > Users :
- Créer l'utilisateur : admin@paide.com / PaideNotre2026
- Récupérer son UUID
- Dans SQL Editor :
```sql
UPDATE public.profiles SET role = 'national', full_name = 'Directeur National PAIDE' WHERE email = 'admin@paide.com';
```

### Étape 3 : Créer les buckets Storage
Dans Supabase Dashboard > Storage :
- Créer bucket `agents-files` (privé)
- Créer bucket `cartes-service` (privé)

## Structure des Rôles

| Rôle | Accès |
|------|-------|
| `national` | Tout — crée/gère tous les layouts |
| `coordination` | Sous-coordinations de sa province |
| `sous_coordination` | Centres de sa zone |
| `centre` | Gestion interne du centre uniquement |

## Layouts disponibles en V0
- ✅ Centres
- ✅ Agents (fiche complète)
- ✅ Filières
- ✅ Calendrier des cours
- ✅ Rapports / Renseignements
- ✅ Paramètres (changement de mot de passe)

## Crédentiels V0
- Email : admin@paide.com
- Mot de passe : PaideNotre2026
