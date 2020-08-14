const nodemailer = require("nodemailer");

//Module permettant d'envoyer un email avec du text simple ou riche (html)
module.exports.sendMeAMail = (bodyMail) => {
  return new Promise((resolve, reject) => {
    async function main() {
      // Création du transporteur
      let transporter = nodemailer.createTransport({
        host: process.env.CORA_Mail_SMTP, //serveur smtp
        port: process.env.CORA_Mail_Port, //port
        secure: false, // true pour le port 465, false pour les autres
        auth: {
          user: process.env.CORA_Mail_User, // utilisateur
          pass: process.env.CORA_Mail_Pass, // mot de passe
        },
      });

      // send mail with defined transport object
      await transporter.sendMail({
        from: process.env.CORA_Mail_From, // Expéditeur
        to: process.env.CORA_Mail_To, // Destinataires (si plusieurs les séparés par des ,)
        subject: "Liste de course", // Sujet du mail
        text: bodyMail.withoutHTML, // Texte sans HTML
        html: bodyMail.withHTML, // Texte avec du html
      });
      console.log("Message envoyé");
      resolve("Message envoyé");
    }

    main().catch((err) => reject(err));
  });
};
