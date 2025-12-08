import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";

//FIX THIS NEED TO GET SEARCH TERM FROM SEARCH FORM ON LANDING PAGE
//STRUGGLING A BIT IF ANYONE COULD HELP THANK YOU - JACKSON
//Search page
router.route('/search').get(async (req, res) => {
    try {
        //searching
        search = req.body.q
        //leads to search page
        res.render('searchResults')
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})

export default router;