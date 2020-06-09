const updateProduct = require("./updateProduct.js");

// Gestion des routes du serveur backend
module.exports = function (expressServer) {
  // Récupère des informations provenant de IFTT
  expressServer.get("/", updateProduct.test);
  expressServer.post("/add/product", updateProduct.add);
  expressServer.post("/delete/product", updateProduct.delete);
};
