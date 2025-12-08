import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";
import getFountain from "../data/fountains.js";

router.route('/login').get(async (req, res) => {
    try {
        return res.render('login')
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})