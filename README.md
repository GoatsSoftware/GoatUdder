# Projet DevOps : GoatUdder

## Objectif

Développer une plateforme web minimaliste de location de pis de chèvres.
L’utilisateur peut louer un ou plusieurs pis pour une durée limitée et obtenir du lait de chèvre selon un modèle de location simple.

---

## Fonctionnel

### Règles de location

- Durée de location entre 1 et 7 jours
- Location de 1 à 4 pis simultanément
- Possibilité de louer des pis individuellement ou en lot
- Tarif fixe : 10€ par jour et par pis

### Interface utilisateur

- Interface web simple
- Consultation des chèvres disponibles
- Création et suivi des locations en cours

---

## Architecture globale

Le système est composé de plusieurs services indépendants :

### Service 1 : Goat Service

Responsable de la gestion des chèvres disponibles à la location.

Fonctions :

- Liste des chèvres
- Détail d’une chèvre (nom, description, état, disponibilité)
- Gestion des données de base liées aux chèvres

---

### Service 2 : Rental Service

Responsable de la gestion des locations.

Fonctions :

- Création d’une location
- Association des chèvres à une location
- Gestion de la durée de location
- Suivi des locations actives et terminées

---

### Service 3 : Frontend Web

Interface utilisateur minimaliste.

Fonctions :

- Affichage des chèvres disponibles
- Formulaire de location
- Visualisation des locations en cours

---

### Service 4 : Base de données

- PostgreSQL
- Port : 3444
- Stockage des chèvres et des locations
- Username : "postgres"
- Password : "password"
- Database : "goatudder"

---

## Architecture logicielle

Chaque backend respecte une architecture en couches :

- Controller (API Web)
- Service (logique métier)
- Data (accès base de données)

---

## Exigences DevOps

### Gestion du code

- Dépôt Git unique
- Historique structuré des commits
- Branching simple (main + feature branches)

---

### Conteneurisation

- Docker pour chaque service backend
- Docker Compose pour orchestration locale

---

### CI (Continuous Integration)

Pipeline obligatoire :

- Build des services
- Lancement des tests
- Analyse de qualité du code
- Vérification de couverture de tests

Les build se font par github actions, avec des étapes claires et des notifications en cas d’échec.
Ils utilisent le runner "github-runner-scale-set-goatsoft-udder"

---

## Qualité logicielle

### Tests obligatoires

- Tests unitaires sur la couche service
- Tests des controllers avec mocks HTTP
- Tests d’intégration sur les repositories

---

### Objectifs de qualité

- Couverture de code élevée
- Séparation stricte des responsabilités
- Code maintenable et testable
- Le texte affiché est en francais, mais les noms de classes et de méthodes sont en anglais pour respecter les conventions de nommage.

## Code utilisé

Le frontend est développé en html, css et javascript
Les backend sont développé en nodejs

## Authentification

Pas d'authentification ni de gestion de comptes utilisateurs pour ce projet, afin de se concentrer sur les aspects DevOps et la gestion des locations. On peut louer des chèvres sans créer de compte, et les locations sont gérées de manière anonyme.
