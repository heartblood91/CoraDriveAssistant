const axios = require("axios");

// Module contenant les credentials
credentialsModule = require("./credentials");

// Ajoute un élément à la liste de course
module.exports.add = function (req, res, next) {
  // Récupère le produit envoyer en paramètre
  const product = req.params.product;

  //Création de la requête pour ajouter un produit:
  const config = createRequest("add");

  axios(config)
    .then(function (response) {
      return res.status(200).send(response.data);
    })
    .catch(function (error) {
      return res.status(401).send(error);
    });
};

// Supprime un élément à la liste de course
module.exports.delete = function (req, res, next) {
  // Récupère le produit envoyer en paramètre
  const product = req.params.product;

  //Création de la requête pour ajouter un produit:
  const config = createRequest("delete");

  axios(config)
    .then(function (response) {
      return res.status(200).send(response.data);
    })
    .catch(function (error) {
      return res.status(401).send(error);
    });
};

const createRequest = (type) => {
  // Produit factice qui devrait provenir à terme d'une 'BDD'
  let productToTest = {
    idProduct: "2983",
    designation: "Cora comté AOP  au lait cru 5 mois d'affinage minimum 200g",
    pft: 0,
    quantite: 0,
    prix: "2.37",
    context_id: 244,
    syncID: null,
  };

  // Construction de data (body)
  // Etape 1: Je vérifie l'existance du produit dans le panier
  let productIsPresent = false;
  let indexOfProduct = 0;

  // Permet de vérifier si le produit est présent pour un update
  credentialsModule.shopCart.itemsPanier.map((item, index) => {
    if (item.idProduct === productToTest.idProduct) {
      productIsPresent = true;
      indexOfProduct = index;
    }
  });

  // Etape 1bis: si le produit est présent, je mets à jour le produit selon les informations que je dispose sinon je conserve les informations provenant du backend
  let newProduct = productIsPresent
    ? credentialsModule.shopCart.itemsPanier[indexOfProduct]
    : productToTest;

  // Etape2: En fonction du type (achat VS vente) je mets à jour la quantité
  if (type === "add") {
    newProduct.quantite = newProduct.quantite + 1;
  } else if (type === "delete") {
    newProduct.quantite = 0;
  }

  // Etape3: création du body
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
      "app-signature": "BROWSER;WEB;81.0.4044.138;;2;1;2.5.17;Chrome;900;1440",
      Origin: "https://www.coradrive.fr",
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "Accept-Language": "fr,en-US;q=0.9,en;q=0.8",
    },
    data: data,
  };

  return config;
};
