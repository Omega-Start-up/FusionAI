# Emergent-like MVP (statique, sans dépendances)

Ce mini-projet démontre un flux "text-to-site": vous saisissez une consigne en français, le générateur produit une page HTML cohérente (héros, features, pricing, FAQ, etc.) et l’aperçu s’affiche dans l’iframe. Vous pouvez télécharger le fichier `site.html`.

## Lancer localement

Dans ce dossier:

```bash
python3 -m http.server 5173
```

Puis ouvrez `http://localhost:5173` et cliquez sur `emergent-lite/` si nécessaire, puis `index.html`.

## Remarques

- Pas de dépendances externes (fonctionne offline). Aucune clé API requise.
- Le générateur est déterministe et basé sur règles simples; vous pouvez brancher un LLM plus tard via une API backend.
- Le code exporté est un seul fichier HTML autonome (CSS inline minimal pour la page générée).