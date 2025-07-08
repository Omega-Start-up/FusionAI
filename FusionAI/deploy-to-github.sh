#!/bin/bash

# 🚀 Script de Déploiement FusionAI vers GitHub
# Usage: ./deploy-to-github.sh [username] [repo-name]

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paramètres
GITHUB_USERNAME=${1:-"your-username"}
REPO_NAME=${2:-"fusionai"}
GITHUB_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo -e "${BLUE}🚀 Déploiement FusionAI vers GitHub${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Vérification que nous sommes dans un repository Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erreur: Pas de repository Git trouvé${NC}"
    echo -e "${YELLOW}💡 Assurez-vous d'être dans le répertoire FusionAI${NC}"
    exit 1
fi

# Vérification des fichiers essentiels
echo -e "${YELLOW}🔍 Vérification des fichiers...${NC}"
REQUIRED_FILES=("README.md" "package.json" "backend/package.json" "frontend/package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Fichier manquant: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ Tous les fichiers essentiels sont présents${NC}"

# Vérification du statut Git
echo -e "${YELLOW}📊 Vérification du statut Git...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Des changements non committés détectés${NC}"
    echo -e "${BLUE}Fichiers modifiés:${NC}"
    git status --porcelain
    read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔄 Déploiement annulé${NC}"
        exit 1
    fi
fi

# Configuration du remote
echo -e "${YELLOW}🔗 Configuration du remote GitHub...${NC}"
if git remote get-url origin >/dev/null 2>&1; then
    echo -e "${BLUE}📍 Remote 'origin' existant: $(git remote get-url origin)${NC}"
    read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$GITHUB_URL"
        echo -e "${GREEN}✅ Remote mis à jour vers: $GITHUB_URL${NC}"
    fi
else
    git remote add origin "$GITHUB_URL"
    echo -e "${GREEN}✅ Remote ajouté: $GITHUB_URL${NC}"
fi

# Affichage des informations de déploiement
echo ""
echo -e "${BLUE}📦 Informations de déploiement:${NC}"
echo -e "${BLUE}├── Repository: $GITHUB_URL${NC}"
echo -e "${BLUE}├── Branche: $(git branch --show-current)${NC}"
echo -e "${BLUE}├── Commits: $(git rev-list --count HEAD)${NC}"
echo -e "${BLUE}└── Dernier commit: $(git log -1 --pretty=format:'%h - %s')${NC}"
echo ""

# Confirmation finale
echo -e "${YELLOW}⚠️  Prêt à pousser vers GitHub${NC}"
read -p "Continuer avec le push ? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔄 Déploiement annulé par l'utilisateur${NC}"
    exit 1
fi

# Push vers GitHub
echo -e "${YELLOW}🚀 Push vers GitHub...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}🎉 SUCCÈS ! FusionAI a été déployé sur GitHub${NC}"
    echo -e "${GREEN}=================================${NC}"
    echo -e "${GREEN}🌐 URL du repository: $GITHUB_URL${NC}"
    echo -e "${GREEN}📱 Vous pouvez maintenant:${NC}"
    echo -e "${GREEN}   ├── Voir votre code sur GitHub${NC}"
    echo -e "${GREEN}   ├── Inviter des collaborateurs${NC}"
    echo -e "${GREEN}   ├── Configurer les GitHub Actions${NC}"
    echo -e "${GREEN}   └── Déployer sur des plateformes cloud${NC}"
    echo ""
    echo -e "${BLUE}🔧 Prochaines étapes recommandées:${NC}"
    echo -e "${BLUE}   1. Configurer les secrets GitHub pour le déploiement${NC}"
    echo -e "${BLUE}   2. Activer GitHub Pages pour la documentation${NC}"
    echo -e "${BLUE}   3. Configurer les webhooks pour CI/CD${NC}"
    echo -e "${BLUE}   4. Ajouter des labels et templates d'issues${NC}"
else
    echo -e "${RED}❌ Erreur lors du push vers GitHub${NC}"
    echo -e "${YELLOW}💡 Vérifiez:${NC}"
    echo -e "${YELLOW}   ├── Vos permissions sur le repository${NC}"
    echo -e "${YELLOW}   ├── Votre authentification GitHub${NC}"
    echo -e "${YELLOW}   └── La connectivité réseau${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🏁 Script terminé avec succès !${NC}"