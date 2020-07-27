//Fonction, sous forme de promesse, recevant une phrase (provenant de l'assistant google) et nous retourne les mots clés

module.exports.getGoogleItems = (product) => {
  return new Promise((resolve, reject) => {
    // Je mets la phrase percue en minuscule + j'enlève les espaces de chaque côté
    // + je verifie l'existance des déterminants reduits par une apostrophe car google assistant me le transmet de cette manière: " l ' " + je split tous les mots dans un array séparés par un espace
    let arrayProduct = product
      .toLowerCase()
      .trim()
      .replace(/ ' /g, "'")
      .split(" ");

    // liste de déterminants (grammaire)
    const articles = [
      "le",
      "la",
      "les",
      "du",
      "des",
      "de",
      "d'",
      "au",
      "aux",
      "un",
      "une",
      "mon",
      "ma",
      "mes",
      "notre",
      "nos",
      "ton",
      "ta",
      "tes",
      "votre",
      "vos",
      "son",
      "sa",
      "ses",
      "leur",
      "leurs",
      "ce",
      "cet",
      "cette",
      "ces",
    ];

    // Enlève les déterminants + joins tous les éléments du array dans une string + supprime un déterminant spécifique (l')
    const justProduct = arrayProduct
      .filter((word) => !articles.includes(word))
      .join(" ")
      .replace(/l'/, "");

    resolve(justProduct);
  });
};
