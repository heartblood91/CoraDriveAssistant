// Récupère les différents modules
const authModule = require("./authentfication");
const checkCart = require("./checkPanier");
const googleTranslate = require("./googleSentences");
const updateProduct = require("./updateProduct");
const verificator = require("./verify");

module.exports.updateCartComplete = function (req, res, next) {
  //Je récupère les informations transmises dans la requête (type d'update + l'item)
  const typeUpdate = req.params.type;
  const ingredientGoogle = req.params.product;

  // Etape 0: Je vérifie l'intégrité de la requête. Si tout est ok, alors je continue le script

  verificator
    .verifyAll(req.params.checksum)
    .then(() => {
      // Etape 1: Je me connecte
      authModule
        .login()
        .then(function (resultat) {
          if (resultat === "Ok") {
            // Etape 2: Je récupère des informations sur le panier
            checkCart
              .getIDShoppingCart()
              .then(function (resultat) {
                if (resultat === "Ok") {
                  //Etape 3: J'envoie le produit brute reçu en paramètre et je l'envoie au 'traducteur' pour ressortir les mots clés
                  googleTranslate
                    .getGoogleItems(ingredientGoogle)
                    .then((product) => {
                      //Etape 4: Je transmet toutes ces informations pour MAJ le panier
                      updateProduct
                        .update(typeUpdate, product)
                        .then(function (resultat) {
                          return res.status(200).send(resultat);
                        })

                        .catch((err) => {
                          // Echec de l'étape 4
                          return res.status(400).send(err);
                        });
                    })

                    .catch((err) => {
                      //Echec de l'étape 3
                      return res.status(400).send(err);
                    });
                } else {
                  // Echec étape 2
                  return res.status(400).send("Echec de la MAJ du panier");
                }
              })

              // Echec Etape 2
              .catch(function (err) {
                return res.status(400).send(err);
              });

            // Echec Etape 1
          } else {
            return res.status(400).send("Echec de l'authentification");
          }
        })

        // Echec de l'étape 1
        .catch(function (err) {
          return res.status(400).send(err);
        });
    })
    .catch((err) => res.status(401).send(err));
};
