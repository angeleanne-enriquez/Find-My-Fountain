import fileUpload from "express-fileupload";

import express from "express";
const app = express();

app.use(fileUpload());