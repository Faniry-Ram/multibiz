# Maquette MultiBiz — référence pour le front web

Ce dossier est la **référence visuelle** de l'interface. Avant de coder une page, ouvre l'écran correspondant dans `screens/` et reproduis-le : mêmes espacements, tailles, couleurs, textes et interactions.

- `screens/*.dc.html` : les 21 écrans de la maquette (16 web, 5 mobile).
- `tokens.css` : les couleurs, polices et ombres, en clair et en sombre, prêtes à coller dans `resources/css/app.css`.

---

## 1. Comment lire un fichier `.dc.html`

Ce ne sont pas des pages à ouvrir dans un navigateur : c'est un format de maquette. Le moteur qui les affiche n'est pas fourni. Il suffit de les lire comme du JSX simplifié.

| Dans le fichier | Équivalent React |
|---|---|
| `<helmet>…</helmet>` | Polices et variables CSS (reprises dans `tokens.css`) |
| `class="mb {{themeClass}}"` sur la racine | La classe `.dark` sur `<html>` |
| `{{ nom }}` ou `{{ objet.champ }}` | `{nom}` / `{objet.champ}` |
| `<sc-for list="{{items}}" as="i">…</sc-for>` | `items.map(i => …)` |
| `<sc-if value="{{cond}}">…</sc-if>` | `{cond && …}` |
| `onClick="{{fn}}"`, `onChange="{{fn}}"` | Les interactions à reproduire |
| `style="…"` en ligne | Les valeurs exactes à traduire en classes Tailwind |
| `style="{{x.style}}"` | Style calculé dans le script : regarde `renderVals()` |
| `<script type="text/x-dc">` → `renderVals()` | Les **données de démo** et les calculs d'affichage (échelles des graphiques, couleurs selon l'état…) |

Règles :
- Les données dans `renderVals()` sont des **données de démonstration**. Ne les mets jamais en dur dans un composant. Elles servent pour un seeder, des fixtures ou la page de démo des composants.
- La logique de dessin des graphiques (calcul des points, des pourcentages, des positions) est réutilisable telle quelle dans des composants React.
- La barre latérale et la barre du haut sont répétées dans chaque écran web : c'est **un seul layout** à coder.
- Un `href="X.dc.html"` indique la navigation : la table de la section 4 donne la route correspondante.

---

## 2. Règles visuelles

### Couleurs
- Toujours passer par les variables de `tokens.css`, jamais de couleur en dur, sauf `#2563EB` pour les boutons principaux et `#FFFFFF` sur fond bleu.
- Rôles :
  - `pos` : rentable, entrées d'argent.
  - `neg` : en perte, morts, retards.
  - `warn` : à surveiller, stock bas.
  - `primary` : sélection, en démarrage, liens.
  - `slate` : neutre, notes, « Correct ».
- **Couleur par projet** (`--b1` à `--b6`), choisie à la création. Une couleur prise est réservée à son projet : elle identifie le projet partout (puce, avatar, courbe).
- Badges de verdict :

| Verdict | Fond | Texte |
|---|---|---|
| Rentable | `--pos-soft` | `--pos` |
| À surveiller | `--warn-soft` | `--warn` |
| En démarrage | `--primary-soft` | `--primary-text` |
| En perte | `--neg-soft` | `--neg` |
| Correct | `--slate-soft` | `--slate-text` |

### Typographie
- Geist pour le texte ; **Geist Mono pour tous les chiffres** (montants, %, dates courtes, axes).
- Eyebrow au-dessus des titres de page : `// texte`, Geist Mono 12–12.5px, couleur `--primary-text`.
- Titres :
  - h1 de page : 32px, 700, letter-spacing −0.03em.
  - h1 de projet : 30px.
  - h2 de carte : 16–17px, 700, letter-spacing −0.02em.
- Texte courant 14–14.5px ; méta 12–13px en `--muted`.

### Formes et espacements
- Zone de contenu : padding 28px 36px 48px (24px en haut sur les pages projet), sections espacées de 18–20px, fond `.dot-grid`.
- Carte : fond `--surface`, bordure 1px `--border`, rayon 16px, padding 18–22px, ombre `--shadow`.
- Tuile de chiffre (stat) : rayon 14px, padding 15–16px.
  - Variante « mise en avant » : fond `#2563EB` et texte blanc.
  - Variante « alerte » : fond `--warn-soft`.
- Boutons : hauteur 40px, rayon 10px, 14px semi-gras.
  - Principal : `#2563EB`.
  - Secondaire : `--surface` + bordure.
  - Danger : bordure et texte `--neg`.
- Champs : hauteur 40–46px, rayon 10–11px, fond `--bg`, bordure `--border`.
- Pastilles de filtre : hauteur 32–34px, rayon 999px. Sélectionnée : fond `--primary-soft` + contour 1.5px `#2563EB`.
- Interrupteurs : 42×24px, bleu quand activé.
- Barre latérale : 240px. Barre du haut : 68px.

### Nombres
- Montants : `1 250 000 Ar`, avec une espace (de préférence insécable fine) comme séparateur de milliers.
- Signes : `+ 476 000` et `− 120 000`, avec le vrai signe moins (U+2212) suivi d'une espace.
- Pourcentages : `73 %`, avec une espace insécable.
- Dates : `sam. 10 oct.`, `3 nov.`. Âge d'un lot : `J21`. Échéance : `J−36`.
- Dans « Ma poche », les montants sont vus **depuis la poche** : un apport s'affiche `− 700 000` (l'argent sort de la poche), un retrait `+ 150 000`.

### Graphiques
- Composants SVG maison, sans librairie : la maquette contient tout le code de calcul.
- `viewBox` fixe avec `preserveAspectRatio="none"` et `vector-effect="non-scaling-stroke"` sur les traits.
- Les libellés d'axes et les étiquettes sont en **HTML positionné en %**, pas en `<text>` SVG, pour ne pas être déformés.
- Quadrillage : traits 1px `--border`. Aires : `rgba(var(--heat), 0.10)`.
- Série principale en `--chart` ; séries de comparaison en `--c3` ; une série par projet dans la couleur du projet.
- Chaque graphique a un `role="img"` et un `aria-label` qui résume les données.
- Les légendes sont des puces HTML au-dessus du graphique.

---

## 3. Composants à créer

| Composant | Où on le voit |
|---|---|
| `AppLayout` : barre latérale + barre du haut | Toutes les pages web connectées |
| `Sidebar` (nav « // piloter », « // mes projets » avec % de capital récupéré, bouton + nouveau projet, carte chrono) | idem |
| `Topbar` (recherche ⌘K, pastille de synchro, bascule de thème, bouton « Noter un flux ») | idem |
| `AuthLayout` (panneau bleu + formulaire) | Connexion |
| `WizardLayout` (barre simple, sans barre latérale) | Nouveau projet |
| `PageHeader` (eyebrow, h1, sous-titre, actions) | Toutes |
| `ProjectHeader` (retour, avatar, nom, badges, actions, onglets) | Pages projet |
| `Tabs` (soulignés, `aria-current`) | Pages projet |
| `Card`, `StatTile`, `InfoNote` | Partout |
| `Badge`, `VerdictBadge`, `SourceBadge` | Partout, Tâches |
| `GoalCard` (titre, badge, barre, méta gauche/droite) | Vue d'ensemble, pages projet |
| `ProgressBar` | Objectifs, capital récupéré, stock |
| `ProjectAvatar`, `ProjectDot` | Partout |
| `Button`, `IconButton`, `ThemeToggle` | Partout |
| `Input`, `Select`, `Textarea`, `DateInput`, `NumberStepper` (− valeur +) | Formulaires, Réglages, Planifier |
| `Switch`, `SegmentedControl`, `FilterChip`, `ChoiceCard` (carte radio) | Formulaires, Réglages, Nouveau projet |
| `Dialog` (en-tête, corps, pied) | Noter un flux, jalon, objectif |
| `DataRow` / tableaux en grille avec chiffres alignés à droite | Historique, Lots, Poche, Ressources |
| `Timeline` (étapes J1 → J45) | Tâches, Réglages |
| `EmptyState` | Listes vides |
| Graphiques : `Sparkline`, `TrajectoryChart` (avec jalons cliquables), `MultiLineChart` (avec infobulle au survol), `StepAreaChart`, `StepLineChart` (avec marqueurs), `PairedBars` (avec jour cliquable), `MonthlyBars`, `DivergingBars`, `StackedBar`, `HBarList`, `WeekStrip` | Voir la section 5 |

Crée aussi une page de démo locale (`/_dev/ui`, seulement en environnement local) qui montre chaque composant en clair et en sombre.

---

## 4. Écrans → routes → pages Inertia

| Écran de maquette | Route | Page Inertia | Phase |
|---|---|---|---|
| `Web-Connexion` | `/login`, `/register` | `Auth/Login`, `Auth/Register` | 1 |
| `Web-Nouveau-Projet` | `/projects/create` | `Projects/Create` | 1 |
| `Web-Formulaires` (3 fenêtres) | aucune (fenêtres globales) | `EntryDialog` (1), `MilestoneDialog` (1, sans calcul d'effet), `GoalDialog` (3) | 1 / 3 |
| `Main` | `/dashboard` | `Dashboard` | 1 (certains blocs en 3) |
| `Web-Historique` | `/history` | `Entries/Index` | 1 |
| `Web-Poche` | `/pocket` | `Pocket/Index` | 1 |
| `Web-Projet-Elevage` | `/projects/{project}` (modèle `lots`) | `Projects/Show` + `Overview/Lots` | 1 |
| `Web-Projet-Effectif` | `/projects/{project}` (modèle `herd`) | `Projects/Show` + `Overview/Herd` | 1 |
| `Web-Projet-Lots` | `/projects/{project}/batches/{batch?}` | `Projects/Batches` | 1 |
| `Web-Projet-Reglages` | `/projects/{project}/settings` | `Projects/Settings` | 1 |
| `Web-Parametres` | `/settings` | `Settings/Index` | 1 (profil, affichage) puis 4 |
| `Web-Analyse` | `/analysis` | `Analysis/Index` | 3 |
| `Web-Taches` | `/tasks` | `Tasks/Index` | 3 |
| `Web-Projet-Ressources` | `/projects/{project}/resources` | `Projects/Resources` | 3 |
| `Web-Projet-Plan` | `/projects/{project}/plan` | `Projects/Plan` | 3 |
| `Web-Projet-Revente` | `/projects/{project}` (modèle `resale`) | `Projects/Show` + `Overview/Resale` | 3 |
| `Mobile-*` (5 écrans) | — | App Expo, hors de ce front | 2 |

`Projects/Show` choisit sa vue d'ensemble selon le modèle du projet. Les onglets dépendent des modules activés :
- `lots` : Vue d'ensemble, Lots, Ressources, Planifier, Historique, Réglages.
- `herd` : Vue d'ensemble, Effectif, Ressources, Historique, Réglages.
- `resale` : Vue d'ensemble, Ressources et stock, Historique, Réglages.
- `simple` : Vue d'ensemble, Historique, Réglages.

---

## 5. Détail par écran

### Connexion (`Web-Connexion`)
- **Panneau gauche** (`#2563EB`, points blancs à 13 %) : titre, 3 exemples de projets avec leur verdict, 3 atouts.
- **Panneau droit** : langue, thème, puis onglets « Se connecter » / « Créer un compte » (`role="tablist"`).
  - L'inscription ajoute les champs nom et devise.
  - Le mot de passe a un bouton Afficher / Masquer.
  - Une case « Rester connecté » à la connexion, une case des conditions d'utilisation à l'inscription.
- Après l'inscription, on arrive sur `/projects/create`. Le bouton Google est optionnel (plus tard).

### Nouveau projet (`Web-Nouveau-Projet`)
- Indicateur d'étapes cliquable pour revenir en arrière.
- **Étape 1** : 4 cartes radio pour le modèle. En choisir un remet les modules par défaut de ce modèle.
- **Étape 2** :
  - Nom.
  - Couleur parmi 6, les couleurs déjà prises sont désactivées.
  - Date de début.
  - Capital de départ : il devient un **apport** dans « Ma poche ».
  - Unité : la question change selon le modèle.
  - Note facultative : elle devient le **premier jalon**.
- **Étape 3** :
  - Type d'objectif parmi 4 ; la cible par défaut dépend du type.
  - Cible et échéance.
  - Interrupteurs de modules, avec l'étiquette « conseillé ».
- **À droite** : un aperçu en direct de la carte du projet et la liste « Ce qui se passe à la création ».
- Brouillon gardé en local. Le dernier bouton s'appelle « Créer « nom » » et mène à la page du projet.

### Les 3 fenêtres (`Web-Formulaires`)
**EntryDialog** (raccourci `N`, ouvert par « Noter un flux »). Les champs s'adaptent au type :

| Type | Champs |
|---|---|
| Vente | Quantité × prix unitaire = total ; « ce qui est vendu » ; photo du reçu |
| Dépense | Quantité × prix unitaire ; catégorie ; case « Mettre en stock » (phase 3) ; photo du reçu |
| Investissement | Montant ; durée d'usage (1–3 ans) avec « ≈ X Ar par mois » ; photo |
| Poche | Sens : apport ou retrait ; montant |
| Effectif | Perte / entrée / réforme ; nombre (−/+) ; effectif avant → après |
| Note | Texte libre |

- Toujours présents : projet, lot ou groupe (selon le projet), date, note.
- Pied de fenêtre :
  - Résumé « projet · lot · montant signé ».
  - « Enregistrer et noter un autre » garde la fenêtre ouverte ; « Enregistrer » la ferme.
  - Rappel : un flux ne s'efface pas.

**MilestoneDialog** (`J`) :
- Projet, date, titre, genre (4 choix), description.
- Indicateurs à comparer (choix multiple ; la liste dépend du modèle du projet).
- Période de comparaison (dépend du modèle).
- Aperçu « ce que MultiBiz calculera ».

**GoalDialog** (`O`, phase 3) :
- 4 types, projet, cible, échéance.
- Projection en direct : rythme actuel → date atteinte, avec un badge « En avance », « En bonne voie », « Trop ambitieux » ou « Déjà atteint ».
- Rappels ; case « Afficher sur la vue d'ensemble ».

### Vue d'ensemble (`Main`)
- En-tête avec un sélecteur de période : « Depuis le début », « 6 mois », « 30 jours ».
- Bilan global sur fond bleu (5 chiffres).
- Une carte par projet :
  - Avatar, verdict, trajectoire en sparkline avec la ligne zéro.
  - Barre de capital récupéré, 3 chiffres, dernier jalon.
- « Ce qui marche » / « Ce qui ne marche pas » (phase 3).
- « Objectifs et échéances » avec un lien `+ Objectif`.
- « À faire aujourd'hui » : cases à cocher et lien vers Tâches (phase 3).
- « Derniers flux » avec un lien vers l'historique.

### Historique (`Web-Historique`)
- Filtres : projet, type, période.
- Flux groupés par jour, avec un résumé de la période.
- Note sur l'immuabilité : une correction apparaît comme un **flux inverse** lié au flux d'origine.

### Ma poche (`Web-Poche`)
- 4 chiffres : sorti, revenu, encore engagé (sur fond bleu), disponible dans les projets.
- Courbe en escalier de l'argent engagé, avec des étiquettes aux apports et retraits.
- Tableau par projet : mis, repris, part déjà revenue (barre), disponible.
- Mouvements vus depuis la poche.
- Note : un apport n'est pas une recette.

### Projet — vue d'ensemble, modèle lots (`Web-Projet-Elevage`)
- `ProjectHeader` avec les actions « + Jalon » et « Planifier la bande suivante ».
- Objectifs, puis 5 chiffres.
- **Trajectoire** (argent cumulé, capital compris) avec des **losanges de jalons cliquables**. Le détail du jalon affiche l'effet avant → après (calculé en phase 3).
- Comparaison des lots ; encart de la bande en cours ; « Ce qui marche » / « Ce qui ne marche pas ».

### Projet — vue d'ensemble, modèle troupeau (`Web-Projet-Effectif`)
- Bandeau « Verdict provisoire » tant que le projet est en démarrage (jusqu'à J90).
- 3 objectifs, puis 5 chiffres (la tuile « pas encore vendus » est en `warn-soft`).
- **Pondus / vendus par jour** : barres appariées avec la ligne d'objectif en pointillés. Un clic sur un jour affiche le détail : pondus, taux, vendus, stock du soir.
- « Ce que disent les chiffres » (pastille chiffrée + texte), coût par œuf, carte Effectif, argent du projet.

### Lots (`Web-Projet-Lots`)
- **Liste des bandes** : carte cliquable avec verdict, marge (barre relative à la meilleure), effectif et pertes. En bas, « + Ouvrir la bande suivante ».
- **Détail** :
  - Tuiles de chiffres : une version pour une bande clôturée, une autre pour la bande en cours, avec des valeurs estimées marquées `*`.
  - Effectif jour par jour en escalier : points rouges pour les morts, étiquettes « vente N », projection en pointillés pour la bande en cours.
  - Pesées : la bande choisie en bleu, les autres en gris.
  - Coût par poste : barre empilée + tableau avec l'écart par poulet face à la bande précédente.
  - Journal ; « Ce que cette bande a appris » (= la note de clôture).

### Réglages du projet (`Web-Projet-Reglages`)
- Identité : nom, date de début, couleur, modèle (modifiable), description.
- **Seuils du verdict** :
  - Pas à pas pour la marge minimale et les pertes maximales.
  - « Juger le projet à partir de » 1, 2 ou 3 bandes.
  - **Aperçu en direct** du verdict de chaque bande et du projet ; le badge de l'en-tête change aussi.
- Calendrier type (J1 → J45), avec un interrupteur « tâche » par étape.
- Modules ; catégories (avec le nombre d'utilisations, retirer = archiver) ; unités et recette ; zone sensible.

### Paramètres (`Web-Parametres`)
- Sous-navigation par sections.
- Profil.
- Affichage : thème Clair / Sombre / Système (applique vraiment le thème), langue, écriture des montants avec un exemple en direct, devise, début de semaine.
- Synchronisation et appareils ; personnes et rôles (`Saisie` = pas d'accès à la poche ni à l'analyse) ; notifications ; données ; zone sensible.

### Phase 3, à faire plus tard
- **Analyse** (`Web-Analyse`) :
  - Résultat cumulé par projet avec une infobulle au survol.
  - Projets côte à côte.
  - Ar par heure en barres divergentes autour d'un seuil.
  - « À quel moment ça marche » ; pistes.
- **Tâches** (`Web-Taches`) :
  - Bande des 7 prochains jours, filtres par projet.
  - Groupes : en retard, aujourd'hui, 7 jours, plus tard. Badge de source : auto, récurrent, manuel, stock bas.
  - Rappels récurrents, calendrier type, régularité.
- **Ressources** (`Web-Projet-Ressources`) :
  - Achat en quantité × prix, avec un rappel du prix moyen.
  - Stock avec « Utiliser » (ajoute le coût au lot en cours), coût par poste, journal, équipement.
- **Planifier** (`Web-Projet-Plan`) : simulateur (nombre d'animaux, prix, pertes, objectif), date de départ, recette mise à l'échelle, calendrier d'achats, comparaison avec les bandes passées.
- **Revente** (`Web-Projet-Revente`) : barres mensuelles avec jalons, produits (« ce qui se vend, ce qui dort »), ventes par semaine.

---

## 6. Chiffres de démo cohérents (pour le seeder et les fixtures)

**Poulets de chair** (capital 650 000 Ar) :

| Bande | Animaux | Morts | Vendus | Prix | Coût | Marge |
|---|---|---|---|---|---|---|
| B1 | 50 | 9 | 41 | 13 000 | 360 000 | 173 000 |
| B2 | 60 | 6 | 54 | 13 500 | 430 000 | 299 000 |
| B3 | 60 | 4 | 56 | 14 000 | 410 000 | 374 000 |
| B4 (en cours, J21 le 10 oct.) | 80 | 3 | 77 en vie | — | 370 000 à date | 578 000 estimée |

Résultat cumulé + 476 000 Ar → capital récupéré 73 %.

**Œufs** (30 poules, capital 700 000 Ar, depuis le 15 août) :
- Ponte du 28 sept. au 10 oct. : 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19.
- Vendus sur les mêmes jours : 0, 0, 0, 6, 0, 12, 0, 6, 10, 0, 12, 6, 36, à 500 Ar.
- 59 œufs non vendus ; résultat − 120 000 Ar.

**Revente en ligne** (capital 400 000 Ar) : résultat + 335 000 Ar, capital récupéré 84 %, verdict « À surveiller ».

**Global** : capital engagé 1 750 000 Ar, résultat cumulé + 691 000 Ar, capital récupéré 39 %.
