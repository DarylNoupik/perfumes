# DIHU — Maison de Parfums

Application e-commerce de vente de parfums, développée pour **DIHU** (Douala, Cameroun).
Commandes via panier intégré ou directement par **WhatsApp**.

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 18.3 | UI / logique |
| Vite | 8.3 | Bundler / dev server |
| lucide-react | 0.378 | Icônes |
| Cloudinary | CDN | Hébergement des images |

Les styles partagés sont dans `src/global.css`. Les composants définissent leurs styles locaux en JSX.

---

## Structure du projet

```
src/
├── main.jsx              # Point d’entrée React
├── App.jsx               # Navigation et affichage des pages
├── features/             # Catalogue, conseils, panier, compte et administration
├── layout/               # En-tête et bouton WhatsApp
├── components/           # Éléments d’interface partagés
├── store/                # État React et opérations de la boutique
├── config/               # Paramètres et numéro WhatsApp
├── data/                 # Catalogue et données de démonstration
├── hooks/                # Hooks liés au navigateur
├── lib/                  # Format monétaire et liens WhatsApp
└── global.css            # Styles partagés
```

Les pages accèdent à l’état et aux opérations de la boutique via `useStore`.

---

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

---

## Fonctionnalités

### Boutique (client)
- Catalogue complet avec filtres par marque et recherche
- Fiche produit détaillée (notes olfactives, contenance, stock)
- Panier et tunnel de commande (nom, téléphone, adresse)
- Paiement **Mobile Money (MTN / Orange)** ou **WhatsApp**
- Paiement en **3 tranches** pour les clients fidèles (3 commandes livrées minimum)
- Commande directe via WhatsApp depuis toute page produit

### Espace client
- Connexion / inscription
- Historique des commandes avec statuts
- Indicateur d'éligibilité au paiement en tranches

### Dashboard admin / vendeur
| Onglet | Admin | Vendeur |
|---|:---:|:---:|
| Vue d'ensemble (CA, commandes) | ✓ | ✓ |
| Gestion des produits | ✓ | ✓ |
| Gestion des commandes | ✓ | ✓ |
| Utilisateurs | ✓ | — |
| Paramètres boutique | ✓ | — |

---

## Comptes de démonstration

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@lumiere.cm | admin123 | Administrateur |
| vendeur@lumiere.cm | vendeur123 | Vendeur |
| client@lumiere.cm | client123 | Client |

---

## Responsive design

Breakpoint mobile : **768 px** (hook `useIsMobile`).

| Composant | Desktop | Mobile |
|---|---|---|
| Header | Liens de nav horizontaux | Menu hamburger déroulant |
| Fiche produit | 2 colonnes (image + infos) | 1 colonne empilée |
| Dashboard admin | Sidebar 210 px | Onglets scrollables horizontaux |
| Formulaires admin | 2 colonnes | 1 colonne |
| Stats compte | 3 colonnes | 2 colonnes |
| Toast | Haut à droite | Bas de l'écran (pleine largeur) |

---

## Images produits

Les images sont hébergées sur **Cloudinary** (`res.cloudinary.com/dhb3ceyqg`).
Pour chaque produit, un emoji de fallback est défini au cas où l'image ne charge pas.

Dans l'admin, les images peuvent être mises à jour en collant une URL CDN (Cloudinary, Unsplash, etc.).

---

## Catalogue actuel

| Parfum | Marque | Prix |
|---|---|---|
| Violet Blossom | Zara | 25 000 XAF |
| Hypnotic Vanilla EDP | Zara | 30 000 XAF |
| Zara Leather | Zara | 34 000 XAF |
| Legend Mont Blanc | Mont Blanc | 35 490 XAF |
| Le Male Le Parfum | Jean Paul Gaultier | 35 700 XAF |
| Only The Brave | Diesel | 35 000 XAF |
| Scandal | Jean Paul Gaultier | 60 000 XAF |
| Invictus Victory Elixir | Paco Rabanne | 60 000 XAF |

---

## Suivi des parfums

Dans l’administration, **Suivi des parfums** regroupe la synthèse par sexe, le stock, la rentabilité, les ventes, les entrées et les paramètres de suivi. Renseignez les coûts et les frais par flacon pour calculer les marges. Les commandes livrées et les ventes manuelles alimentent le journal des ventes.

Dans **Ventes**, **Importer les ventes Excel** reprend les lignes historiques du classeur de suivi `.xlsx` et complète les références, les catégories et les coûts de l’onglet **Stock ROI** pour les parfums reconnus. Si le prix réel est vide, le calcul utilise le prix prévu. Les ventes importées alimentent la vue d’ensemble et la rentabilité sans modifier le stock disponible ni écraser les réglages déjà saisis.

## Connexion Supabase

Copiez `.env.example` vers `.env.local` et renseignez `VITE_SUPABASE_PUBLISHABLE_KEY` à partir de **Connect** dans Supabase. Reportez les deux variables dans Vercel avant de redéployer. Si les deux variables sont présentes, le catalogue, les commandes et le suivi utilisent la base partagée. En développement sans ces variables, la boutique utilise le mode de démonstration et le stockage local du navigateur.

L’accès administrateur repose sur le rôle `admin` dans les métadonnées d’application de Supabase Auth. La confirmation par e-mail utilise l’origine du site. Ajoutez l’URL locale et celle de production à la liste des redirections autorisées dans **Authentication → URL Configuration**.

## Contact & commandes

Définir `VITE_CONTACT_WHATSAPP_NUMBER` dans `.env.local` en développement ou dans les variables d’environnement du projet Vercel, puis relancer le serveur ou le déploiement. Utiliser le numéro au format international, sans `+` ni espaces.

Livraison : Douala, Cameroun

---

*Projet 2023-24 — En cours de construction*
