const updateProduct = require("./updateProduct");
const authentification = require("./authentfication");
const check = require("./checkPanier");
const setListProduct = require("./setListProduct");

// Gestion des routes du serveur backend
module.exports = function (expressServer) {
  // Récupère des informations provenant de IFTT

  // MAJ des produits (ajout / suppression)
  expressServer.post("/add/:product", updateProduct.add);
  expressServer.post("/delete/:product", updateProduct.delete);

  //Authentification
  expressServer.post("/getFormToken", authentification.getFormToken);
  expressServer.post("/login", authentification.login);
  expressServer.post("/logout", authentification.logout);

  //Verifie le panier
  expressServer.post("/check", check.getIDShoppingCart);

  //Récupère la BDD de produits:
  expressServer.get("/majListProduct", setListProduct.majListProduct);
};
