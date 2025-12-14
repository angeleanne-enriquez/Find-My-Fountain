//reformatted with prettier 
import bcrypt from "bcrypt";
import * as h from "../helpers.js";
import { users, fountains, reviews } from "../config/mongoCollections.js";

//Register a new user
export const registerUsers = async (
  firstName,
  lastName,
  email,
  password,
  username,
  bio,
  picture,
  privacy
) => {
  //Validate firstName
  firstName = h.checkValidString(firstName, 2, 20, "First name");
  if(!/^[A-Za-z]+$/.test(firstName)) throw "Error: First name can only have letters."

  //Validate lastName
  lastName = h.checkValidString(lastName, 2, 20, "Last name");
  if(!/^[A-Za-z]+$/.test(lastName)) throw "Error: First name can only have letters."

  //Validate email
  email = h.checkValidEmail(email, "Email address");

  //Validate password
  password = h.checkValidPassword(password, 8, null, "Password");

  //Validate username
  username = h.checkValidString(username, 2, 20, "Username").toLowerCase();

  //Validate bio
  if(bio.trim() !== "") bio = h.checkValidString(bio, 20, 255, "Bio");

  //Validate picture

  //Validate privacy
  privacy = privacy.trim().toLowerCase();
  if(privacy !== "private" && privacy !== "public") throw "Error: privacy must only be 'private' or 'public'";

  //Get the user collection
  const userCollection = await users();

  //Make sure email isn't already taken
  let existingUser = await userCollection.findOne({ email: email });
  if (existingUser) throw `${email} has already been taken!`;

  //Make sure username isn't already taken
  existingUser = await userCollection.findOne({ username: username });
  if (existingUser) throw `${username} has already been taken!`;

  //Hash password
  password = await bcrypt.hash(password, 16);

  //Create new user
  let newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    username: username,
    bio: bio,
    picture: picture,
    privacy: privacy,
    favorites: [],
    reviews: [],
  };

  //Upload new user to database
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not add user!";

  return await getUserProfile(insertInfo.insertedId);
};

//Adds a fountain to a user's favorite list
export const addFavoriteFountain = async (fountainId, username) => {
  //Validate fountainId
  fountainId = h.checkValidID(fountainId, "Fountain id");

  //Validate username
  username = h.checkValidID(username, "Username");

  //Get fountain collection
  const fountainCollection = await fountains();

  //Make sure this fountain exists
  const fountain = fountainCollection.findOne({ _id: fountainId });
  if (!fountain) throw "Fountain does not exist!";

  //Retrieve user
  const userCollection = await users();
  const user = await userCollection.findOne({"username": username });

  if (!user) throw "User could not be found!";

  //Add the fountain to the user profile
  let fountainList = user["favorites"];
  fountainList.push(fountain["_id"]);

  //Increment the fountain's numFavorites counter
  let numFavorites = fountain["numFavorites"]++;

  //Update user
  await userCollection.updateOne(
    {"username": username },
    { $set: { favorites: fountainList } }
  );

  //Update fountain
  await fountainCollection.updateOne(
    { _id: fountainId },
    { $set: { numFavorites: numFavorites } }
  );
};

//Adds a review to the user's review list
export const addReview = async (reviewId, username) => {
  //validate reviewId
  reviewId = h.checkValidID(reviewId, "Review id");

  //Validate username
  username = h.checkValidID(username, "Username");

  //Get the review collection
  const reviewCollection = await reviews();

  //Make sure this review exists
  const review = await reviewCollection.findOne({ _id: reviewId });
  if (!review) throw "Review does not exist!";

  //Retrieve user
  const userCollection = await users();
  const user = await userCollection.findOne({"username": username });

  if (!user) throw "User could not be found!";

  //Add the review to the user profile
  let reviewList = user["reviews"];
  reviewList.push(review["_id"]);

  await userCollection.updateOne(
    { "username": username },
    { $set: { reviews: reviewList } }
  );
};

//Retrieves a given user's information
export const getUserProfile = async (username) => {
  //Validate username
  username = h.checkValidString(username, 2, 20, "Username").toLowerCase();

  //Retrieve user
  const userCollection = await users();
  const user = await userCollection.findOne({"username": username });

  if (!user) throw "User could not be found!";

  const userProfile = {
    _id: user["_id"],
    firstName: user["firstName"],
    lastName: user["lastName"],
    username: user["username"],
    bio: user["bio"],
    picture: user["picture"],
    privacy: user["privacy"],
    favorites: user["favorites"],
    reviews: user["reviews"]
  };

  return userProfile;
};

//Let's a user log in to their account
export const login = async (username, password) => {
  //Validate username
  username = h.checkValidString(username, 2, 20, "Username");

  //Validate password
  password = h.checkValidPassword(password, 8, null, "Password");

  //Check if the user actually exists
  const userCollection = await users();
  const existingUser = await userCollection.findOne({ username: username });

  if (!existingUser) throw "Either the username or password is invalid";

  //Compare password to hashed password
  let passwordsMatch = await bcrypt.compare(password, existingUser["password"]);
  if (!passwordsMatch) throw "Either the username or password is invalid";

  return await getUserProfile(existingUser["username"]);
};

//lets a user edit their settings
export const editSettings = async (
  username,
  newFirst,
  newLast,
  newEmail,
  newPassword,
  newConfirmPassword,
  newUsername,
  newBio,
  newPic,
  newPrivacy
) => {
  //privacy
  //HOW TO GET PICTURE CHECK 
  //params can be empty 
  if (
    typeof newFirst !== "string" ||
    typeof newLast !== "string" ||
    typeof newEmail !== "string" ||
    typeof newPassword !== "string" ||
    typeof newConfirmPassword !== "string" ||
    typeof newUsername !== "string" ||
    typeof newBio !== "string" ||
    typeof newPrivacy !== "string"
  )
    throw "Error: firstName, lastName, username, password, username, bio, and privacy must be string type";

    if((newFirst.trim() !== "" && !/^[A-Za-z]{2,20}$/.test(newFirst)) || (newLast.trim() !== "" || !/^[A-Za-z]{2,20}$/.test(newLast))) throw "Error: firstName and lastName must be between 2 to 20 characters inclusive."

    if(newEmail.trim() !== "" && !h.checkValidEmail(newEmail, "New Email")) throw "Error: not a valid newEmail";

    if(newPassword.trim() !== "" && !h.checkValidPassword(newPassword, "New Password")) throw "Error: not a valid newPassword";
    if(newPassword !== "" && newConfirmPassword  !== "" && newConfirmPassword !== newPassword) throw "Error: passwords do no match"

    if(newUsername.trim() !==  "" && !h.checkValidString(newUsername, 2, 20, "Username")) throw "Error: not a valid newUsername";
    
    if(newBio.trim() !== "" && !h.checkValidString(newBio, 20, 255, "Bio")) throw "Error: not a valid newBio";

    privacy = privacy.trim().toLowerCase();
    if(privacy !=="" && privacy !== "private" && privacy !== "public") throw "Error: privacy must only be 'private' or 'public'";

  username = username.trim().toLowerCase();

  let userCollection = await users();
  let user = await userCollection.findOne({ _id: username });
  if (user === null) throw "Cannot find that user";

  if(newUsername !=="") {
    let existingUser = await userCollection.findOne({ email: newEmail });
    if(existingUser) throw "Error: username is already taken";}

if(newEmail !== ""){
    let existingUser = await userCollection.findOne({ username: newUsername });
    if(existingUser) throw "Error: email is already taken";}

    if(newPassword !== ""){
        let newPassword = await bcrypt.hash(newPassword, 10);
        let existingUser = await userCollection.findOne({password: newPassword});
        if(existingUser) throw "Error: password is already taken"
    }

  //IF PARAMS WERE NOT ADDED, KEEP THE SAME -> LIKE REGISTER IN LAB 10
  let updatedUser = await userCollection.findOneAndUpdate(
    { _id: username },
    {
      $set: {
        username: newUsername !== "" ? newUsername : "$$REMOVE",
        firstName: newFirst !== "" ? newFirst : "$$REMOVE",
        lastName: newLast !== "" ? newLast : "$$REMOVE",
        email: newEmail !== "" ? newEmail : "$$REMOVE",
        password: newPassword !== "" ? newPassword : "$$REMOVE",
        bio: newBio !== "" ? newBio : "$$REMOVE",
        picture: newPic !== "" ? newPic : "$$REMOVE",
        privacy: newPrivacy !== "" ? newPrivacy : "$$REMOVE"
      },
    },
    { returnDocument: " after" }
  );

  if (!updatedUser) throw "Error: could not update user settings successfully.";

  return { settingsUpdated: true };
};

export default {
  registerUsers,
  addFavoriteFountain,
  addReview,
  getUserProfile,
  login,
  editSettings,
};
