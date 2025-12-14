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
import { seedFunc } from "./tasks/seed.js";
import { getUserProfile } from "./data/users.js";
import { getFountain } from "./data/fountains.js";


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

//Seed database
await seedFunc()

/*1. for get /user/:username
    a. if user does not exist, render an error page
    b. if user is private and the viewer is not the user, render an error page
    c. if there are any other errors, render an error page 
    d. else redirect viewer to the user page with that username
*/
app.use("/user/:username", async (req, res, next) => {
    try {
        let viewUsername = req.params.username; //check if user exists; throws otherwise
        let viewUser = await getUserProfile(viewUsername);
        
        if(!viewUser) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: user cannot be found",
            errorClass: "error",
            link: "/user",
            });

        if((req.session.user.username !== req.params.username) && (viewUser.privacy === "private")) return res
            .status(403)
            .render("error", {
            title: "Error",
            error: "Error: user is private.",
            errorClass: "error",
            link: "/user",
            });

        else next();
    } catch(e) {
        return res
            .status(403)
            .render("error", {
            title: "Error",
            error: e,
            errorClass: "error",
            link: "/user",
            });
    }
});

//2. for login page - if the user is already logged in, redirect them to their own page; else go to the login page 
app.use("/login", async (req, res, next) => {
  if (req.session.user) return res.redirect(`/user/${req.session.user["username"]}`);
  next();
});

//3. for register page - if the user is already logged in, redirect them to their own page; else go to the login page 
app.use("/register", async (req, res, next) => {
  if (req.session.user) return res.redirect(`/user/${req.session.user["username"]}`);
  next();
});

/*4. for get /fountain/:id
    a. if fountain does not exist, render an error page
    b. if there are any other errors, render an error page 
    c. else redirect viewer to the fountain page with that id
*/
app.use("/fountain/:id", async (req, res, next) => {
    try {
        let viewFountainId = req.params.id; //check if fountain exists; throws otherwise
        let viewFountain = await getFountain(viewFountainId);
        
        if(!viewFountain) return res.status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain cannot be found",
            errorClass: "error",
            link: "/fountain",
            });

        if(viewFountain.operational === false) return res
            .status(403)
            .render("error", {
            title: "Error",
            error: "Error: fountain is not operational.",
            errorClass: "error",
            link: "/fountain",
            });

        else next();
    } catch(e) {
        return res
            .status(403)
            .render("error", {
            title: "Error",
            error: e,
            errorClass: "error",
            link: "/fountain",
            });
    }
});

//5. for logout page
app.use("/logout", async (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
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