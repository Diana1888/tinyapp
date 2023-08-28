//Generate a Random ID
const generateRandomString = () => {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const stringLength = 6;

  for (let i = 0; i < stringLength; i++) {
    let num = Math.floor(Math.random() * alphanumeric.length);
    result += alphanumeric[num];
  }
  return result;
};

//Check if user exist with provided email
const getUserByEmail = (email, urlDatabase) => {
  for (const userId in urlDatabase) {
    if (urlDatabase[userId].email === email) {
      return urlDatabase[userId];
    }
  }
  return undefined;
};


//Return URL that matched with userID
const urlsForUser = (id, urlDatabase) => {
  let listUrls = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      listUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return listUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser};