import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";


//Search page
router.route('/search').get(async (req, res) => {
    try {
        //searching
        search = req.body.q
        //leads to search page
        res.render('searchResults', search)
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})

export default router;