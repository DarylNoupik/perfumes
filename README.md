# DIHU — Maison de Parfums

Application e-commerce de vente de parfums, développée pour **DIHU** (Douala, Cameroun).
Commandes via panier intégré ou directement par **WhatsApp**.

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 18.3 | UI / logique |
| Vite | 5.2 | Bundler / dev server |
| lucide-react | 0.378 | Icônes |
| Cloudinary | CDN | Hébergement des images |

Aucune dépendance CSS externe — tout le style est en **inline styles** + injections CSS globales.

---

## Structure du projet

```
app-construction/
├── lumiere-parfums.jsx   # Source unique — backend (store) + frontend (UI)
├── src/
│   └── main.jsx          # Point d'entrée React
├── vite.config.js
└── package.json
```

L'application est contenue dans un **seul fichier** `lumiere-parfums.jsx`, organisé en deux grandes sections :

- **Backend** : données seed, store global (`Context API`), logique métier (auth, panier, commandes, produits, paramètres)
- **Frontend** : composants UI purs (`AppHeader`, `ShopPage`, `ProductPage`, `CartPage`, `CheckoutPage`, `AccountPage`, `AdminPage`, …)

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

## Contact & commandes

WhatsApp : **+237 656 493 976**
Livraison : Douala, Cameroun

---

*Projet 2023-24 — En cours de construction*
