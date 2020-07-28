const axios = require("axios");

// Module contenant les credentials
credentialsModule = require("./credentials");

// Récupère la BDD (fichier json)
const jsonBDD = require("./constante/list-product.json");

//Fonction, sous forme de promesse, qui ajoute ou suprime un élément à la liste de course
module.exports.update = (addOrRemove, product) => {
  return new Promise((resolve, reject) => {
    //Création de la requête pour ajouter un produit:
    const config = createRequest(addOrRemove, product);

    // Si la fonction nous retourne une non-correspondance alors on rejete directement la promesse
    // Si correspondance, alors on envoie la requête via Axios
    config === "Produit inconnu" && reject(config);

    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

const createRequest = (type, nameOfProduct) => {
  // Etape 1: Je recherche une correspondance entre le produit transmis par le client et la BDD (+ je récupère les caractéristiques de ce produit dans la BDD)
  let theProduct;

  jsonBDD.map((productBDD) => {
    if (productBDD.googleIngredientCmd.trim().toLowerCase() === nameOfProduct) {
      // Copie l'ensemble des caractéristiques du produit
      theProduct = Object.assign({}, productBDD);

      // Supprime les informations innutiles
      delete theProduct.googleIngredientCmd;
    }
  });

  // Je vérifie qu'un produit a été trouvé dans la BDD
  // Si aucune correspondance, je stop le script et je fais un retour à l'utilisateur

  if (theProduct === undefined) {
    return "Produit inconnu";
  } else {
    // Construction de data (body)
    // Etape 2: Je vérifie l'existance du produit dans le panier
    let productIsPresent = false;
    let indexOfProduct = 0;

    // Permet de vérifier si le produit est présent pour un update
    credentialsModule.shopCart.itemsPanier.map((item, index) => {
      if (item.idProduct === theProduct.idProduct) {
        productIsPresent = true;
        indexOfProduct = index;
      }
    });

    // Etape 3: si le produit est présent, je mets à jour le produit selon les informations que je dispose sinon je conserve les informations provenant du backend
    let newProduct = productIsPresent
      ? Object.assign(
          {},
          credentialsModule.shopCart.itemsPanier[indexOfProduct]
        )
      : Object.assign({}, theProduct);

    // Etape 4: En fonction du type (achat VS vente) je mets à jour la quantité
    newProduct.quantite = type === "add" ? newProduct.quantite + 1 : 0;

    // Etape 5: création du body
    const data =
      '{"items":[{"id":' +
      newProduct.idProduct +
      ',"designation":"' +
      newProduct.designation +
      '","pft":' +
      newProduct.pft +
      ',"quantite":' +
      newProduct.quantite +
      ',"prix":"' +
      newProduct.prix +
      '","context_id":' +
      newProduct.context_id +
      ', "syncId":' +
      newProduct.syncID +
      "}]}";

    //Etape 6: Création de la config
    const config = {
      method: "post",
      url:
        "https://api.coradrive.fr/api/magasins/120/panier/" +
        credentialsModule.shopCart.idPanier +
        "/items?uuid=" +
        credentialsModule.uuidCora +
        "&" +
        credentialsModule.shopCart.lastSync,
      headers: {
        Host: "api.coradrive.fr",
        Pragma: "no-cache",
        Authorization: "Bearer " + credentialsModule.token,
        "cora-auth": "apidrive",
        Accept: "application/vnd.api.v1+json",
        "Cache-Control": "no-cache",
        "app-id": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
        "Content-Type": "application/json;charset=UTF-8",
        "app-signature":
          "BROWSER;WEB;81.0.4044.138;;2;1;2.5.17;Chrome;900;1440",
        Origin: "https://www.coradrive.fr",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Language": "fr,en-US;q=0.9,en;q=0.8",
      },
      data: data,
    };

    return config;
  }
};
