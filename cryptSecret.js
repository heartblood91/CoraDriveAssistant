const CryptoJS = require("crypto-js");
const fs = require("fs");
const dotenv = require("dotenv");
const verificator = require("./verify");

// Récupère les informations sensibles
const configFile = require("./constante/config");

// Fonction permettant de chiffrer un texte
cryptMyText = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.CORA_SecretPass).toString();
};

//Fonction permettant de déchiffrer un texte (fonction exporter pour l'authentification)
module.exports.decryptMyText = (text) => {
  const bytes = CryptoJS.AES.decrypt(text, process.env.CORA_SecretPass);
  let originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText === "" ? null : originalText;
};

// Module permettant de chiffrer les informations de base (login + mdp)
module.exports.secretKeyToCrypt = function (req, res, next) {
  // Etape 0: Je vérifie l'intégrité de la requête. Si tout est ok, alors je continue le script

  verificator
    .verifyAll(req.params.checksum)
    .then(() => {
      new Promise((resolve, reject) => {
        // Je vérifie que l'utilisateur a rentré un mot de passe pour chiffrer / déchiffrer les identifiants
        if (process.env.CORA_SecretPass === "") {
          reject(
            "Renseigner d'abord une valeur dans le fichier .env --> CORA_SecretPass"
          );
        } else {
          // Je copie le login et le mot de passe en local
          let login = process.env.CORA_login;
          let mdp = process.env.CORA_mdp;

          // Etape 1: je vérifie que le contenu ne soit pas chiffré
          const loginIsCrypt =
            module.exports.decryptMyText(login) === null ? false : true;
          const mdpIsCrypt =
            module.exports.decryptMyText(mdp) === null ? false : true;

          // Je stop si les 2 éléments sont chiffrés

          if (loginIsCrypt && mdpIsCrypt) {
            reject("Identifiants déjà chiffrés");
          } else {
            // Etape 2: Transforme le mot de passe et le login en information chiffré
            !loginIsCrypt && (login = cryptMyText(process.env.CORA_login));
            !mdpIsCrypt && (mdp = cryptMyText(process.env.CORA_mdp));

            // Etape 3: Je récupère toutes les informations du fichier .env
            const envConfig = dotenv.parse(fs.readFileSync(".env"));

            // Etape 4: Je mets à jour les informations
            process.env.CORA_login = envConfig.CORA_login = login;
            process.env.CORA_mdp = envConfig.CORA_mdp = mdp;

            //Etape 5: Je mets à jour le fichier .env

            // Ouvre le fichier json
            let writeStream = fs.createWriteStream(".env");

            // Inscrit dans une variable, l'ensemble des lignes du fichier
            for (const k in envConfig) {
              writeStream.write([k] + '="' + envConfig[k] + '"\n');
            }

            // Ferme le fichier
            writeStream.end();

            resolve("Les identifiants ont été chiffrés");
          }
        }
      })
        .then((resultat) => {
          return res.status(200).send(resultat);
        })
        .catch((err) => {
          return res.status(400).send(err);
        });
    })
    .catch((err) => res.status(401).send(err));
};
