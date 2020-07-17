const axios = require("axios");

// Module contenant les credentials
credentialsModule = require("./credentials");

// Pour éviter toute modification du login/mdp
const { login, mdp } = require("./credentials");

const defaultHeader = {
  Host: "www.coradrive.fr",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
  "cora-auth": "apidrive",
  "Cache-Control": "no-cache",
  "app-id": "1",
  "X-Requested-With": "XMLHttpRequest",
  "Content-Type": "application/json;charset=UTF-8",
  "app-signature": "BROWSER;WEB;83.0.4103.97;;2;1;2.5.17;Chrome;1080;1920",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
  "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
};

getFormToken = () => {
  // Préparation de notre body
  const data = '{"action":"token-connexion"}';

  // Preparation de notre requete
  const config = {
    method: "post",
    url:
      "https://www.coradrive.fr/massy/ajax.html?tx_coradrive_piajax%5Bcontroller%5D=AjaxLegacy&tx_coradrive_piajax%5Baction%5D=routing&tx_coradrive_piajax%5BextensionName%5D=Coradrive&tx_coradrive_piajax%5BpluginName%5D=PiAjax",
    headers: {
      ...defaultHeader,
    },
    data: data,
  };
  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        // Copie du cookie
        let cookie1FromCora = credentialsModule.cookie1FromCora;
        let cookie2FromCora = credentialsModule.cookie2FromCora;

        // On récupère les 2 cookies
        cookie1FromCora = JSON.stringify(response.headers["set-cookie"][0]);
        cookie2FromCora = JSON.stringify(response.headers["set-cookie"][1]);

        // Suppression des crochets + des valeurs inutiles
        cookie1FromCora = cookie1FromCora.split(";");
        cookie1FromCora = cookie1FromCora[0];
        cookie1FromCora = cookie1FromCora.replace(/\[/, "");
        cookie1FromCora = cookie1FromCora.replace(/\"/, "");

        cookie2FromCora = cookie2FromCora.split(";");
        cookie2FromCora = cookie2FromCora[0];
        cookie2FromCora = cookie2FromCora.replace(/\[/, "");
        cookie2FromCora = cookie2FromCora.replace(/\"/, "");

        //On sauvegarde les cookies
        credentialsModule.cookie1FromCora = cookie1FromCora;
        credentialsModule.cookie2FromCora = cookie2FromCora;

        // On vérifie la présence d'un token
        if (
          response.data.token == null ||
          response.data.token.trim().length === 0
        ) {
          // Aucun token reçu, on stop la connexion et on prévient l'utilisateur
          reject(
            "Oups... Aucun token de formulaire dans la requête, je ne peux pas continuer..."
          );
        } else {
          // Tout s'est bien déroulé, on save le token

          // On récupère le token pour le formulaire
          credentialsModule.formToken = JSON.stringify(response.data.token);
          resolve("Ok");
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

getLoginToken = () => {
  // Préparation de notre body
  const data =
    '{"user":"' +
    login +
    '","pass":"' +
    mdp +
    '","lopotdemiel":"","formToken":' +
    credentialsModule.formToken +
    "}";

  // Preparation de notre requete
  const config = {
    method: "post",
    url:
      "https://www.coradrive.fr/massy/ajax.html?tx_coradrive_piajax%5Bcontroller%5D=Authentication&tx_coradrive_piajax%5Baction%5D=tryLogin&tx_coradrive_piajax%5BextensionName%5D=Coradrive&tx_coradrive_piajax%5BpluginName%5D=PiAjax",
    headers: {
      ...defaultHeader,
      Cookie:
        credentialsModule.cookie1FromCora +
        ";" +
        credentialsModule.cookie2FromCora,
    },
    data: data,
  };

  return new Promise((resolve, reject) => {
    // Envoie de notre requete
    axios(config)
      .then(function (response) {
        // On vérifie la présence d'un token
        if (
          response.data.user.token == null ||
          response.data.user.token.trim().length === 0
        ) {
          // Aucun token reçu, on stop la connexion et on prévient l'utilisateur
          reject(
            "Oups... Aucun token de connexion dans la requête, je ne peux pas continuer..."
          );
        } else {
          // Tout s'est bien déroulé, on save le token

          // Récupère le token d'identification
          credentialsModule.token = response.data.user.token;
          resolve("Ok");
        }
      })

      // En cas d'erreur
      .catch(function (err) {
        reject(err);
      });
  });
};

module.exports.login = function (req, res, next) {
  // Etape 1: Je récupère le token de formulaire, indispensable pour la connexion
  getFormToken()
    .then(function () {
      // Etape 2: Si j'ai bien récupéré le token, alors je peux m'idenfitier sur le site et récupérer un token de connexion
      getLoginToken()
        .then(function (resultat) {
          return res.status(200).send(resultat);
        })
        .catch(function (err) {
          // Echec de l'étape 2 (soit erreur de requête soit pas de token)
          return res.status(400).send(err);
        });
    })

    // Echec de l'étape 1 (soit erreur de requête soit pas de token)
    .catch(function (err) {
      return res.status(400).send(err);
    });
};
