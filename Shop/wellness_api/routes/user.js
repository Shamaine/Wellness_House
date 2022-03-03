const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//UPDATE
//Both user and admin can access the update function
//Update password when user id is verified,
//if password exist on request, encrypt new password
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        //take everything inside req.body and set it again
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
//Only Admin can access get user function
//Use verifyTokenAndAdmin to verify user is an admin
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
//Only Admin can access get all user function
//Use verifyTokenAndAdmin to verify user is an admin
//use .find() to find the latest 5 users
//sort in decending order by id -1
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  //store latest query inside variable query
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS
//Only Admin can access get user stats function
//Use verifyTokenAndAdmin to verify user is an admin
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  //return last year stat by -1
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      //Filter user stat that is greater than lastYear
      //Passes the remaining documents to the $group stage.
      { $match: { createdAt: { $gte: lastYear } } },
      {
        //extract the month created in database and save as month variable
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        // group remaining items by month
        // display month _id : 3 =>March
        $group: {
          _id: "$month",
          //anad calculate total user number
          total: { $sum: 1 },
        },
      },
    ]);
    //if successful, show data
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
