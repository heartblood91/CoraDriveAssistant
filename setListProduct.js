const axios = require("axios");
const fs = require("fs");

// Fake global list
// Récupère des informations de crédentials sans modification possible
const {
  // testListeCourseGlobal, // A supprimer
  // testListeCourseUnique, // A supprimer
  idShop,
  nameOfListUseForBDD,
} = require("./credentials");
const { resolve } = require("path");

// Module contenant les credentials
credentialsModule = require("./credentials");

// Header identique dans les 2 requêtes
const defaultHeader = {
  Host: "api.coradrive.fr",
  Pragma: "no-cache",
  Authorization: "Bearer " + credentialsModule.token,
  "cora-auth": "apidrive",
  Accept: "application/vnd.api.v1+json",
  "Cache-Control": "no-cache",
  "app-id": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  "Content-Type": "application/json",
  "app-signature": "BROWSER;WEB;81.0.4044.138;;2;1;2.5.17;Chrome;900;1440",
  Origin: "https://www.coradrive.fr",
  "Sec-Fetch-Site": "same-site",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
  "Accept-Language": "fr,en-US;q=0.9,en;q=0.8",
};

// Récupère l'ID de la liste contenant les produits pour la BDD en parcourant toutes les listes de courses
const getLists = () => {
  // Preparation de notre requete
  const config = {
    method: "get",
    url:
      "https://api.coradrive.fr/api/me/listeDeCourses?ean_unique=1&magasin_id=" +
      idShop,
    headers: {
      ...defaultHeader,
    },
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        // Récupère l'ensemble des listes de courses
        const oldGlobalList = response.data.data;

        // Fake listes pour le test
        //const oldGlobalList = testListeCourseGlobal.data;

        // Je cherche la liste qui va me servir pour créer la BDD
        // Variable representant l'index de la liste
        let indexOfTheList = -1;

        // Je parcours toutes les listes de courses pour trouver une correspondance
        oldGlobalList.map((list, index) => {
          if (list.attributes.titre === nameOfListUseForBDD) {
            indexOfTheList = index;
          }
        });

        // Si une correspondance est trouvé alors je mets à jour la variable
        // Si non je préviens l'utilisateur
        if (indexOfTheList > -1) {
          credentialsModule.iDOfListUseForBDD =
            oldGlobalList[indexOfTheList].id;

          // Retourne au client que tout s'est bien déroulé
          resolve("Ok");
        } else {
          // Retourne au client qu'aucune correspondance n'a été trouvé
          reject(
            "ATTENTION, je ne trouve pas de liste de course avec le nom: " +
              nameOfListUseForBDD
          );
        }
      })
      .catch(function (error) {
        // Retourne au client une erreur
        reject(error);
      });
  });
};

// Récupère la liste des produits sur la dite liste de course
formatListProduct = () => {
  // Preparation de notre requete
  const config = {
    method: "get",
    url:
      "https://api.coradrive.fr/api/me/listeDeCourses/" +
      credentialsModule.iDOfListUseForBDD +
      "?ean_unique=1&magasin_id=" +
      idShop,
    headers: {
      ...defaultHeader,
    },
  };
  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        // Récupère l'ensemble des produits de la liste de courses
        const oldUniqueList = response.data.data.attributes.produits.data;

        // Fake liste de course
        //const oldUniqueList = testListeCourseUnique.data.attributes.produits.data;

        // Transforme la liste de course en une liste de produit adapté aux requetes de Cora
        const newUniqueList = oldUniqueList.map((item) => {
          return {
            idProduct: item.attributes.produit.data.id,
            designation: item.attributes.produit.data.attributes.designation,
            googleIngredientCmd:
              item.attributes.produit.data.attributes.designation, //par défaut il s'agit de la désignation du produit détérminé par Cora
            pft: item.attributes.produit.data.attributes.pft,
            quantite: 0, // Par défaut on en a 0 dans le panier
            prix: item.attributes.produit.data.attributes.prix,
            context_id: 244, //Fixé à 244 par Cora d'après plusieurs tests
            syncID: null, //Fixé à null si absent du panier
          };
        });

        // Ouvre le fichier json
        let writeStream = fs.createWriteStream("constante/list-product.json");

        // Inscrit dans le fichier, la liste des produits favoris (encodage utf8)
        writeStream.write(JSON.stringify(newUniqueList, null, 2), "utf8");

        // Ferme le fichier
        writeStream.end();

        // Retourne au client que tout s'est bien déroulé
        resolve("Ok");
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

// Récupère la liste des produits sur la dite liste de course
module.exports.majListProduct = function (req, res, next) {
  // Etape 1: Je récupère l'ID de la liste de course utilisée pour créer la BDD parmis l'ensemble des listes de courses en favoris de l'utilisateur
  getLists()
    .then(function () {
      // Etape 2: Si j'ai bien récupéré un ID alors, je peux récupérer le contenu de la liste de course et la formater
      formatListProduct()
        .then(function (resultat) {
          return res.status(200).send(resultat);
        })
        .catch(function (err) {
          // Echec de l'étape 2 (erreur de requête)
          return res.status(400).send(err);
        });
    })

    // Echec de l'étape 1 (soit erreur de requête soit pas de correspondance)
    .catch(function (err) {
      return res.status(400).send(err);
    });
};
