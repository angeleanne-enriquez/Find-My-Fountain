import usersRoutes from "./auth_routes.js";

const configRoutes = (app) => {
  app.use("/", usersRoutes);
  app.use(/(.'*')/, (req, res) => {
    return res.status(404).json({ error: "Not found" });
  });
};

export default configRoutes;