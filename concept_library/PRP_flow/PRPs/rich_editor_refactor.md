# PRP : Refactorisation du Rich Editor (MDS)

## 🎯 Objectif
Transformer le composant `RichEditor` d'un prototype "fourre-tout" en un composant de production maintenable, performant et visuellement cohérent, capable de basculer entre un mode WYSIWYG (Tiptap) et un mode Markdown brut.

## 🚩 Mauvaises Pratiques Identifiées (Anti-Patterns)
1.  **Dédoublement de la Logique** : Gestion manuelle des chaînes de caractères (RegEx) pour le Markdown vs API Tiptap pour le visuel.
2.  **État Fragmenté** : Multiples sources de vérité (`content` parent, `editor` state, `mdActiveStyles` local) entraînant des désynchronisations.
3.  **Réactivité par "Hacks"** : Utilisation intensive de `setTimeout` et de `setTick` pour forcer les rafraîchissements de l'UI.
4.  **Fragilité des Types** : Utilisation de `any` et guards `String(...)` dispersés au lieu d'un contrat d'interface strict.
5.  **Couplage Fort** : Logique de formatage Markdown codée en dur dans les handlers d'événements UI.

## 🛠 Principes de Conception (Best Practices)

### 1. Source de Vérité Unique
- L'éditeur Tiptap doit rester le moteur central même en mode Markdown si possible, ou utiliser un pont de synchronisation unidirectionnel strict.
- Utilisation de l'extension `tiptap-markdown` comme unique parseur/sérialiseur.

### 2. Abstraction du Formatage (Actions)
- Créer une interface `EditorAction` unifiée. Que l'on soit en mode Markdown ou Visuel, cliquer sur "Gras" doit appeler une fonction capable de déterminer le contexte et d'appliquer la transformation appropriée.

### 3. Observateur d'État Unifié
- Centraliser la détection des styles actifs (Bold, Italic, etc.) dans un hook personnalisé `useEditorState`.
- Ce hook doit écouter les transactions Tiptap ET les événements de sélection du Textarea Markdown.

### 4. UI Atomique et Découplée
- Les boutons de la barre d'outils (`ToolbarButton`) ne doivent recevoir qu'un état `active` (booléen) et une fonction `onClick`. Ils ne doivent pas connaître la logique interne de l'éditeur.

## 🏗 Architecture Cible

### Composants
- `RichEditor` (Conteneur principal, gestion des modes).
- `EditorToolbar` (Barre d'outils, gère la disposition des boutons).
- `VisualEditor` (Pont vers `EditorContent` de Tiptap).
- `MarkdownEditor` (Textarea optimisé avec gestion de sélection).

### Flux de Données
1.  **Saisie** -> Mise à jour du Markdown -> Appel du `onChange` parent.
2.  **Switch Mode** -> Conversion via `tiptap-markdown` -> Initialisation du nouveau mode.
3.  **Action (Gras)** -> Détection du mode -> Application (Tiptap command ou Markdown Wrap) -> Mise à jour immédiate de l'état visuel du bouton.

## ✅ Critères de Validation
- [ ] Zéro erreur de type (TypeScript strict).
- [ ] Persistance visuelle du bouton bleu (Active) sans scintillement.
- [ ] Bascule entre modes sans perte de curseur ou de contenu.
- [ ] Support du "Sticky behavior" (entrer/sortir d'un style) dans les deux modes.
