require("dotenv").config();

module.exports = {
  // Les différents ports
  PORT_PROD: process.env.CORA_PORT_PROD,
  PORT_DEV: process.env.CORA_PORT_DEV,

  // Configurer par l'utilisateur via le fichier .env
  idShop: process.env.CORA_idShop,
  login: process.env.CORA_login,
  mdp: process.env.CORA_mdp,
  nameOfListUseForBDD: process.env.CORA_nameOfListUseForBDD,

  // Reset à chaque reboot
  token: "",
  formToken: "",
  cookie1FromCora: "",
  cookie2FromCora: "",
  uuidCora: "",
  shopCart: {},
  iDOfListUseForBDD: -1,
};
