# 🤝 Guide de Contribution - FusionAI

Merci de votre intérêt pour contribuer à **FusionAI** ! Ce guide vous explique comment participer au développement de cette plateforme innovante.

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+
- **npm** 9+
- **Git** 2.30+
- **Docker** (optionnel)

### Installation
```bash
# 1. Fork et cloner le repository
git clone https://github.com/YOUR-USERNAME/fusionai.git
cd fusionai

# 2. Installation des dépendances
npm run setup

# 3. Démarrage en développement
npm run dev
```

## 🏗️ Structure du Projet

```
FusionAI/
├── 🔷 frontend/          # Angular 17+ Application
├── 🔶 backend/           # Node.js/Express API
├── 📚 docs/              # Documentation
└── 🐳 docker-compose.yml # Services
```

## 📝 Types de Contributions

### 🐛 Rapporter un Bug
1. Vérifiez si le bug n'a pas déjà été signalé
2. Utilisez le template d'issue "Bug Report"
3. Fournissez un maximum de détails et d'étapes de reproduction

### ✨ Proposer une Fonctionnalité
1. Ouvrez une issue avec le template "Feature Request"
2. Décrivez le problème que résout votre fonctionnalité
3. Proposez une solution détaillée

### 🔧 Contribuer au Code
1. Créez une branche depuis `main`
2. Implémentez vos changements
3. Testez votre code
4. Soumettez une Pull Request

## 🌿 Workflow Git

### Création d'une Branche
```bash
# Nomenclature recommandée
git checkout -b feature/nom-fonctionnalite
git checkout -b bugfix/correction-bug
git checkout -b docs/mise-a-jour-doc
```

### Commits
Utilisez les **Conventional Commits** :
```bash
# Exemples
git commit -m "feat(frontend): add window resizing feature"
git commit -m "fix(backend): resolve JWT token expiration issue"
git commit -m "docs: update API endpoints documentation"
git commit -m "style(ui): improve button hover animations"
```

### Types de Commits
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Changements de style (CSS, formatting)
- `refactor`: Refactorisation de code
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

## 🧪 Tests

### Frontend (Angular)
```bash
cd frontend
npm test                  # Tests unitaires
npm run test:coverage     # Avec couverture
npm run e2e               # Tests end-to-end
```

### Backend (Node.js)
```bash
cd backend
npm test                  # Tests API
npm run test:coverage     # Avec couverture
npm run test:watch        # Mode watch
```

## 📋 Standards de Code

### Frontend
- **TypeScript** strict mode
- **Angular** style guide
- **ESLint** + **Prettier**
- **Composants standalone** privilégiés
- **Tests unitaires** obligatoires

### Backend
- **Node.js** best practices
- **Express** conventions
- **ESLint** configuration
- **Validation** des entrées
- **Tests API** complets

### Général
- **Commentaires** en français pour la logique métier
- **Noms de variables** explicites
- **Documentation** des fonctions complexes
- **Performance** considérée

## 🎨 Conventions UI/UX

### Design System
- Inspiration **Cursor** pour la navigation
- Fenêtres **Emergent.sh** pour l'interactivité
- Esthétique **Lovable.dev** pour l'élégance

### Responsive Design
- **Mobile-first** approach
- **Breakpoints** : 576px, 768px, 992px, 1200px
- **Touch-friendly** sur mobile

### Accessibilité
- **ARIA** labels appropriés
- **Contrast** suffisant (AA minimum)
- **Navigation clavier** complète
- **Screen readers** compatible

## 🔍 Code Review

### Critères d'Acceptation
- ✅ Code conforme aux standards
- ✅ Tests passent (coverage > 80%)
- ✅ Documentation mise à jour
- ✅ Pas de régression
- ✅ Performance acceptable

### Process
1. **Self-review** avant soumission
2. **Tests automatiques** passent
3. **Review** par au moins 1 mainteneur
4. **Merge** après approbation

## 🚀 Déploiement

### Environments
- **Development** : Auto-déployé depuis `develop`
- **Staging** : Manuel depuis `staging`
- **Production** : Manuel depuis `main`

### Checklist Pré-déploiement
- [ ] Tests passent
- [ ] Documentation à jour
- [ ] Variables d'environnement configurées
- [ ] Migration de BDD si nécessaire
- [ ] Monitoring activé

## 🤔 Besoin d'Aide ?

### Ressources
- 📚 [Documentation](./README.md)
- 🐛 [Issues](https://github.com/your-org/fusionai/issues)
- 💬 [Discussions](https://github.com/your-org/fusionai/discussions)
- 📧 Email : contribute@fusionai.dev

### Communauté
- **Discord** : [FusionAI Community](https://discord.gg/fusionai)
- **Twitter** : [@FusionAI_Dev](https://twitter.com/FusionAI_Dev)

## 🏆 Reconnaissance

Les contributeurs sont listés dans :
- `CONTRIBUTORS.md`
- Page "About" de l'application
- Release notes

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous licence **MIT**.

---

**Merci de faire partie de l'aventure FusionAI ! 🚀**

*Ensemble, révolutionnons l'expérience de développement.*