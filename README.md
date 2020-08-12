<img src="https://cdn.hidemyhome.ovh/CoraDriveAssistant.webp" data-canonical-src="https://cdn.hidemyhome.ovh/CoraDriveAssistant.webp" alt="Logo de l'appli" width="300" height="200" />

# CoraDriveAssistant, l'intelligence de Google couplée au drive de Cora

> Application permettant de faire le lien entre les produits disponibles sur CoraDrive et votre assistant Google

## Index

- [Description](#description)
- [Exemples](#vidéos)
- [Installation du serveur backend](#installationBackend)
- [Configuration côté IFTTT](#installationIFTTT)
- [Personnalisation de la base de donnée](#configBDD)
- [Package](#package)
- [Confidentialité](#confidentialité)
- [Evolutions possible](#evolutions)
- [Merci](#merci)

## Description

Avant de débuter, je vais raconter un peu ma vie. Je ne suis pas développeur professionnel, juste un autodidacte passionné!

Le projet a débuté en juin 2020. J'en avais marre de demander à ma compagne d'ajouter les produits que nous avions besoin au fil de l'eau dans notre panier. J'aurais très bien pû le faire moi-même, me diriez vous... Vous savez, tout comme moi, pour éviter une guerre froide, il faut impérativement prendre le produit habituel... Bref...

J'ai pris conscience que j'utilisais ma compagne comme un assistant vocal. Il était logique pour moi de me lancer dans le défi ~~de transformer mon assistant vocal en ma compagne~~ de lier Google Assistant avec le site CoraDrive.

D'ailleurs j'ai appris dans les journaux quelques semaines plus tard que Carrefour a fait un partenariat avec Google, pour faire la même chose (liée Google et son entreprise).

Terminé le background, entrons dans la partie technique:

**L'application est un serveur backend relié à IFTTT.**

1. IFTTT

Commençons par les commandes vocales:

- Vous pouvez ajouter, soustraire ou retirer un produit de votre liste de course
- Mettre à jour une base de donnée de produits (**facultatif**)

Ces commandes vocales, via weebhocks d'IFTTT font une requête vers le serveur backend.

2. Le serveur backend

Le serveur backend reçoit une requête d'IFTTT contenant la tâche à executer ((Ajout | Soustraction | Suppression ) + item ou MAJ de la "BDD").

Dans le cadre d'une mise à jour du panier, si la requête est conforme alors:

1. Il se connecte à CoraDrive
   - Si un token est présent, il s'en sert.
   - Si absence de token ou périmé, alors il se connecte via les identifiants. Puis il enregistre ce token en local dans le fichier .env
2. Il récupère les informations essentielles sur le panier
3. Je nettoie le bruit reçu par la commande vocal pour accéder au nom du produit
4. Je cherche une correspondance entre le produit et la base de donnée
5. Si tout est ok, alors je fais ma requête à CoraDrive. (Ajout / Soustraction / Suppression de l'item)

Dans le cadre d'une mise à jour de la "BDD", si la requête est conforme alors:

1. Il se connecte à CoraDrive
   - Si un token est présent, il s'en sert.
   - Si absence de token ou périmé, alors il se connecte via les identifiants. Puis il enregistre ce token en local dans le fichier .env
2. Je récupère les nom de toutes les listes de courses du client
3. Je sélectionne, celle qui m'interesse pour avoir le détail des produits
4. Je fais la MAJ de la "BDD":
   - Vérification de la conformité des produits dans la liste (désignation et prix). Si je détecte une différence utile, je fais la mise à jour
   - Si un élément n'était pas dans la liste, alors je l'ajoute en respectant un formatage strict
   - Je fais un retour au client avec :
     - La liste des produits ajoutés
     - La liste des produits indisponibles que je n'ai pas pu ajouter
     - La liste des produits MAJ

## Vidéos

Plutôt que de long discours voici quelques exemples en vidéo:

_[vidéo en cours de tournage...]_

 <section id="installationBackend">

## Installation du serveur backend

```shell
$ git clone "https://github.com/heartblood91/CoraDriveAssistant.git" && cd CoraDriveAssistant\
$ npm i
```

**Pour des raisons de confidentialité, certaines données sensibles ont été masquées, ou retirées dans les derniers commits. Pour que l'application fonctionne correctement suivez les instructions ci-dessous, sinon l'appli crashera**

1. Ouvrir le fichier sample.env dans le dossier racine, et renseignez les informations manquantes.

   - Ports de l'application (_CORA_PORT_PROD & CORA_PORT_DEV_)
   - L'id du magasin (vous pouvez le trouver dans le fichier constante/list-shop.json) (_CORA_idShop_)
   - Votre identifiant et mot de passe pour vous connecter à CoraDrive (_CORA_login & CORA_mdp_)
   - Le nom de votre liste de course que vous utiliserez comme référence pour votre base de donnée (_CORA_nameOfListUseForBDD_)
   - FACULTATIF:
     - Une passphrase ou un long mot de passe pour chiffrer votre identifiant et votre mot de passe
     - Un mot de passe / token pour vérifier l'intégrité de vos requêtes IFTTT - votre backend (_CORA_Checksum_)

2. Après, rennomer le fichier .env

3. Pour lancer le serveur, exécuter la commande suivante

- En mode développement ou qualification:

```shell
$ npm run start
```

- En mode production:

```shell
$ npm run prod
```

 <section id="installationIFTTT">

## Configuration côté IFTTT

1. Connectez-vous sur le site d'IFTTT ou créez votre compte si vous n'en avez pas (_https://ifttt.com/_)

2. Cliquez sur _Create_ puis _Applets_

3. Cliquez sur _This_ puis _Google Assistant_ puis _Say a phrase with a text ingredient_

4. Remplissez le formulaire selon vos préférences, pour ma part, j'ai mis ceci
   - _What do you want to say?_ --> Ajoute \$ au panier (le symbole dollar est l'ingrédient de votre recette. Il s'agit du mot que google doit capter et transmettre à votre serveur backend)
   - _What's another way to say it?_ (optional) --> Panier ajoute \$
   - _What do you want the Assistant to say in response?_ --> Ok j'ajoute \$ à la liste CoraDrive
   - _Language_ French

**Pour avoir fait plusieurs tests, vous ne pouvez pas utiliser de phrase contenant le mot _liste_, car Google a déjà paramétré ce trigger. Vous ne pouvez pas non plus, utiliser le mot _CoraDrive_ sinon Google fera une recherche sur internet.**

<center><img src="https://cdn.hidemyhome.ovh/IFTTT-Step1.webp" data-canonical-src="https://cdn.hidemyhome.ovh/IFTTT-Step1.webp" alt="Configuration google assistant" /></center>

5. Cliquez sur _That_ puis _webhooks_ puis _Make a web request_

6. Remplissez le formulaire comme ceci:
   - _Url_ --> http[**s**]: //[**nom de domaine ou ip**]/update/[**add ou remove ou delete**]/item/{{TextField}}
   - _Methode_ --> POST
   - _Content Type_ --> Application/json
   - _Body_ --> Vide

**Si vous avez configurer un token pour les requêtes vers votre serveur ajouter _/[Votre token]_ à la fin de l'url (_Ex: https://jadoretonappli.fr/update/add/item/{{TextField}}/ceciestmonsupermotdepassetokendelamortquituepourprotegermonbeauserveurdesvilainsrobots_ )**

**Dans l'url _add_ permet d'ajouter un élément dans votre panier, _remove_ permet de soustraire et _delete_ le retire complétement**

<center><img src="https://cdn.hidemyhome.ovh/IFTTT-Step2.webp" data-canonical-src="https://cdn.hidemyhome.ovh/IFTTT-Step2.webp" alt="Configuration google assistant" /></center>

7. Vous pouvez donner un nom / description à votre recette.

**Parfait! Vous avez paramétré l'ajout du produit! Reproduisez les étapes de 2 à 7 pour soustraire et retirer complétement un produit de votre panier en remplaçant les phrases et l'url**

Voici, en images, le résumé de la configuration complète:

<u>**Ajout:**</u>

<center>
<img src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTAdd.webp" data-canonical-src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTAdd.webp" alt="Configuration ajout" width="480" height="500" /></center>

<u>**Soustraction:**</u>

<center>
<img src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTRemove.webp" data-canonical-src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTRemove.webp" alt="Configuration soustraction" width="480" height="500" /></center>

<u>**Suppression:**</u>

<center>
<img src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTDelete.webp" data-canonical-src="https://cdn.hidemyhome.ovh/CoraResumeIFTTTDelete.webp" alt="Configuration suppression" width="480" height="500" /></center>

 <section id="configBDD">
## Personnalisation de la base de donnée

Voici le guide, pas à pas, pour paramétrer ou mettre à jour sa base de donnée

Côté CoraDrive:
<u>Pour créer une liste, suivez ces étapes:</u>

1. Connectez-vous au site de CoraDrive.
2. Pour enregister une liste de course, ajoutez tous les produits au panier. **Ces items constitueront votre base de donnée**.
3. Ouvrez votre panier, puis en bas à gauche (au dessus du total et des avantages), cliquez sur le bouton _Enregister comme liste_.
4. Une fenêtre s'ouvre, _Créer une nouvelle liste_ et **donner lui un nom**. **Ce nom sera à renseigner dans le fichier .env (_CORA_nameOfListUseForBDD_)**

<u>Pour modifier une liste, suivez ces étapes:</u>

1. Connectez-vous au site de CoraDrive.
2. Cliquez sur _Mes listes de courses_ puis _Voir mes listes_
3. Sur la ligne correspondante à votre ancienne liste, cliquez sur l'icône du panier en rouge. **Elle ajoutera tous les éléments à votre panier actuelle.**
4. Ajouter les nouveaux produits à votre panier.
5. Ouvrez votre panier, puis en bas à gauche (au dessus du total et des avantages), cliquez sur le bouton _Enregister comme liste_.
6. Une fenêtre s'ouvre, _Remplacer une liste existante :_ et sélectionner votre liste parmis la liste déroulante.

<u>Côté serveur:</u>
Après avoir renseigné toutes les informations obligatoires dans le fichier .env, executer la commande, via votre navigateur: http[s]: //[adresse web ou ip]:[Port]/majListProduct
Les informations entre crochets son à renseigner. _Ex: https://jadoretonappli.fr/majListProduct_

Si tout a bien fonctionné, vous allez retrouver tous vos produits dans le fichier _constante\list-product.json_. Ouvrez le fichier avec votre éditeur de texte / code favoris (bloc notes - notepad - VSC - ...) **Pour chaque produits, vous avez une ligne _googleIngredientCmd_ à renseigner**. Par défaut, il s'agira du nom du produit. **Je vous conseille vivement de le changer**, la désignation du produit selon Cora est trop longue pour l'énoncer parfaitement à Google. Un exemple avec ce petit bout de comté Cora. Sa désignation _Cora comté AOP au lait cru 5 mois d'affinage minimum 200g_. Je ne me vois pas dire cette phrase à Google! Je l'ai raccourci au minimum chez moi --> _Comté_. Vous pouvez ajouter le préfixe petit ou grand pour différencier le poids du produit.

## Package

Il s'agit juste d'une liste des packages utilisées et des mes raisons:

- Express.js (Permet de construire le serveur) --> https://expressjs.com/fr/
- Axios (pour les requêtes sur CoraDrive) --> [https://github.com/axios/axios](https://github.com/axios/axios)
- Uuid (nécessaire pour le panier CoraDrive) --> https://www.npmjs.com/package/uuid
- crypto-js (Permet de chiffrer/dechiffrer votre login et votre mot de passe) --> https://www.npmjs.com/package/crypto-js
- dotenv (Pour la gestion des variables d'environnement) --> https://www.npmjs.com/package/dotenv
- Cors (Pour éviter les conflits de nom de domaine) --> https://github.com/expressjs/cors
- Compression (Reduit la taille de la réponse) --> https://github.com/expressjs/compression
- Helmet (Protège l'en-tête de la requête) --> https://helmetjs.github.io/
- Morgan (Pour traiter le json) --> https://github.com/expressjs/morgan

## Confidentialité

Je pense qu'il est important de faire un point "sécurité" et sur les données.

- Votre identifiant, mot de passe et token sont stockés sur le serveur dans un fichier en clair. Cependant, vous avez la possibilité de les chiffrer. Pour cela, il faut renseigner une passPhrase ou un long mot de passe dans le fichier .env (_CORA_SecretPass_).
  Puis executer la requête, dans votre navigateur : http[s]: //[adresse web ou ip]:[Port]/cryptMyID
  Les informations entre crochets son à renseigner. _Ex: https://jadoretonappli.fr/cryptMyID_

- Pour éviter des requêtes sur votre serveur backend par des robots, vous pouvez ajouter un token / mot de passe, à fournir à chaque requête d'IFTTT. N'hésitez pas à inscrire un mot de passe aléatoire, long, que vous remplacerez tous les ans.

## Evolutions

- Système permettant de vérifier les paramètres obligatoires et facultatifs de l'appli pour éviter un crash ou des erreurs
- Automatiser la création d'une liste de course pour la base de donnée
- Application android
- Mettre en place des retours TTS
- Commande permettant de vérifier l'existence du produit dans le panier
- Préparation de la liste de course via un algorithme basique
- Faire la même démarche pour les autres drives (Auchan, Leclerc, Intermarché, Leader Price ...)
- Envoie la liste de course par mail

## Merci

N'hésitez pas à faire des commentaires ou proposés des évolutions de l'application, je verrais ce que je peux faire!
:heartpulse: Merci :heartpulse:
