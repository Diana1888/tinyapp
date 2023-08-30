// Packages
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080

// Creating the epxress server
const app = express();

// Setting the view engine
app.set("view engine", "ejs");



// Middleware //

//convert the request body into string
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["secretkey"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Data
const { generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const { urlDatabase, users } = require('./database');



//GET Endpoints
app.get("/", (req, res) => {
   const userCookie = users[req.session["user_id"]];

   if (userCookie) {
    return res.redirect("/urls");
  }

  res.redirect('/login')
})

//Display Urls page
app.get("/urls", (req, res) => {
  const userCookie = users[req.session["user_id"]];

  if (!userCookie) {
    return res.status(400).send("Only registered and logged in users can view URLs.");
  }

  const userUrls = urlsForUser(userCookie.id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: userCookie,
  };

  res.render("urls_index", templateVars);
});


//Display new Url Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };

  const user = users[req.session["user_id"]];
  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});


//Display page with details of Url
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.status(400).send("Only registered and logged in users can view URLs.");
  }

  const userUrls = urlsForUser(user.id, urlDatabase);

  if (!userUrls[shortUrl]) {
    return res.status(400).send("You are not authorized to edit url that doesn't belong to you");
  }
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[shortUrl].longURL,
    user: users[req.session["user_id"]]
  };

  res.render("urls_show", templateVars);
});


//Redirect to Url after requesting Url id
app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]) {
    return res.status(404).send("There is no shortUrl found");
  }

  res.redirect(urlDatabase[shortUrl].longURL);
});


//Display Registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };

  const user = users[req.session["user_id"]];
  if (user) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});


//Display Login form
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };

  const user = users[req.session["user_id"]];
  if (user) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

//POST Endpoints

//Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl]  = {
    longURL: req.body.longURL,
    userID: user.id,
  };

  if (!user) {
    return res.status(400).send("Only registered and logged in users can create new tiny URLs.");
  }

  res.redirect(`/urls/${shortUrl}`);
});


//Route to Delete URL resource
app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.session["user_id"]];
  
  if (!user) {
    return res.status(400).send("Only registered and logged in users can delete URLs.");
  }
  if (user.id !== urlDatabase[shortUrl].userID) {
    return res.status(403).send("You can't delete URLS that doesn't belong to you");
  }

  if (!urlDatabase[shortUrl]) {
    return res.status(404).send("URL is not found");
  }

  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});


//Route to Edit URL resource
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.session["user_id"]];
  
  if (!user) {
    return res.status(400).send("Only registered and logged in users can edit URLs.");
  }
  if (user.id !== urlDatabase[shortUrl].userID) {
    return res.status(403).send("You can't edit URLS that doesn't belong to you");
  }

  if (!urlDatabase[shortUrl]) {
    return res.status(404).send("URL is not found");
  }
  
  urlDatabase[shortUrl].longURL  = req.body.longURL;
  res.redirect(`/urls`);
});


//Route to handle registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("Please enter your email and/or password");
  }
  
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send(`A user is already registered with ${email} address`);
  }
  const user_id = generateRandomString();

   // Create a hashed password
   const salt = bcrypt.genSaltSync(10);
   const hashedPassword = bcrypt.hashSync(password, salt);

   users[user_id] = {id: user_id, email: email, password: hashedPassword};  
   console.log(users);

  req.session.user_id = user_id;
  res.redirect('/urls');
});


//Route to let user to Log in and set cookies.
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please enter your email and/or password");
  }

  const user = getUserByEmail(email, users);
  console.log(user);


  const matchedPassword = bcrypt.compareSync(password, user.password);
  if (!user || !matchedPassword) {
    return res.status(403).send("The e-mail and/or password you specified are not correct.");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});


//ADD POST Route to let user to Logout and clear cookies.
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Start listening on PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});