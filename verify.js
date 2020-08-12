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
