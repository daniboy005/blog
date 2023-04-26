const express = require('express');
const session = require('express-session');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://danieloh05:kHIP7IAVWiyoB6R9@cluster0.lz3xtlt.mongodb.net/blog?retryWrites=true&w=majority";
const dbName = 'blog';
const collectionName = 'user';
const bodyParser = require('body-parser');
const path = require('path');

const client = new MongoClient(url);

app.use(express.static(__dirname, { index: 'login.html' }));



// Configure the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '3qE59X1W7m1GKx2ZmIeC',
  resave: false,
  saveUninitialized: false
}));

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    // If the user is authenticated, allow them to access the page
    next();
  } else {
    // If the user is not authenticated, redirect them to the login page
    req.session.message = 'You are not authenticated. Please log in to continue.';
    res.redirect('/');
  }
};


// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'));
});

// Handle login form submissions
app.post('/login', (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  console.log(`User: ${email}, Password: ${password}`);

  // Connect to the MongoDB database
  client.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }

    const db = client.db(blog);
    const collection = db.collection(user);

    collection.findOne({ user: email, password: password }, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }
    
      console.log("Query result: ", user);
    
      if (!user) {
        console.log(`Could not find user with email ${email}`);
        return res.status(401).send();
      }
    
      // Set the session variable to indicate that the user is authenticated
      req.session.isAuthenticated = true;
      console.log(`Authenticated user with email ${email}`);
    
      // Redirect the user to the index page
      res.redirect('/index.html')
      .then(() => {
        console.log("redirecting to index page");
      })
      .catch(err => {
        console.log(err);
      });
    
      // Close the MongoDB connection
      client.close();
    });
    
    });
  });


// Serve the create page
app.get('/create', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, './create.html'));
});


// Serve the index page only to authenticated users
app.get('/index.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
