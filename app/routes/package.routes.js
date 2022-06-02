const { authJwt } = require("../middlewares");
const controller = require("../controllers/package.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  

  app.get("/api/package/:id", [/*authJwt.verifyToken*/], controller.getOnePackage);
  app.get("/api/package", [authJwt.verifyToken,authJwt.isAdmin], controller.getAllPackages);
  app.post("/api/package", [authJwt.verifyToken,authJwt.isAdmin], controller.createPackage);
  app.put("/api/package/:id", [authJwt.verifyToken,authJwt.isAdmin], controller.updatePackage);
  app.delete("/api/package/:id", [authJwt.verifyToken,authJwt.isAdmin], controller.deletePackage);
  
};
