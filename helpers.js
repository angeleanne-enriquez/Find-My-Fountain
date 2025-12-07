import v from "validator";

//Validates the string and makes sure that it is within a given range of length (null to have no limit)
export const checkValidString = (str, min, max, errorName) => {
    if (!str) throw `${errorName} must be defined!`;
    if (typeof str !== "string") throw `${errorName} must be a string!`;
    let trimStr = str.trim();
    if (trimStr == "") throw `${errorName} cannot be an empty string!`;

    if ((min !== null) && (str.length < min)) throw `${errorName} must be at least ${min} characters long!`;
    if ((max !== null) && (str.length > max)) throw `${errorName} must be at most ${max} characters long!`;
    
    return trimStr;
};

//Validates the number and makes sure that it is within a given range (null to have no limit)
export const checkValidNumber = (num, min, max, errorName) => {
    if (!num) throw `${errorName} must be defined!`;
    if (typeof num !== "number") throw `${errorName} must be a number!`;

    if ((min !== null) && (num < min)) throw `${errorName} must be at least ${min}!`;
    if ((max !== null) && (num > max)) throw `${errorName} must be at most ${max}!`;
};

//Validates that a given object is an object
export const checkValidObject = (obj, errorName) => {
    if (!((typeof obj === "object") && (!Array.isArray(obj)) && (obj !== null))) throw `${errorName} must be an object!`;
};

//Validates that a given id is valid
export const checkValidID = (id, errorName) => {
    //Validates the id string
    id = checkValidString(id, errorName);
    if (!ObjectId.isValid(id)) throw 'Invalid object ID!';

    return id;
};

//Validates a given boolean
export const checkValidBoolean = (bool, errorName) => {
    if (!bool) throw `${errorName} must be defined!`;
    if (typeof bool !== "bollean") throw `${errorName} must be a boolean!`;
};

//Validate email
export const checkValidEmail = (email, errorName) => {
    email = h.checkValidString(email, null, null, "errorName");
    if (!(v.isEmail(email_address))) throw `${errorName} must be in a valid format!`;

    return email;
};

//Validate password
export const checkValidPassword = (password, min, max, errorName) => {
    password = h.checkValidString(password, min, max, errorName);

    //Check for no spaces, at least one capital letter, one number, and one special character
    if (!/[A-Z]/.test(password)) throw `${errorName} needs at least one capital letter!`;
    if (!/[\d]/.test(password)) throw `${errorName} needs at least one number!`;
    if (!/[^A-Za-z\d]/.test(password)) throw `${errorName} needs at least one special character!`;
    if (/\s/.test(password)) throw `${errorName} cannot contain any spaces!`;

    return password;
}