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
      if(!req.session.user) return res.status(200).render('login');
      else throw "Error: User cannot log in after already logging in."
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
        username: didLogin.username,
        firstName: didLogin.firstName,
        lastName: didLogin.lastName,
        bio: didLogin.bio,
        picture: didLogin.picture,
      };

      // redirect to this user's profile page
      return res.redirect(`/user/${req.session.user.username}`);
    } catch (e) {
      // invalid username/password or other error
      return res.status(400).render('login', {
        title: 'Login',
        error: e,
      });
    }
  });

  

  router
  .route('/register')
  .get(async (req, res) => {
    // code here for GET register page
    try {
        return res.status(200).render('register')
    } catch(e) {
        //error message
        return res.status(403).render("error hello testing", {error:e})
    }
  })
  .post(async (req, res) => {
    // code here for POST register (create user)
    try {
            //define registration terms
            let firstName = req.body.firstName
            let lastName = req.body.lastName
            let email = req.body.email
            let username = req.body.username
            let password = req.body.password
            let bio = req.body.bio
            let picture = req.body.picture
            let privacy = req.body.privacy

            let confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) throw "Error: password and confirmPassword must match";
            
            //registering 
            let newUser = await usersData.registerUsers(firstName,lastName,email,password,username,bio,picture,privacy)

            if(!newUser) throw "Error: unable to register user."
            //take back to home but now logged in 
            return res.status(200).redirect("/login")
        } catch(e) {
            //error message
            return res.status(403).render("error", {error:e})
        }
  });



router
  .route('/logout')
  .get(async (req, res) => {
    // code here for GET logout (clear session, redirect or render page)
    try {
        req.session.destroy();
        res.clearCookie("AuthenticationState");
        return res.status(200).render("logout", { title: "Logged Out" });
    } catch (e) {
        return res.status(403).render("error", {
        title: "Log Out",
        error: e,
      });
    }
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
    try{
      if (!req.body.q){
        req.body.q = ''
      }
      //filters
      let parkFilter = req.body.park
      let ratingFilter = req.body.rating

      let fountainBoroughs = await fountainsData.fountainByBorough(req.body.q,parkFilter,ratingFilter)
      return res.status(200).render('searchResults',{borough:req.body.q,fountainBoroughs:fountainBoroughs})
    } catch(e){
      //error message
      return res.status(403).render("error", {error:e})
    }
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
        if(!req.params.id || req.params.id === "") throw "Error: no id provided";

        let fountainId = req.params.id;
        let fountain = await fountainsData.getFountain(fountainId);

        if(!fountain) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain cannot be found",
            errorClass: "error",
            link: "/fountain",
        });

        if(fountain.operational === false) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain is not working",
            errorClass: "error",
            link: "/fountain",
        })

        let user = null,
            favorited = false,
            reviews = await reviewsData.getReviewsByFountainId(fountainId);

        if(req.session.user) {
            user = req.session.user;
            
            let userData = await usersData.getUserProfile(user.username);
            let favorites = await userData["favorites"];

            favorited = (favorites.includes(req.params.id));
        }
        
        // Simple location display string
        let locationDisplay = 'Location data not available';
        if (Array.isArray(fountain.location) && fountain.location.length === 2) 
          locationDisplay = `${fountain.location[0]}, ${fountain.location[1]}`;

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
        if(!req.params.id || req.params.id === "") throw "Error: no id provided";

        let fountainId = req.params.id;
        let fountain = await fountainsData.getFountain(fountainId);

        if(!fountain) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain cannot be found",
            errorClass: "error",
            link: "/fountain",
        });

        if(!req.session.user) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: user must be logged in to write/edit/delete a review",
            errorClass: "error",
            link: "/fountain",
        })

        let user = req.session.user.username,
            reviewText = req.body.reviewText,
            ratings = {
            taste: Number(req.body.taste),
            location: Number(req.body.location),
            pressure: Number(req.body.pressure),
            cleanliness: Number(req.body.cleanliness), 
            accessibility: Number(req.body.accessibility),
            operational: req.body.operational === "true"}

        await reviewsData.createReview(user, fountainId, reviewText, ratings);

        let fountainReviews = await reviewsData.getReviewsByFountainId(fountainId);

        fountain = await fountainsData.getFountain(fountainId);

        return res.status(200).render('fountainDetails', {fountain: fountain, user: user, reviews: fountainReviews});
    } catch(e) {
        return res.status(403).render("error", {error:e})
    }
  });

router
  .route('/fountain/:id/like')
  .post(async (req, res) => {
    // code here for POST like fountain
    if (!req.session.user) return res.status(403).render("error", {error: "Must be logged in to favorite!"});

    let user = req.session.user;
    let fountainId = req.params.id;

    await usersData.addFavoriteFountain(fountainId, user.username);

    res.redirect(req.get("referer"));
  });

router
  .route('/fountain/:id/dislike')
  .post(async (req, res) => {
    // code here for POST dislike fountain
    if (!req.session.user) return res.status(403).render("error", {error: "Must be logged in to unfavorite!"});

    let user = req.session.user;
    let fountainId = req.params.id;

    await usersData.removeFavoriteFountain(fountainId, user.username);

    res.redirect(req.get("referer"));
  });



/* ========== User Profile ========== */
// GET /user/:username   (show a user's profile, favorites, reviews)
router
  .route('/user/:username')
  .get(async (req, res) => {
    // code here for GET user profile
    try {
        if (!req.params.username || req.params.username === "") 
          //check if username is in the route
          throw "Error: no username provided";
    
        let viewUsername = req.params.username; //check if user exists; throws otherwise
        let viewUser = await usersData.getUserProfile(viewUsername);

        if(!viewUser) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: user cannot be found",
            errorClass: "error",
            link: "/user",
        });

        if(((req.session.user) && (req.session.user.username === viewUser.username)) || viewUser.privacy === "public") {
          
          let firstName = viewUser.firstName; //get all the info abt the user to display on the page
          let lastName = viewUser.lastName;
          let bio = viewUser.bio;
          let picture = viewUser.picture;
          let favorites = viewUser.favorites;

          let isOwnProfile = ((req.session.user) && (req.session.user.username === viewUser.username));
          
          let loginUser = null;
          if (req.session.user) loginUser = req.session.user;

          let favoriteFountains = await fountainsData.getFavoriteFountains(favorites);

          //Get all reviews
          let reviews = await reviewsData.getReviewsByUsername(viewUser.username);
          let reviewFountainIds = reviews.map(review => review["fountain"]);

          let reviewFountains = await fountainsData.getFavoriteFountains(reviewFountainIds);

          for (let x = 0; x < reviews.length; x++) {
            reviewFountains[x]["ratings"] = reviews[x]["ratings"];
            reviewFountains[x]["body"] = reviews[x]["body"];
            reviewFountains[x]["reviewId"] = reviews[x]["_id"];
          }

          return res.status(200).render("profile", {
            //returns page with that info
            title: `User: ${viewUsername}`,
            viewUser: {
              firstName: firstName,
              lastName: lastName,
              bio: bio,
              picture: picture,
              favorites: favoriteFountains,
              reviews: reviewFountains,
              username: viewUsername
            },
            user: loginUser,
            isOwnProfile: isOwnProfile
          });
        }
        else throw "Error: This user is private.";
      } catch (e) {
        return res.status(403).render("error", {
          //renders error page if there is an error
          title: "User",
          error: e,
          errorClass: "error", 
        });
      }
  });


/* ========== Settings for user ========== */
router
  .route("/user/:username/settings")
  .get(async (req, res) => {
    try {
      if (!req.params.username || req.params.username === "")
        //checks if username is in the route
        throw "Error: no username provided";

      let username = req.params.username; //checks if user exists
      await usersData.getUserProfile(username);

      if(username === req.session.user.username) return res.status(200).render("settings", { title: "Settings", user: {username: username }}); //renders status page
      else throw "Error: cannot look at user's settings that are not your own."

    } catch (e) {
      return res.status(403).render("error", {
        //renders error page if there was an error
        title: "Settings",
        error: e,
        errorClass: "settingsError",
      });
    }
  })

  .post(async (req, res) => {
    //code here for POST
    try {
      if(!req.params.username || req.params.username === "") throw "Error: no username provided";
        
      if (req.session.user.username !== req.params.username)
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
        error: e,
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
    try {
      if(!req.params.id || req.params.id === "") throw "Error: no id provided";

      let reviewId = req.params.id;

      await reviewsData.removeReview(reviewId);

      res.redirect(req.get("referer"));
    } catch (e) {
      return res.status(400).render('error', {
        title: 'Error',
        error: e
      });
    }
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
