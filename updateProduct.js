const axios = require("axios");
const fs = require("fs");

// Module contenant les credentials
configFile = require("./constante/config");

// Récupère la BDD (fichier json)
const jsonBDD = require("./constante/list-product.json");

// Partage les infos sur le produit trouvé dans la BDD
let newProduct = "";

//Fonction, sous forme de promesse, qui ajoute ou suprime un élément à la liste de course
module.exports.update = (addOrRemove, product) => {
  return new Promise((resolve, reject) => {
    //Création de la requête pour ajouter un produit:
    const config = createRequest(addOrRemove, product);

    // Si la fonction nous retourne une non-correspondance alors on rejete directement la promesse
    // Si correspondance, alors on envoie la requête via Axios
    config === "Produit inconnu" && reject(config);

    // S'il s'agit d'une vérification alors la fonction retournera la quantité de produit trouvé dans le panier dans la variable 'config'
    if (addOrRemove === "verify") {
      let message = "";

      if (config === 0) {
        message =
          "Le produit [" + product + "] n'est pas présent dans le panier";
      } else {
        message =
          "Le produit [" +
          product +
          "] est présent. Il y a en " +
          config +
          " dans le panier";
      }

      resolve(message);
    } else {
      axios(config)
        .then(function (response) {
          // On vérifie les retours
          const codeError =
            response.data.items[0].errors !== undefined
              ? response.data.items[0].errors[0].code
              : null;

          // Gestion du code erreur: MAJ du produit alors je mets à jour la BDD avec les nouvelles informations
          if (codeError !== null && codeError === 4) {
            // Ouvre le fichier json
            let writeStream = fs.createWriteStream(
              "constante/list-product.json"
            );

            // Je cherche le produit correspondant
            const jsonBDDCopy = jsonBDD.map((item) => {
              if (item.idProduct === newProduct.idProduct) {
                // Je change le prix
                item.prix = response.data.items[0].errors[0].new_prix;
              }
              return item;
            });
            // Inscrit dans le fichier, la MAJ (encodage utf8)
            writeStream.write(JSON.stringify(jsonBDDCopy, null, 2), "utf8");

            // Ferme le fichier
            writeStream.end();

            // Gestion du code erreur: Quantité trop importante
          } else if (codeError !== null && codeError === 2) {
            reject(
              "Quantité maximum atteinte. Aucun produit ajouté au panier."
            );

            // Gestion des cas d'erreur (indispo ou inconnu)
          } else if (codeError !== null && codeError === 0) {
            reject(response.data.items[0].errors[0].produit);
          }

          resolve(
            "Ok le produit a été " +
              (addOrRemove === "delete"
                ? "supprimé complétement d"
                : addOrRemove === "remove"
                ? "retiré d"
                : "ajouté a") +
              "u panier"
          );
        })
        .catch(function (err) {
          reject(err);
        });
    }
  });
};

const createRequest = (type, nameOfProduct) => {
  // Etape 1: Je recherche une correspondance entre le produit transmis par le client et la BDD (+ je récupère les caractéristiques de ce produit dans la BDD)
  let theProduct;
  let config;

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
    configFile.shopCart.itemsPanier.map((item, index) => {
      if (item.idProduct === theProduct.idProduct) {
        productIsPresent = true;
        indexOfProduct = index;
      }
    });

    // Soit je vérifie seulement la présence du produit
    if (type === "verify") {
      // Etape 3 A:
      config = productIsPresent
        ? configFile.shopCart.itemsPanier[indexOfProduct].quantite
        : 0;
    } else {
      // Soit je mets à jour la quantité

      // Etape 3B: si le produit est présent, je mets à jour le produit selon les informations que je dispose sinon je conserve les informations provenant du backend
      newProduct = productIsPresent
        ? Object.assign({}, configFile.shopCart.itemsPanier[indexOfProduct])
        : Object.assign({}, theProduct);

      // Etape 4: En fonction du type (ajout VS soustrait VS supprime) je mets à jour la quantité
      newProduct.quantite =
        type === "add"
          ? newProduct.quantite + 1
          : type === "remove"
          ? newProduct.quantite - 1
          : 0;

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
      config = {
        method: "post",
        url:
          "https://api.coradrive.fr/api/magasins/120/panier/" +
          configFile.shopCart.idPanier +
          "/items?uuid=" +
          configFile.uuidCora +
          "&" +
          configFile.shopCart.lastSync,
        headers: {
          Host: "api.coradrive.fr",
          Pragma: "no-cache",
          Authorization: "Bearer " + process.env.CORA_token,
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
    }

    return config;
  }
};
