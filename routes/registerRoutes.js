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


export default router;