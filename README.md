Projet: IoT Porte
=========================


Description :
------------
Ce projet vise à créer une application capable de contrôler à distance un circuit électronique.  

L’application en tant que telle est un site web capable de communiquer avec une base de données et le Raspberry pi.
L’application sera capable d’envoyer des commandes vers le pi pour contrôler une porte. L’application sera également 
capable de recevoir des données sur la température, la luminosité autour de la porte ainsi que la distance entre 
la porte et le mur sur lequel elle se ferme et ensuite envoyer ces mêmes données vers la base de données.  

Le Raspberry pi lui contrôle un circuit électronique capable de récolter des données qui sont : 
la température, la luminosité et la distance de fermeture de la porte. Ces données récoltées sont ensuite envoyées 
à l’application web et stocké dans une base de données. Le Pi est également capable de contrôler la porte de manière
automatique avec les données récoltées out de manière manuelle selon les commandes de l’utilisateur. 


Prérequis :
------------
- Raspberry Pi avec l'application et l'environnement déjà installée.
- Les dépendances Python nécessaires sont déjà installées dans le Raspberry Pi.
- Connexion réseau pour envoyer les données vers l'Iot Hub.


Exécution du code Raspberry Pi :
------------
1.  Ouvrir un terminal sur le Raspberry Pi.
2.  Se placer dans le dossier du projet :  ``cd ~/iot_projet``
3.  Lancer le script principal : ``./lancer.sh``
4.  Vérifier les messages dans le terminal pour confirmer que :
   - Les capteurs sont détectés
   - Le moteur stepper fonctionne et est allumé
   - Les données sont envoyées à l'IoT Hub
   - Les actions sont sauvegardée dans la base de données


Accès à l'interface web :
------------
- Ouvrir un navigateur web et accèder à l'URL fournie pour consulter les données envoyées Pi:
  ``https://witty-ocean-0a9c5f00f.7.azurestaticapps.net/``


Auteur :
------------
- Arnaud Simard-Desmeule / Cedryk Leblanc
- Date de derniere version : 4 avril 2026
