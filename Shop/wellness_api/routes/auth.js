const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//***REGISTER***
//Use Post request to
//1)register new user (send username, email and password object to database()
//2)Log In for existing user
//Use async function to await user
//Encrypt password with CrptoJS AES- Advanced Encryption Standard algorithm
//CryptoJS.AES.encrypt("password", "Secret Key")
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  // use try catch method to catch the error in an asynchronous function
  //await will ask the execution to wait for new user save to database
  // to be completed before moving to the next line for execution
  //http status code 201 = successfully created in database
  //http status code 500 = Internal Server Error

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//***LOGIN***
//http status code 401 = Unauthorized
router.post("/login", async (req, res) => {
  try {
    //store user name in variable user
    //findOne() method finds and return
    //username that matches the first stored username in database
    const user = await User.findOne({
      username: req.body.username,
    });
    // if user doesn't exist, return status 401, "Wrong User Name"
    if (!user) {
      return res.status(401).json("Wrong User Name");
    }

    // Decrypt password
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    //store saved decrypted password in variable originalPassword
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    //store input password in variable inputPassword
    const inputPassword = req.body.password;
    //compare original password with input password
    //if not the same, display error 401 with message "wrong password"
    if (originalPassword != inputPassword)
      return res.status(401).json("Wrong Password");

    // add jwt-(JSON Web Token) to build a more secure application
    //if user wanted to Create, read, update and delete -CRUD operation
    //compare its user id with the stored database object id
    //to check if the item is belongs to the user
    // need to add a jwt secret key in .env folder
    //give it an expiration of 3 days
    // user will need to log in again after 3 days
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    //to protect our password, we destructure our user
    //to seperate the password out from other info
    //only pass other info without the password
    //mongodb store document under _doc folder
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
