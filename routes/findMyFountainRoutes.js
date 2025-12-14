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
      return res.render('login')
    }catch(e){
      //error message
      return res.status(403).render("error", {error:e})
      }
  })
  .post(async (req, res) => {
    // code here for POST login (authenticate user)
    try{
      //field validation
      if (!req.body.username){
        return res.status(403).render("login", {error:"must fill in username"})
       }
      if (!req.body.password){
        return res.status(403).render("login", {error:"must fill in password"})
      }
      //login
      let didLogin = await usersData.login(req.body.username,req.body.password)
      if (didLogin){
        req.session.user = {
          username: didLogin.username,
          firstName: didLogin.firstName,
          lastName: didLogin.lastName,
          email: didLogin.email,
          bio: didLogin.bio,
          picture: didLogin.picture,
          _id: didLogin._id
        }
        return res.redirect(`/user/${req.session.user["username"]}`)
      } else {
        //error message
        return res.status(403).render("error", {error:"login error"})
      }
    } catch(e){
      return res.status(403).render("error", {error:e})
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



/* ========== Search ========== */
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
      res.render('searchResults',{borough:req.body.q,fountainBoroughs:fountainBoroughs})
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
        //checking if arguments are provided 
        if(!req.params.id || req.params.id === "") throw "Error: no id provided";

        //checking if fountain exists
        let fountainId = req.params.id;
        let fountain = await fountainsData.getFountain(fountainId);

        if(!fountain) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain cannot be found",
            errorClass: "error",
            link: "/fountain",
        });

        //checking if fountain is operational
        if(fountain.operational === false) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain is not working",
            errorClass: "error",
            link: "/fountain",
        })

        let user = null,
            favorited = false,
            reviews = fountain.reviews;
        
        //checking if user already favorited it 
        if(req.session.user) {
            user = req.session.user;
            
            let userData = await usersData.getUserProfile(user.username);
            let favorites = await userData["favorites"];

            favorited = (favorites.includes(req.params.id));
        }

        return res.status(200).render('fountainDetails', {
          fountain: fountain,
          user: user,
          favorited: favorited, 
          reviews: reviews
        });
    } catch(e) {
        return res.status(403).render("error", {error:e})
    }
  })
  .post(async (req, res) => {
    // code here for POST new review / mark as working
    try {
        //checking if arguments are provided 
        if(!req.params.id || req.params.id === "") throw "Error: no id provided";

        //checking if fountain exists
        let fountainId = req.params.id;
        let fountain = await fountainsData.getFountain(fountainId);

        if(!fountain) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain cannot be found",
            errorClass: "error",
            link: "/fountain",
        });

        //checking if fountain is operational
        if(fountain.operational === false) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain is not working",
            errorClass: "error",
            link: "/fountain",
        })

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
            taste: req.body.taste,
            location: req.body.location,
            pressure: req.body.pressure,
            cleanliness: req.body.cleanliness, 
            accessiblity: req.body.accessibility,
            operational: req.body.operational}

        let review = await reviewsData.createReview(user, fountainId, reviewText, ratings);
        if(!review) throw "Error: unable to create review/mark fountain as un/operational.";

        let reviewAdded = await fountainsData.addReview(fountainId, review._id);
        if(!reviewAdded) throw "Error: unable to add review/mark fountain as un/operational.";

        let reviews = fountain.reviews;

        return res.status(200).render('fountainDetails',fountain, user, reviews);
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
        if (!req.params.username || req.params.username === "") {
          //check if username is in the route
          throw "Error: no username provided";
        }

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
          let reviews = viewUser.reviews;

          let isOwnProfile = ((req.session.user) && (req.session.user.username === viewUser.username));
          
          let loginUser = null;
          if (req.session.user) loginUser = req.session.user;

          let favoriteFountains = await fountainsData.getFavoriteFountains(favorites);

          return res.status(200).render("profile", {
            //returns page with that info
            title: `User: ${viewUsername}`,
            viewUser: {
              firstName: firstName,
              lastName: lastName,
              bio: bio,
              picture: picture,
              favorites: favoriteFountains,
              reviews: reviews,
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
  })


/* ========== Settings for user ========== */
router
  .route("/user/:username/settings")
  .get(async (req, res) => {
    try {
      if (!req.params.username || req.params.username === "")
        //checks if username is in the route
        throw "Error: no userlink provided";

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
  });

// Add a comment to a review
router
  .route('/reviews/:id/comments')
  .post(async (req, res) => {
    // code here for POST add comment on a review
    if(!req.params.id || req.params.id === "") throw "Error: no id provided";

    let reviewId = req.params.id;
    let review = await reviewsData.getReviewContent(reviewId);

    if(!review) return res.status(403)
        .render("error", {
        title: "Error",
        error: "Error: review cannot be found",
        errorClass: "error",
        link: "/review",
    });

    if(!req.session.user) return res.status(403)
        .render("error", {
        title: "Error",
        error: "Error: user must be logged in to comment under a review",
        errorClass: "error",
        link: "/review",
    });

    let username = req.session.user.username, 
        comment = req.body.body
  });

export default router;
