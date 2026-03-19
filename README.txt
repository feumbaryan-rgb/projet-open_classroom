PROJET CORRIGÉ

Ce que j'ai corrigé :
- ajout d'un petit serveur frontend (server.js)
- ajout d'un package.json pour démarrer facilement le frontend

Pourquoi tu avais l'erreur "Cannot GET /index.html" :
- ton backend API ne sert pas les fichiers HTML du frontend
- il faut ouvrir le frontend avec son propre serveur, séparé du backend

Comment lancer :
1. Ouvre un terminal dans le dossier FrontEnd
2. Lance :
   npm start
3. Ouvre ensuite :
   http://localhost:5500

IMPORTANT :
- ton backend doit aussi être lancé à part sur http://localhost:5678
- la connexion ne marchera que si le backend répond bien à :
  POST /api/users/login

Si le backend est éteint, le login affichera :
"Erreur serveur. Vérifie que le backend est lancé."
