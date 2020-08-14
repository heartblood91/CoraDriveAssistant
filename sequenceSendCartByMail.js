// Récupère les différents modules
const authModule = require("./authentfication");
const checkCart = require("./checkPanier");
const verificator = require("./verify");
const notification = require("./notif");
const senderMail = require("./sendMail");
const configFile = require("./constante/config");

// Fonction permettant de formater un panier en une belle liste de course pour un envoie par mail
const formatMyCartToList = () => {
  // J'initialise mes variables
  let totalPrice = 0;
  let bodyMail = { withHTML: "", withoutHTML: "" };

  // Préparation de variable contenant le contenu du mail (avec/sans HTML)
  bodyMail.withoutHTML =
    "Bonjour, \nVeuillez trouver ci-dessous votre liste de course: \n\n";
  bodyMail.withHTML =
    '<html> <head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"> </head> <body> Bonjour, <br>Veuillez trouver ci-dessous votre liste de course: <br><ul>';

  configFile.shopCart.itemsPanier.map((item) => {
    // Je prends l'ancienne valeur du total et j'aoute le produit (prix unitaire * sa quantité)
    totalPrice = totalPrice + parseFloat(item.prix) * parseInt(item.quantite);

    // Je prends le contenu de mail et j'ajoute le nouveau produit (selon HTML/Text simple)

    // Version texte simple:
    bodyMail.withoutHTML =
      bodyMail.withoutHTML +
      "-" +
      item.designation +
      " X " +
      item.quantite +
      "\n";

    // En version HTML:

    bodyMail.withHTML =
      bodyMail.withHTML +
      "<li>" +
      '<img data-v-308641df="" src="' +
      item.visuel +
      '" alt="' +
      item.designation +
      '" class="photo" moz-do-not-send="true" width="50" height="50"></img> X ' +
      item.quantite +
      " (<i>" +
      item.designation +
      "</i>)</li>";

    item.designation + " X " + item.quantite;
  });

  // Je cloture mon mail
  bodyMail.withoutHTML =
    bodyMail.withoutHTML +
    "\n-PRIX TOTAL: " +
    totalPrice.toFixed(2) +
    "\n\nAmicalement, \nVotre assistante";
  bodyMail.withHTML =
    bodyMail.withHTML +
    "<br><li><b>PRIX TOTAL: " +
    totalPrice.toFixed(2) +
    "€</b></li>" +
    "</ul><br>Amicalement,<br>Votre assistante   </body> </html>";

  // Je renvoie la variable
  return bodyMail;
};

module.exports.sendMeCartByMail = function (req, res, next) {
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
                  // Je transforme mon panier en une liste
                  const bodyMail = formatMyCartToList();
                  // res.status(200).send("ok");

                  senderMail
                    .sendMeAMail(bodyMail)
                    .then((resultat) => {
                      notification.notifyMe(resultat, "Succes");

                      res.status(200).send(resultat);
                    })
                    .catch((err) => {
                      notification.notifyMe(
                        "Echec lors de l'envoie du mail",
                        "Erreur"
                      );
                      res.status(400).send(err);
                    });
                } else {
                  // Echec étape 2
                  notification.notifyMe("Echec de la MAJ du panier", "Erreur");
                  return res.status(400).send("Echec de la MAJ du panier");
                }
              })

              // Echec Etape 2
              .catch(function (err) {
                notification.notifyMe("Voir les logs", "Erreur");
                return res.status(400).send(err);
              });

            // Echec Etape 1
          } else {
            notification.notifyMe("Echec de l'authentification", "Erreur");
            return res.status(400).send("Echec de l'authentification");
          }
        })

        // Echec de l'étape 1
        .catch(function (err) {
          notification.notifyMe("Voir les logs", "Erreur");
          return res.status(400).send(err);
        });
    })
    .catch((err) => {
      notification.notifyMe("Checksum", "Erreur");
      res.status(401).send(err);
    });
};
