//reformatted with prettier 
//import express, express router as shown in lecture code
import { Router } from "express";
const router = Router();

import {
  registerUsers,
  addFavoriteFountain,
  addReview,
  getUserProfile,
  login,
  editSettings,
} from "../data/users.js";
// NEED TO ADD VALIDATION CHECKERS

router.route("Find-My-Fountain/user/:id").get(async (req, res) => {
  //code here for GET
  try {
    if (!req.params.id || req.params.id === "")
      //check if username is in the route
      throw "Error: no username provided";

    let username = req.params.id; //check if user exists; throws otherwise
    let user = await getUserProfile(username);

    let firstName = user.firstName; //get all the info abt the user to display on the page
    let lastName = user.lastName;
    let bio = user.bio;
    let picture = user.picture;
    let favorites = user.favorites;
    let reviews = user.reviews;
    //   let likedFountains = userName.likedFountains;,
    //   dislikedFountains = userName.dislikedFountains;,
    //   privacy = userName.privacy;,
    //   role = userName.role;

    return res.status(200).render("user", {
      //returns page with that info
      title: `User: ${username}`,
      firstName,
      lastName,
      bio,
      picture,
      favorites,
      reviews,
      //   likedFountains,
      //   dislikedFountains,
      //   privacy,
      //   role
    });
  } catch (e) {
    return res.status(403).render("error", {
      //renders error page if there is an error
      title: "User",
      errorMessages: e,
      errorClass: "error", 
    });
  }
});

router
  .route("Find-My-Fountain/user/:id/settings")
  .get(async (req, res) => {
    try {
      if (!req.params.id || req.params.id === "")
        //checks if username is in the route
        throw "Error: no userlink provided";

      let username = req.params.id; //checks if user exists
      await getUserProfile(username);

      return res.status(200).render("settings", { title: "Settings" }); //renders status page
    } catch (e) {
      return res.status(403).render("error", {
        //renders error page if there was an error
        title: "User",
        errorMessages: e,
        errorClass: "error",
      });
    }
  })

  .post(async (req, res) => {
    //code here for POST
    try {
      if (req.session.user.username !== req.params.id)
        //checks if user is the same as the one on the page to be able to edit settings
        throw "Error: Cannot edit the settings of another user";

      let username = req.session.user.username;

      let settingsFields = [
        //checks if there is at least one field that is going to be edited
        { name: "newUsername", value: req.body.username },
        { name: "newFirst", value: req.body.firstName },
        { name: "newLast", value: req.body.lastName },
        { name: "newEmail", value: req.body.email },
        { name: "newPassword", value: req.body.password },
        { name: "newBio", value: req.body.bio },
        { name: "newPic", value: req.body.picture },
      ]; // { name: "newPrivacy", value: req.body.newPrivacy }
      let missingFields = [];

      settingsFields.forEach((element) => {
        if (!element.value || element.value === "")
          missingFields.push(element.name);
      });
      if (missingFields.length === 0)
        throw `Error: Must provide at least 1 setting to update`;

      //updates the settings
      let edited = await editSettings(
        username,
        newFirst,
        newLast,
        newEmail,
        newPassword,
        newUsername,
        newBio,
        newPic
      );

      if (edited.settingsUpdated === true) {
        //checks if settings were updated
        await getUserProfile(username); //checks if user exists

        return res.status(400).render("settings", {
          //renders settings page with that message
          title: "Settings",
          message: "Settings updated successfully.",
        });
      }
    } catch (e) {
      return res.status(403).render("error", {
        //renders error page if there was an error
        title: "User",
        errorMessages: e,
        errorClass: "error",
      });
    }
  });

export default router;
