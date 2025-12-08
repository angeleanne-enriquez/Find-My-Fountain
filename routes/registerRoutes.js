import { Router } from "express";
const router = Router();

//Main register page
//NEEDS TO BE COMPLETED
router.route('/register').get(async (req, res) => {
    try {
        return res.render('register')
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})


export default router;