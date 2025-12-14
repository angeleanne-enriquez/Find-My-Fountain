import {Router} from 'express';
import * as usersData from '../data/users.js';
import * as fountainsData from '../data/fountains.js';
import * as reviewsData from '../data/reviews.js';


const router = Router();

/* ========== Landing Page ========== */
router
  .route('/')
  .get(async (req, res) => {
    // code here for GET landing page
    try {
        let user = null;
        if (req.session && req.session.user) {
          user = req.session.user;
        }
  
        return res.status(200).render('landingPage', {
          title: 'Find My Fountain',
          user: user
        });
      } catch (e) {
        return res.status(500).render('error', {
          title: 'Error',
          error: 'Internal Server Error'
        });
      }
  });



/* ========== Auth: Login / Register / Logout ========== */
//WIP
router
  .route('/login')
  .get(async (req, res) => {
    // code here for GET login page
    try {
      return res.status(200).render('login')
    }catch(e){
      //error message
      return res.status(500).render("error", {error:e})
      }
  })
  .post(async (req, res) => {
    // code here for POST login (authenticate user)
    try {
      const { username, password } = req.body;
      const errors = {};

      // very basic server-side checks for presence
      if (!username || username.trim().length === 0) {
        errors.username = 'You must provide a username';
      }
      if (!password || password.length === 0) {
        errors.password = 'You must provide a password';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).render('login', {
          title: 'Login',
          errors,
        });
      }

      // call data layer login(username, password)
      const didLogin = await usersData.login(username, password);

      // store what the data layer actually returns
      req.session.user = {
        _id: didLogin._id,
        username: didLogin.username,
        firstName: didLogin.firstName,
        lastName: didLogin.lastName,
        bio: didLogin.bio,
        picture: didLogin.picture,
      };

      // redirect to this user's profile page
      return res.redirect(`/user/${req.session.user._id}`);
    } catch (e) {
      // invalid username/password or other error
      return res.status(400).render('login', {
        title: 'Login',
        error: e,
      });
    }
  });



router
  .route('/logout')
  .get(async (req, res) => {
    // code here for GET logout (clear session, redirect or render page)
    
  });



/* ========== Search Results ========== */
// POST /search
router
  .route('/search')
  .get(async(req,res) => {
    try {
      //leads to search page
      res.render('search')
    }catch(e){
      //error message
      return res.status(403).render("error", {error:e})
      }
  })
  .post(async (req, res) => {
    // code here for POST search (use filters, return searchResults view)
  });


/* ========== Fountain Details + Review Submission + Like/Dislike ========== */
// GET /fountain/:id  (show fountain details)
// POST /fountain/:id (submit a review / mark operational)
router
  .route('/fountain/:id')
  .get(async (req, res) => {
    // code here for GET fountain details
    try {
        //checking if fountain exists
        const fountainId = req.params.id;

        // get fountain from DB
        const fountain = await fountainsData.getFountain(fountainId);

        // Get reviews for this fountain
        const reviews = await reviewsData.getReviewsByFountainId(fountainId);
        
        // Simple location display string
        let locationDisplay = 'Location data not available';
        if (Array.isArray(fountain.location) && fountain.location.length === 2) 
          locationDisplay = `${fountain.location[0]}, ${fountain.location[1]}`;

        // Logged-in user
        const user = req.session.user || null;

        let favorited = false;
        if (user && Array.isArray(user.favorites)) 
          favorited = user.favorites.includes(fountainId);

        return res.status(200).render('fountainDetails', {
          title: 'Fountain Details',
          fountain,
          locationDisplay,
          reviews,
          user,
          favorited
        }); 
    } catch(e) {
        return res.status(404).render("error", {title: 'Error', error:e})
    }
  })
  .post(async (req, res) => {
    // code here for POST new review / mark as working
    try {
      if (!req.session || !req.session.user) {
        return res
          .status(401)
          .json({ error: 'You must be logged in to submit a review.' });
      }

      const fountainId = req.params.id;
      const username = req.session.user.username; // from your session

      const body = req.body.reviewText;

      const ratings = {
        taste: Number(req.body.taste),
        location: Number(req.body.location),
        pressure: Number(req.body.pressure),
        cleanliness: Number(req.body.cleanliness),
        accessibility: Number(req.body.accessibility),
        operational:
          req.body.operational === 'true' ||
          req.body.operational === 'on' ||
          req.body.operational === true
      };

      await reviewsData.createReview(username, fountainId, body, ratings);

      // For Ajax: tell the client it worked
      return res.json({ reviewCreated: true });
    } catch (e) {
      return res.status(400).json({ error: e.toString() });
    }
  });

router
  .route('/fountain/:id/like')
  .post(async (req, res) => {
    // code here for POST like fountain
  });

router
  .route('/fountain/:id/dislike')
  .post(async (req, res) => {
    // code here for POST dislike fountain
  });



/* ========== User Profile ========== */
// GET /user/:id   (show a user's profile, favorites, reviews)
// POST /user/:id  (edits to your own profile: bio/picture)
router
  .route('/user/:id')
  .get(async (req, res) => {
    // code here for GET user profile
    try {
        if (!req.params.id || req.params.id === "")
          //check if username is in the route
          throw "Error: no user id provided";
    
        let username = req.params.id; //check if user exists; throws otherwise
        let user = await usersData.getUserProfile(username);

        if(req.session.user.username === username || user.privacy === "public"){
    
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
    
        return res.status(200).render("profile", {
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
        });}
        else throw "Error: This user is private.";
      } catch (e) {
        return res.status(403).render("error", {
          //renders error page if there is an error
          title: "User",
          errorMessages: e,
          errorClass: "error", 
        });
      }
  })
  .post(async (req, res) => {
    // code here for POST profile updates
  });


/* ========== Settings for user ========== */
router
  .route("/user/:id/settings")
  .get(async (req, res) => {
    try {
      if (!req.params.id || req.params.id === "")
        //checks if username is in the route
        throw "Error: no userlink provided";

      let username = req.params.id; //checks if user exists
      await usersData.getUserProfile(username);

      if(username === req.session.user._id) return res.status(200).render("settings", { title: "Settings" }); //renders status page
      else throw "Error: cannot look at user's settings that are not your own."

    } catch (e) {
      return res.status(403).render("error", {
        //renders error page if there was an error
        title: "Settings",
        errorMessages: e,
        errorClass: "settingsError",
      });
    }
  })

  .post(async (req, res) => {
    //code here for POST
    try {
      if (req.session.user._id !== req.params.id)
        //checks if user is the same as the one on the page to be able to edit settings
        throw "Error: Cannot edit the settings of another user";

      let username = req.session.user._id;

      let settingsFields = [
        //checks if there is at least one field that is going to be edited
        { name: "newUsername", value: req.body.username },
        { name: "newFirst", value: req.body.firstName },
        { name: "newLast", value: req.body.lastName },
        { name: "newEmail", value: req.body.email },
        { name: "newPassword", value: req.body.password },
        { name: "newConfirmPassword", value: req.body.confirmPassword },
        { name: "newBio", value: req.body.bio },
        { name: "newPic", value: req.body.picture },
        { name: "newPrivacy", value: req.body.newPrivacy }
      ]; 
      let missingFields = [];

      settingsFields.forEach((element) => {
        if (!element.value || element.value === "")
          missingFields.push(element.name);
      });
      if (missingFields.length === 0)
        throw `Error: Must provide at least 1 setting to update`;

      //updates the settings
      let newUsername = req.body.username;
      let newFirst = req.body.firstName;
      let newLast = req.body.lastName;
      let newEmail = req.body.email; 
      let newPassword = req.body.password;
      let newConfirmPassword = req.body.confirmPassword;
      let newBio = req.body.bio;
      let newPic = req.body.pic;
      let newPrivacy = req.body.privacy;

      let edited = await usersData.editSettings(
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
      );

      if (edited.settingsUpdated === true) {
        //checks if settings were updated
        await usersData.getUserProfile(username); //checks if user exists

        return res.status(400).render("settings", {
          //renders settings page with that message
          title: "Settings",
          message: "Settings updated successfully.",
        });
      }
    } catch (e) {
      return res.status(403).render("error", {
        //renders error page if there was an error
        title: "Settings",
        errorMessages: e,
        errorClass: "settingsError",
      });
    }
  });


/* ========== Review Edit/Delete + Comments ========== */
// Edit a review (GET form + POST update)
// GET /reviews/:id/edit - show edit form
router
  .route('/reviews/:id/edit')
  .get(async (req, res) => {
    // code here for GET edit review form
  })
  .post(async (req, res) => {
    // code here for POST edit review (update in DB)
  });

// Delete a review
router
  .route('/reviews/:id/delete')
  .post(async (req, res) => {
    // code here for POST delete review
  });

// Add a comment to a review
router
  .route('/reviews/:id/comments')
  .post(async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.redirect('/login');
      }

      const reviewId = req.params.id;
      const username = req.session.user.username;
      const body = req.body.commentText;

      await reviewsData.addComment(reviewId, username, body);

      // simplest: go back to the page the user came from
      return res.redirect('back');
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Error',
        error: e
      });
    }
  });

export default router;
