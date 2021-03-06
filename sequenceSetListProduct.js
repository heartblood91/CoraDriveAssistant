const axios = require("axios");
const fs = require("fs");

// Récupère le module de connexion + les credentials
const authModule = require("./authentfication");
const configFile = require("./constante/config");
const verificator = require("./verify");
const notification = require("./notif");

//Récupère l'ancienne liste JSON
const oldUniqueList = require("./constante/list-product.json");

// Header identique dans les 2 requêtes
const defaultHeader = {
  Host: "api.coradrive.fr",
  Pragma: "no-cache",
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
      configFile.idShop,
    headers: {
      ...defaultHeader,
      Authorization: "Bearer " + process.env.CORA_token, //Ajout du token car il est fixé après la connexion
    },
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        // Récupère l'ensemble des listes de courses
        const oldGlobalList = response.data.data;

        // Je cherche la liste qui va me servir pour créer la BDD
        // Variable representant l'index de la liste
        let indexOfTheList = -1;

        // Je parcours toutes les listes de courses pour trouver une correspondance
        oldGlobalList.map((list, index) => {
          if (list.attributes.titre === configFile.nameOfListUseForBDD) {
            indexOfTheList = index;
          }
        });

        // Si une correspondance est trouvé alors je mets à jour la variable
        // Si non je préviens l'utilisateur
        if (indexOfTheList > -1) {
          configFile.iDOfListUseForBDD = oldGlobalList[indexOfTheList].id;

          // Retourne au client que tout s'est bien déroulé
          resolve("Ok");
        } else {
          // Retourne au client qu'aucune correspondance n'a été trouvé
          reject(
            "ATTENTION, je ne trouve pas de liste de course avec le nom: " +
              configFile.nameOfListUseForBDD
          );
        }
      })
      .catch(function (error) {
        // Retourne au client une erreur
        reject("erreur de connexion à Cora pour la liste");
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
      configFile.iDOfListUseForBDD +
      "?ean_unique=1&magasin_id=" +
      configFile.idShop,
    headers: {
      ...defaultHeader,
      Authorization: "Bearer " + process.env.CORA_token, //Ajout du token car il est fixé après la connexion
    },
  };

  return new Promise((resolve, reject) => {
    let message = "";
    let iProductAdd = 0;
    let iProductMaj = 0;

    axios(config)
      .then(function (response) {
        // Récupère l'ensemble des produits de la liste de courses

        const newUniqueListWithoutFormat =
          response.data.data.attributes.produits.data;

        // Verifie si le produit est déjà dans la liste
        newUniqueListWithoutFormat.map((item) => {
          let isCommon = false;
          //Je boucle sur tous les items de la liste que nous avons en stock
          oldUniqueList.map((oldItem) => {
            //Si je trouve l'ID correspondant  --> ABORT
            if (oldItem.idProduct === item.attributes.produit.data.id) {
              // Je vérifie que le prix, la désignation ou l'image n'est pas été MAJ
              if (
                oldItem.designation !==
                  item.attributes.produit.data.attributes.designation ||
                oldItem.prix !== item.attributes.produit.data.attributes.prix ||
                oldItem.visuel !==
                  item.attributes.produit.data.attributes.visuel
              ) {
                // Par précaution, je vérifie que la MAJ apporte quelque chose (pas de undefined || null || "" || " ")
                if (
                  item.attributes.produit.data.attributes.designation == null ||
                  item.attributes.produit.data.attributes.designation.trim()
                    .length === 0 ||
                  item.attributes.produit.data.attributes.prix == null ||
                  item.attributes.produit.data.attributes.prix.trim().length ===
                    0 ||
                  item.attributes.produit.data.attributes.visuel == null ||
                  item.attributes.produit.data.attributes.visuel.trim()
                    .length === 0
                ) {
                } else {
                  oldItem.designation =
                    item.attributes.produit.data.attributes.designation;
                  oldItem.prix = item.attributes.produit.data.attributes.prix;

                  // Récupère le lien de la photo mais remplace le sous domaine api par www
                  (oldItem.visuel = item.attributes.produit.data.attributes.visuel
                    .replace("api", "www")
                    .replace("###DIMENSION###", "400")), // Récupère le lien de la photo mais remplace le sous domaine api par www + remplace ###DIMENSION### par 400 (val par def.)
                    (iProductMaj += 1);

                  // Récupère le n° du rayon
                  oldItem.rayon =
                    item.attributes.produit.data.attributes.visuel.split(
                      "/"
                    )[7] === undefined
                      ? null
                      : parseInt(
                          item.attributes.produit.data.attributes.visuel
                            .split("/")[7]
                            .replace("R", "")
                        );
                }
              }

              return (isCommon = true);
            }
          });

          // Si nouvel ID alors je l'ajoute à la liste actuel:
          if (!isCommon) {
            // Transforme la liste de course en une liste de produit adapté aux requetes de Cora
            oldUniqueList.push({
              idProduct: item.attributes.produit.data.id,
              designation: item.attributes.produit.data.attributes.designation,
              googleIngredientCmd:
                item.attributes.produit.data.attributes.designation, //par défaut il s'agit de la désignation du produit détérminé par Cora
              visuel: item.attributes.produit.data.attributes.visuel
                .replace("api", "www")
                .replace("###DIMENSION###", "400"), // Récupère le lien de la photo mais remplace le sous domaine api par www + remplace ###DIMENSION### par 400 (val par def.)
              // Récupère le n° du rayon
              rayon:
                item.attributes.produit.data.attributes.visuel.split("/")[7] ===
                undefined
                  ? null
                  : parseInt(
                      item.attributes.produit.data.attributes.visuel
                        .split("/")[7]
                        .replace("R", "")
                    ),
              pft: item.attributes.produit.data.attributes.pft,
              quantite: 0, // Par défaut on en a 0 dans le panier
              prix: item.attributes.produit.data.attributes.prix,
              context_id: 244, //Fixé à 244 par Cora d'après plusieurs tests
              syncID: null, //Fixé à null si absent du panier
            });

            //Compte le nombre de produits ajouter à la liste
            iProductAdd += 1;
          }
        });

        // Création du message avec le(s) produit(s) ajouté(s):
        if (iProductAdd > 0) {
          message =
            iProductAdd.toString() +
            (iProductAdd >= 2 ? " produits ajoutés. " : " produit ajouté. ");
        }

        // idem pour le(s) produit(s) MAJ:
        if (iProductMaj > 0) {
          message =
            message +
            iProductMaj.toString() +
            (iProductMaj >= 2
              ? " produits mises à jour. "
              : " produit mise à jour. ");
        }

        // Ouvre le fichier json
        let writeStream = fs.createWriteStream("constante/list-product.json");

        // Inscrit dans le fichier, la liste des produits favoris (encodage utf8)
        writeStream.write(JSON.stringify(oldUniqueList, null, 2), "utf8");

        // Ferme le fichier
        writeStream.end();

        // Retourne au client:
        // Il manque des produits car indisponibles sur le site CoraDrive actuellement
        const indispo = response.data.meta.items_indisponibles;

        // S'il y a des produits indisponibles:
        if (indispo.length > 0) {
          const productsIndispo = indispo.map((item) => {
            return " " + item.designation;
          });

          // Création du message
          message =
            message +
            "Je n'ai pas pu compléter la liste avec " +
            (indispo.length >= 2 ? "ces produits:" : "ce produit:") +
            productsIndispo;

          // Transmission du message
          resolve(message);

          // Tout est ok
        } else {
          resolve(message);
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

// Récupère la liste des produits sur la dite liste de course
module.exports.majListProduct = function (req, res, next) {
  // Etape 0: Je vérifie l'intégrité de la requête. Si tout est ok, alors je continue le script

  verificator
    .verifyAll(req.params.checksum)
    .then(() => {
      // Etape 1: Je me connecte
      authModule.login().then(function (resultat) {
        if (resultat === "Ok") {
          // Etape 2: Je récupère l'ID de la liste de course utilisée pour créer la BDD parmis l'ensemble des listes de courses en favoris de l'utilisateur
          getLists()
            .then(function () {
              // Etape 3: Si j'ai bien récupéré un ID alors, je peux récupérer le contenu de la liste de course et la formater
              formatListProduct()
                .then(function (resultat) {
                  notification.notifyMe(resultat, "Succes");
                  return res.status(200).send(resultat);
                })
                .catch(function (err) {
                  // Echec de l'étape 3 (erreur de requête)
                  notification.notifyMe("Voir les logs", "Erreur");
                  return res.status(400).send(err);
                });
            })

            // Echec de l'étape 2 (soit erreur de requête soit pas de correspondance)
            .catch(function (err) {
              notification.notifyMe("Voir les logs", "Erreur");
              return res.status(400).send(err);
            });
        } else {
          // Echec étape 1
          notification.notifyMe("Echec lors de l'authentification", "Erreur");
          return res.status(401).send("Echec lors de l'authentification");
        }
      });
    })
    .catch((err) => {
      notification.notifyMe("Checksum", "Erreur");
      res.status(401).send(err);
    });
};
