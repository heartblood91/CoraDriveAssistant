const setListProduct = require("./sequenceSetListProduct");
const sequenceUpdate = require("./sequenceUpdateCart");
const cryptMachine = require("./cryptSecret");

// Gestion des routes du serveur backend
module.exports = function (expressServer) {
  // Séquence de MAJ du panier (ajout/soustraction/suppression d'un item)
  expressServer.post(
    "/update/:type/item/:product/:checksum?",
    sequenceUpdate.updateCartComplete
  );

  //Récupère la BDD de produits:
  expressServer.get(
    "/majListProduct/:checksum?",
    setListProduct.majListProduct
  );

  //Chiffres les identifiants (login + mdp)
  expressServer.get("/cryptMyID/:checksum?", cryptMachine.secretKeyToCrypt);
};
