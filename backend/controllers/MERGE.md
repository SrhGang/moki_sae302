# Guide de Gestion des Branches Backend

Ce guide explique comment gérer correctement les modifications du backend tout en travaillant dans un projet contenant également du frontend.

## Commandes pour merger uniquement le dossier backend

Pour merger le dossier backend d'une branche vers main :

```bash
# 1. Aller sur la branche main
git checkout main

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Copier uniquement le dossier backend depuis l'autre branche
git checkout backend -- backend/

# 4. Ajouter et commiter les changements
git add backend/
git commit -m "Merge du dossier backend depuis la branche backend"

# 5. Pousser les changements
git push origin main

# Version en une seule ligne
git checkout main; git pull origin main; git checkout backend -- backend/; git add backend/; git commit -m "Merge du dossier backend depuis la branche backend"; git push origin main
```

## Travailler sur le backend avec des modifications frontend locales

### Mettre de côté les modifications frontend
```bash
# Stocker temporairement les modifications frontend
git stash push frontend/
```

### Créer une nouvelle branche pour les modifications backend
```bash
# Créer et basculer sur une nouvelle branche
git checkout -b backend-updates
```

### Commiter les modifications backend
```bash
# Ajouter uniquement les fichiers du backend
git add backend/
git commit -m "Mise à jour du backend : <description>"

# Pousser les modifications
git push origin backend-updates
```

### Merger les modifications dans main
```bash
git checkout main
git pull origin main
git checkout backend-updates -- backend/
git add backend/
git commit -m "Merge des mises à jour backend"
git push origin main
```

### Récupérer les modifications frontend mises de côté
```bash
git stash pop
```

## Commandes utiles

### Vérifier l'état des fichiers
```bash
git status
```

### Retirer des fichiers frontend ajoutés par erreur
```bash
git reset frontend/
```

## Points importants à retenir

1. Toujours utiliser `git add backend/` spécifiquement
2. Ne jamais inclure les fichiers du frontend dans vos commits
3. Vérifier les fichiers à commiter avec `git status` avant chaque commit
4. En cas d'erreur d'ajout de fichiers frontend, utiliser `git reset frontend/`

Ces pratiques vous permettront de :
- Maintenir une séparation claire entre le code frontend et backend
- Éviter les commits accidentels de code frontend
- Garder un historique de versions propre pour le backend