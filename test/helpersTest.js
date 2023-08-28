const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  dldls4: {
    longURL: "https://www.apple.ca",
    userID: "user2RandomID",
  },
  kuK5ku: {
    longURL: "https://www.bananas.ca",
    userID: "user2RandomID",
  },
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, "Email found in database")
  });

  it('should return undefined if email not found in database', function() {
    const user = getUserByEmail("testingtest@example.com", testUsers)
    const expectedUserID = "user2RandomID";
    assert.strictEqual(user, undefined, "Email not found in database")
  });
});


describe('urlsForUser', function() {
  it('should return list of matched URLs per userID', function() {
    const userURLs = urlsForUser("userRandomID", testUrlDatabase);
    const expectedURLs =  {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID",
      },
    };
    assert.deepEqual(userURLs, expectedURLs)
  });

  it('should return empty list if no URLs found per UserID', function() {
    const userURLs = urlsForUser("user3RandomID", testUrlDatabase);
    const expectedURLs =  {};
    assert.deepEqual(userURLs, expectedURLs)
  });
});




