import * as h from "../helpers.js";
import * as f from "./fountains.js";
import * as u from "./users.js";
import { users, fountains, reviews } from "../config/mongoCollections.js";

//Validates a given ratings object
export const checkValidRatings = (ratings) => {
    //Make sure ratings is an object
    h.checkValidObject(ratings, "Ratings");

    //Validate taste
    if (!ratings["taste"]) throw "Taste must be given a rating!"
    h.checkValidNumber(ratings["taste"], 1, 5, "Taste");

    //Validate location
    if (!ratings["location"]) throw "Location must be given a rating!"
    h.checkValidNumber(ratings["location"], 1, 5, "Location");

    //Validate pressure
    if (!ratings["pressure"]) throw "Pressure must be given a rating!"
    h.checkValidNumber(ratings["pressure"], 1, 5, "Pressure");

    //Validate cleanliness
    if (!ratings["cleanliness"]) throw "Cleanliness must be given a rating!"
    h.checkValidNumber(ratings["cleanliness"], 1, 5, "Cleanliness");

    //Validate accessibility
    if (!ratings["accessibility"]) throw "Accessibility must be given a rating!"
    h.checkValidNumber(ratings["accessibility"], 1, 5, "Accessibility");

    //Validate operational
    if (!ratings["operational"]) throw "Operational must be defined!"
    h.checkValidBoolean(ratings["operational"], "Operational");
};

//Creates a new review
export const createReview = async (username, fountainId, body, ratings) => {
    //Validate username
    username = h.checkValidString(username, 2, 20, "Username").toLowerCase();
    
    //Validate fountainId
    fountainId = h.checkValidID(fountainId, "Fountain id");

    //Validate body
    body = h.checkValidString(body, 20, 255, "Review content");

    //Validate ratings
    checkValidRatings(ratings);

    //Validate that user exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({"username": username});
    if (!existingUser) throw "Poster does not exist!";

    //Validate that fountain exists
    const fountainCollection = await fountains();
    const existingFountain = await fountainCollection.findOne({"_id": fountainId});
    if (!existingFountain) throw "Fountain does not exist!";

    //Get reviews collection
    const reviewCollection = await reviews();

    const newReview = {
        username: username,
        fountain: fountainId.toString(),
        body: body,
        ratings: ratings,
        comments: [],
        date: h.formatDate(new Date())
    };

    //Upload new review to database
    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add review!';

    //Update the reviewList and average ratings of the fountain
    f.addReview(fountainId, insertInfo.insertedId);

    //Update the reviewList of the user
    u.addReview(insertInfo.insertedId, username);
};

//Adds a user comment to a review
export const addComment = async (reviewId, username, body) => {
    //Validate reviewId
    reviewId = h.checkValidID(reviewId, "Review id");
    
    //Validate userId
    username = h.checkValidString(username, 2, 20, "Username");

    //Validate body
    body = h.checkValidString(body, 20, 255, "Comment body");

    //Make sure the user exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({"username": username});
    if (!existingUser) throw "User not found!";

    //Get review
    const reviewCollection = await reviews();
    const existingReview = await reviewCollection.findOne({"_id": reviewId});
    if (!existingReview) throw "Review not found!";

    let reviewComments = existingReview["comments"];

    const newComment = {
        username: username,
        body: body
    };

    reviewComments.push(newComment);

    await reviewCollection.updateOne({"_id": reviewId}, {$set:
        {comments: reviewComments}
    });
}

//Gets a review's poster and content
export const getReviewContent = async (reviewId) => {
    //Validate reviewId
    reviewId = h.checkValidID(reviewId, "Review id");

    //Get review
    const reviewCollection = await reviews();

    const review = reviewCollection.findOne({"_id": reviewId});

    if (!review) throw "Review not found";

    let reviewContent = {
        user: review["user"],
        body: review["body"]
    };

    return reviewContent;
}

export const getReviewsByFountainId = async (fountainId) => {
    // validate the id
    fountainId = h.checkValidID(fountainId, "Fountain id");
  
    const reviewCollection = await reviews();
  
    // get all reviews whose fountain field matches this fountainId
    const reviewList = await reviewCollection
      .find({ fountain: fountainId.toString() })
      .toArray();
  
    return reviewList;
  };