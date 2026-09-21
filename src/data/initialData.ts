import { 
  EmailCampaign, 
  EmailItem, 
  NoteItem, 
  AgendaEvent, 
  ServerFile, 
  HomeServerInfo,
  AlarmItem,
  AmbulanceWorkShift,
  HealthLogEntry,
  AppProject,
  BetaTester,
  CodeVaultItem
} from "../types";

export const initialEmails: EmailItem[] = [
  {
    id: "mail-1",
    from: "claire.duval@atelier-design.fr",
    fromName: "Claire Duval (Atelier Design)",
    subject: "Proposition de maquettes pour la refonte produit + validation devis",
    date: "Aujourd'hui à 09:20",
    snippet: "Bonjour Fabrice, je te transmets les maquettes finalisées ainsi que le devis ajusté. Pourrions-nous caler un rapide point ?",
    body: `Bonjour Fabrice,

J'espère que tu vas bien.
Comme convenu lors de notre dernier échange, je te transmets en pièce jointe les maquettes finalisées de l'interface client ainsi que la nouvelle grille tarifaire.

Les retours de ton équipe ont tous été intégrés avec succès. Peux-tu y jeter un coup d'œil et me confirmer si nous pouvons lancer la phase d'intégration technique d'ici jeudi ?

Si tu as 15 minutes aujourd'hui ou demain pour débriefer, ce serait parfait.

Bien amicalement,
Claire Duval
Directrice Artistique`,
    category: "important",
    urgency: "haute",
    isRead: false,
    isStarred: true,
    summary: "Validation requise des maquettes client et devis avant jeudi pour lancement de l'intégration.",
    suggestedAction: "Répondre immédiatement et planifier un point de 15 min",
    tags: ["Client", "Devis", "Projet"],
  },
  {
    id: "mail-2",
    from: "facturation@ovhcloud.com",
    fromName: "OVHcloud Facturation",
    subject: "Facture n° FR-2026-98124 - Renouvellement domaine et serveur",
    date: "Aujourd'hui à 07:45",
    snippet: "Votre facture mensuelle est disponible dans votre espace client. Montant prélevé : 42,90 € TTC.",
    body: `Cher client Fabrice Moriau,

Votre facture mensuelle du 21/09/2026 a été émise :
Numéro : FR-2026-98124
Montant : 42,90 € TTC
Mode de règlement : Carte bancaire (débit automatique sous 48h)

Détail des prestations :
- Hébergement VPS Pro : 35,00 €
- Noms de domaine .fr & .com : 7,90 €

Vous pouvez télécharger le PDF depuis votre console de gestion.`,
    category: "facture",
    urgency: "moyenne",
    isRead: false,
    isStarred: false,
    summary: "Facture OVHcloud de 42,90 € prélevée sous 48h pour hébergement et domaines.",
    suggestedAction: "Classer dans la comptabilité",
    tags: ["Compta", "Serveur"],
  },
  {
    id: "mail-3",
    from: "news@tech-trends-weekly.io",
    fromName: "Tech Trends Weekly",
    subject: "L'essor de l'IA locale et les serveurs domestiques autonomes",
    date: "Hier à 18:30",
    snippet: "Cette semaine dans notre édition : comment recycler un vieux PC en serveur d'IA privé à domicile...",
    body: `Édition #142 de Tech Trends Weekly

Bonjour Fabrice,

Dans cette édition :
1. Pourquoi héberger ses propres modèles IA sur un vieux PC de bureau avec Ollama ou vLLM
2. Les meilleures configurations de stockage RAID pour les serveurs domestiques basse consommation
3. Les outils de synchronisation sécurisée maison vers cloud sans abonnement

Bonne lecture !`,
    category: "newsletter",
    urgency: "basse",
    isRead: true,
    isStarred: false,
    summary: "Newsletter sur le recyclage de vieux PC en serveurs d'IA et stockage local autonome.",
    suggestedAction: "Archiver après lecture",
    tags: ["Veille", "Serveur"],
  },
  {
    id: "mail-4",
    from: "promo@fnac-pro.com",
    fromName: "Fnac Électronique",
    subject: "⚡ Ventes Flash : Disques durs NAS 4To et adaptateurs réseau à -40%",
    date: "Hier à 14:10",
    snippet: "Offres exclusives pour vos sauvegardes et vos serveurs personnels valables jusqu'à minuit...",
    body: `Offres spéciales de rentrée informatique !
Profitez de réductions jusqu'à -40% sur les disques durs Seagate IronWolf et Western Digital Red pour vos serveurs NAS et PC maison.
Cliquez ici pour découvrir les offres limitées.`,
    category: "promo",
    urgency: "basse",
    isRead: true,
    isStarred: false,
    summary: "Promotion Fnac sur les disques durs pour serveurs domestiques.",
    suggestedAction: "Archiver ou se désabonner",
    tags: ["Promo"],
  },
  {
    id: "mail-5",
    from: "alexandre.leroy@partenaires-immo.be",
    fromName: "Alexandre Leroy",
    subject: "Revue du contrat de partenariat & date de signature",
    date: "20 Septembre",
    snippet: "Bonjour Fabrice, nous avons validé les clauses juridiques avec notre avocat. Es-tu disponible vendredi ?",
    body: `Bonjour Fabrice,

Bonne nouvelle, notre service juridique a validé la version 2.1 de l'accord-cadre.
Seriez-vous disponible vendredi matin à 10h30 par visioconférence pour finaliser la signature électronique ?

Bien cordialement,
Alexandre Leroy`,
    category: "important",
    urgency: "haute",
    isRead: false,
    isStarred: true,
    summary: "Validation finale du contrat de partenariat, demande de signature vendredi à 10h30.",
    suggestedAction: "Ajouter à l'agenda vendredi 10h30 et confirmer par mail",
    tags: ["Contrat", "Juridique"],
  },
];

export const initialNotes: NoteItem[] = [
  {
    id: "note-1",
    title: "Projet Serveur Maison (Vieux PC i5)",
    content: `# Configuration du vieux PC en serveur maison
- Système : Ubuntu Server 24.04 LTS minimale sans interface graphique
- Rôle 1 : Stockage partagé Samba (SMB) pour les photos et documents de la famille
- Rôle 2 : Passerelle API locale pour Georges (script daemon Python sur port 8088)
- Rôle 3 : Serveur multimédia Jellyfin
- Rôle 4 : Sauvegarde automatique hebdomadaire du PC portable

*À faire :*
- [x] Dépoussiérer le boîtier et changer la pâte thermique
- [x] Installer SSD 240 Go pour le système
- [ ] Configurer l'IP statique (192.168.1.145) sur la box
- [ ] Connecter le token d'authentification Georges`,
    category: "Serveur",
    tags: ["Hardware", "Linux", "Georges"],
    createdAt: "2026-09-19",
    updatedAt: "2026-09-21",
    isPinned: true,
  },
  {
    id: "note-2",
    title: "Idées Campagne Emailing : Lancement Automne",
    content: `- Thème : "Reprenez le contrôle de votre productivité avec nos solutions sur mesure"
- Angle : Éviter la surcharge mentale après la rentrée
- Cible : Dirigeants de TPE, indépendants et créateurs
- Offre : Audit gratuit de 30 minutes + 15% sur les 3 premiers mois
- Visuel souhaité : Un bureau minimaliste et chaleureux au soleil couchant avec une tasse de café fumant, style cinématique épuré`,
    category: "Travail",
    tags: ["Marketing", "Email", "Copywriting"],
    createdAt: "2026-09-20",
    updatedAt: "2026-09-20",
    isPinned: true,
  },
  {
    id: "note-3",
    title: "Rappels personnels & Famille",
    content: `- Réserver révision voiture pour fin octobre
- Vérifier renouvellement passeport de Sophie
- Idée cadeau anniversaire maman : livre photo relié depuis le serveur familial`,
    category: "Personnel",
    tags: ["Famille", "Perso"],
    createdAt: "2026-09-18",
    updatedAt: "2026-09-18",
    isPinned: false,
  },
];

export const initialAgendaEvents: AgendaEvent[] = [
  {
    id: "ev-ambu-1",
    title: "Garde Ambulance de Jour (ASSU-03 - SAMU 15 / CHU)",
    date: "2026-09-22",
    time: "07:00",
    durationMinutes: 720,
    category: "Garde Ambulance",
    shiftType: "jour",
    description: "Vacation 12h. Prise de poste avec Marc V. (DEA). Vérification matériel oxygénothérapie & DSA.",
    location: "Poste de garde & Secteur Nord",
    isCompleted: false,
  },
  {
    id: "ev-1",
    title: "Point validation maquettes avec Claire Duval",
    date: "2026-09-21",
    time: "14:30",
    durationMinutes: 30,
    category: "Pro",
    description: "Revue rapide des maquettes et du devis produit.",
    location: "Google Meet",
    isCompleted: false,
  },
  {
    id: "ev-2",
    title: "Supervision & test réseau serveur maison",
    date: "2026-09-21",
    time: "17:00",
    durationMinutes: 45,
    category: "Serveur",
    description: "Vérifier le montage des disques HDD 2To et le script daemon de Georges.",
    location: "Maison / Bureau local",
    isCompleted: false,
  },
  {
    id: "ev-ambu-2",
    title: "Garde de Nuit Ambulance & Urgences",
    date: "2026-09-25",
    time: "19:00",
    durationMinutes: 720,
    category: "Garde Ambulance",
    shiftType: "nuit",
    description: "Tour de garde de nuit 19h00 - 07h00. Équipage d'urgence.",
    location: "Centre de secours / Urgences",
    isCompleted: false,
  },
  {
    id: "ev-3",
    title: "Signature contrat partenariat Alexandre Leroy",
    date: "2026-09-25",
    time: "10:30",
    durationMinutes: 45,
    category: "Pro",
    description: "Signature électronique de l'accord cadre v2.1.",
    location: "Visioconférence",
    isCompleted: false,
  },
  {
    id: "ev-4",
    title: "Envoi de la newsletter & campagne d'automne",
    date: "2026-09-23",
    time: "09:00",
    durationMinutes: 60,
    category: "Emailing",
    description: "Diffusion de la campagne préparée par Georges avec les visuels 2K.",
    location: "Plateforme Emailing",
    isCompleted: false,
  },
];

export const initialCampaignExample: EmailCampaign = {
  id: "camp-init-1",
  campaignTitle: "Lancement de la Nouvelle Gamme Automne : Café Bio d'Exception",
  targetAudience: "Amateurs de café artisanal, abonnés fidèles et gastronomes",
  subjectLines: [
    { subject: "🍂 Votre rituel d'automne mérite un café inoubliable (-20% à l'intérieur)", predictedOpenRate: "47%", type: "Curiosité & Promo" },
    { subject: "Nouveau cru Éthiopie Yirgacheffe : notes de bergamote et miel", predictedOpenRate: "42%", type: "Bénéfice & Saveur" },
    { subject: "Fabrice, goûtez en avant-première notre torréfaction de rentrée", predictedOpenRate: "45%", type: "Personnalisé" },
    { subject: "⏳ Édition limitée : seulement 200 paquets disponibles pour ce millésime", predictedOpenRate: "51%", type: "Urgence / Rareté" },
  ],
  previewText: "Des grains soigneusement torréfiés à la main pour réchauffer vos matinées d'automne...",
  emailHeadline: "Réveillez vos sens avec l'or noir de l'automne",
  subheadline: "Une sélection rare de cafés de spécialité biologiques, torréfiés lentement pour sublimer chaque arôme.",
  bodyHtml: `<p>Bonjour,</p>
<p>Les matins se rafraîchissent, la lumière dore les feuilles, et le besoin d'un moment de pur réconfort se fait sentir au réveil.</p>
<p>Nous avons parcouru les hauts plateaux volcaniques pour vous dénicher une récolte d'exception : des fèves récoltées à la main, séchées sur lits africains au soleil, et torréfiées artisanalement dans notre atelier.</p>
<p><strong>Ce que vous découvrirez dans votre tasse :</strong></p>
<ul>
  <li>Une attaque gourmande aux notes subtiles de chocolat noir et d'épices douces</li>
  <li>Une longueur en bouche délicatement fruitée et sans amertume</li>
  <li>100% biologique, équitable et respectueux des producteurs locaux</li>
</ul>
<p>Pour célébrer ce lancement, bénéficiez de <strong>-20% de réduction immédiate</strong> sur toute notre gamme avec le code privilégié <strong>AUTOMNE20</strong>.</p>`,
  keyTakeaways: [
    "Torréfaction artisanale fraîche chaque semaine",
    "Grains 100% bio et traçabilité directe à la ferme",
    "Livraison offerte dès 35 € et emballages 100% compostables"
  ],
  callToAction: {
    buttonText: "Découvrir la collection d'automne & Profiter des -20%",
    targetUrl: "https://boutique-cafe-artisan.fr/automne",
    subtext: "Offre valable jusqu'au dimanche 27 septembre à minuit."
  },
  psMessage: "P.S. Les 50 premières commandes recevront en cadeau exclusif notre carnet de dégustation illustré !",
  suggestedVisualPrompt: "A cozy aesthetic autumn morning scene, warm golden sunlight streaming through a window onto a rustic wooden table, an artisanal porcelain cup filled with steaming espresso with rich hazelnut crema, roasted coffee beans scattered nearby with cinnamon sticks and autumn leaves, warm amber and mahogany tones, hyper-realistic, 8k resolution, cinematic lighting.",
  generatedVisualUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
  visualResolution: "2K",
  visualAspectRatio: "16:9",
  createdAt: "2026-09-21",
};

export const sampleFiles: ServerFile[] = [
  {
    id: "f1",
    name: "Factures_2026.pdf",
    path: "/data/Documents/Comptabilite/Factures_2026.pdf",
    size: "2.4 MB",
    type: "pdf",
    modified: "2026-09-18 14:30",
    category: "Documents",
  },
  {
    id: "f2",
    name: "Campagnes_Marketing_Archives.xlsx",
    path: "/data/Documents/Marketing/Campagnes_Marketing_Archives.xlsx",
    size: "1.8 MB",
    type: "excel",
    modified: "2026-09-20 09:15",
    category: "Documents",
  },
  {
    id: "f3",
    name: "Sauvegarde_PC_Portable.tar.gz",
    path: "/backup/PC_Portable/Sauvegarde_20260920.tar.gz",
    size: "14.2 GB",
    type: "archive",
    modified: "2026-09-20 03:00",
    category: "Backups",
  },
  {
    id: "f4",
    name: "Photo_Famille_Vacances_HD.jpg",
    path: "/data/Photos/2026/Photo_Famille_Vacances_HD.jpg",
    size: "8.5 MB",
    type: "image",
    modified: "2026-09-15 18:40",
    category: "Photos",
  },
  {
    id: "f5",
    name: "Notes_Serveur_Config_Home.md",
    path: "/data/Projets/Notes_Serveur_Config_Home.md",
    size: "34 KB",
    type: "text",
    modified: "2026-09-21 06:20",
    category: "Notes",
  },
  {
    id: "f6",
    name: "docker-compose.yml",
    path: "/data/Serveur/docker-compose.yml",
    size: "4 KB",
    type: "code",
    modified: "2026-09-19 22:10",
    category: "Système",
  },
];

// 1. Horloge & Réveil Matin J.A.R.V.I.S.
export const initialAlarms: AlarmItem[] = [
  {
    id: "alarm-1",
    label: "Réveil Garde Ambulance (Prise 07h00)",
    time: "05:45",
    enabled: true,
    repeatDays: ["Lun", "Mar", "Mer", "Ven"],
    soundType: "jarvis_arc",
    briefingOnWake: true,
  },
  {
    id: "alarm-2",
    label: "Réveil Travail & Suivi Marchés",
    time: "07:15",
    enabled: false,
    repeatDays: ["Jeu"],
    soundType: "iron_man_chime",
    briefingOnWake: true,
  },
  {
    id: "alarm-3",
    label: "Réveil Doux Week-end",
    time: "08:30",
    enabled: true,
    repeatDays: ["Sam", "Dim"],
    soundType: "gentle_pulse",
    briefingOnWake: false,
  },
];

// 2. Application Téléphone : Feuille de Vacation & Journée de Travail Ambulance
export const initialAmbulanceShifts: AmbulanceWorkShift[] = [
  {
    id: "shift-1",
    date: "2026-09-21",
    vehicle: "Ambulance ASSU-03 (Urgences)",
    partnerName: "Marc V. (DEA)",
    startTime: "07:00",
    endTime: "19:00",
    breakDurationMinutes: 45,
    interventionsCount: 6,
    kilometersStart: 142380,
    kilometersEnd: 142595,
    totalKm: 215,
    notes: "3 urgences régulées SAMU 15 (détresse respi, chute personne âgée, bilan trauma), 2 retours cliniques et 1 transfert CHU. Vérification lot O2 effectuée.",
    status: "validé",
    lastSyncedAt: "2026-09-21 19:10",
  },
  {
    id: "shift-2",
    date: "2026-09-19",
    vehicle: "VSL-02 (Transports programmés)",
    partnerName: "En solo",
    startTime: "08:00",
    endTime: "16:45",
    breakDurationMinutes: 30,
    interventionsCount: 5,
    kilometersStart: 98410,
    kilometersEnd: 98565,
    totalKm: 155,
    notes: "4 séances de dialyse aller/retour et 1 consultation oncologie. Aucun retard de transmission.",
    status: "transmis",
    lastSyncedAt: "2026-09-19 17:00",
  },
  {
    id: "shift-3",
    date: "2026-09-16",
    vehicle: "Ambulance ASSU-01",
    partnerName: "Nathalie B. (Auxiliaire)",
    startTime: "07:00",
    endTime: "19:30",
    breakDurationMinutes: 40,
    interventionsCount: 7,
    kilometersStart: 210100,
    kilometersEnd: 210360,
    totalKm: 260,
    notes: "Grosse journée d'astreinte, prolongation de 30 min pour prise en charge urgente régulée.",
    status: "transmis",
    lastSyncedAt: "2026-09-16 20:00",
  },
];

// 3. Application Téléphone : Mon Carnet de Santé (Suivi Poids & Constantes)
export const initialHealthLogs: HealthLogEntry[] = [
  {
    id: "health-1",
    date: "2026-09-21",
    time: "06:15",
    weightKg: 78.2,
    targetWeightKg: 76.5,
    systolicBp: 122,
    diastolicBp: 78,
    sleepHours: 7.2,
    hydrationLiters: 2.2,
    comment: "Pesée matinale à jeun. Bonne énergie avant la garde.",
    bmi: 23.6,
  },
  {
    id: "health-2",
    date: "2026-09-18",
    time: "06:30",
    weightKg: 78.5,
    targetWeightKg: 76.5,
    systolicBp: 124,
    diastolicBp: 80,
    sleepHours: 6.8,
    hydrationLiters: 2.0,
    comment: "Réveil en forme, hydratation correcte.",
    bmi: 23.7,
  },
  {
    id: "health-3",
    date: "2026-09-14",
    time: "07:00",
    weightKg: 78.9,
    targetWeightKg: 76.5,
    systolicBp: 125,
    diastolicBp: 81,
    sleepHours: 7.0,
    hydrationLiters: 1.8,
    comment: "Diminution du sel confirmée.",
    bmi: 23.8,
  },
  {
    id: "health-4",
    date: "2026-09-10",
    time: "06:45",
    weightKg: 79.4,
    targetWeightKg: 76.5,
    systolicBp: 127,
    diastolicBp: 82,
    sleepHours: 6.5,
    hydrationLiters: 1.9,
    comment: "Séance gainage et marche rapide.",
    bmi: 24.0,
  },
  {
    id: "health-5",
    date: "2026-09-02",
    time: "07:15",
    weightKg: 80.2,
    targetWeightKg: 76.5,
    systolicBp: 129,
    diastolicBp: 83,
    sleepHours: 7.4,
    hydrationLiters: 1.7,
    comment: "Point de départ reprise en main.",
    bmi: 24.2,
  },
];

// 4. Projet de Publication d'Application & Recrutement de Testeurs
export const initialAppProject: AppProject = {
  id: "app-proj-1",
  name: "AmbuGuard Pro",
  category: "Santé, Urgences & Productivité Médicale",
  version: "1.2.0 (Build 42)",
  platform: "Android (Google Play)",
  tagline: "L'application tout-en-un pour les ambulanciers : tournées, feuilles de route et temps de repos",
  shortDescription: "Gérez vos vacations, compteurs kilométriques, interventions d'urgence et bilans en un clin d'œil.",
  fullDescription: `AmbuGuard Pro est l'application conçue par et pour les professionnels du transport sanitaire (ambulanciers diplômés d'État, auxiliaires, régulateurs).

Fonctionnalités clés :
• Enregistrement simplifié de vos vacations (prise et fin de poste, pauses légales, astreintes)
• Journal de bord kilométrique automatique et suivi du véhicule (ASSU, VSL, TPMR)
• Fiche de transmission rapide et synthèse d'interventions SAMU / Cliniques
• Export direct en PDF et CSV certifiés pour les bilans d'activité
• Mode hors-ligne complet (fonctionne en zone blanche ou sous-sol d'hôpital)
• Synchronisation sécurisée avec le majordome IA Georges`,
  releaseNotes: `Nouveautés de la version 1.2.0 :
- Ajout de l'export automatique vers le cloud et webhook Georges
- Optimisation du mode sombre pour les gardes de nuit
- Nouveau calcul instantané des temps de pause réglementaires
- Correction des calculs de cumul kilométrique en fin de vacation`,
  asoKeywords: [
    "ambulancier", 
    "feuille de route ambulance", 
    "garde SAMU", 
    "transport sanitaire", 
    "ASSU", 
    "horaires ambulancier", 
    "carnet de bord véhicule", 
    "urgence médicale"
  ],
  testersNeededCount: 25,
  currentTestersCount: 16,
  status: "bêta_ouverte",
};

export const initialBetaTesters: BetaTester[] = [
  {
    id: "test-1",
    name: "Alexandre Mercier",
    email: "alex.mercier.dea@gmail.com",
    platform: "Android",
    profile: "Ambulancier / Pro Santé",
    status: "actif",
    feedback: "Interface super fluide en intervention. Le calcul automatique des kilomètres économise 15 min par shift !",
    joinedAt: "2026-09-14",
  },
  {
    id: "test-2",
    name: "Julien Delorme",
    email: "j.delorme.samu@orange.fr",
    platform: "Android",
    profile: "Ambulancier / Pro Santé",
    status: "retour_reçu",
    feedback: "Très bon suivi des heures de nuit. Suggère d'ajouter un bouton d'alerte pour les pauses repas écourtées.",
    joinedAt: "2026-09-15",
  },
  {
    id: "test-3",
    name: "Stéphanie Roussel",
    email: "stephanie.roussel@outlook.fr",
    platform: "iOS",
    profile: "Ambulancier / Pro Santé",
    status: "actif",
    feedback: "Version TestFlight impeccable sur iPhone 15 Pro, la lisibilité est top.",
    joinedAt: "2026-09-17",
  },
  {
    id: "test-4",
    name: "Thomas Bernard",
    email: "t.bernard.dev@gmail.com",
    platform: "Multi-plateforme",
    profile: "Bêta-testeur tech",
    status: "invité",
    joinedAt: "2026-09-20",
  },
  {
    id: "test-5",
    name: "Céline Gauthier",
    email: "celine.gauthier@sante-secours.org",
    platform: "Android",
    profile: "Ambulancier / Pro Santé",
    status: "actif",
    feedback: "Testé sur 3 gardes de 12h consécutives : zéro plantage, la synchro est instantanée.",
    joinedAt: "2026-09-18",
  },
];

export const initialCodeVaultItems: CodeVaultItem[] = [
  {
    id: "code-1",
    title: "Validation Bancaire (SMS Clé 6 chiffres)",
    code: "839 204",
    category: "2fa_sms",
    serviceOrOrigin: "Banque Populaire / Paiement 3D Secure",
    capturedVia: "hotkey",
    createdAt: "Aujourd'hui à 11:42",
    expiresAt: "Dans 8 minutes",
    isFavorite: true,
    notes: "Code reçu pour authentification paiement serveur"
  },
  {
    id: "code-2",
    title: "Code Clavier Alarme & Entrée Poste Secours",
    code: "4729#",
    category: "pin",
    serviceOrOrigin: "Porte sas Ambulance / Urgences",
    capturedVia: "voice",
    createdAt: "Hier à 19:15",
    isFavorite: true,
    notes: "Code à dicter ou afficher en intervention de nuit"
  },
  {
    id: "code-3",
    title: "Clé Sécurité Wi-Fi Maison Fibre",
    code: "K9x#vL72!mQ89pZx",
    category: "wifi",
    serviceOrOrigin: "Box Fibre Salon 5GHz",
    capturedVia: "clipboard",
    createdAt: "2026-09-15",
    isFavorite: true,
    notes: "Réseau principal sécurisé WPA3"
  },
  {
    id: "code-4",
    title: "Clé SSH & Root Serveur PC Maison",
    code: "ssh -p 2222 fabrice@192.168.1.150 -i ~/.ssh/id_rsa_georges",
    category: "snippet",
    serviceOrOrigin: "Ubuntu Server 24.04 LTS (Vieux PC)",
    capturedVia: "manual",
    createdAt: "2026-09-18",
    isFavorite: true,
    notes: "Commande de connexion rapide au terminal distant"
  },
  {
    id: "code-5",
    title: "Jeton API Gemini Developer",
    code: "AIzaSyB7qX82M90P_kL42xZq190VwTa_DEMO_KEY",
    category: "api_key",
    serviceOrOrigin: "Google AI Studio Console",
    capturedVia: "hotkey",
    createdAt: "2026-09-19",
    isFavorite: false,
    notes: "Clé projet modèle de raisonnement"
  },
  {
    id: "code-6",
    title: "Licence Google Play Console Bêta",
    code: "GPLAY-PROD-2026-AMBU-84920-BETA",
    category: "license",
    serviceOrOrigin: "Compte Développeur Google",
    capturedVia: "voice",
    createdAt: "2026-09-20",
    isFavorite: false,
    notes: "Clé de signature de build"
  }
];

