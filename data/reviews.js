import * as h from "../helpers.js";
import * as f from "./fountains.js";
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
export const createReview = async (posterId, fountainId, body, ratings) => {
    //Validate posterId
    posterId = h.checkValidID(posterId, "Poster id")
    
    //Validate fountainId
    fountainId = h.checkValidID(fountainId, "Fountain id");

    //Validate body
    body = h.checkValidString(body, 20, 255, "Review content");

    //Validate ratings
    checkValidRatings(ratings);

    //Validate that user exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({"_id": posterId});
    if (!existingUser) throw "Poster does not exist!";

    //Validate that fountain exists
    const fountainCollection = await fountains();
    const existingFountain = await fountainCollection.findOne({"_id": fountainId});
    if (!existingFountain) throw "Fountain does not exist!";

    //Get reviews collection
    const reviewCollection = await reviews();

    const newReview = {
        poster: posterId,
        fountain: fountainId,
        body: body,
        ratings: ratings,
        comments: []
    };

    //Upload new review to database
    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add review!';

    //Update the reviewList and average ratings of the fountain
    f.addReview(fountainId, insertInfo.insertedId);
    
    return getReviewContent(insertInfo.insertedId);
};

//Adds a user comment to a review
export const addComment = async (reviewId, userId, body) => {
    //Validate reviewId
    reviewId = h.checkValidID(reviewId, "Review id");
    
    //Validate userId
    userId = h.checkValidID(userId, "User id");

    //Validate body
    body = h.checkValidString(body, 20, 255, "Comment body");

    //Make sure the user exists
    const userCollection = await users();
    const existingUser = await userCollection.findOne({"_id": userId});
    if (!existingUser) throw "User not found!";

    //Get review
    const reviewCollection = await reviews();
    const existingReview = await reviewCollection.findOne({"_id": reviewId});
    if (!existingReview) throw "Review not found!";

    let reviewComments = existingReview["comments"];

    const newComment = {
        user: userId,
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