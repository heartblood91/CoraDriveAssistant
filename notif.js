const axios = require("axios");

// module permettant d'envoyer des notifications via IFTTT
module.exports.notifyMe = (body, title) => {
  // Est ce que l'utilisateur autorise l'envoie de notification ? Et a t'il bien configurer sa clé Webhooks
  const isNotif =
    process.env.CORA_Notif === "true" && process.env.CORA_Webhooks_Key !== ""
      ? true
      : false;

  if (isNotif) {
    // Preparation de notre requete
    const config = {
      method: "get",
      url:
        "https://maker.ifttt.com/trigger/CoraDriveAssistant/with/key/" +
        process.env.CORA_Webhooks_Key +
        "?value1=" +
        body +
        "&value2=" +
        title,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
        "Content-Type": "application/json;charset=utf-8",
        "app-signature":
          "BROWSER;WEB;83.0.4103.97;;2;1;2.5.17;Chrome;1080;1920",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    };

    axios(config).catch(function (err) {
      // La requête a été rejété parce que la clé n'est pas bonne
      if (err.response.status === 401) {
        console.warn("Clé webhooks incorrecte");
      } else {
        // La requête a été rejeté
        console.warn(err);
      }
    });

    // Si la personne a activer les notifs mais n'a pas renseigné sa clé, alors on l'a prévient
  } else if (process.env.CORA_Notif === "true" && !isNotif) {
    console.warn("La clé de Webhooks n'est pas renseigné dans le fichier .env");
  }
};
