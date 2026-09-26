import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Mic,
  Eye,
  Server,
  Lock,
  Bell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap
} from "lucide-react";

interface OnboardingScreenProps {
  onComplete: (settings: {
    voiceEnabled: boolean;
    visionEnabled: boolean;
    serverEnabled: boolean;
    vaultEnabled: boolean;
    notificationsEnabled: boolean;
    userName: string;
    voiceStyle: "jarvis" | "classic";
    serverIp: string;
    apiKey: string;
  }) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [userName, setUserName] = useState<string>("Monsieur Fabrice");
  const [serverIp, setServerIp] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [visionEnabled, setVisionEnabled] = useState<boolean>(true);
  const [serverEnabled, setServerEnabled] = useState<boolean>(true);
  const [vaultEnabled, setVaultEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [voiceStyle, setVoiceStyle] = useState<"jarvis" | "classic">("jarvis");

  const handleStart = () => {
    // Play startup chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {}

    onComplete({
      voiceEnabled,
      visionEnabled,
      serverEnabled,
      vaultEnabled,
      notificationsEnabled,
      userName,
      voiceStyle,
      serverIp,
      apiKey
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto selection:bg-cyan-500/30">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 my-8">

        {/* Neon accent top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse">
            <Bot size={36} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Initialisation de Georges
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Bienvenue dans votre assistant d'intelligence artificielle multimodal. Configurez vos paramètres d'ancrage pour réveiller le système.
          </p>
        </div>

        {/* Configuration Parameters Panel */}
        <div className="space-y-6">

          {/* User Name input */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Identité de l'Opérateur</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Votre nom ou titre..."
              />
            </div>
          </div>

          {/* Server IP input */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Server size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Adresse IP du Serveur (Ordinateur)</label>
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                placeholder="Ex: 192.168.1.XX"
              />
              <p className="text-[10px] text-slate-500 mt-1">Nécessaire pour connecter Georges à son cerveau (sur votre PC).</p>
            </div>
          </div>

          {/* API Key input */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Clé API Gemini (Optionnel)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                placeholder="AIzaSy..."
              />
              <p className="text-[10px] text-slate-500 mt-1">Pour activer les capacités d'intelligence artificielle avancées.</p>
            </div>
          </div>

          {/* Personality Selector */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Style de Personnalité Vocal</label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setVoiceStyle("jarvis")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    voiceStyle === "jarvis"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  🧬 Protocole J.A.R.V.I.S.
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceStyle("classic")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    voiceStyle === "classic"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  🤵 Majordome Classique
                </button>
              </div>
            </div>
          </div>

          {/* Parameters checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Modules Fonctionnels à Activer</h3>

            {/* Checkbox 1: Voice */}
            <label className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer select-none">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/20">
                <Mic size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white">Reconnaissance & Synthèse Vocale Active</div>
                <div className="text-xs text-slate-400 mt-0.5">Permet à Georges d'écouter le mot clé de réveil et de vous répondre à haute voix en français.</div>
              </div>
            </label>

            {/* Checkbox 2: Vision */}
            <label className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visionEnabled}
                onChange={(e) => setVisionEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                <Eye size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white">Capteurs Optiques & Vision Jarvis</div>
                <div className="text-xs text-slate-400 mt-0.5">Active l'analyse intelligente des photos de l'appareil photo et des captures d'écran HUD de l'appareil.</div>
              </div>
            </label>

            {/* Checkbox 3: Server */}
            <label className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer select-none">
              <input
                type="checkbox"
                checked={serverEnabled}
                onChange={(e) => setServerEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                <Server size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white">Réseau Serveur Domestique & Logs</div>
                <div className="text-xs text-slate-400 mt-0.5">Connecte le tableau de bord au serveur virtuel local pour surveiller la mémoire et les requêtes.</div>
              </div>
            </label>

            {/* Checkbox 4: Vault */}
            <label className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vaultEnabled}
                onChange={(e) => setVaultEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <Lock size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white">Coffre-fort Sécurisé (Code Vault)</div>
                <div className="text-xs text-slate-400 mt-0.5">Active le module d'interception de codes 2FA, clés API, digicodes et mots de passe.</div>
              </div>
            </label>

            {/* Checkbox 5: Notifications */}
            <label className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0 border border-pink-500/20">
                <Bell size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white">Alertes d'Agenda & Gardes d'Ambulance</div>
                <div className="text-xs text-slate-400 mt-0.5">Permet les rappels instantanés pour vos vacations d'urgence, événements et réveils.</div>
              </div>
            </label>

          </div>
        </div>

        {/* Footer info/compliance bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Toutes les données restent stockées localement</span>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Démarrer Georges</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
