# Kabin Financial

Landing page statique et démonstration fonctionnelle pour le financement de véhicules blindés.

## Lancer localement

```sh
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Démonstration fonctionnelle

La démo est disponible dans `demo.html` et représente le futur flux Kabin:

- sélection d'une unité fictive de démonstration;
- configuration de blindage;
- calcul côté serveur par `POST /api/simulate`;
- préparation d'un événement `Pulse CRM` et d'un résumé `Olivia AI v3.5` par `POST /api/lead`.

Les deux endpoints ne persistent volontairement aucune donnée et n'appellent ni le CRM ni Olivia. Les fixtures sont fictives: les VIN, l'inventaire et les règles commerciales réelles restent dans le backend de production sur le VPS.

Le serveur calcule la mensualité pour la simulation et la recalcule lors de l'envoi du lead. Le navigateur affiche uniquement les résultats renvoyés par l'API.

## Vérification et preview Vercel (`dev`)

Le serveur Python sert les pages statiques uniquement. Pour tester aussi les API, utiliser `vercel dev`.

```sh
node --test tests/demo-api.test.mjs
vercel pull --yes --environment=preview --git-branch=dev
vercel build
vercel deploy --yes --target=preview
```

Vercel détecte automatiquement le runtime Node des fonctions `.mjs`; sa version est définie par le projet. Ne pas utiliser `nodejs22.x` dans `functions.runtime`, qui attend un runtime personnalisé versionné.

`.vercelignore` limite les fichiers envoyés aux pages, aux images explicitement autorisées et aux trois modules API de démonstration. Ne jamais ajouter d'inventaire Excel, de VIN, de numéro de série ni de données commerciales réelles à cette liste.
