// module permettant de vérifier l'intégrité d'une requête
module.exports.verifyChecksum = (checksum) => {
  return new Promise((resolve, reject) => {
    // Existante d'un checksum ?
    const isChecksum = process.env.CORA_Checksum === "" ? false : true;

    // Si oui, je vérifie la correspondance
    if (isChecksum) {
      if (process.env.CORA_Checksum === checksum) {
        resolve("Authorized");
        // Pas de correspondance, alors, je bloque la reqûete --> unauthorized
      } else {
        reject("Unauthorized");
      }
    } else {
      resolve("Pas de checksum paramétré");
    }
  });
};

// module permettant de vérifier que les informations sont correctements renseignées par l'utilisateur
module.exports.verifySetting = () => {
  return new Promise((resolve, reject) => {
    let message = "";

    // Verifie les paramètres obligatoires et vérifiables (pas les ports car la requête ne pourra venir sans port définit par conséquent, vérification impossible)
    // Et constitue le message
    message =
      process.env.CORA_idShop === ""
        ? "- L'ID du magasin n'est pas renseigné. \n"
        : "";
    message =
      message +
      (process.env.CORA_login === ""
        ? "- Il me manque votre identifiant de connexion. \n"
        : "");
    message =
      message +
      (process.env.CORA_mdp === ""
        ? "- Je ne vois pas de mot de passe. \n"
        : "");
    message =
      message +
      (process.env.CORA_nameOfListUseForBDD === ""
        ? "- Je n'ai pas le nom de votre base de donnée. \n"
        : "");

    // compte le nombre d'erreur
    const iError = message.split("\n").length;

    //Si message est vide alors tout va bien
    if (message === "") {
      // Transmission du message
      resolve("Ok");

      // Le message n'est pas vide, il contient des erreurs, je transmet la liste à l'utilisateur
    } else {
      message =
        "Merci de corriger l" +
        (iError >= 2 ? "es " : "'") +
        "erreur" +
        (iError >= 2 ? "s" : "") +
        " ci-dessous avant de continuer: \n" +
        message;

      // Transmission du message
      reject(message);
    }
  });
};
