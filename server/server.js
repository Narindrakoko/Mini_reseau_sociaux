const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuration du middleware
app.use(bodyParser.json());
app.use(cors());

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Assurez-vous d'utiliser votre mot de passe MySQL
  database: 'treetracking'
});

// Connexion à la base de données MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL Database');
});

// Route pour la connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (results.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Incorrect email or password' });
    }
  });
});
// Nouvelle route pour récupérer les utilisateurs
app.get('/users', (req, res) => {
  const query = 'SELECT id, email FROM users';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err); // Ajouter un log pour l'erreur
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
