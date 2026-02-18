# PRP Flow - Product Requirement Prompts

## Concept

Un **PRP (Product Requirement Prompt)** est un document structuré qui fournit à un agent IA tout ce dont il a besoin pour livrer du code production-ready du premier coup.

## Différence avec un PRD classique

| PRD Classique | PRP |
|---------------|-----|
| Décrit **quoi** construire | Décrit **quoi** + **comment** |
| Évite les détails techniques | Inclut les détails d'implémentation |
| Pour les humains | Optimisé pour les agents IA |
| Références abstraites | Chemins de fichiers exacts |

## Les 3 Couches d'un PRP

### 1. Contexte
- Chemins de fichiers précis à référencer
- Versions des dépendances
- Extraits de code existants
- Documentation dans `ai_docs/`

### 2. Détails d'Implémentation
- Spécifications API exactes
- Patterns à suivre
- Architecture des composants
- Schéma de base de données

### 3. Validation
- Critères testables
- Checklist de sécurité
- Étapes de test manuelles

## Workflow

```
1. /create-prp [description de la feature]
   ↓
2. Gemini explore le codebase + ai_docs
   ↓
3. Gemini génère un PRP dans PRPs/
   ↓
4. Tu valides/ajustes le PRP
   ↓
5. Tu donnes le PRP à Gemini pour implémenter
   ↓
6. Code production-ready
```

## Structure des Dossiers

```
project/
├── ai_docs/              # Documentation pour l'IA
│   ├── architecture.md   # Vue d'ensemble technique
│   ├── patterns.md       # Patterns de code à suivre
│   └── ...
├── PRPs/                 # PRPs générés
│   ├── feature-x.md
│   └── feature-y.md
└── concept_library/
    └── PRP_flow/
        ├── README.md     # Ce fichier
        └── PRPs/
            └── base_template_v1.md  # Template de référence
```

## Principe Fondamental

> "Context is king" en ingénierie de prompts agentic.
>
> Les LLM génèrent du code de meilleure qualité avec des références directes plutôt que des descriptions vagues.

## Utilisation

```bash
# Dans Claude Code, lance la commande :
/create-prp Ajouter un système de notifications push
```
