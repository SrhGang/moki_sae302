# Documentation Technique Backend - Moki

## Vue d'ensemble

API REST et serveur Socket.io pour application de messagerie temps réel développée en TypeScript avec Node.js, Express et MongoDB.

## Architecture

```
backend/
├── config/           # Configuration (CORS, DB)
├── controllers/      # Logique métier
├── middleware/       # Middlewares d'authentification
├── models/          # Modèles MongoDB
├── routes/          # Routes API REST
├── socket/          # Gestionnaires Socket.io
├── utilis/          # Utilitaires
└── server.ts        # Point d'entrée
```

## Installation et démarrage

```bash
npm install
npm run dev    # Développement avec watch
npm start      # Production
```

### Variables d'environnement (.env)
```env
MONGODB_URI=mongodb://localhost:27017/moki
JWT_SECRET=mon_jwt_secret_key
JWT_REFRESH_SECRET=mon_refresh_secret_key
PORT=3000
```

## API REST Endpoints

### Authentification
- `POST /api/signup` - Inscription utilisateur
- `POST /api/login` - Connexion utilisateur  
- `POST /api/logout` - Déconnexion utilisateur
- `POST /api/refresh` - Renouvellement token JWT

### Utilisateurs
- `GET /api/protect/user` - Informations utilisateur (protégé)
- `POST /api/avatar` - Upload avatar utilisateur

### Messages
- **Migré vers WebSocket** - Voir section Socket.io

## Modèles de données

### User Model
```typescript
interface IUser {
    uid: string;           // ID unique généré (u + 8 chars hex)
    username: string;      // Nom utilisateur (unique)
    password: string;      // Hash bcrypt
    profilePicture: string; // URL avatar
    refreshToken?: string; // Token refresh
    createdAt: Date;
    lastActive: Date;
}
```

### Message Model
```typescript
interface IMessage {
    sender: string;       // UID expéditeur
    recipient: string;    // UID destinataire
    content: string;      // Contenu message
    timestamp: Date;      // Horodatage
}
```

## Socket.io - Temps réel

### Événements serveur
- `connection` - Nouvelle connexion
- `disconnect` - Déconnexion
- `send_message` - Envoyer message (avec JWT)
- `get_messages` - Récupérer historique messages
- `receive_message` - Recevoir nouveau message
- `message_sent` - Confirmation envoi
- `message_error` - Erreur envoi
- `messages_retrieved` - Historique récupéré
- `messages_error` - Erreur récupération

### Authentification WebSocket
Chaque événement message nécessite un token JWT :
```typescript
socket.emit('send_message', {
    recipient: 'username',
    content: 'message',
    token: 'jwt_access_token'
});
```

### Envoi de message WebSocket
```typescript
// Client émet
socket.emit('send_message', {
    recipient: 'destinataire',
    content: 'contenu',
    token: 'jwt_token'
});

// Serveur répond
socket.on('message_sent', (data) => {
    // { success: true, messageId: '...', timestamp: '...' }
});

socket.on('message_error', (data) => {
    // { error: 'Message d\'erreur' }
});
```

### Réception de message
```typescript
socket.on('receive_message', (data) => {
    // { sender: '...', content: '...', timestamp: '...', messageId: '...' }
});
```

### Récupération historique
```typescript
// Client émet
socket.emit('get_messages', {
    otherUser: 'autre_utilisateur',
    token: 'jwt_token'
});

// Serveur répond
socket.on('messages_retrieved', (data) => {
    // { messages: [...] }
});
```

### Gestionnaires
- **userHandlers.ts** - Gestion utilisateurs connectés
- **messageHandlers.ts** - Messages temps réel avec auth JWT

## Sécurité

### JWT Authentication
- **Access Token** : 15 minutes
- **Refresh Token** : 7 jours
- Middleware auth sur routes `/api/protect/*`

### Hachage mots de passe
```typescript
// bcryptjs avec salt rounds = 10
const hashedPassword = await bcrypt.hash(password, 10);
```

### CORS
Configuration restrictive pour production dans `config/cors.ts`

## Base de données MongoDB

### Collections

#### users
```javascript
{
  uid: "u12ab34cd",      // Généré automatiquement
  username: "Nath",   // Index unique
  password: "$2b$10...",  // Hash bcrypt
  profilePicture: "avatar.jpg",
  refreshToken: "jwt_token",
  createdAt: ISODate,
  lastActive: ISODate
}
```

#### messages
```javascript
{
  sender: "u12ab34cd",
  recipient: "u56ef78gh", 
  content: "Tu vas bien ?",
  timestamp: ISODate
}
```

### Connexion DB
```typescript
// config/db.ts
mongoose.connect(process.env.MONGODB_URI!)
```

## Structure des controllers

### authController.ts
- `signup` - Création compte utilisateur
- `login` - Authentification utilisateur
- `logout` - Invalidation refresh token

### tokenController.ts
- `refreshToken` - Génération nouveau access token

### messageController.ts
- **Déprécié** - Logique migrée vers WebSocket (messageHandlers.ts)

### avatarController.ts
- `uploadAvatar` - Upload et sauvegarde avatar

## Middleware d'authentification

```typescript
// middleware/auth.ts
export const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    // Vérification JWT et ajout user à req
}
```

## Gestion des utilisateurs connectés

```typescript
// utilis/connectedUsers.ts
export const connectedUsers = new Map<string, string>();
// Mapping socketId -> userId
```

## Scripts package.json

```json
{
  "scripts": {
    "start": "ts-node server.ts",
    "dev": "ts-node --watch server.ts"
  }
}
```

## Dépendances principales

### Production
- `express` - Framework web
- `socket.io` - Communication temps réel
- `mongoose` - ODM MongoDB
- `jsonwebtoken` - Authentification JWT
- `bcryptjs` - Hachage mots de passe
- `cors` - Gestion CORS
- `dotenv` - Variables environnement

### Développement
- `typescript` - Typage statique
- `ts-node` - Exécution TypeScript
- `@types/*` - Définitions types

## Gestion d'erreurs

### Codes de réponse HTTP (API REST)
- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès refusé
- `404` - Non trouvé
- `500` - Erreur serveur

### Format réponses d'erreur HTTP
```json
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

### Gestion d'erreurs WebSocket
```typescript
// Erreurs messages
socket.on('message_error', (data) => {
    // { error: 'Token manquant' }
    // { error: 'Destinataire et contenu requis' }
    // { error: 'Erreur serveur' }
});

socket.on('messages_error', (data) => {
    // { error: 'Token manquant' }
    // { error: 'Erreur serveur' }
});
```

## Logs et debugging

### Console logs
- Connexions Socket.io
- Erreurs base de données
- Authentification utilisateurs
- Démarrage serveur

### Monitoring
- Utilisateurs connectés en temps réel
- Messages échangés
- Erreurs d'authentification

---

*Documentation Backend v1.0.0*