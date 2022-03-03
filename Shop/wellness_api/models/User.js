const mongoose = require("mongoose");

//define user properties: username,email,pass,access
//use mongoose timestamp to store date and time created/updated
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, min: 3, max: 20 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 3, max: 20 },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//call the model constructor on the Mongoose instance and pass it the name of the collection by exporting the UserSchema
module.exports = mongoose.model("User", UserSchema);
