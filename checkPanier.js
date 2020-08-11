const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// Module contenant les credentials
configFile = require("./constante/config");

//Fonction, sous forme de promesse, qui récupère les informations provenant du panier, nécessaire à la mise à jour de celui-ci
module.exports.getIDShoppingCart = () => {
  return new Promise((resolve, reject) => {
    // Création + stockage d'un uuid
    configFile.uuidCora = uuidv4();

    // Préparation de notre body
    const data = "";

    // Preparation de notre requete
    const config = {
      method: "post",
      url:
        "https://api.coradrive.fr/api/magasins/120/panier/checkStatus?uuid=" +
        configFile.uuidCora +
        "&checkPanierDB=1&isLocalSync=1&checkStockDrive=0",
      headers: {
        Host: "api.coradrive.fr",
        Pragma: "no-cache",
        Authorization: "Bearer " + process.env.CORA_token,
        "cora-auth": "apidrive",
        Accept: "application/vnd.api.v1+json",
        "Cache-Control": "no-cache",
        "app-id": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
        "Content-Type": "application/json;charset=utf-8",
        "app-signature":
          "BROWSER;WEB;83.0.4103.97;;2;1;2.5.17;Chrome;1080;1920",
        Origin: "https://www.coradrive.fr",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        // Récupérer les informations qui nous intéresse en ométant les informations innutiles
        // Le panier sans modification provenant de CoraDrive
        const oldShopCart = response.data;
        // L'ID du panier
        const idPanier = oldShopCart.data.id;

        // La denière synchro
        let lastSync = oldShopCart.meta.etatPanier.dateLastUpdate;

        // Enlève l'espace dans la synchro
        lastSync = lastSync.replace(/\s/g, "%20");

        // Les élements du panier si existant
        const globalPanier =
          oldShopCart.data.attributes.lignes_panier === null
            ? []
            : oldShopCart.data.attributes.lignes_panier.data;

        // Je fais un map sur l'ensemble des items pour récupérer les éléments qui nous interesse
        const itemsPanier = globalPanier.map((item) => {
          return {
            idProduct: item.attributes.produit.data.id,
            designation: item.attributes.designation,
            pft: item.attributes.pft,
            quantite: item.attributes.quantite,
            prix: item.attributes.prix,
            context_id: item.attributes.context_id,
            syncID: item.id,
          };
        });

        //Stock toutes les informations dans la variable shopCart
        configFile.shopCart = { idPanier, lastSync, itemsPanier };

        resolve("Ok");
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
