//git pull -> gets an updated version
//git add . -> updates any files you edited
//git commit -m "<message what you did>" 
//git push 

//post route for like/dislike/review 
//no logout page, just signout and redirect to home page 

//reformatted with prettier 
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import fileUpload from "express-fileupload";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middlewares
app.use(
  session({
    name: "AuthenticationState",

    secret: "some secret string!",

    resave: false,

    saveUninitialized: false,
  })
);

/*1. for get /user/:id
    a. redirect viewer to the user page with that id 
    b. EXTRA FEATURE: if private, throw error 
    c. if no id was provided, throw error 
*/
app.use("/Find-My-Fountain/user/:id", async (req, res, next) => {
  if (!req.params.id) return res
      .status(403)
      .render("error", {
        title: "Error",
        errorMessages: "Error: no id was given.",
        errorClass: "error",
        link: "/user",
      });
  else next();
});

//setting up the handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.use("/public", express.static("public"));

//uploading file for pfp
app.use(fileUpload());

//setting up the server
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});