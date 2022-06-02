const { authJwt } = require("../middlewares");
const controller = require("../controllers/delivery.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  

  app.get("/api/delivery/:id", [/*authJwt.verifyToken*/], controller.getOneDelivery);
  app.get("/api/delivery", [authJwt.verifyToken,authJwt.isAdmin], controller.getAllDeliveries);
  app.post("/api/delivery", [authJwt.verifyToken,authJwt.isAdmin], controller.createDelivery);
  app.put("/api/delivery/:id", [authJwt.verifyToken,authJwt.isAdmin], controller.updateDelivery);
  app.delete("/api/delivery/:id", [authJwt.verifyToken,authJwt.isAdmin], controller.deleteDelivery);
  
};
