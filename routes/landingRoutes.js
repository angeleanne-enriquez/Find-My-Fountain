import { Router } from "express";
const router = Router();
import { editSettings } from "../data/users.js";


//Main page
router.route('/').get(async (req, res) => {
    try {
        //define needed vars
        user = req.session.user
        return res.render('landingPage',)
    }catch(e){
        return res.status(403).render("error", {error:e})
        }
    

})


export default router;