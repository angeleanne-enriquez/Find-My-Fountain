//import fountiain database
import { fountains } from "../config/mongoCollections.js";
//URL to fetch with 
let URL = "https://data.cityofnewyork.us/resource/qnv7-p7a2.json"
//Seeding using fetch implemented like this https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export const seedFunc = async () => {
    //obtaining fountain collection to add to 
    let fountainCollection = await fountains()
    //check if database already seeded
    let checkFountain = await fountainCollection.findOne()
    if (checkFountain){
        console.log("Fountains already seeded!");
        return
    }
    //seeding database using fetch
    let response  = await fetch(URL)
    let result =  await response.json()
    //inserting into all fountains into collection
    await fountainCollection.insertMany(result)
    //say seeded
    console.log("Fountain Data Seeded!");
}
