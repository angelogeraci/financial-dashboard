# Financial Dashboard

Une application moderne de gestion financière pour entreprise avec catégorisation AI et tableau de bord interactif.

## 🚀 Fonctionnalités

### Gestion de la Trésorerie
- Upload et traitement de fichiers Excel (transactions)
- Détection automatique des doublons
- Catégorisation AI des transactions
- Interface de modification/suppression des transactions
- Ajout de coûts manuels (ponctuels ou récurrents)
- Gestion du niveau réel de trésorerie

### Gestion des Coûts (Estimation)
- Interface d'ajout de coûts estimés
- Gestion différenciée des coûts des employés
- Catégorisation des coûts
- Coûts ponctuels ou récurrents

### Gestion des Revenus
- Ajout de revenus fixes ou récurrents
- Catégorisation des revenus (Insightive, Ads management, etc.)
- Gestion de périodes et dates

### Dashboard
10 graphiques principaux :
1. Revenu & Évolution
2. Répartition des Revenus par Source
3. Dépenses par Catégorie
4. Résultat Net (Profitabilité)
5. Trésorerie (Cash Flow)
6. Créances & Dettes
7. Ratios Financiers Clés
8. Stock & Rotation
9. Budget vs Réalisé
10. Focus sectoriel

## 🛠️ Technologies

- **Frontend**: React.js avec design moderne
- **Backend**: Node.js + Express
- **Base de données**: MongoDB
- **AI**: OpenAI API pour la catégorisation
- **Authentification**: JWT
- **Déploiement**: Docker

## 📋 Prérequis

- Node.js (v16+)
- Docker & Docker Compose
- MongoDB
- Clé API OpenAI

## 🚀 Installation rapide

```bash
# Cloner le repository
git clone https://github.com/angelogeraci/financial-dashboard.git
cd financial-dashboard

# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configurer les clés API dans les fichiers .env

# Démarrer avec Docker
docker-compose up -d

# Accéder à l'application
http://localhost:3000
```

## 🎯 Usage

1. Créez un compte ou connectez-vous
2. Uploadez vos fichiers Excel de transactions
3. Configurez les catégories et les employés
4. Consultez votre tableau de bord financier

## 📱 Responsivité

L'application est entièrement responsive et fonctionne sur :
- Desktop
- Tablette
- Mobile

## 🔐 Sécurité

- Authentification JWT
- Rôles utilisateur (admin, viewer)
- Protection des routes API
- Validation des données

## 📊 Structure du projet

```
financial-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── services/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à créer une issue ou une pull request.

## 📝 License

MIT License

## 👤 Auteur

Angelo Geraci

## 📞 Support

Pour toute question : angelo@votre-entreprise.com