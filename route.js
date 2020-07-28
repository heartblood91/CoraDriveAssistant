const authentification = require("./authentfication");
const check = require("./checkPanier");
const setListProduct = require("./setListProduct");

// Gestion des routes du serveur backend
module.exports = function (expressServer) {
  //Authentification
  expressServer.post("/login", authentification.login);

  //Verifie le panier
  expressServer.post("/check", check.getIDShoppingCart);

  //Récupère la BDD de produits:
  expressServer.get("/majListProduct", setListProduct.majListProduct);
};
