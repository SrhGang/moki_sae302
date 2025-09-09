const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('ChatAppDB.db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const uniqid = require('uniqid');
function generateUniqueId() {
    let id = '';
    for(let i = 0; i < 15; i++) {
        id += Math.floor(Math.random() * 10);
    }
    return 'u'+id;
}
const bcrypt = require('bcryptjs');
const request = require('request');
const { toASCII } = require('punycode');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { log } = require('console');
const secretKey = process.env.SECRET_KEY || 'defaultSecretKey';
const moment = require('moment');
const now = moment();
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App API',
            version: '1.0.0',
            description: 'Documentation pour Chat App API',
        },
    },
    apis: ['./api.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.get('/swagger-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Inscription de l'utilisateur.
 *     description: Permet à un utilisateur de s'inscrire avec un nom d'utilisateur et un mot de passe.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Succès. L'utilisateur à bien été inscrit.
 *       400:
 *         description: Erreur. Le nom d'utilisateur existe déjà.
 *       500:
 *         description: Une erreur est survenue.
 */
app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const uniqueId = generateUniqueId();
    console.log('API - UniqueId généré : ', uniqueId);
    console.log('Formulaire d\'inscritpion reçu : ', req.body );
    db.get(`SELECT * FROM Utilisateurs WHERE username = ?`, [username], async (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        if (row) {
            res.status(400).send('Le nom d\'utilisateur existe déjà');
        } else {
            console.log('Début de l\'inscrition');
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                db.run(`INSERT INTO Utilisateurs(username, password, unique_id) VALUES(?, ?, ?)`, [username, hashedPassword, uniqueId], function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    // Obtenir le dernier id inserer
                    console.log(`Une ligne a été insérée avec rowid ${this.lastID}`);
                    console.log('success! redirection dans /login');
                    return res.status(200).json({
                        status: 'success',
                    });
                });
            } catch (error) {
                res.status(500).send('Une erreur est survenue');
            }
        }
    });
});

app.use((req, res, next) => {
    const url = req.originalUrl;
    if (url !== '/login') {
        console.log('Nouvelle requête reçue:', url);
    }
    next();
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification de l'utilisateur.
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Succès. L'utilisateur est authentifié avec succès.
 *       400:
 *         description: Erreur. Nom d'utilisateur introuvable ou mot de passe incorrect.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.get(`SELECT * FROM Utilisateurs WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            return res.status(500).send('Une erreur est survenue lors de la connexion.');
        }
        if (!user) {
            return res.status(400).send('Nom d\'utilisateur introuvable');
        }

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const token = jwt.sign({ unique_id: user.unique_id }, secretKey, { expiresIn: '5h' });
                res.status(200).json({
                    status: 'success',
                    message: 'Vous êtes connecté',
                    token: token,
                });
            } else {
                res.status(400).send('Mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur lors de la comparaison des mots de passe:', error);
            res.status(500).send('Une erreur est survenue lors de la connexion.');
        }
    });
});

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Vérifier le token du dashboard.
 *     description: Permet de vérifier le token de l'utilisateur connecté pour qu'il puisse aller au dashboard.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification de l'utilisateur.
 *     responses:
 *       200:
 *         description: Succès. Le token est bon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Succès.
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: Tu es connecté.
 *                 unique_id:
 *                   type: string
 *                   description: L'identifiant unique de l'utilisateur.
 *       401:
 *         description: Erreur. L'en-tête d'autorisation est manquant ou invalide.
 *       404:
 *         description: Erreur. Le token est invalide.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.get('/dashboard', (req, res) => {
    // Vérification de l'en-tête d'autorisation
    if (!req.headers['authorization']) {
        console.log("En-tête d'autorisation manquant");
        return res.status(401).json({
            status: 'error',
            message: 'En-tête d\'autorisation manquant',
            token: req.headers
        });
    }

    // Extraction du token
    const token = req.headers['authorization'].split(' ')[1];

    try {
        // Décodage du token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, secretKey);
            // console.log('API - decodedToken trouver : ', decodedToken);
        } catch (err) {
            console.log('API -  Token invalide');
            throw new Error('Token invalide');
        }

        // Préparation de la réponse
        const data = {
            status: 'success',
            message: 'Tu es connecté',
            unique_id: decodedToken.unique_id
        }

        // Envoi de la réponse
        res.status(200).json(data);
    } catch (err) {
        // Gestion des erreurs
        res.status(500).send({
            status: 'error',
            message: err.message
        });
    }
});

app.get('/avatars', (req, res) => {
    db.all(`SELECT * FROM Avatars WHERE type='utilisateur'`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        // Convertir les images BLOB en format base64
        const avatars = rows.map(row => {
            return {
                ...row,
                image: row.image.toString('base64')
            };
        });
        res.json(avatars);
    });
});

/**
 * @swagger
 * /user-avatar:
 *   get:
 *     summary: Obtenir l'avatar de l'utilisateur.
 *     description: Permet d'obtenir l'avatar de l'utilisateur connecté avec son unique_id stocké dans les cookies.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification de l'utilisateur.
 *     responses:
 *       200:
 *         description: Succès. L'avatar de l'utilisateur est renvoyé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Indique le statut de la réponse.
 *                   example: success
 *                 id:
 *                   type: integer
 *                   description: L'ID de l'utilisateur.
 *                 unique_id:
 *                   type: string
 *                   description: L'identifiant unique de l'utilisateur.
 *                 avatar_id:
 *                   type: integer
 *                   description: L'ID de l'avatar de l'utilisateur.
 *                 avatar:
 *                   type: string
 *                   description: L'image de l'avatar en format base64.
 *                   example: "data:image/png;base64"
 *                 username:
 *                   type: string
 *                   description: Le nom d'utilisateur.
 *       401:
 *         description: Erreur. L'en-tête d'autorisation est manquant ou invalide.
 *       404:
 *         description: Erreur. Aucun avatar trouvé pour l'utilisateur.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.get('/user-avatar', (req, res) => {
    if (!req.headers['authorization']) {
        console.log("En-tête d'autorisation manquant");
        return res.status(401).json({
            status: 'error',
            message: 'En-tête d\'autorisation manquant',
            token: req.headers
        });
    }
    // console.log('API - req.headers[\'authorization\'] : ', req.headers['authorization']);
    const token = req.headers['authorization'].split(' ')[1];

    // console.log('API - Token reçu pour vérifier l\'avatar : ', token);
    try {
        const decodedToken = jwt.verify(token, secretKey);
        const uniqueId = decodedToken.unique_id;
        // console.log('API - Début de la recherche de l\'avatar dans /user-avatar.');
        // console.log('API - Chercher l\'avatar pour l\'utilisateur : ', uniqueId);

        // Utilisez une requête SQL pour récupérer l'avatar_id et le username de l'utilisateur
        db.get(`SELECT id, avatar_id, username FROM Utilisateurs WHERE unique_id=?`, [uniqueId], (err, row) => {
            if (err) {
                console.log('Erreur lors de la récupération de l\'avatar_id et du username de l\'utilisateur : ', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Erreur interne du serveur'
                });
            }

            if (!row || !row.avatar_id) {
                // L'utilisateur n'a pas d'avatar ou de username, renvoyer une réponse appropriée
                return res.status(404).json({
                    status: 'error',
                    message: 'Information manquante pour l\'utilisateur'
                });
            }

            const avatarId = row.avatar_id;
            const userId = row.id;
            const username = row.username;

            // console.log('API - Voici le résultat de la requete sql : ', row);

            // Utilisez une autre requête SQL pour récupérer l'image de l'avatar
            db.get(`SELECT * FROM Avatars WHERE id=?`, [avatarId], (err, avatar) => {
                if (err) {
                    console.log('Erreur lors de la récupération de l\'avatar : ', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Erreur interne du serveur'
                    });
                }

                if (!avatar) {
                    // L'avatar n'a pas été trouvé, informer app.js qu'il n'y a pas d'avatar
                    return res.status(404).json({
                        status: 'error',
                        message: 'L\'utilisateur n\'a pas d\'avatar'
                    });
                }

                // Convertir l'image BLOB en format base64
                const base64Image = avatar.image.toString('base64');
                // Ajouter l'avatar et le nom d'utilisateur à l'objet utilisateur
                const userWithAvatarAndUsername = {
                    status: "success",
                    search: false,
                    id: userId,
                    unique_id: uniqueId,
                    avatar_id: avatarId,
                    avatar: base64Image,
                    username: username,
                };

                res.json(userWithAvatarAndUsername);
            });
        });

    } catch (err) {
        console.log('Erreur dans l\'API ', err);
        console.error(err);
        res.status(400).json({
            status: 'error',
            message: 'Token invalide ou expiré'
        });
    }
});

app.post('/update-avatar', (req, res) => {
    const avatarId = req.body.avatarId;
    const token = req.body.token;
    console.log('API - Utilisateur à choisi l\'avatar : ', avatarId);
    // console.log('API - Token reçu pour vérifier l\'avatar : ', token);

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Token non fourni'
        });
    }

    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Token invalide ou expiré'
            });
        }
        const uniqueId = decodedToken.unique_id;
        console.log('API - Chercher l\'avatar dans /update-avatar pour l\'utilisateur : ', uniqueId);

        // Mettez à jour l'avatar de l'utilisateur dans la base de données
        db.run(`UPDATE Utilisateurs SET avatar_id = ? WHERE unique_id = ?`, [avatarId, uniqueId], (err) => {
            if (err) {
                console.error(err.message);
                console.log('Erreur de la mise à jour de l\'avatar : ', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Erreur lors de la mise à jour de l\'avatar'
                });
            }
            console.log('API - Avatar mis à jour avec succès pour : ', uniqueId + 'pour l\'avatar_id : ' + avatarId);
            return res.status(200).json({
                status: 'success',
                message: 'Avatar mis à jour avec succès'
            });
        });
    });
});

app.get('/search', function(req, res) {
    let name = req.query.name;
    let type = req.query.type; // 'utilisateur' ou 'groupe'
    try {
        let query = `SELECT Utilisateurs.username, Utilisateurs.unique_id, Avatars.image FROM Utilisateurs 
            LEFT JOIN Avatars ON Utilisateurs.avatar_id = Avatars.id 
            WHERE Utilisateurs.username LIKE ?`;

        db.all(query, [`${name}%`], (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send('Une erreur s\'est produite lors de la recherche');
            } else {
                if (!rows || rows.length === 0) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Aucun utilisateur trouvé'
                    });
                }

                const searchResults = rows.map(row => {
                    const base64Image = row.image ? row.image.toString('base64') : null;
                    return {
                        avatar: base64Image,
                        username: row.username,
                        unique_id: row.unique_id,
                    };
                });                

                const searchData = {
                    status: "success",
                    message: 'Utilisateur(s) trouvé(s)',
                    search: true,
                    users: searchResults,
                };
                res.status(200).json(searchData);
            }
        });
    } catch (error) {
        console.error('API - Erreur lors de la recherche', error);
    }
});

app.post('/start-conversation', function(req, res) {
    const uniqueId = req.query.uniqueId;
    // const token = req.headers['authorization'].split(' ')[1];
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        console.log("En-tête d'autorisation manquant");
        return res.status(401).json({ status: 'error', message: 'Token non fourni' });
    }

    let decodedToken;
    try {
        // const decodedToken = jwt.verify(token, secretKey);
        // const currentUserId = decodedToken.unique_id;

        decodedToken = jwt.verify(token, secretKey);
        const currentUserId = decodedToken.unique_id;

        // Vérifiez si une conversation existe déjà entre les deux utilisateurs
        let query = `SELECT id FROM Conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`;
        db.get(query, [currentUserId, uniqueId, uniqueId, currentUserId], (err, row) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'existence de la conversation :', err);
                return res.status(500).json({ status: 'error', message: 'Une erreur s\'est produite lors de la vérification de l\'existence de la conversation' });
            }

            if (row) {
                // Une conversation existe déjà, renvoyez simplement son id
                res.json({ uniqueId: row.id });
            } else {
                // Aucune conversation n'existe, créez-en une nouvelle
                let insertQuery = `INSERT INTO Conversations (user1_id, user2_id) VALUES (?, ?)`;
                db.run(insertQuery, [currentUserId, uniqueId], function(err) {
                    if (err) {
                        console.error('Erreur lors de la création de la conversation :', err);
                        return res.status(500).json({ status: 'error', message: 'Une erreur s\'est produite lors de la création de la conversation' });
                    }
                    // Renvoyez l'id de la nouvelle conversation
                    res.json({ uniqueId: this.lastID });
                });
            }
        });
    } catch (err) {
        console.error('Erreur lors de la vérification du token:', err);
        return res.status(401).json({ status: 'error', message: 'Token invalide ou expiré' });
    }
});

app.get('/conversation', function(req, res) {
    const uniqueId = req.query.uniqueId;
    // console.log('API - Requete reçu de /conversation : ', req.query);
    try {
        const currentUserId = uniqueId;
        

        let query = `SELECT * FROM Conversations WHERE user1_id = ? OR user2_id = ?`;
        db.all(query, [currentUserId, currentUserId], (err, conversations) => {
            if (err) {
                console.error('Erreur lors de la récupération des conversations :', err);
                return res.status(500).json({ status: 'error', message: 'Une erreur s\'est produite lors de la récupération des conversations' });
            }

            if (conversations.length === 0) {
                return res.json({ status: 'success', message: 'Aucune conversation trouvée', conversationData: {} });
            }

            let conversationData = {};

            conversations.forEach((conversation, index) => {
                let messagesQuery = `SELECT * FROM Messages WHERE conversation_id = ?`;
                db.all(messagesQuery, [conversation.id], (err, messages) => {
                    if (err) {
                        console.error('Erreur lors de la récupération des messages de la conversation :', err);
                        return res.status(500).json({ status: 'error', message: 'Une erreur s\'est produite lors de la récupération des messages de la conversation' });
                    }

                    let otherUserId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;
                    // console.log('API - Qui est otherUserId ? ', otherUserId);
                    let userQuery = `SELECT Utilisateurs.id, Utilisateurs.username, Utilisateurs.avatar_id, Utilisateurs.unique_id, Avatars.image FROM Utilisateurs LEFT JOIN Avatars ON Utilisateurs.avatar_id = Avatars.id WHERE Utilisateurs.unique_id = ?`;
                    db.get(userQuery, [otherUserId], (err, user) => {
                        if (err) {
                            console.error('Erreur lors de la récupération des informations de l\'utilisateur :', err);
                            return res.status(500).json({ status: 'error', message: 'Une erreur s\'est produite lors de la récupération des informations de l\'utilisateur' });
                        }

                        // Convertir l'image en une chaîne Base64 si elle existe
                        if (user.image) {
                            user.image = user.image.toString('base64');
                        }

                        conversationData[user.unique_id] = { user: user, messages: messages };
                        // console.log('API - les données de conversation à conversationData : ', conversationData);

                        if (index === conversations.length - 1) {
                            res.json({ status: 'success', conversationData: conversationData });
                            // console.log('API -  Données de conversation à envoyé au Serveur Web : ', conversationData);
                        }
                    });
                });
            });
        });

    } catch (err) {
        console.log('API -  Token invalide');
        return res.status(500).json({ status: 'error', message: 'Token invalide' });
    }
});

app.get('/show-conversation/:uniqueId', function(req, res) {
    let uniqueId = req.params.uniqueId;
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    if (!token) {
        console.log("En-tête d'autorisation manquant");
        return res.status(401).json({ status: 'error', message: 'Token non fourni' });
    }
    try {
        decodedToken = jwt.verify(token, secretKey);
        const currentUserId = decodedToken.unique_id;

        let sqlMessages = `SELECT Messages.contenu, Messages.created_at, Utilisateurs.username
                FROM Messages
                JOIN Conversations ON Messages.conversation_id = Conversations.id
                JOIN Utilisateurs ON Messages.utilisateur_id = Utilisateurs.unique_id
                WHERE ((Conversations.user1_id = ? AND Conversations.user2_id = ?)
                OR (Conversations.user1_id = ? AND Conversations.user2_id = ?))
                ORDER BY Messages.created_at DESC`;

        db.all(sqlMessages, [uniqueId, currentUserId, currentUserId, uniqueId], (err, rows) => {
            if (err) {
                throw err;
            }

            let sqlUsernamesAndAvatar = `SELECT Utilisateurs.username, Utilisateurs.unique_id, Avatars.image 
                FROM Utilisateurs 
                JOIN Avatars ON Utilisateurs.avatar_id = Avatars.id 
                WHERE Utilisateurs.unique_id = ? OR Utilisateurs.unique_id = ?`;

            db.all(sqlUsernamesAndAvatar, [uniqueId, currentUserId], (err, users) => {
                if (err) {
                    throw err;
                }

                // console.log('API - sqlUsernamesAndAvatar : ', users);
                // Convertir les images BLOB en format base64
                const base64ImageUniqueId = users[0].image ? users[0].image.toString('base64') : null;
                const base64ImageCurrentUserId = users[1].image ? users[1].image.toString('base64') : null;
                const uniqueId = users[0].unique_id;

                let showConversationData = {
                    status: "success",
                    show: true,
                    conversationData: rows,
                    usernames: {
                        uniqueId: {
                            username : users[0].username,
                            uniqueId : uniqueId
                        },
                        currentUserId : {
                            uniqueId: currentUserId,
                            username: users[1].username
                        },
                    },
                    avatarUniqueId: base64ImageUniqueId,
                    avatarCurrentUserId: base64ImageCurrentUserId
                }

                res.status(200).json(showConversationData);
            });
        });
    } catch (error) {
        console.log(error);
    }
});

app.post('/new-message/:uniqueId', function (req, res) {
    let uniqueId = req.params.uniqueId;
    const token = req.body.token;
    const messageContent = req.body.message;
    
    if (!token) {
        console.log("En-tête d'autorisation manquant");
        return res.status(401).json({ status: 'error', message: 'Token non fourni' });
    }
    if (messageContent == null || messageContent == undefined) {
        return;
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, secretKey);
        const currentUserId = decodedToken.unique_id;
        let sqlConversationId = `SELECT id FROM Conversations WHERE 
            (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`;

        db.get(sqlConversationId, [uniqueId, currentUserId, currentUserId, uniqueId], (err, row) => {
            if (err) {
                throw err;
            }

            console.log('API - currentUserId : ', currentUserId);

            let conversationId = row.id;
            const created_at = now.format('HH:mm DD/MM');

            let sqlNewMessage = `INSERT INTO Messages(utilisateur_id, contenu, created_at, conversation_id) VALUES (?, ?, ?, ?)`;

            db.run(sqlNewMessage, [currentUserId, messageContent, created_at, conversationId], (err) => {
                if (err) {
                    throw err;
                }

                res.status(200).json({ status: 'success', message: 'Message inserted successfully' });
            });
        });
    } catch (error) {
        console.log(error);
    }
});

app.listen(3001, () => {
  console.log('Le serveur API est en écoute sur le port 3001');
});
