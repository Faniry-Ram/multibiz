# Audit d'architecture — bascule vers « surveillance par historique des flux »

Statut : lecture seule, aucune modification de code effectuée. À valider avant toute étape
d'implémentation.

## 0. Résumé exécutif

La base existante est **structurellement saine et réutilisable** : l'organisation en domaines
(`app/Domain/*`), les contrôleurs minces, les Actions partagées, les Policies scopées par
organisation, le socle de synchro (`Syncable`, séquence globale, `processed_operations`), le
typage strict TS, et la pile Laravel 13 / React 19 / Tailwind 4 / Inertia correspondent déjà à la
cible. Rien à jeter côté architecture technique.

Ce qui ne correspond pas à la cible, c'est le **modèle métier** de Phase 1 actuelle : il a été
pensé comme une comptabilité générique (`businesses` → `categories` → `transactions`
income/expense, modifiables et supprimables, avec un `payment_method`) plutôt que comme un
registre de flux immuable organisé autour de projets typés (lots, troupeau, revente) avec verdict,
capital récupéré, et « ma poche ». Aucun module de gestion « complète » (clients, commandes,
factures, fournisseurs, entrepôts) n'a été trouvé dans le code — donc rien à isoler de ce côté.
Le travail est donc une **évolution du modèle de données et des Actions existantes**, pas une
réécriture du socle.

Trois non-négociables de la cible sont absents aujourd'hui et sont le vrai cœur du travail :
1. Les flux (`transactions`) sont actuellement mutables (`update`/`delete` existent, testés,
   utilisés par l'UI) — la cible interdit ça au niveau modèle et Policy.
2. Pas de notion de projet typé (modèle lots/herd/resale/simple), de bande/lot, de jalons, de
   « ma poche », d'effectif, de production — seulement des `businesses` génériques.
3. Pas de table `organization_user` ni de rôles (owner/manager/entry/viewer) — un `user` appartient
   à une seule organisation sans rôle. Pas de `device_id` ni de distinction `recorded_at` /
   `occurred_at` au niveau flux (seul `occurred_at` existe).

## 1. Inventaire de l'existant

### 1.1 Dossiers Domain (`backend/app/Domain`)

| Domaine | Contenu | Remarque |
|---|---|---|
| `Identity` | `Models/User`, `Actions/RegisterOrganizationAndUser` | Rattache l'inscription à la création d'organisation. Pas de rôle. |
| `Organization` | `Models/Organization`, `Data/OrganizationData` | PK auto-incrémentée (`id` bigint), pas d'UUID, pas de `currency`/`timezone`. |
| `Business` | `Models/Business`, `Actions/{Create,Update,Delete}Business`, `Data/BusinessData`, `Policies/BusinessPolicy` | Équivalent actuel de « projet », mais sans `model` (lots/herd/resale/simple), sans `status`, `started_on`, `settings` JSON. |
| `Finance` | `Models/{Category,Transaction}`, `Actions/{Create,Update,Delete}{Category,Transaction}`, `Data/*`, `Enums/{TransactionType,PaymentMethod}`, `Policies/*`, `Queries/DashboardStats` | Cœur du futur « registre de flux », mais modélisé en comptabilité classique mutable. |
| `Sync` | `Concerns/Syncable`, `Models/ProcessedOperation` | Socle solide : UUID + SoftDeletes + version via séquence Postgres globale. Directement réutilisable. |

Aucun dossier `Catalog`, `Stock`, `Sales`, `Purchasing`, `Analytics` n'existe encore — cohérent
avec le statut « Phase 1 finance uniquement » documenté dans `CLAUDE.md`.

### 1.2 Modèles & migrations

| Table | PK | Syncable (UUID+soft delete+version) | Champs clés | Écart avec la cible |
|---|---|---|---|---|
| `organizations` | `id` bigint | non | `name` | Cible veut `uuid`, `currency`, `timezone`, `week_starts_on`. |
| `users` | `id` bigint | non | `organization_id` (1 org, pas de rôle) | Cible veut `organization_user` (pivot, rôle owner/manager/entry/viewer) à la place d'une FK directe. |
| `businesses` | `uuid` | oui | `organization_id`, `name`, `type` (texte libre), `color`, `currency`, `created_by` | Devient `projects` : il manque `model`, `status`, `started_on`, `description`, `settings` JSON. `type` texte libre ne correspond à rien côté cible. |
| `categories` | `uuid` | oui | `business_id`, `name`, `kind` (income/expense), `color`, `created_by` | Cible : `project_id` (renommage), `kind` doit inclure `investment`, + `archived_at` (aujourd'hui seul `deleted_at` via Syncable, pas d'archivage logique distinct). |
| `transactions` | `uuid` | oui | `business_id`, `category_id`, `type` (income/expense), `amount`, `payment_method`, `occurred_at`, `note`, `source_type`/`source_id`, `created_by` | Devient `entries` : **mutable aujourd'hui (update/delete existent)** — à bloquer. Il manque `batch_id`, `quantity`, `unit_price`, `unit`, `headcount_delta`, `headcount_reason`, `useful_life_months`, `recorded_at`, `device_id`, `reverses_entry_id`. `type` doit passer de income/expense à sale/expense/investment/owner_in/owner_out/headcount/production/note. `payment_method` n'existe pas dans la cible — hors scope métier demandé, à statuer (garder en option libre ou retirer). |
| `processed_operations` | `uuid` (`op_id`) | — | `user_id`, `result`, `processed_at` | Conforme à ADR 0004 ; prêt pour l'idempotence de `POST /api/sync/push` et, par extension, de `POST /entries`. Réutilisable tel quel. |
| `sync_version_seq` | séquence Postgres | — | — | Mécanisme global à conserver pour toutes les tables synchronisables futures (`projects`, `entries`, `batches`, `milestones`, …). |

Tables cible absentes : `organization_user`, `projects` (renommage de `businesses`), `batches`,
`entries` (renommage de `transactions`), `attachments`, `milestones`. Tables « plus tard »
(`resources`, `stock_movements`, etc.) : absentes, conforme — ne pas les créer maintenant.

### 1.3 Routes

- `routes/web.php` + `routes/businesses.php` + `routes/finance.php` : CRUD complet Inertia pour
  businesses/categories/transactions, y compris `PATCH`/`DELETE` sur les transactions — à
  reconstruire autour d'un historique append-only.
- **Aucun `routes/api.php`** et aucun dossier `app/Http/Api` : le squelette `api/v1` demandé en
  Phase 1 (Sanctum, `GET /projects`, `POST /entries` idempotent) est entièrement à créer, pas à
  adapter.

### 1.4 Pages Inertia & composants (`backend/resources/js`)

| Élément | Rôle actuel | Écart |
|---|---|---|
| `pages/businesses/{index,show}.tsx` | Liste des entreprises + détail (catégories + transactions paginées, édition/suppression inline) | À remodeler en `Projects/Create` (3 étapes) et `Projects/Show` (onglets Vue d'ensemble/Lots/Historique/Réglages). Les boutons « Modifier »/« Supprimer » sur les transactions doivent disparaître (immutabilité). |
| `pages/dashboard.tsx` | Carte par business avec revenus/dépenses/solde du mois courant | Proche de la cible « Vue d'ensemble » mais sans verdict, capital récupéré, trajectoire. |
| `components/{business,category,transaction}-form-dialog.tsx` | Formulaires modaux CRUD | La logique de formulaire adaptatif par type (vente qty×prix, investissement avec durée, poche, effectif, production, note) demandée pour « Noter un flux » n'existe pas encore — ces dialogs sont une base de départ, pas le composant final. |
| `components/app-sidebar.tsx` | Nav : Tableau de bord, Entreprises | À remplacer par la nav cible (Vue d'ensemble, Analyse, Ma poche, Historique, Tâches, Paramètres + liste de projets avec % capital récupéré). |
| `components/ui/*` | Set shadcn standard (Button, Card, Badge, Dialog, Select, Sheet, Sidebar, Tooltip, Toggle…) | Couvre déjà Button/Card/Badge/Dialog. Manquent `Stat`, `Tabs` (visible), `Switch`, `SegmentedControl`, et tout `components/charts/`. |
| `resources/css/app.css` | Thème shadcn par défaut (Instrument Sans, tokens oklch génériques) | Pas de police Geist/Geist Mono, pas de couleur primaire `#2563EB` imposée, pas de couleurs sémantiques positif/négatif/attention, pas de couleurs fixes par projet (ambre/rose/cyan/violet). À tout redéfinir dans `@theme`. |
| `pages/auth/register.tsx` | Formulaire d'inscription avec champ « Organization name » | Toujours en anglais brut (noté déjà dans `CLAUDE.md` comme dette Phase 4) ; à traduire en français avec le reste de l'UI. |

### 1.5 Tests

731 lignes de tests Pest répartis sur Business (policy, CRUD, show), Finance (category/transaction
actions, controllers, policies), Sync (`SyncableTest`), Identity (inscription + organisation), et
Dashboard. Bonne couverture de ce qui existe, mais :
- `TransactionActionsTest`/`TransactionControllerTest` testent explicitement `update`/`delete` sur
  les transactions → ces tests devront être **supprimés et remplacés** par des tests qui vérifient
  l'inverse (immutabilité + flux inverse), pas adaptés.
- `BusinessPolicyTest`/`CategoryPolicy`/`TransactionPolicyTest` testent uniquement l'isolation par
  organisation (pas de rôle) → à étendre pour owner/manager/entry/viewer.
- Aucun test sur l'API (normal, elle n'existe pas).

## 2. Modules de « gestion complète » à écarter

Recherche effectuée dans tout `backend/app`, `backend/resources/js`, `backend/routes`,
`backend/database/migrations` pour clients, commandes, factures, fournisseurs, entrepôts, stock,
catalogue : **aucun module de ce type n'a été trouvé**. Il n'y a rien à retirer ou isoler au sens
« code mort à supprimer ». Le starter kit Laravel/React standard (2FA, passkeys) a déjà été retiré
avant cette mission (noté dans `CLAUDE.md`).

En revanche, certains choix de modélisation de Phase 1 relèvent de l'esprit « comptabilité
d'entreprise classique » plutôt que « surveillance de petits projets » et devraient être
reconsidérés même s'ils ne sont pas des modules à part :
- `payment_method` (cash/mobile_money/bank/other) sur chaque transaction : absent du modèle cible
  (`entries`). À garder seulement si tu veux le conserver en champ libre optionnel ; sinon à
  retirer.
- `type` libre sur `businesses` (`'Épicerie'`, `'Restaurant'`, `'Salon de coiffure'` dans le
  seeder) : remplacé par l'enum fermé `model` (lots/herd/resale/simple) de la cible.
- Pagination serveur classique (25/page) sur les transactions : compatible avec un historique
  groupé par jour, pas un obstacle, mais le regroupement par jour demandé n'existe pas encore.

## 3. Recommandation par élément

Légende : **Garder** = aucun changement structurel · **Adapter/renommer** = même brique, nouveau
nom/colonnes/règles · **Créer** = n'existe pas encore · **Mettre de côté** = ne pas construire en
Phase 1 (déjà respecté).

| Élément | Décision | Détail |
|---|---|---|
| Structure `app/Domain/*` (Models/Actions/Data/Policies/Enums/Queries) | **Garder** | Correspond exactement à la cible (Services en plus à introduire si besoin). |
| Contrôleurs minces + Actions partagées (ADR 0001/0002) | **Garder** | Déjà le bon pattern ; l'API devra appeler les mêmes Actions. |
| `Syncable` (UUID, SoftDeletes, séquence globale) | **Garder**, avec un bémol | Le `SoftDeletes` qu'il apporte sert à la synchro (suppression visible au pull), mais la cible interdit toute suppression des `entries` elles-mêmes — il faudra soit ne pas utiliser `SoftDeletes`/`delete()` sur `Entry`, soit le garder uniquement pour un usage non prévu. À trancher à l'étape de conception des `entries`. |
| `App\Support\Money` | **Garder** | Conforme à ADR 0005 et aux règles « montants entiers ». |
| `Organization` / `User` (PK bigint, pas de rôle) | **Adapter** | Ajouter `organization_user` (rôle), envisager UUID sur `organizations` pour cohérence avec le reste du schéma synchronisable (à trancher : l'organisation elle-même n'est pas « synchronisée » par le mobile de la même façon que ses projets — à vérifier avant de migrer son PK). |
| `Business` (modèle, Action, Policy, migration) | **Adapter/renommer** → `Project` | Ajouter `model`, `status`, `started_on`, `description`, `settings` JSON ; retirer/retyper `type` ; migration de données obligatoire pour les lignes déjà seedées. |
| `Category` | **Adapter** | `business_id` → `project_id` ; `kind` étendu à `investment` ; ajouter `archived_at`. |
| `Transaction` | **Adapter en profondeur** → `Entry` | Nouveau jeu de types, nouvelles colonnes (quantité, prix unitaire, effectif, durée d'usage, `batch_id`, `recorded_at`, `device_id`, `reverses_entry_id`), **suppression des Actions `Update`/`Delete`** et blocage au niveau modèle + Policy. |
| `DashboardStats` (Queries/Finance) | **Adapter/déplacer** → `app/Domain/Analytics` | Bonne idée déjà présente (séparer lecture et écriture) ; à étendre pour calculer résultat cumulé, capital récupéré, verdict — jamais stocké. |
| `ProcessedOperation` / idempotence | **Garder** | Prêt à servir pour `POST /entries` dès que l'API existe. |
| `routes/businesses.php`, `routes/finance.php` (update/destroy sur transactions) | **Adapter/retirer** | Retirer les routes `PATCH`/`DELETE` transactions ; remplacer par une route « flux inverse ». Renommer les fichiers/routes projects/entries. |
| `app/Http/Api`, `routes/api.php` | **Créer** | Rien n'existe ; squelette Sanctum + `GET /projects` + `POST /entries` idempotent à construire en Phase 1 comme demandé. |
| Pages `businesses/index.tsx`, `businesses/show.tsx` | **Adapter/renommer** → `Projects/Create`, `Projects/Show` (onglets) | Réutiliser la structure Inertia/Form existante, retirer les actions d'édition/suppression sur les transactions. |
| `dashboard.tsx` | **Adapter** | Vers la « Vue d'ensemble » cible (bilan global, carte verdict/capital récupéré/trajectoire). |
| `app-sidebar.tsx` | **Adapter** | Nouvelle nav + liste dynamique des projets avec % capital récupéré. |
| `*-form-dialog.tsx` | **Adapter/remplacer** | Vers un composant « Noter un flux » unique, accessible globalement, à champs dynamiques par type. |
| `components/ui/*` existants (Button, Card, Badge, Dialog, Select, Sheet, Sidebar…) | **Garder** | Base shadcn correcte. |
| `components/ui/{stat,tabs-visible,switch,segmented-control}`, `components/charts/*` | **Créer** | N'existent pas. |
| `resources/css/app.css` (thème) | **Adapter** | Police Geist/Geist Mono, couleur primaire, couleurs sémantiques, couleurs fixes par projet. |
| `register.tsx` (champ organisation en anglais) | **Adapter** | Traduire en français, dette déjà identifiée dans `CLAUDE.md`. |
| Tests Business/Finance CRUD actuels | **Adapter** pour la plupart, **retirer** pour update/delete de transaction | Garder la structure de test (policy/action/controller séparés), mais les réécrire pour les nouvelles règles. |
| `DemoDataSeeder` | **Remplacer** | Nouveau seeder avec les chiffres fournis (poulets de chair, œufs) une fois les modèles `Project`/`Batch`/`Entry` en place. |
| ADRs existantes (0001–0005) | **Garder** | Toujours valables ; ajouter de nouvelles ADR pour : immutabilité du registre (règle 2), calcul vs stockage (règle 3), rôles par organisation (règle 5). |

## 4. Modules « plus tard » (Phase 3) — à ne pas construire maintenant

Conforme à la demande : aucune table `resources`, `stock_movements`, `recipes`, `recipe_lines`,
`care_steps`, `goals`, `milestone_metrics`, `tasks`, `reminders`, `time_entries`, `weighings`,
`devices` n'existe, et aucune ne doit être créée en Phase 1. Seul point d'attention : le champ
`source_type`/`source_id` déjà présent sur `transactions` ressemble à une préparation pour relier
un flux à une source polymorphe (ex. un mouvement de stock futur) — à documenter explicitement
comme réservé à la Phase 3 (« un achat mis en stock sera un flux expense + une entrée de stock »)
plutôt que supprimé, puisqu'il va dans le même sens que la cible à long terme.

## 5. Plan de migration étape par étape

Chaque étape = un commit, tests au vert, pas de perte de données (migration de données si une
table a déjà des lignes en environnement de développement/démo — `businesses`, `categories`,
`transactions` ont déjà des seeders donc des lignes en local).

1. **Comptes & rôles**
   - Créer `organization_user` (organization_id, user_id, role), migrer les lignes `users`
     existantes (`organization_id` + rôle `owner` par défaut) sans supprimer `users.organization_id`
     tout de suite (double écriture transitoire) ou le retirer dans la même migration si aucune
     dépendance restante.
   - Risque : toutes les Policies actuelles comparent `user->organization_id` directement ; il
     faudra les faire pointer vers l'appartenance via `organization_user` sans casser l'isolation
     testée (`BusinessPolicyTest`, `CategoryPolicyTest`, `TransactionPolicyTest`).

2. **Renommage `Business` → `Project`**
   - Migration : renommer la table `businesses` → `projects`, ajouter `model`, `status`,
     `started_on`, `description`, `settings` JSON avec valeurs par défaut pour les lignes
     existantes (`model = 'simple'`, `status = 'active'`).
   - Renommer domaine `App\Domain\Business` → `App\Domain\Project` (ou l'intégrer dans un domaine
     plus large) ; mettre à jour toutes les références (`Category`, `Transaction`,
     `DashboardStats`, policies, routes, pages, factories).
   - Risque : beaucoup de références croisées (Business apparaît dans Finance, Sync docblocks,
     factories, tests, pages Inertia) — à faire en un seul commit cohérent plutôt qu'en plusieurs
     demi-mesures, sous peine de casser les types générés (`php artisan typescript:transform`,
     wayfinder) entre deux commits.

3. **`Category` : `business_id` → `project_id`, `kind` + `investment`, `archived_at`**
   - Migration de renommage de colonne + nouvelle valeur d'enum + nouvelle colonne nullable.
   - Risque faible, mais `TransactionType` (renommé probablement `EntryType` ou split en
     `CategoryKind`/`EntryType`) est partagé entre `categories.kind` et le futur `entries.type` —
     bien découpler les deux enums puisque leurs valeurs divergent dans la cible (`kind` garde
     income/expense/investment, `type` a sale/expense/investment/owner_in/owner_out/headcount/
     production/note).

4. **`Transaction` → `Entry` : immuabilité + nouveau schéma (étape la plus risquée)**
   - Ajouter les colonnes cible (`batch_id` nullable en attendant l'étape 5, `quantity`,
     `unit_price`, `unit`, `headcount_delta`, `headcount_reason`, `useful_life_months`,
     `recorded_at`, `device_id`, `reverses_entry_id`), migrer les lignes existantes
     (`type: income/expense` → `type: sale/expense` au mieux, `recorded_at = created_at`).
   - Retirer `UpdateTransaction`/`DeleteTransaction` (Actions), les routes `PATCH`/`DELETE`
     correspondantes, et les boutons « Modifier »/« Supprimer » dans `businesses/show.tsx`.
   - Bloquer `update`/`delete` au niveau modèle (ex. lever une exception dans un hook Eloquent) et
     dans la Policy (`update`/`delete` retournent toujours `false`) ; tester explicitement qu'une
     tentative d'update/delete échoue.
   - Ajouter l'Action `ReverseEntry` (flux inverse).
   - Risque principal : `payment_method` n'a pas d'équivalent cible — décider avant de migrer si on
     le garde (champ optionnel) ou on le supprime (perte d'info sur les lignes existantes si
     supprimé — à couvrir par la règle « pas de perte de données » : si supprimé, exporter/archiver
     plutôt que `DROP COLUMN` sans recours, ou le garder nullable sans l'exposer dans l'UI).
   - Risque secondaire : la pagination/affichage par jour de l'historique n'existe pas — prévoir
     un `GROUP BY DATE(occurred_at)` côté requête, pas côté stockage.

5. **`Batch` (lots), `Milestone` (jalons), `Attachment`**
   - Nouvelles tables, aucune migration de données nécessaire (rien n'existe aujourd'hui).
   - Brancher `entries.batch_id` une fois `batches` créée.
   - Risque faible, mais dépend que l'étape 4 soit stable (schéma `entries` figé) avant d'ajouter
     la FK.

6. **Analytics (résultat cumulé, capital récupéré, verdict, ma poche, lots, troupeau)**
   - Déplacer/étendre `DashboardStats` vers `App\Domain\Analytics\Services\*`, un service par
     concept (`ProjectVerdict`, `PocketSummary`, `BatchStats`, `HerdStats`).
   - Risque : s'assurer qu'aucun champ calculé n'est stocké (règle 3) — revue de code dédiée sur ce
     point avant de merger.

7. **Front : nav, thème, « Noter un flux », Vue d'ensemble, Lots, Troupeau, Ma poche, Historique**
   - Une fois le backend stable, reconstruire les pages/composants listés en section 3. Découper en
     plusieurs commits (thème d'abord, puis nav, puis chaque page) pour garder les tests/CI verts à
     chaque étape (y compris `npm run check`, `npm run types:check`).

8. **Squelette API `api/v1`**
   - `app/Http/Api/Controllers`, `routes/api.php`, Sanctum tokens, `GET /projects`,
     `POST /entries` idempotent via `processed_operations` (même mécanisme qu'ADR 0004, appliqué
     ici à une écriture simple plutôt qu'à un push/pull complet).
   - Risque faible si les étapes 1–6 sont terminées : l'API ne fait qu'appeler les Actions déjà
     testées.

9. **Seeder & tests de bout en bout**
   - Remplacer `DemoDataSeeder` par les données fournies (poulets de chair, œufs) et écrire les
     tests de calcul (résultat cumulé, capital récupéré, taux de ponte, immutabilité, flux inverse,
     apport neutre sur le résultat, idempotence UUID, rôle `entry` sans accès à Ma poche).

10. **Mise à jour finale de `CLAUDE.md`**
    - Documenter les nouvelles conventions (domaines renommés, immutabilité des `entries`, rôles,
      calculs non stockés, conventions front) une fois tout validé et stable.

### Risques transverses à garder en tête à chaque étape

- **Wayfinder** : `wayfinder:generate` strips les helpers `.form()` existants si lancé sans
  `--with-form` (déjà noté comme piège connu) — à surveiller à chaque renommage de contrôleur.
- **Types générés** : `php artisan typescript:transform` doit être relancé après chaque changement
  de DTO (`Data/*`), sous peine de types TS obsolètes dans `resources/js/types/generated` et
  `packages/shared-types`.
- **Tests Pest** : nécessitent Postgres (`docker compose up -d`) — à vérifier avant chaque run,
  surtout après les migrations de renommage de table (étapes 2–4) qui sont les plus sensibles au
  rollback en cas d'échec.
- **Vite manifest** : tout test HTTP qui rend une page Inertia renommée/nouvelle nécessite
  `npm run build` au préalable (déjà noté comme piège connu).
