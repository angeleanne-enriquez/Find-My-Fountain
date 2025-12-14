import * as h from "../helpers.js";
import {fountains, reviews} from '../config/mongoCollections.js'
import { setUncaughtExceptionCaptureCallback } from "node:process";
//Add a review to the fountain and update its ratings
export const addReview = async (fountainId, reviewId) => {
    //Validate fountainId
    fountainId = h.checkValidID(fountainId, "Fountain id");

    //Valiate reviewId
    reviewId = h.checkValidID(reviewId, "Review id");

    //Get review
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({"_id": reviewId});

    if (!review) throw "Review not found!";

    //Get fountain
    const fountainCollection = await fountains();
    const fountain = await fountainCollection.findOne({"_id": fountainId});

    if (!fountain) throw "Fountain not found!";

    let reviewList = fountain["reviews"];

    reviewList.push(review);

    //Recalculate the average ratings
    let avgRatings = calculateAverages(reviewList);

    //Update the fountain
    await reviewCollection.updateOne({"_id": reviewId}, {$set:
        {
            reviews: reviewList,
            avgRatings: avgRatings
        }
    });
};

//Returns the avgRatings object based on the given list of review ids
export const calculateAverages = async (reviews) => {
    //The minimum difference in the number of people who need to report a fountain as nonoperational for the fountain to be flagged
    const operationalThreshold = 5;

    //All of our ratings
    tasteSum = locationSum = pressureSum = cleanlinessSum = accessibilitySum = operationalSum = 0;
    
    const reviewCollection = await reviews();

    //Go through each review and add its ratings
    for (let reviewId of reviews) {
        const review = await reviewCollection.findOne({"_id": reviewId});
        //If the review was deleted, do not use it in the calculations
        if (!review) continue;

        const reviewRatings = review["ratings"];

        tasteSum += reviewRatings["taste"]
        locationSum += reviewRatings["location"]
        pressureSum += reviewRatings["pressure"]
        cleanlinessSum += reviewRatings["cleanliness"]
        accessibilitySum += reviewRatings["accessibility"]

        if (reviewRatings["operational"]) operationalSum++;
    }

    //Determines if enough people have flagged the fountain as non-operational for the flag to be visible
    operational = ((reviews.length - operationalSum) > operationalThreshold);

    //Average each rating
    let avgRatings = {
        taste: tasteSum/reviews.length,
        location: locationSum/reviews.length,
        pressure: pressureSum/reviews.length,
        cleanliness: cleanlinessSum/reviews.length,
        accessibility: accessibilitySum/reviews.length,
        operational: operational
    };

    return avgRatings;
};

//getting fountain
export const getFountain = async(fountainId) => {
    fountainId = h.checkValidID(fountainId)
    const fountainCollection = await fountains();
    const fountain = await fountainCollection.findOne({"_id": fountainId});
    if (!fountain){
        throw "Fountain not found!"
    }
    return fountain
}

//get fountain by borough
export const fountainByBorough = async(borough,parkFilter,ratingFilter) => {
    if (!borough){
        throw "Must input borough!"
    }
    borough = h.checkValidString(borough)
    let lowerBorough = borough.toLowerCase()
    if (lowerBorough != "bronx" && lowerBorough != "staten island" && lowerBorough != "manhattan" && lowerBorough != "brooklyn" && lowerBorough != "queens"){
        throw "Borough must be a NYC borough"
    }
    const fountainCollection = await fountains()
    if (borough == "manhattan"){
        borough = "Manhattan"
    }
    if (borough == "queens"){
        borough = "Queens"
    }
    if (borough == "staten island"){
        borough = "Staten Island"
    }
    if (borough == "brooklyn"){
        borough = "Brooklyn"
    }
    if (borough == "bronx"){
        borough = "Bronx"
    }
    //filtering
    let boroughFiltered = await fountainCollection.find({borough:borough}).toArray()
    let curFilter = boroughFiltered
    let finalFilter = []
    //START FILTERING
    //park filter
    if (parkFilter){
        let filteredParkFountains = []
        for (let x of curFilter){
            if (x.park == parkFilter){
                filteredParkFountains.push(x)
          }
        }
        if (filteredParkFountains.length === 0){
            throw "No fountains in this borough with that park name!"
        }
        curFilter = filteredParkFountains
    }
    //rating filter
    if (ratingFilter && ratingFilter != 'Select Rating'){
        for (let x of curFilter){
            if (x.averageRatings > Number(ratingFilter)){
                finalFilter.push(x)
            }
        }
        if (finalFilter.length === 0){
            throw "No fountains with that rating"
        }
        return finalFilter
    }
    
    return curFilter
}

//Takes a list of ids and returns a list of fountain info (id, park, borough)
export const getFavoriteFountains = async(favoriteIds) => {
    let fountains = []
    for (let fountainId of favoriteIds) {
        let fountain = await getFountain(fountainId);

        let fountainInfo = {};
        
        fountainInfo["_id"] = fountain["_id"].toString();
        fountainInfo["park"] = fountain["park"];
        fountainInfo["borough"] = fountain["borough"];

        fountains.push(fountainInfo);
    }

    return fountains;
}

export default getFountain