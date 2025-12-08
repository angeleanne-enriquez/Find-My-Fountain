import landingRoutes from "./landingRoutes.js";
import loginRoutes from "./loginRoutes.js";
import searchRoutes from "./searchRoutes.js";
import fountainRoutes from "./fountainRoutes.js";
import userRoutes from "./userRoutes.js";
import registerRoutes from './registerRoutes.js'

//all routes routed I believe
const configRoutes = (app) => {
  app.use("/", landingRoutes);
  app.use("/", fountainRoutes)
  app.use("/", userRoutes)
  app.use("/", searchRoutes)
  app.use("/",loginRoutes)
  app.use("/", registerRoutes)

  app.use(/(.'*')/, (req, res) => {
    return res.status(404).json({ error: "Not found" });
  });
};

export default configRoutes;