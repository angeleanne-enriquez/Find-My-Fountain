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

//Main register page
//NEEDS TO BE COMPLETED - JACKSON TULLMAN
router.route('/register').get(async (req, res) => {
    try {
        return res.render('register')
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})
.post(async (req, res) => {
    try {
        //define registration terms
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let email = req.body.email
        let username = req.body.username
        let password = req.body.password
        let bio = req.body.bio
        let picture = req.body.picture
        //registering 
        let newUser = await registerUsers(firstName,lastName,email,username,password,bio,picture)
        //take back to home but now logged in 
        return res.status('landingPage', {user:newUser})
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})


export default router;