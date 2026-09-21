import React, { useState } from "react";
import { 
  Rocket, 
  Users, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  Share2, 
  ExternalLink, 
  FileText, 
  Send, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Tag
} from "lucide-react";
import { AppProject, BetaTester } from "../types";
import { alarmAudio } from "../utils/alarmAudio";

interface AppPublisherTabProps {
  project: AppProject;
  testers: BetaTester[];
  onAddTester: (tester: Omit<BetaTester, "id" | "joinedAt">) => void;
  onDeleteTester: (id: string) => void;
  onUpdateProject: (updated: Partial<AppProject>) => void;
}

export const AppPublisherTab: React.FC<AppPublisherTabProps> = ({
  project,
  testers,
  onAddTester,
  onDeleteTester,
  onUpdateProject,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"store" | "recruitment" | "testers">("recruitment");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // New tester form state
  const [isAddingTester, setIsAddingTester] = useState(false);
  const [testerName, setTesterName] = useState("");
  const [testerEmail, setTesterEmail] = useState("");
  const [testerPlatform, setTesterPlatform] = useState<BetaTester["platform"]>("Android");
  const [testerProfile, setTesterProfile] = useState<BetaTester["profile"]>("Ambulancier / Pro Santé");

  // Recruitment template selector
  const [recruitmentPlatform, setRecruitmentPlatform] = useState<"facebook" | "email" | "whatsapp">("facebook");

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    alarmAudio.playChime("iron_man_chime");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateTester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerName.trim() || !testerEmail.trim()) return;

    onAddTester({
      name: testerName.trim(),
      email: testerEmail.trim(),
      platform: testerPlatform,
      profile: testerProfile,
      status: "invité",
    });

    setTesterName("");
    setTesterEmail("");
    setIsAddingTester(false);
    alarmAudio.playChime("iron_man_chime");
  };

  // Ready-to-use recruitment message templates
  const recruitmentTemplates = {
    facebook: `🚑 Appel à testeurs : AmbuGuard Pro (Application pour Ambulanciers)

Bonjour à tous les collègues ambulanciers et ambulancières ! 👋
Dans le cadre de la publication officielle de mon application mobile **${project.name}**, je recherche **${Math.max(1, project.testersNeededCount - testers.length)} testeurs supplémentaires** sur Android et iPhone.

🔹 **Pourquoi cette application ?**
Créée pour nous faire gagner du temps sur chaque vacation :
- Remplissage rapide de vos feuilles de route et temps de pause
- Compteur kilométrique départ/arrivée et bilan des urgences
- Fonctionne 100% hors-ligne (en zone blanche ou sous-sol d'hôpital)
- Export direct des bilans d'activité

👉 Si vous souhaitez la tester gratuitement avant la sortie publique sur le Google Play Store et participer à son amélioration, commentez ce post ou envoyez-moi un message privé !

Merci d'avance pour votre aide confraternelle ! 🤝`,

    email: `Objet : Invitation exclusive au test de l'application ${project.name} (Bêta testeurs)

Bonjour,

Je te contacte car je finalise actuellement la publication de mon application mobile **${project.name}** dédiée aux professionnels du transport sanitaire et aux ambulanciers.

L'application permet d'enregistrer ses tournées, calculer automatiquement les kilométrages, suivre les vacations d'urgence et exporter les bilans d'heures en un clin d'œil.

Dans le cadre du programme de test fermé Google Play et Apple TestFlight, je serais ravi d'avoir tes retours d'utilisation sur le terrain.

Pour rejoindre la phase de test :
1. Clique sur ce lien d'accès privilégié : https://play.google.com/apps/testing/com.ambuguard.pro
2. Installe l'application sur ton smartphone
3. Partage-moi tes suggestions et ressentis

Un grand merci pour ton coup de main !

Bien amicalement,
Fabrice Moriau`,

    whatsapp: `Salut ! 🚑 Je finalise la publication de mon application pour ambulanciers (${project.name}). J'ai besoin de quelques testeurs sur Android ou iPhone pour valider la dernière version sur le store. Tu as 5 min pour installer la version bêta et me donner ton avis ? Voici le lien direct : https://play.google.com/apps/testing/com.ambuguard.pro . Merci d'avance !`,
  };

  const progressPercent = Math.min(100, Math.round((testers.length / project.testersNeededCount) * 100));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      
      {/* Top Banner: Project Title and Publication Status */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Rocket className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {project.name} &middot; Publication Store & Testeurs
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {project.version} &middot; Bêta Ouverte
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plateforme cible : {project.platform} &middot; {project.category}
            </p>
          </div>
        </div>

        {/* Testers Metric Progress Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Bêta-testeurs recrutés</span>
            <span className="text-amber-400 font-bold font-mono">
              {testers.length} / {project.testersNeededCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("recruitment")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "recruitment"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>Campagne Recrutement Testeurs</span>
        </button>

        <button
          onClick={() => setActiveSubTab("store")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "store"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Fiche Store Google Play & ASO</span>
        </button>

        <button
          onClick={() => setActiveSubTab("testers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "testers"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Liste & Retours des Testeurs ({testers.length})</span>
        </button>
      </div>

      {/* 1. RECRUITMENT CAMPAIGN TAB */}
      {activeSubTab === "recruitment" && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Générateur d'Annonces & Messages de Recrutement
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Georges a rédigé des modèles prêts à l'envoi pour trouver rapidement vos {project.testersNeededCount - testers.length} testeurs restants.
              </p>
            </div>

            <button
              onClick={() => setIsAddingTester(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire un testeur</span>
            </button>
          </div>

          {/* Quick Platform Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setRecruitmentPlatform("facebook")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                recruitmentPlatform === "facebook"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Post Réseaux Sociaux & Groupes d'Ambulanciers
            </button>

            <button
              onClick={() => setRecruitmentPlatform("email")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                recruitmentPlatform === "email"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Email d'Invitation Personnel
            </button>

            <button
              onClick={() => setRecruitmentPlatform("whatsapp")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                recruitmentPlatform === "whatsapp"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Message Court WhatsApp / SMS
            </button>
          </div>

          {/* Message Preview & Copy Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Message généré par Georges
              </span>

              <button
                onClick={() => copyToClipboard(recruitmentTemplates[recruitmentPlatform], "recruitment-text")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedField === "recruitment-text" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le message</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
              {recruitmentTemplates[recruitmentPlatform]}
            </div>
          </div>
        </div>
      )}

      {/* 2. STORE METADATA & ASO TAB */}
      {activeSubTab === "store" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Fiche de Publication Google Play Store
                </h3>
                <p className="text-xs text-slate-500">
                  Prête à être copiée-collée dans la Google Play Console ou App Store Connect.
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Conforme Store
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {/* Short Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Description Courte (Max 80 caractères) :
                  </span>
                  <button
                    onClick={() => copyToClipboard(project.shortDescription, "short-desc")}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedField === "short-desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copier</span>
                  </button>
                </div>
                <div className="text-xs text-slate-900 font-medium">
                  {project.shortDescription}
                </div>
              </div>

              {/* Long Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Description Longue Complète (ASO optimisé) :
                  </span>
                  <button
                    onClick={() => copyToClipboard(project.fullDescription, "long-desc")}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedField === "long-desc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copier</span>
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {project.fullDescription}
                </div>
              </div>

              {/* Release Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Nouveautés de la Version (Release Notes) :
                  </span>
                  <button
                    onClick={() => copyToClipboard(project.releaseNotes, "release-notes")}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedField === "release-notes" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copier</span>
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {project.releaseNotes}
                </div>
              </div>

              {/* ASO Keywords */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Mots-Clés de Référencement (ASO) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.asoKeywords.map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TESTERS LIST & FEEDBACK TAB */}
      {activeSubTab === "testers" && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Liste des Bêta-Testeurs & Retours d'Expérience
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {testers.length} testeurs enregistrés &middot; Suivi des retours pour la publication finale
              </p>
            </div>

            <button
              onClick={() => setIsAddingTester(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un testeur</span>
            </button>
          </div>

          {/* Add Tester Form */}
          {isAddingTester && (
            <form onSubmit={handleCreateTester} className="bg-white rounded-3xl border-2 border-slate-800 p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  Nouveau Bêta-Testeur
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingTester(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    placeholder="Ex: Vincent Lambert"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email (compte Google Play / Apple ID)</label>
                  <input
                    type="email"
                    value={testerEmail}
                    onChange={(e) => setTesterEmail(e.target.value)}
                    placeholder="vincent.ambulancier@gmail.com"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plateforme</label>
                  <select
                    value={testerPlatform}
                    onChange={(e) => setTesterPlatform(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Android">Android (Google Play)</option>
                    <option value="iOS">iOS (Apple TestFlight)</option>
                    <option value="Multi-plateforme">Multi-plateforme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profil</label>
                  <select
                    value={testerProfile}
                    onChange={(e) => setTesterProfile(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Ambulancier / Pro Santé">Ambulancier / Pro Santé</option>
                    <option value="Bêta-testeur tech">Bêta-testeur tech</option>
                    <option value="Partenaire">Partenaire</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTester(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Enregistrer & Inviter
                </button>
              </div>
            </form>
          )}

          {/* Testers List */}
          <div className="space-y-3">
            {testers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {t.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {t.platform}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === "actif"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : t.status === "retour_reçu"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {t.status === "actif" ? "Actif sur le build" : t.status === "retour_reçu" ? "Feedback transmis" : "Invité"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    {t.email} &middot; Profil : {t.profile} &middot; Rejoint le {t.joinedAt}
                  </div>

                  {t.feedback && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                      "{t.feedback}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onDeleteTester(t.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
