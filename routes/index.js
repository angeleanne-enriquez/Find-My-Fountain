import landingRoutes from "./landingRoutes.js";

const configRoutes = (app) => {
  app.use("/", landingRoutes);
  app.use(/(.'*')/, (req, res) => {
    return res.status(404).json({ error: "Not found" });
  });
};

export default configRoutes;