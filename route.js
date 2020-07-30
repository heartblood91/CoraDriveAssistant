const setListProduct = require("./sequenceSetListProduct");
const sequenceUpdate = require("./sequenceUpdateCart");

// Gestion des routes du serveur backend
module.exports = function (expressServer) {
  // Séquence de MAJ du panier (ajout/soustraction/suppression d'un item)
  expressServer.post(
    "/update/:type/item/:product",
    sequenceUpdate.updateCartComplete
  );

  //Récupère la BDD de produits:
  expressServer.get("/majListProduct", setListProduct.majListProduct);
};
