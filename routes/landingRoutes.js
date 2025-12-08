import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";


//Main page
router.route('/').get(async (req, res) => {
    try {
        //define needed vars
        let user = req.session.user
        return res.render('landingPage', user)
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})


export default router;