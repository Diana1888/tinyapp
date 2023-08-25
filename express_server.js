const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//use EJS as its templating engine
app.set("view engine", "ejs");

//convert the request body into string
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Generate a Random Short URL ID
function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const stringLength = 6;

  for (let i = 0; i < stringLength; i++) {
    let num = Math.floor(Math.random() * alphanumeric.length);
    result += alphanumeric[num];
  }
  return result;
}

//Function to search user by email
function searchUserByEmail(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//use to pass URL data to template
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

//Route to Show Registration form
app.get('/register', (req, res) => {
  res.render('register');
})



//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//Add a GET Route to show and Update Tiny URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_show", templateVars);
});

//Redirect to Url after requesting Url id
app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longURL = urlDatabase[shortUrl];
  res.redirect(longURL);
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  // console.log(req.body, shortUrl); // Log the POST request body to the console
  urlDatabase[shortUrl]  = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});



//Add POST Route to Delete URL resource
app.post('/urls/:id/delete', (req, res) => {
  const {id} = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});


//Add POST Route to Edit URL resource
app.post('/urls/:id/edit', (req, res) => {
  const {id} = req.params;
  urlDatabase[id]  = req.body.longURL;
  res.redirect(`/urls`);
});


//Add POST Route to let user to Log in and set cookies.

app.post('/login', (req, res) => {
console.log("cookies", req.cookies);
  const user = req.cookies.user;
  console.log(user);

  res.cookie('user', user);
  res.redirect('/urls');
});

//ADD POST Route to handle registration
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; 
  users[user_id] = {id: user_id, email, password}
  
  if (!email || !password) {
    return res.status(401).send("Please enter your email and/or password");
  }

  const user = searchUserByEmail(email);
  
  if (user && user.password === password) {
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  } else {
    return res.status(401).send("A user is already registered with this e-mail address");
  }



})

//ADD POST Route to let user to Logout and clear cookies.
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});