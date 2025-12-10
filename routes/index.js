import findMyFountainRoutes from "./findMyFountainRoutes.js";


//all routes routed I believe
const configRoutes = (app) => {
  app.use("/", findMyFountainRoutes);
  
  app.use(/(.'*')/, (req, res) => {
    return res.status(404).json({ error: "Not found" });
  });
};

export default configRoutes;