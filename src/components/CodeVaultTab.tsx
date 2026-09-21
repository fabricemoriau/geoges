import React, { useState, useEffect, useRef } from "react";
import { 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  Mic, 
  MicOff, 
  Clipboard, 
  Sparkles, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter, 
  Laptop, 
  Smartphone, 
  Zap, 
  AlertCircle,
  Volume2,
  Maximize2,
  X,
  Code as CodeIcon,
  Wifi,
  Shield,
  FileCode,
  Terminal,
  Lock
} from "lucide-react";
import { CodeVaultItem, CodeCategory } from "../types";

interface CodeVaultTabProps {
  codes: CodeVaultItem[];
  onAddCode: (codeData: Omit<CodeVaultItem, "id" | "createdAt">) => void;
  onDeleteCode: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSaveAsNote?: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const CodeVaultTab: React.FC<CodeVaultTabProps> = ({
  codes,
  onAddCode,
  onDeleteCode,
  onToggleFavorite,
  onSaveAsNote,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomCode, setZoomCode] = useState<CodeVaultItem | null>(null);

  // Manual Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCategory, setNewCategory] = useState<CodeCategory>("2fa_sms");
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newExpires, setNewExpires] = useState("");

  // Voice Dictation of Code State
  const [isDictatingCode, setIsDictatingCode] = useState(false);
  const [dictatedDraft, setDictatedDraft] = useState("");
  const [dictationStatus, setDictationStatus] = useState("Dites votre code chiffre par chiffre ou lettre par lettre...");
  const recognitionRef = useRef<any>(null);

  // Clipboard Grabber Feedback
  const [grabFeedback, setGrabFeedback] = useState<string | null>(null);

  // Play Stark Cyber Chime for Code Capture
  const playStarkChime = (type: "grab" | "copy" | "voice") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "grab") {
        // High tech electronic beep sequence (1046Hz to 1568Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "copy") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1318, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659, ctx.currentTime);
        osc.frequency.setValueAtTime(987, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  };

  // Auto-detect Code Type based on patterns
  const detectCodeType = (raw: string): { category: CodeCategory; title: string } => {
    const trimmed = raw.trim();
    if (/^\d{6}$/.test(trimmed.replace(/\s+/g, ""))) {
      return { category: "2fa_sms", title: "Code de Validation 6 chiffres (SMS / 2FA)" };
    }
    if (/^\d{4,5}[#*]?$/.test(trimmed)) {
      return { category: "pin", title: "Code PIN / Digicode Sécurisé" };
    }
    if (trimmed.startsWith("ssh-") || trimmed.startsWith("ssh ") || trimmed.includes("sudo ") || trimmed.includes("curl ")) {
      return { category: "snippet", title: "Commande Terminal / Script" };
    }
    if (trimmed.startsWith("AIzaSy") || trimmed.startsWith("sk-") || trimmed.startsWith("ghp_")) {
      return { category: "api_key", title: "Clé d'API Développeur" };
    }
    if (/^[A-Z0-9]{4,5}-[A-Z0-9]{4,5}-[A-Z0-9]{4,5}/.test(trimmed)) {
      return { category: "license", title: "Clé de Licence Logiciel" };
    }
    if (trimmed.length > 12 && /[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && /[0-9]/.test(trimmed) && /[^A-Za-z0-9]/.test(trimmed)) {
      return { category: "password", title: "Mot de Passe Complexe Fort" };
    }
    return { category: "autre", title: "Code Enregistré" };
  };

  // 1. Grab Code from Clipboard (or triggered via Hotkey)
  const handleGrabFromClipboard = async () => {
    try {
      playStarkChime("grab");
      if (!navigator.clipboard) {
        setGrabFeedback("Presse-papier non accessible directement. Utilisez le formulaire manuel.");
        return;
      }
      const text = await navigator.clipboard.readText();
      const clean = text.trim();
      if (!clean) {
        setGrabFeedback("Le presse-papier est vide. Copiez d'abord un code sur votre ordinateur !");
        setTimeout(() => setGrabFeedback(null), 4000);
        return;
      }

      const detected = detectCodeType(clean);
      onAddCode({
        title: detected.title,
        code: clean,
        category: detected.category,
        serviceOrOrigin: "Attrapé sur Ordinateur",
        capturedVia: "clipboard",
        isFavorite: false,
        notes: `Capturé le ${new Date().toLocaleTimeString()} depuis le presse-papier`,
      });

      setGrabFeedback(`✓ Code attrapé avec succès : « ${clean.slice(0, 14)}${clean.length > 14 ? "..." : ""} »`);
      setTimeout(() => setGrabFeedback(null), 4500);
    } catch (err) {
      console.warn("Clipboard read error:", err);
      setGrabFeedback("Autorisation presse-papier requise par le navigateur.");
      setTimeout(() => setGrabFeedback(null), 4000);
    }
  };

  // 2. Specialized Code Voice Dictation ("Lire mes codes à Georges")
  const startCodeDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictationStatus("Reconnaissance vocale non supportée sur ce navigateur.");
      return;
    }

    try {
      playStarkChime("voice");
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsDictatingCode(true);
        setDictationStatus("Georges écoute votre code... Épelez ou dictez clairement :");
      };

      recognition.onresult = (e: any) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }

        // Clean and transform spoken numbers/letters to clean code format
        const formattedCode = cleanSpokenCode(transcript);
        setDictatedDraft(formattedCode);
      };

      recognition.onerror = (e: any) => {
        console.warn("Dictation error:", e);
        setIsDictatingCode(false);
        setDictationStatus("Écoute interrompue. Cliquez pour recommencer.");
      };

      recognition.onend = () => {
        setIsDictatingCode(false);
        setDictationStatus("Dictée terminée. Vérifiez et cliquez sur Enregistrer.");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsDictatingCode(false);
      setDictationStatus("Microphone indisponible.");
    }
  };

  const stopCodeDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsDictatingCode(false);
  };

  // Convert spoken French numbers and symbols into actual characters
  const cleanSpokenCode = (raw: string): string => {
    let s = raw.toLowerCase();

    // Replacements for numbers
    const numberMap: Record<string, string> = {
      "zéro": "0", "zero": "0",
      "un": "1", "une": "1",
      "deux": "2",
      "trois": "3",
      "quatre": "4",
      "cinq": "5",
      "six": "6",
      "sept": "7",
      "huit": "8",
      "neuf": "9",
      "dix": "10",
      "onze": "11",
      "douze": "12",
    };

    // Replace written number words
    Object.keys(numberMap).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      s = s.replace(regex, numberMap[word]);
    });

    // Replace symbol words
    s = s.replace(/\btiret du bas\b/g, "_")
         .replace(/\btiret\b/g, "-")
         .replace(/\bpoint\b/g, ".")
         .replace(/\barobase\b/g, "@")
         .replace(/\bdièse\b|\bdiese\b/g, "#")
         .replace(/\bétoile\b|\betoile\b/g, "*")
         .replace(/\bslash\b/g, "/")
         .replace(/\bpoint d'exclamation\b/g, "!")
         .replace(/\bpoint d'interrogation\b/g, "?")
         .replace(/\bmajuscule ([a-z])\b/g, (_, letter) => letter.toUpperCase());

    return s.replace(/\s+/g, " ").trim();
  };

  const handleSaveDictatedCode = () => {
    if (!dictatedDraft.trim()) return;
    const clean = dictatedDraft.trim();
    const detected = detectCodeType(clean);

    onAddCode({
      title: detected.title,
      code: clean,
      category: detected.category,
      serviceOrOrigin: "Dicté à Georges (Vocal)",
      capturedVia: "voice",
      isFavorite: false,
      notes: "Dicté à voix haute et transcrit avec précision",
    });

    playStarkChime("grab");
    setDictatedDraft("");
    setGrabFeedback(`✓ Code dicté enregistré avec succès : « ${clean} »`);
    setTimeout(() => setGrabFeedback(null), 4000);
  };

  // Copy Code to Clipboard with feedback
  const handleCopyCode = async (id: string, text: string) => {
    try {
      playStarkChime("copy");
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  // Toggle reveal code
  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Submit Manual Form
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    onAddCode({
      title: newTitle.trim() || detectCodeType(newCode).title,
      code: newCode.trim(),
      category: newCategory,
      serviceOrOrigin: newService.trim() || undefined,
      capturedVia: "manual",
      expiresAt: newExpires.trim() || undefined,
      notes: newNotes.trim() || undefined,
      isFavorite: false,
    });

    playStarkChime("grab");
    setNewTitle("");
    setNewCode("");
    setNewService("");
    setNewNotes("");
    setNewExpires("");
    setIsAdding(false);
  };

  // Filter & Search
  const filteredCodes = codes.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      (c.serviceOrOrigin && c.serviceOrOrigin.toLowerCase().includes(query)) ||
      (c.notes && c.notes.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: CodeCategory) => {
    switch (category) {
      case "2fa_sms":
        return { label: "SMS / 2FA (OTP)", color: "bg-emerald-50 text-emerald-800 border-emerald-300", icon: ShieldCheck };
      case "pin":
        return { label: "Code PIN / Digicode", color: "bg-blue-50 text-blue-800 border-blue-300", icon: Lock };
      case "password":
        return { label: "Mot de passe", color: "bg-purple-50 text-purple-800 border-purple-300", icon: Key };
      case "wifi":
        return { label: "Clé Wi-Fi", color: "bg-cyan-50 text-cyan-800 border-cyan-300", icon: Wifi };
      case "api_key":
        return { label: "Jeton / Clé API", color: "bg-amber-50 text-amber-800 border-amber-300", icon: CodeIcon };
      case "license":
        return { label: "Licence Logiciel", color: "bg-indigo-50 text-indigo-800 border-indigo-300", icon: Shield };
      case "snippet":
        return { label: "Script / Terminal", color: "bg-slate-800 text-cyan-300 border-slate-700", icon: Terminal };
      default:
        return { label: "Autre code", color: "bg-slate-100 text-slate-700 border-slate-300", icon: FileCode };
    }
  };

  const getSourceIcon = (via: CodeVaultItem["capturedVia"]) => {
    switch (via) {
      case "hotkey":
        return { label: "Touche [Alt+C]", icon: Laptop, color: "text-amber-500" };
      case "voice":
        return { label: "Dicté vocalement", icon: Mic, color: "text-cyan-500" };
      case "clipboard":
        return { label: "Presse-papier", icon: Clipboard, color: "text-emerald-500" };
      default:
        return { label: "Manuel", icon: Plus, color: "text-slate-400" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      
      {/* Executive Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle Stark background graphic glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Coffre-Fort & Attrape-Codes J.A.R.V.I.S.
              </h2>
              <span className="text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2.5 py-0.5 rounded-full">
                Chiffré & Instantané
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enregistrez vos codes dès que vous les manipulez sur ordinateur. Attrapez-les automatiquement avec la touche <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs font-bold shadow-xs">Alt + C</kbd>, dictez-les oralement à Georges ou collez votre presse-papier en un clic.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Grab From Clipboard Hotkey Trigger */}
            <button
              onClick={handleGrabFromClipboard}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer transform hover:scale-[1.02]"
              title="Attraper immédiatement le texte ou code copié dans le presse-papier de votre ordinateur"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Attraper le Code [Alt + C]</span>
            </button>

            {/* Read Voice Code Button */}
            <button
              onClick={() => {
                if (isDictatingCode) {
                  stopCodeDictation();
                } else {
                  startCodeDictation();
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                isDictatingCode
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30"
              }`}
              title="Lire un code à voix haute à Georges"
            >
              {isDictatingCode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
              <span>{isDictatingCode ? "Arrêter la dictée" : "Lire un code à Georges"}</span>
            </button>

            {/* Manual New Code */}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Saisie manuelle</span>
            </button>
          </div>
        </div>

        {/* Global Hotkey Banner Notification */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>Touche d'attrape automatique activée :</strong> appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[11px] font-bold">Alt + C</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[11px] font-bold">Ctrl + Shift + C</kbd> n'importe où dans l'application pour capturer le code copié sur votre PC.
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {codes.length} codes sécurisés &middot; {codes.filter(c => c.isFavorite).length} favoris
          </div>
        </div>

        {/* Feedback Alert Pill */}
        {grabFeedback && (
          <div className="mt-3 p-2.5 bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-medium rounded-xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{grabFeedback}</span>
          </div>
        )}
      </div>

      {/* Voice Dictation Drawer if active or has draft */}
      {(isDictatingCode || dictatedDraft) && (
        <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-5 shadow-xl text-white space-y-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Mic className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Module de Dictée Vocale Spéciale Codes</h3>
                <p className="text-xs text-slate-400">{dictationStatus}</p>
              </div>
            </div>

            <button
              onClick={() => {
                stopCodeDictation();
                setDictatedDraft("");
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              Fermer
            </button>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-lg text-cyan-300 tracking-wider flex items-center justify-between">
            <span>{dictatedDraft || "Parlez maintenant (ex: « quatre deux un huit arobase »)..."}</span>
            {dictatedDraft && (
              <span className="text-xs text-slate-400 font-sans">
                {dictatedDraft.replace(/\s+/g, "").length} caractères
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setDictatedDraft("")}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Effacer
            </button>

            {isDictatingCode ? (
              <button
                onClick={stopCodeDictation}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Terminer l'écoute</span>
              </button>
            ) : (
              <button
                onClick={startCodeDictation}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 border border-cyan-500/30"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Reprendre la dictée</span>
              </button>
            )}

            <button
              onClick={handleSaveDictatedCode}
              disabled={!dictatedDraft.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer dans le coffre</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSubmitManual}
          className="bg-white rounded-3xl border-2 border-slate-900 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Nouveau Code à Sécuriser
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre ou Description du code
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Validation CB Banque Populaire, Digicode Sas Urgences..."
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie de code
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CodeCategory)}
                className="w-full text-xs border rounded-xl p-2.5 bg-white font-medium"
              >
                <option value="2fa_sms">🔐 Validation 2FA / SMS (Code temporaire)</option>
                <option value="pin">🔢 Code PIN / Digicode de porte</option>
                <option value="password">🔑 Mot de passe fort</option>
                <option value="wifi">📶 Clé de sécurité Wi-Fi</option>
                <option value="api_key">⚡ Jeton d'accès / Clé d'API</option>
                <option value="license">🛡️ Clé de Licence Logiciel</option>
                <option value="snippet">💻 Commande Terminal / Script</option>
                <option value="autre">📝 Autre code</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Le Code / Valeur secrète *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ex: 839201, MonPassw0rd!#2026, ssh -p 22..."
                  className="w-full text-sm font-mono font-bold border-2 border-slate-800 rounded-xl p-3 bg-slate-50 focus:bg-white text-slate-900 tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service ou Origine (optionnel)
              </label>
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Ex: Google, CHU Urgences, Serveur Linux..."
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiration ou validité (ex: pour 2FA / SMS)
              </label>
              <input
                type="text"
                value={newExpires}
                onChange={(e) => setNewExpires(e.target.value)}
                placeholder="Ex: 10 minutes, Temporaire, Permanent..."
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes ou instructions d'utilisation
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ex: À renseigner sur la page de paiement avant validation"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
            >
              Mémoriser dans le coffre
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un code, service, titre..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Tous" },
            { id: "2fa_sms", label: "SMS / 2FA" },
            { id: "pin", label: "PIN & Digicodes" },
            { id: "password", label: "Mots de passe" },
            { id: "wifi", label: "Wi-Fi" },
            { id: "snippet", label: "Terminal / Scripts" },
            { id: "api_key", label: "Clés API" },
            { id: "license", label: "Licences" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCodes.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Aucun code trouvé</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Copiez un code sur votre ordinateur et cliquez sur <strong>« Attraper le Code [Alt+C] »</strong>, ou dictez-le directement à Georges.
            </p>
          </div>
        ) : (
          filteredCodes.map((item) => {
            const badge = getCategoryBadge(item.category);
            const BadgeIcon = badge.icon;
            const source = getSourceIcon(item.capturedVia);
            const SourceIcon = source.icon;
            const isRevealed = revealedIds[item.id] || false;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-all space-y-3 relative group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>

                      {item.serviceOrOrigin && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.serviceOrOrigin}
                        </span>
                      )}

                      {item.expiresAt && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.expiresAt}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  {/* Favorite & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        item.isFavorite
                          ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                          : "text-slate-300 hover:text-amber-400 hover:bg-slate-100"
                      }`}
                      title={item.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
                    </button>

                    <button
                      onClick={() => onDeleteCode(item.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer ce code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Secure Code Display Field */}
                <div className="p-3.5 bg-slate-950 text-white rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                  <div className="font-mono text-sm sm:text-base font-bold tracking-wider overflow-x-auto scrollbar-none select-all text-amber-300">
                    {isRevealed ? (
                      item.code
                    ) : (
                      <span className="text-slate-400 tracking-widest">
                        {"•".repeat(Math.min(item.code.length, 16))}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Reveal */}
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isRevealed ? "Masquer le code" : "Afficher le code en clair"}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Zoom / Grand format modal button */}
                    <button
                      onClick={() => setZoomCode(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                      title="Afficher en grand pour lecture facile"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>

                    {/* Copy to clipboard button */}
                    <button
                      onClick={() => handleCopyCode(item.id, item.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500 text-slate-950 font-black scale-105"
                          : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      }`}
                      title="Copier le code pour le coller directement sur votre ordinateur"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Copié !" : "Copier"}</span>
                    </button>
                  </div>
                </div>

                {/* Footer notes & capture source */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <SourceIcon className={`w-3.5 h-3.5 ${source.color}`} />
                    <span>{source.label}</span>
                    <span>&middot;</span>
                    <span>{item.createdAt}</span>
                  </div>

                  {item.notes && (
                    <span className="text-slate-600 italic truncate max-w-[200px]" title={item.notes}>
                      {item.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Big Display Modal (Zoom) for reading code at distance */}
      {zoomCode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white space-y-6 shadow-2xl relative">
            <button
              onClick={() => setZoomCode(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Lecture Grand Format J.A.R.V.I.S.
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {zoomCode.title}
              </h3>
              {zoomCode.serviceOrOrigin && (
                <p className="text-xs text-slate-400">{zoomCode.serviceOrOrigin}</p>
              )}
            </div>

            {/* Giant Code Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center font-mono text-2xl sm:text-4xl font-black text-amber-300 tracking-widest select-all break-all shadow-inner">
              {zoomCode.code}
            </div>

            {zoomCode.notes && (
              <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl">
                {zoomCode.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                Capturé via {zoomCode.capturedVia} &middot; {zoomCode.createdAt}
              </span>

              <button
                onClick={() => handleCopyCode(zoomCode.id, zoomCode.code)}
                className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedId === zoomCode.id ? "Copié !" : "Copier le code"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
