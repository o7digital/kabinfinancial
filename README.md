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
