# Démo React et Supabase

Cette application indépendante affiche les lignes de la table `instruments`.

1. Exécutez `instruments.sql` dans le SQL Editor d’un projet Supabase de démonstration.
2. Créez `.env.local` et renseignez les valeurs du panneau **Connect**.

   ```dotenv
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. Installez les dépendances et démarrez l’application depuis `my-app`.

   ```sh
   npm ci
   npm run dev
   ```
