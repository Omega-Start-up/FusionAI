import { Injectable, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  systemPreference: boolean;
  customColors?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  
  // Signals pour l'état du thème
  public currentTheme = signal<Theme>('dark');
  public systemPreference = signal<Theme>('dark');
  public isDarkMode = signal<boolean>(true);
  
  private readonly STORAGE_KEY = 'fusion_theme';
  private readonly CUSTOM_COLORS_KEY = 'fusion_custom_colors';
  
  private mediaQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.initializeTheme();
    this.setupSystemPreferenceListener();
    this.setupThemeEffect();
  }

  /**
   * Initialiser le thème au démarrage
   */
  private initializeTheme(): void {
    // Récupérer le thème sauvegardé
    const savedTheme = this.getSavedTheme();
    
    // Détecter la préférence système
    const systemPreference = this.detectSystemPreference();
    this.systemPreference.set(systemPreference);
    
    // Appliquer le thème initial
    const initialTheme = savedTheme || 'auto';
    this.setTheme(initialTheme);
  }

  /**
   * Configurer l'effet réactif pour les changements de thème
   */
  private setupThemeEffect(): void {
    effect(() => {
      const theme = this.currentTheme();
      const systemPref = this.systemPreference();
      
      let resolvedTheme: 'light' | 'dark';
      
             if (theme === 'auto') {
         resolvedTheme = systemPref === 'auto' ? 'dark' : systemPref;
       } else {
         resolvedTheme = theme as 'light' | 'dark';
       }
      
      this.isDarkMode.set(resolvedTheme === 'dark');
      this.applyThemeToDocument(resolvedTheme);
      this.saveTheme(theme);
    });
  }

  /**
   * Configurer l'écoute des changements de préférence système
   */
  private setupSystemPreferenceListener(): void {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (e) => {
        const systemPreference = e.matches ? 'dark' : 'light';
        this.systemPreference.set(systemPreference);
      });
    }
  }

  /**
   * Changer le thème
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Basculer entre light et dark
   */
  toggleTheme(): void {
    const currentTheme = this.currentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Utiliser le thème automatique (système)
   */
  useAutoTheme(): void {
    this.setTheme('auto');
  }

  /**
   * Obtenir le thème actuel
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Vérifier si le mode sombre est actif
   */
  isDark(): boolean {
    return this.isDarkMode();
  }

  /**
   * Appliquer le thème au document
   */
  private applyThemeToDocument(theme: 'light' | 'dark'): void {
    const htmlElement = this.document.documentElement;
    
    // Retirer toutes les classes de thème
    htmlElement.classList.remove('light-theme', 'dark-theme');
    
    // Ajouter la classe appropriée
    htmlElement.classList.add(`${theme}-theme`);
    
    // Définir l'attribut data-theme
    htmlElement.setAttribute('data-theme', theme);
    
    // Mettre à jour la meta theme-color
    this.updateThemeColor(theme);
  }

  /**
   * Mettre à jour la couleur de thème pour PWA
   */
  private updateThemeColor(theme: 'light' | 'dark'): void {
    const themeColorMeta = this.document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#121212' : '#ffffff';
    
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', color);
    }
  }

  /**
   * Détecter la préférence système
   */
  private detectSystemPreference(): Theme {
    if (this.mediaQuery?.matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Sauvegarder le thème
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Impossible de sauvegarder le thème:', error);
    }
  }

  /**
   * Récupérer le thème sauvegardé
   */
  private getSavedTheme(): Theme | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return (saved as Theme) || null;
    } catch (error) {
      console.warn('Impossible de récupérer le thème sauvegardé:', error);
      return null;
    }
  }

  /**
   * Couleurs personnalisées
   */
  setCustomColors(colors: Record<string, string>): void {
    try {
      localStorage.setItem(this.CUSTOM_COLORS_KEY, JSON.stringify(colors));
      this.applyCustomColors(colors);
    } catch (error) {
      console.warn('Impossible de sauvegarder les couleurs personnalisées:', error);
    }
  }

  getCustomColors(): Record<string, string> | null {
    try {
      const saved = localStorage.getItem(this.CUSTOM_COLORS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Impossible de récupérer les couleurs personnalisées:', error);
      return null;
    }
  }

  private applyCustomColors(colors: Record<string, string>): void {
    const htmlElement = this.document.documentElement;
    
    Object.entries(colors).forEach(([property, value]) => {
      htmlElement.style.setProperty(`--${property}`, value);
    });
  }

  /**
   * Réinitialiser aux paramètres par défaut
   */
  resetToDefaults(): void {
    this.setTheme('auto');
    this.clearCustomColors();
  }

  private clearCustomColors(): void {
    try {
      localStorage.removeItem(this.CUSTOM_COLORS_KEY);
      // Retirer les propriétés CSS personnalisées
      const htmlElement = this.document.documentElement;
      const customColors = this.getCustomColors();
      
      if (customColors) {
        Object.keys(customColors).forEach(property => {
          htmlElement.style.removeProperty(`--${property}`);
        });
      }
    } catch (error) {
      console.warn('Impossible de supprimer les couleurs personnalisées:', error);
    }
  }

  /**
   * Obtenir la configuration complète du thème
   */
  getThemeConfig(): ThemeConfig {
    return {
      theme: this.currentTheme(),
      systemPreference: this.currentTheme() === 'auto',
      customColors: this.getCustomColors() || undefined
    };
  }

  /**
   * Thèmes prédéfinis
   */
  readonly presetThemes = {
    default: {
      'primary-color': '#667eea',
      'accent-color': '#ff6b6b'
    },
    ocean: {
      'primary-color': '#0077be',
      'accent-color': '#00a8cc'
    },
    forest: {
      'primary-color': '#2d5016',
      'accent-color': '#7cb342'
    },
    sunset: {
      'primary-color': '#ff7043',
      'accent-color': '#ffab40'
    },
    purple: {
      'primary-color': '#7b1fa2',
      'accent-color': '#ab47bc'
    }
  };

  /**
   * Appliquer un thème prédéfini
   */
  applyPresetTheme(presetName: keyof typeof this.presetThemes): void {
    const preset = this.presetThemes[presetName];
    if (preset) {
      this.setCustomColors(preset);
    }
  }
}