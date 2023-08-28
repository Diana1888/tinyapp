const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

//use EJS as its templating engine
app.set("view engine", "ejs");

//convert the request body into string
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user@gmail.com",
    password: "$2a$10$uBbNocseL78DMg8aeh0h/.vPvygCndai0hDnElT5BuOoO.0sY5bGy", // 123456
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "test@email.com",
    password: "$2a$10$NzxTIzvhwPDR5dyV5Ap4m.qRTKq8lJzn9ll46FpBo5b/4a7FHNBeu", // password
  }

  
};

//Generate a Random Short URL ID
const generateRandomString = () => {
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
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

console.log(getUserByEmail("user3@example.com", users));
//Check that URL belongs to user id
const urlsForUser = (id) => {
  let listUrls = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      listUrls[shortUrl] = urlDatabase[shortUrl]
    }
  }
  return listUrls;
}

// console.log(urlsForUser("aJ48lW"));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//use to pass URL data to template
app.get("/urls", (req, res) => {


  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(400).send("Only registered and logged in users can view URLs.");
  } 

  const userUrls = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: users[req.cookies["user_id"]],
  };

    res.render("urls_index", templateVars);

});





//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect('/login')
  } 
  res.render("urls_new", templateVars);
});

//Add a GET Route to show and Update Tiny URL
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(400).send("Only registered and logged in users can view URLs.");
  } 
  

  const userUrls = urlsForUser(user.id, urlDatabase);

  if (!userUrls[shortUrl]){
    return res.status(400).send("This URL dones't belonf to you");
  }
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[shortUrl].longURL,
    user: users[req.cookies["user_id"]]
  };

  
  console.log(templateVars);
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


//Route to Show Registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect('/urls')
  } 

    res.render('register', templateVars);
});

//Route to show Log in form
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect('/urls')
  } 

  res.render('login', templateVars);
});


//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl]  = {
    longURL: req.body.longURL,
    userID: user.id
  }

  // console.log(urlDatabase[shortUrl].longURL);
  
  if (!user) {
    return res.status(400).send("Only registered and logged in users can create new tiny URLs.");
  } 

  res.redirect(`/urls/${shortUrl}`);
});



//Add POST Route to Delete URL resource
app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.cookies["user_id"]];
  
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


//Add POST Route to Edit URL resource
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.cookies["user_id"]];
  
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


//ADD POST Route to handle registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
    // Create a hashed password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  console.log(password, hashedPassword);
  

  if (!email || !password) {
    return res.status(400).send("Please enter your email and/or password");
  }
  
  const user = getUserByEmail(email)
  if (user) {
    return res.status(400).send(`A user is already registered with ${email} address`);
  }

  const user_id = generateRandomString();
  users[user_id] = {id: user_id, email, hashedPassword};

  res.cookie('user_id', user_id);
  res.redirect('/urls');
});


//Add POST Route to let user to Log in and set cookies.
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please enter your email and/or password");
  }

  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Email doesn't exist");
  }

  const matchedPassword = bcrypt.compareSync(password, user.password);
  if (!matchedPassword){
    console.log(password, user.password);
    return res.status(403).send("The e-mail and/or password you specified are not correct.");
  }


  res.cookie('user_id', user.id);
  res.redirect('/urls');



});



//ADD POST Route to let user to Logout and clear cookies.
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});