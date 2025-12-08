import { Router } from "express";
const router = Router();
import * as h from "../helpers.js";
import getFountain from "../data/fountains.js";

router.route('/fountain/:id').get(async (req, res) => {
    try {
        //checking if fountain exists
        let fountainId = req.params.id;
        let fountain = await getFountain(fountainId);
        //display
        res.render('fountainDetails',fountain)
    }catch(e){
        //error message
        return res.status(403).render("error", {error:e})
        }
})