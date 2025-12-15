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
    let results =  await response.json()

    let formattedResults = [];
    for (let result of results) {
        let formattedResult = {};

        //Format the bouroughs
        if (result["borough"] === "M") result["borough"] = "Manhattan";
        else if (result["borough"] === "R") result["borough"] = "Staten Island";
        else if (result["borough"] === "Q") result["borough"] = "Queens";
        else if (result["borough"] === "B") result["borough"] = "Brooklyn";
        else if (result["borough"] === "X") result["borough"] = "Bronx";

        formattedResult["borough"] = result["borough"];

        //Location
        formattedResult["location"] = [result["the_geom"]["coordinates"][0], result["the_geom"]["coordinates"][1]];

        //Park
        formattedResult["park"] = result["propertyna"];

        //Ratings
        formattedResult["avgRatings"] = {
            taste: 0,
            location: 0,
		    pressure: 0,
		    cleanliness: 0,
		    accesibility: 0,
		    operational: true
        };

        //Numfavorites
        formattedResult["numFavorites"] = 0;

        formattedResult["reviews"] = [];

        formattedResults.push(formattedResult);
    }

    //inserting into all fountains into collection
    await fountainCollection.insertMany(formattedResults);
    //say seeded
    console.log("Fountain Data Seeded!");
}
