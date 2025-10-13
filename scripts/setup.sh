#!/bin/bash

# 🎓 EduChain Credentials - Script de Configuration
# Ce script configure automatiquement l'environnement de développement

set -e

echo "🎓 Configuration d'EduChain Credentials..."
echo "========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Veuillez installer Node.js 18+ depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ requis. Version actuelle: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) ✓"
    
    # npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    print_success "npm $(npm --version) ✓"
    
    # Git
    if ! command -v git &> /dev/null; then
        print_warning "Git n'est pas installé (optionnel)"
    else
        print_success "Git $(git --version | cut -d' ' -f3) ✓"
    fi
}

# Configuration de l'environnement
setup_environment() {
    print_status "Configuration de l'environnement..."
    
    # Aller dans le dossier backend
    cd backend
    
    # Copier le fichier .env.example vers .env s'il n'existe pas
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
        print_warning "⚠️  IMPORTANT: Éditez le fichier .env avec vos clés Hedera et IPFS"
        print_warning "   - HEDERA_ACCOUNT_ID: Votre ID de compte Hedera Testnet"
        print_warning "   - HEDERA_PRIVATE_KEY: Votre clé privée Hedera"
        print_warning "   - IPFS_API_KEY: Votre clé API Infura IPFS"
        print_warning "   - IPFS_API_SECRET: Votre secret API Infura IPFS"
    else
        print_success "Fichier .env existe déjà"
    fi
    
    # Créer les dossiers nécessaires
    mkdir -p logs
    mkdir -p uploads
    mkdir -p tmp
    
    print_success "Dossiers créés"
}

# Installation des dépendances
install_dependencies() {
    print_status "Installation des dépendances..."
    
    # Vérifier si node_modules existe
    if [ -d "node_modules" ]; then
        print_warning "node_modules existe déjà. Voulez-vous réinstaller? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            rm -f package-lock.json
        else
            print_status "Installation ignorée"
            return
        fi
    fi
    
    # Installation
    print_status "Installation en cours... (cela peut prendre quelques minutes)"
    npm install
    
    print_success "Dépendances installées"
}

# Vérification de la configuration
verify_configuration() {
    print_status "Vérification de la configuration..."
    
    # Vérifier les variables d'environnement critiques
    source .env 2>/dev/null || true
    
    local config_ok=true
    
    if [ -z "$HEDERA_ACCOUNT_ID" ] || [ "$HEDERA_ACCOUNT_ID" = "0.0.xxxxx" ]; then
        print_error "HEDERA_ACCOUNT_ID non configuré dans .env"
        config_ok=false
    fi
    
    if [ -z "$HEDERA_PRIVATE_KEY" ] || [[ "$HEDERA_PRIVATE_KEY" == *"xxxxxxxx"* ]]; then
        print_error "HEDERA_PRIVATE_KEY non configuré dans .env"
        config_ok=false
    fi
    
    if [ -z "$IPFS_API_KEY" ] || [ "$IPFS_API_KEY" = "your_ipfs_api_key" ]; then
        print_warning "IPFS_API_KEY non configuré dans .env (optionnel pour les tests)"
    fi
    
    if [ "$config_ok" = true ]; then
        print_success "Configuration de base OK"
    else
        print_error "Configuration incomplète. Veuillez éditer le fichier .env"
        return 1
    fi
}

# Test de l'installation
test_installation() {
    print_status "Test de l'installation..."
    
    # Test de démarrage rapide
    timeout 10s npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    sleep 3
    
    # Tester l'endpoint de santé
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Serveur démarré avec succès"
        kill $SERVER_PID 2>/dev/null || true
    else
        print_warning "Impossible de tester le serveur (normal si la config n'est pas complète)"
        kill $SERVER_PID 2>/dev/null || true
    fi
}

# Affichage des instructions finales
show_instructions() {
    echo ""
    echo "🎉 Configuration terminée !"
    echo "========================="
    echo ""
    echo "📋 Prochaines étapes:"
    echo ""
    echo "1. 🔧 Configurez vos clés dans backend/.env:"
    echo "   - Créez un compte Hedera Testnet: https://portal.hedera.com/"
    echo "   - Créez un projet IPFS Infura: https://infura.io/"
    echo ""
    echo "2. 🚀 Démarrez le serveur:"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
    echo "3. 🌐 Testez l'API:"
    echo "   curl http://localhost:3000/api/health"
    echo ""
    echo "4. 📚 Consultez la documentation:"
    echo "   - README.md"
    echo "   - docs/API_EXAMPLES.md"
    echo "   - docs/DEPLOYMENT_GUIDE.md"
    echo ""
    echo "🎓 Bon développement avec EduChain Credentials !"
}

# Menu principal
show_menu() {
    echo ""
    echo "🎓 EduChain Credentials - Menu de Configuration"
    echo "=============================================="
    echo ""
    echo "1. Configuration complète (recommandé)"
    echo "2. Vérifier les prérequis seulement"
    echo "3. Installer les dépendances seulement"
    echo "4. Vérifier la configuration"
    echo "5. Tester l'installation"
    echo "6. Quitter"
    echo ""
    echo -n "Choisissez une option (1-6): "
}

# Fonction principale
main() {
    # Si des arguments sont passés, exécuter directement
    if [ $# -gt 0 ]; then
        case $1 in
            --full)
                check_prerequisites
                setup_environment
                install_dependencies
                verify_configuration
                test_installation
                show_instructions
                ;;
            --check)
                check_prerequisites
                ;;
            --install)
                install_dependencies
                ;;
            --verify)
                verify_configuration
                ;;
            --test)
                test_installation
                ;;
            *)
                echo "Usage: $0 [--full|--check|--install|--verify|--test]"
                exit 1
                ;;
        esac
        return
    fi
    
    # Menu interactif
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                check_prerequisites
                setup_environment
                install_dependencies
                verify_configuration
                test_installation
                show_instructions
                break
                ;;
            2)
                check_prerequisites
                ;;
            3)
                install_dependencies
                ;;
            4)
                verify_configuration
                ;;
            5)
                test_installation
                ;;
            6)
                print_success "Au revoir !"
                exit 0
                ;;
            *)
                print_error "Option invalide. Veuillez choisir entre 1 et 6."
                ;;
        esac
        
        echo ""
        echo "Appuyez sur Entrée pour continuer..."
        read -r
    done
}

# Gestion des signaux
trap 'print_error "Script interrompu"; exit 1' INT TERM

# Exécution
main "$@"