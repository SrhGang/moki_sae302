var express = require('express');
var app = express();
app.set('views', __dirname);
app.set('view engine', 'ejs');
app.use(express.static('.'));
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
const apiBaseUrl = 'http://localhost:3001';
const secretKey = process.env.SECRET_KEY || 'defaultSecretKey';
let token;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App',
            version: '1.0.0',
            description: 'Web App - Chat App',
        },
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.get('/swagger-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', function(req, res) {
    res.render('index');
});

app.get('/signup', function(req, res) {
    res.render('signup');
});

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
 *         description: Succès. Rédiriger l'utilisateur vers /login pour qu'il s'authentifié.
 *       400:
 *         description: Erreur. Nom d'utilisateur introuvable ou mot de passe incorrect.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.post('/signup', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    request.post(`${apiBaseUrl}/signup`, {
        json: {
            username: req.body.username,
            password: req.body.password
        }
    }, function(error, response, body){
        if (!error && response.statusCode == 200) {
            res.redirect('/login');
        } else {
            console.error(error);
        }
    });    
});

app.get('/login', function(req, res) {
    res.render('login');
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
 *         description: Succès. Stocker le token dans cookie et vérification de l'avatar.
 *       400:
 *         description: Erreur d'authentification de l'API.
 *       500:
 *         description: Erreur lors de l'analyse de la réponse JSON de l'API.
 */
app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const loginApiUrl = `${apiBaseUrl}/login`;
    const userAvatarApiUrl = `${apiBaseUrl}/user-avatar`;
    const avatarsApiUrl = `${apiBaseUrl}/avatars`;

    request.post(loginApiUrl, {
        json: {
            username: username,
            password: password
        }
    }, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            console.log("Erreur d'authentification de l'API:", err || response.statusCode);
            return res.render('login');
        }

        try {
            const responseBody = typeof body === 'object' ? body : JSON.parse(body);

            if (response.statusCode == 200 && responseBody.status === 'success') {
                const token = responseBody.token;
                res.cookie('token', token);

                checkUserAvatar(token, userAvatarApiUrl, avatarsApiUrl, res);
                return;
            } else {
                console.log("Erreur d'authentification de l'API:", responseBody.message);
                return res.render('login');
            }
        } catch (e) {
            console.error("Erreur lors de l'analyse de la réponse JSON de l'API:", e);
            return res.render('login');
        }
    });
});

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Requête de vérification du token.
 *     description: Permet d'envoyer une requête pour vérifier le token de l'utilisateur connecté pour qu'il puisse aller au dashboard.
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
app.get('/dashboard', function(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    checkTokenAndRenderDashboard(token, res, showConversationData = {show: false});
});

async function checkTokenAndRenderDashboard(token, res, showConversationData) {
    request.get(`${apiBaseUrl}/dashboard`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, function(error, response, body) {
        if (error) {
            console.error("Serveur WEB - Erreur lors de la récupération des données de /dashboard", error);
            return res.status(500).send('Erreur lors de la récupération des données de /dashboard');
        }
        try {
            const data = JSON.parse(body);
            if (response.statusCode === 200 && data.status === 'success') {
                request.get(`${apiBaseUrl}/user-avatar`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                },
                function(err, response, body) {
                    if (err & err !== null & err !== undefined) {
                        console.error("Serveur WEB - Erreur lors de la récupération de l'avatar de l'utilisateur dans /dashboard : ", err);
                        return res.status(500).send('Erreur lors de la récupération de l\'avatar de l\'utilisateur dans /dashboard');
                    }                    

                    try {
                        let dashboardData = JSON.parse(body);
                        // console.log('Serveur WEB - dashboardData : ', dashboardData);
                        if (response.statusCode === 200 && dashboardData && dashboardData.status === 'success') {
                            // Récupérer les conversations de l'utilisateur
                            request.get(`${apiBaseUrl}/conversation?uniqueId=${data.unique_id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }, function(err, response, body) {
                                if (err) {
                                    console.error("Serveur Web - Erreur lors de la récupération des conversations de l'utilisateur : ", err);
                                    return res.status(500).send('Erreur lors de la récupération des conversations de l\'utilisateur');
                                }
                                try {
                                    let conversationData = JSON.parse(body);
                                    if (response.statusCode === 200 && conversationData && conversationData.status === 'success') {
                                        let searchData = { search: false };
                                        res.render('dashboard', { data: { dashboardData: dashboardData, searchData: searchData, conversationData: conversationData.conversationData, showConversationData: showConversationData } });
                                    } else {
                                        res.render('login');
                                    }
                                } catch (e) {
                                    console.error("Serveur WEB - Erreur lors de l'analyse JSON : ", e.message);
                                    return res.render('login');
                                }
                            });
                        } else {
                            res.render('login');
                        }
                    } catch (e) {
                        console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                        return res.render('login');
                    }                    
                });
            } else {
                console.log("Serveur WEB - Erreur lors de la vérification du token");
                return res.redirect('/login');
            }
        } catch (err) {
            console.error("Serveur WEB - Erreur lors de l'analyse JSON : ", err.message);
            return res.render('login');
        }
    });
}

async function checkUserAvatar(token, userAvatarApiUrl, avatarsApiUrl, res) {
    request.get(userAvatarApiUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, function(error, response) {
        if (error ) { //|| response.statusCode !== 200
            console.log("Erreur lors de la récupération de l'avatar de l'utilisateur dans checkUserAvatar : ", response.statusCode);
            return res.render('login');
        }

        try {
            const user = typeof response.body === 'object' ? response.body : JSON.parse(response.body);
            // console.log('Serveur WEB - Données reçu pour user dans checkUserAvatar : ', user);
            if (response.statusCode === 200 && user.status === 'success') {
                if (res.req.url !== '/dashboard') {
                    // console.log('Serveur WEB - Tout est OK pour rendre la page /dashbaord dans checkUserAvatar');
                    return res.redirect('/dashboard');
                } else {
                    console.log("Serveur WEB - L'utilisateur a un avatar, mais la page actuelle est déjà /dashboard");
                    return;
                }
            } else {
                console.log("Serveur WEB - Il n'a pas d'avatar, redirection à /avatars");
                request.get(avatarsApiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }, function (err, avatarsResponse) {
                    if (avatarsResponse.statusCode === 200) {
                        const avatars = JSON.parse(avatarsResponse.body);
                        res.render('avatar', { avatars: avatars });
                    } else {
                        console.log("Erreur lors de la récupération des avatars", avatarsResponse.statusCode);
                        res.render('avatar', { avatars: [] });
                    }
                });
            }
        } catch (e) {
            console.error("Erreur lors de la récupération de l'avatar de l'utilisateur ou de l'analyse JSON:", e);
            res.render('login');
        }
    });
}

app.post('/update-avatar', function(req, res) {
    const avatarId = req.body.avatarId;
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    // console.log('Serveur WEB - Début de la requete /update-avatar de la MAJ pour l\'avatar');
    // console.log('Token de l\'utilisateur : ', token);

    request.post(`${apiBaseUrl}/update-avatar`, {
        json: {
            avatarId: avatarId,
            token: token
        }
    }, (err, response, body) => {
        if (!err && response.statusCode === 200 && body && body.status === 'success') {
            // console.log('Serveur WEB - Données reçu de l\'API pour la MAJ de l\'avatar : ', body);
            res.status(200).json({
                status: body.status
            });
        } else {
            console.log("Erreur lors de la mise à jour de l'avatar");
            res.status(500).json({
                status: 'error',
                message: 'Erreur lors de la mise à jour de l\'avatar'
            });
        }
    });
});

app.get('/logout', function(req, res) {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/search', function(req, res) {
    const name = req.query.name;
    const type = req.query.type;
    const token = req.cookies.token;
    const options = {
        url: `${apiBaseUrl}/search?name=${name}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }
    };
    request(options, function(err, response, body) {
        if (err) {
            console.log(err);
            res.status(500).send('Une erreur s\'est produite lors de la recherche');
        } else {
            try {
                let searchData = JSON.parse(body);
                if (response.statusCode === 200 && searchData.status === 'success') {
                    request.get(`${apiBaseUrl}/user-avatar`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }, function(err, response, body) {
                        if (err) {
                            console.error("Serveur Web - Erreur lors de la récupération de l'avatar de l'utilisateur dans /search : ", err);
                            return res.status(500).send('Erreur lors de la récupération de l\'avatar de l\'utilisateur dans /search');
                        }
                        try {
                            let dashboardData = JSON.parse(body);
                            if (response.statusCode === 200 && dashboardData && dashboardData.status === 'success') {
                                res.render('dashboard', { data: { dashboardData: dashboardData, searchData: searchData } });
                            } else {
                                res.render('login');
                            }
                        } catch (e) {
                            console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                            return res.render('login');
                        }
                    });
                } else {
                    res.status(500).send('Une erreur s\'est produite lors de la recherche');
                }
            } catch (e) {
                console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                return res.render('login');
            }
        }
    });
});

app.post('/start-conversation', function(req, res) {
    const uniqueId = req.query.uniqueId;
    const token = req.cookies.token;
    // console.log('Serveur WEB - donnés reçu : ', req.query);

    if (!token) {
        console.log("En-tête d'autorisation manquant");
        return res.status(500).send('En-tête d\'autorisation manquant');
    }

    const options = {
        url: `${apiBaseUrl}/start-conversation?uniqueId=${uniqueId}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    request(options, function(err, response, body) {
        if (err) {
            console.log(err);
            res.status(500).send('Une erreur s\'est produite lors de la création de la conversation');
        } else {
            try {
                let conversationData = JSON.parse(body);
                if (response.statusCode === 200 && conversationData.status === 'success') {
                    // console.log('Serveur WEB - Envoyées les données dans dashboard');
                    // Faire une requête à l'API pour obtenir l'avatar de l'utilisateur
                    request.get(`${apiBaseUrl}/user-avatar`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }, function(err, response, body) {
                        if (err) {
                            console.error("Serveur Web - Erreur lors de la récupération de l'avatar de l'utilisateur dans /start-conversation : ", err);
                            return res.status(500).send('Erreur lors de la récupération de l\'avatar de l\'utilisateur dans /start-conversation');
                        }
                        try {
                            let dashboardData = JSON.parse(body);
                            if (response.statusCode === 200 && dashboardData && dashboardData.status === 'success') {
                                res.render('dashboard', { data: { dashboardData: dashboardData, conversationData: conversationData } });
                                console.log('Server WEB - Données réçu par l\'API pour la conversation : ', conversationData);
                            } else {
                                res.render('login');
                            }
                        } catch (e) {
                            console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                            return res.render('login');
                        }
                    });
                } else {
                    res.status(500).send('Une erreur s\'est produite lors du récupération de la conversation');
                }
                // console.log('Serveur WEB - Fin de /start-conversation');
            } catch (e) {
                console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                return res.render('login');
            }
        }
    });
});

app.get('/conversation', function(req, res) {
    const uniqueId = req.query.uniqueId;
    const token = req.body.cookie;

    if (!token) {
        console.log("En-tête d'autorisation manquant");
        return res.status(500).send('En-tête d\'autorisation manquant');
    }

    const options = {
        url: `${apiBaseUrl}/conversation?uniqueId=${uniqueId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    request(options, function(err, response, body) {
        if (err) {
            console.log(err);
            res.status(500).send('Une erreur s\'est produite lors de la récupération de la conversation');
        } else {
            try {
                let conversationData = JSON.parse(body);
                if (response.statusCode === 200 && conversationData.status === 'success') {
                    // console.log('Serveur WEB - Envoyées les données dans dashboard');
                    // Faire une requête à l'API pour obtenir l'avatar de l'utilisateur
                    request.get(`${apiBaseUrl}/user-avatar`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }, function(err, response, body) {
                        if (err) {
                            console.error("Serveur Web - Erreur lors de la récupération de l'avatar de l'utilisateur dans /conversation : ", err);
                            return res.status(500).send('Erreur lors de la récupération de l\'avatar de l\'utilisateur dans /conversation');
                        }
                        try {
                            let dashboardData = JSON.parse(body);
                            if (response.statusCode === 200 && dashboardData && dashboardData.status === 'success') {
                                res.render('dashboard', { data: { dashboardData: dashboardData, conversationData: conversationData } });
                                if (conversationData.conversationData != null || undefined) {
                                    console.log('Server WEB - Données réçu par l\'API pour la conversation dans /conversation ');
                                } else {
                                    console.log('Server WEB - Données pas réçu par l\'API pour la conversation dans /conversation ');
                                }
                            } else {
                                res.render('login');
                            }
                        } catch (e) {
                            console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                            return res.render('login');
                        }
                    });
                } else {
                    res.status(500).send('Une erreur s\'est produite lors du récupération de la conversation');
                }
                // console.log('Serveur WEB - Fin de /conversation');
            } catch (e) {
                console.error("Serveur Web - Erreur lors de l'analyse JSON : ", e.message);
                return res.render('login');
            }
        }
    });
});

app.get('/show-conversation/:uniqueId', async function(req, res) {
    console.log('Serveur WEB - Données réçu dans /show-conversation/');
    var uniqueId = req.params.uniqueId;
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    console.log('Serveur WEB - Conversation avec  : ', uniqueId);

    request.get(`${apiBaseUrl}/show-conversation/${uniqueId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, function(error, response, body) {
        if (error) {
            console.error("Serveur WEB - Erreur lors de la récupération des données de /show-conversation", error);
            return res.status(500).send('Erreur lors de la récupération des données de /show-conversation');
        }
        try {
            const showConversationData = JSON.parse(body);
            if (response.statusCode === 200 && showConversationData.status === 'success') {
                console.log('Serveur WEB - showConversationData : ', showConversationData.conversationData);
                checkTokenAndRenderDashboard(token, res, showConversationData);
            } else {
                console.log("Serveur WEB - Erreur lors de la récupération des données de la conversation");
                return res.redirect('/login');
            }
        } catch (err) {
            console.error("Serveur WEB - Erreur lors de l'analyse JSON : ", err.message);
            return res.render('login');
        }
    });
});

app.post('/new-message/:uniqueId', async function (req, res) {
    const uniqueId = req.body.uniqueId;
    const messageContent = req.body.message;
    const token = req.body.token;

    if (uniqueId != undefined && messageContent != undefined) {
        request.post(`${apiBaseUrl}/new-message/${uniqueId}`, {
            json: {
                token: token,
                uniqueId: uniqueId,
                message: messageContent
            }
        }, function(error, response, body){
            if (error || response.statusCode != 200) {
                console.error('Erreur lors de l\'envoi du message :', error);
                return res.status(500).json({ status: 'error', message: 'Erreur lors de l\'envoi du message' });
            }

            console.log('Serveur WEB - response dans /new-message', response);
            res.status(200).json({ status: 'success', message: 'Message envoyé avec succès' });
        });
    } else {
        return res.status(400).json({ status: 'error', message: 'Paramètres manquants' });
    }
});

app.use((req, res, next) => {
    res.status(404).send('Page non trouvée');
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Serveur WEB - Erreur globale :', err);
    res.status(500).send('Une erreur est survenue');
});

app.listen(8000, function() {
    console.log('Le serveur est démarré sur le port 8000');
});