# Georges - Assistant Personnel & Majordome IA (façon J.A.R.V.I.S.)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

**Georges** est un assistant personnel intelligent et majordome numérique inspiré de **J.A.R.V.I.S.** (Iron Man), conçu sur-mesure pour Fabrice Moriau. Il combine la commande vocale interactive, la vision par caméra de smartphone, l'analyse multi-IA gratuites, la gestion d'agenda et de gardes d'ambulance, le suivi de santé et le déploiement d'applications mobiles sur le Google Play Store.

![Icône Georges Majordome](public/app-icon.jpg)

---

## 🚀 Fonctionnalités Principales

### 1. Voix & Commandes J.A.R.V.I.S. (Iron Man)
* **Synthèse vocale sur-mesure** : Voix masculine posée et raffinée, modulée avec précision.
* **Effets sonores Stark Industries** : Sons de confirmation synthétisés via la Web Audio API (pulsations Arc Reactor, clics radio de casque HUD).
* **Déclenchement vocal** : Reconnaissance directe des mots-clés « Georges », « Georgie » ou « Jarvis » et commande push-to-talk.

### 2. Vision par Téléphone & Capture d'Écran
* **Photo Smartphone en direct** : Accès à la caméra du téléphone pour photographier des documents, objets ou pannes.
* **Capture d'écran (HUD)** : Enregistrement de l'écran ou de fenêtres pour diagnostic instantané avec analyse visuelle par IA.

### 3. Horloge Virtuelle, Réveil & Briefing Météo
* **Horloge digitale Stark** : Affichage de l'heure en temps réel avec animation de synchronisation.
* **Gestionnaire d'alarmes** : Programmation d'alarmes avec sonneries audio custom et mode lever de soleil.
* **Briefing matinal vocal** : Récapitulatif météo (température, prévisions, vent, UV) et rappel des rendez-vous et gardes de la journée.

### 4. Applications Téléphone & Gardes Ambulances
* **Application AmbuGuard** : Saisie et suivi des journées de travail en ambulance (ASSU, VSL, co-équipier, horaires, kilométrages, nombre d'interventions).
* **Synchronisation Agenda** : Ajout automatique des vacations (Garde Jour, Nuit, VSL, Astreinte) au planning.
* **Application Mon Carnet de Santé** : Enregistrement du poids avec calcul automatique de l'IMC, suivi de la tension artérielle, temps de sommeil et hydratation.

### 5. Publication d'Application & Recrutement de Testeurs
* **Tableau de bord Google Play Console** : Suivi de la jauge des 20 testeurs fermés obligatoires avant publication.
* **Générateur d'annonces de recrutement** : Création automatique de messages prêts à copier pour recruter des testeurs sur LinkedIn, WhatsApp ou forums.
* **Checklist Store** : Suivi des prérequis (builds AAB, fiche descriptive, captures, politique de confidentialité).

### 6. Consensus Multi-IA Gratuites
* Consultation simultanée des grands modèles IA gratuits du marché :
  - **Gemini 3.5 Flash** (Google AI)
  - **Mistral 7B Instruct** (Mistral AI)
  - **Llama 3.3 70B** (Meta AI)
  - **DeepSeek R1 Distill** (DeepSeek)
  - **Qwen 2.5 72B** (Alibaba)
  - **DuckDuckGo AI** (Accès libre & confidentiel)
* Confrontation des réponses et formulation d'une synthèse claire avec transparence totale sur les requêtes transmises.

### 7. Gestion Quotidienne Complète
* **Boîte de Réception & Tri Automatique** : Classification des e-mails, détection des urgences et rédaction de réponses assistées.
* **Rédacteur de Courriers** : Modèles administratifs, professionnels et officiels générés sur-mesure.
* **Campagnes Marketing & Visuels IA** : Création d'e-mailings et d'images promotionnelles HD.
* **Bourse & Portefeuille Virtuel** : Analyses des opportunités d'investissement, CAC 40 et portefeuille simulé.
* **Serveur PC Maison** : Surveillance de la télémétrie (CPU, RAM, disques) et gestion des sauvegardes réseau.

---

## 🛠️ Stack Technique

* **Frontend** : React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
* **Audio & Multimédia** : Web Audio API (synthétiseur de sons Arc Reactor Stark), Web Speech API (reconnaissance vocale et synthèse TTS), MediaDevices API (caméra et partage d'écran)
* **PWA & Mobile** : Web App Manifest (`manifest.json`), icône haute définition (`app-icon.jpg`)
* **Stockage** : Persistance automatique via `localStorage` du navigateur

---

## 📦 Installation & Démarrage Local

### Prérequis
* Node.js (version 18 ou supérieure)
* npm ou yarn / pnpm

### Instructions

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/votre-nom-utilisateur/georges-majordome-ia.git
   cd georges-majordome-ia
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement (optionnel) :**
   ```bash
   cp .env.example .env
   ```

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

5. **Construire pour la production :**
   ```bash
   npm run build
   ```

---

## 📱 Installation sur Smartphone (PWA)

1. Ouvrez l'application dans Chrome ou Safari Mobile.
2. Appuyez sur le menu de partage ou les 3 points verticaux.
3. Sélectionnez **« Ajouter à l'écran d'accueil »** ou **« Installer l'application »**.
4. L'icône de Georges (le majordome avec son plateau) apparaîtra parmi vos applications.

---

## 📄 Licence

Ce projet est sous licence [Apache 2.0](LICENSE).
