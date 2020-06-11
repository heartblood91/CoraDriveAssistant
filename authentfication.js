const axios = require("axios");

let formToken, cookie1FromCora, cookie2FromCora;

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

module.exports.getFormToken = function (req, res, next) {
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

  axios(config)
    .then(function (response) {
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

      // On récupère le token pour le formulaire
      formToken = JSON.stringify(response.data.token);

      return res.status(200).send("ok");
    })
    // En cas d'erreur
    .catch(function (error) {
      return res.status(401).send(error);
    });
};

module.exports.login = function (req, res, next) {
  // Préparation de notre body
  const data =
    '{"user":"***REMOVED***","pass":"***REMOVED***","lopotdemiel":"","formToken":' +
    formToken +
    "}";

  // Preparation de notre requete
  const config = {
    method: "post",
    url:
      "https://www.coradrive.fr/massy/ajax.html?tx_coradrive_piajax%5Bcontroller%5D=Authentication&tx_coradrive_piajax%5Baction%5D=tryLogin&tx_coradrive_piajax%5BextensionName%5D=Coradrive&tx_coradrive_piajax%5BpluginName%5D=PiAjax",
    headers: {
      ...defaultHeader,
      Cookie: cookie1FromCora + ";" + cookie2FromCora,
    },
    data: data,
  };

  // Envoie de notre requete
  axios(config)
    .then(function (response) {
      // Récupère le token d'identification
      exports.tokenAuth = JSON.stringify(response.data.user.token);
      return res.status(401).send("ok");
    })

    // En cas d'erreur
    .catch(function (error) {
      return res.status(401).send(error);
    });
};

module.exports.logout = function (req, res, next) {
  return res.status(200).send("Test: ok");
};
