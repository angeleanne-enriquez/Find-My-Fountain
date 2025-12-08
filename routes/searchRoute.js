import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";


//Search page
router.route('/Find-My-Fountain/search').post(async (req, res) => {
    //search may be a different name CHANGE LATER
    let searchInput = req.body.search
    
    //validate input
    h.checkValidString(searchInput)

})

export default router;