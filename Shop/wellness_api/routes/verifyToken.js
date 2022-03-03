const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    //returns the 2nd item of the array seperated by space
    //At postman extra string added in front of token and seperate with a space
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      //if token is not the valid token , return status 403 Forbidden
      if (err) res.status(403).json("Token is not valid!");
      //created new request
      req.user = user;
      //pass the control to the next middleware function in this stack
      //in this case the user.js within the routes folder
      next();
    });
    //if no auth header , return status 401 = Unauthorized
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

//to verify if the input user id is equal to the stored user id
//or if the user is admin
//if this is the case, pass control to user.js within the routes folder
//else return status 403 Forbidden
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

//to verify if the user is an admin
//only gain access to admin
//if not an admin, return status 403 Forbidden
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      //continue router function
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
