import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  AlarmClock, 
  Sun, 
  CloudSun, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  Check, 
  Calendar, 
  Stethoscope, 
  Car,
  TrendingUp,
  Server,
  CloudRain,
  Wind,
  Droplets,
  Zap,
  Info
} from "lucide-react";
import { AlarmItem, MorningWeather, MorningBriefing, AgendaEvent } from "../types";
import { alarmAudio } from "../utils/alarmAudio";

interface AlarmClockTabProps {
  alarms: AlarmItem[];
  onToggleAlarm: (id: string) => void;
  onAddAlarm: (alarm: Omit<AlarmItem, "id">) => void;
  onDeleteAlarm: (id: string) => void;
  agendaEvents: AgendaEvent[];
  unreadEmailsCount: number;
}

export const AlarmClockTab: React.FC<AlarmClockTabProps> = ({
  alarms,
  onToggleAlarm,
  onAddAlarm,
  onDeleteAlarm,
  agendaEvents,
  unreadEmailsCount,
}) => {
  // Current time state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Real-time ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather info state
  const [weather] = useState<MorningWeather>({
    city: "Paris / Île-de-France",
    temperatureC: 18,
    condition: "Éclaircies & Temps doux",
    feelsLikeC: 19,
    humidityPercent: 62,
    windSpeedKmh: 14,
    summary: "Conditions douces et lumineuses pour votre début de journée. Visibilité excellente pour vos déplacements et transports sanitaires.",
    attireAdvice: "Tenue légère et confortable. Prévoyez une veste de garde imperméable pour votre service d'ambulance en cas d'ondées vespérales.",
  });

  // Alarm adding state
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [newLabel, setNewLabel] = useState("Réveil Matin");
  const [newTime, setNewTime] = useState("06:30");
  const [newSound, setNewSound] = useState<AlarmItem["soundType"]>("jarvis_arc");
  const [newDays, setNewDays] = useState<string[]>(["Lun", "Mar", "Mer", "Jeu", "Ven"]);
  const [newBriefingOnWake, setNewBriefingOnWake] = useState(true);

  // Active alarm simulator
  const [isRinging, setIsRinging] = useState(false);
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);

  // Speech synthesis state for morning briefing
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Filter ambulance shifts and upcoming events for today / tomorrow
  const ambulanceShifts = agendaEvents.filter(
    (ev) => ev.category === "Garde Ambulance" || ev.title.toLowerCase().includes("ambulance") || ev.title.toLowerCase().includes("garde")
  );

  // Generate the morning briefing spoken text
  const hours = currentTime.getHours();
  const greeting = hours < 12 ? "Bonjour Monsieur Fabrice" : hours < 18 ? "Bon après-midi Monsieur Fabrice" : "Bonsoir Monsieur Fabrice";
  
  const upcomingShift = ambulanceShifts[0];
  const shiftText = upcomingShift 
    ? `Votre prochaine garde d'ambulance est planifiée le ${upcomingShift.date} à ${upcomingShift.time} avec pour mission : ${upcomingShift.title}.`
    : "Aucune garde d'ambulance urgente n'est planifiée pour les prochaines 24 heures.";

  const briefingScript = `${greeting}. Il est ${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Tous les systèmes J.A.R.V.I.S. sont nominaux. 
Côté météo à ${weather.city} : la température est de ${weather.temperatureC} degrés avec ${weather.condition.toLowerCase()}. ${weather.attireAdvice}
Concernant votre emploi du temps : ${shiftText} Vous avez également ${agendaEvents.filter(e => !e.isCompleted).length} rendez-vous au total dans votre agenda, et ${unreadEmailsCount} messages non lus dans votre boîte prioritaire.
Votre serveur maison sur vieux PC est en ligne et stable, et les marchés financiers affichent une ouverture favorable.
J'attends vos instructions pour cette journée, Monsieur.`;

  // Start speech synthesis for briefing
  const handleSpeakBriefing = () => {
    if (!("speechSynthesis" in window)) {
      alert("La synthèse vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    if (isSpeakingBriefing) {
      window.speechSynthesis.cancel();
      setIsSpeakingBriefing(false);
      return;
    }

    window.speechSynthesis.cancel();
    alarmAudio.playChime("iron_man_chime");

    const utterance = new SpeechSynthesisUtterance(briefingScript);
    utterance.lang = "fr-FR";
    utterance.rate = 0.98;
    utterance.pitch = 0.92; // Slightly deeper, refined J.A.R.V.I.S. tone

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      (v) => v.lang.startsWith("fr") && (v.name.includes("Thomas") || v.name.includes("Nicolas") || v.name.includes("Male") || v.name.includes("Google"))
    ) || voices.find((v) => v.lang.startsWith("fr"));

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeakingBriefing(true);
    utterance.onend = () => setIsSpeakingBriefing(false);
    utterance.onerror = () => setIsSpeakingBriefing(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech
  const handleStopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingBriefing(false);
  };

  // Simulate an alarm ringing
  const handleTriggerAlarm = (alarm: AlarmItem) => {
    setActiveRingingAlarm(alarm);
    setIsRinging(true);
    alarmAudio.startAlarmLoop(alarm.soundType);
  };

  // Dismiss ringing alarm
  const handleDismissAlarm = (triggerBriefing = true) => {
    alarmAudio.stopAlarmLoop();
    setIsRinging(false);
    setActiveRingingAlarm(null);
    if (triggerBriefing) {
      setTimeout(() => {
        handleSpeakBriefing();
      }, 600);
    }
  };

  // Days list
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const handleToggleDay = (day: string) => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter((d) => d !== day));
    } else {
      setNewDays([...newDays, day]);
    }
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlarm({
      label: newLabel || "Réveil",
      time: newTime,
      enabled: true,
      repeatDays: newDays,
      soundType: newSound,
      briefingOnWake: newBriefingOnWake,
    });
    setIsAddingAlarm(false);
    setNewLabel("Réveil Matin");
    alarmAudio.playChime("iron_man_chime");
  };

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      
      {/* Active Alarm Modal Overlay (when alarm rings) */}
      {isRinging && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Hologram Pulse Ring */}
            <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-bounce">
                <Bell className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>

              <div>
                <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                  Protocole Réveil J.A.R.V.I.S.
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {activeRingingAlarm?.label || "Réveil Matin"}
                </h3>
                <div className="text-4xl font-black font-mono text-cyan-300 tracking-wider mt-2">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Bonjour Monsieur Fabrice. Il est l'heure de vous lever. Georges a préparé votre bulletin météo et le récapitulatif de votre garde.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => handleDismissAlarm(true)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Arrêter & Écouter le Briefing Matinal</span>
              </button>

              <button
                onClick={() => handleDismissAlarm(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Arrêter sans le briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero: Stark J.A.R.V.I.S. Virtual Clock & Status HUD */}
      <div className="relative bg-radial from-slate-900 via-slate-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle grid HUD pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Glowing corner accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Clock Face */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                J.A.R.V.I.S. TEMPS RÉEL & RÉVEIL
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                FUSEAU : EUROPE/PARIS (UTC+2)
              </span>
            </div>

            {/* Giant Digital Time */}
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-xl sm:text-3xl font-mono text-cyan-400 font-bold">
                :{currentTime.getSeconds().toString().padStart(2, "0")}
              </span>
            </div>

            <p className="text-sm sm:text-base capitalize text-slate-300 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{formattedDate}</span>
            </p>
          </div>

          {/* Quick HUD Metrics & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Weather Pill */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{weather.temperatureC}°C</span>
                  <span className="text-slate-400 font-normal">&middot; {weather.condition}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Ressenti {weather.feelsLikeC}°C</span>
                  <span>&middot;</span>
                  <span>Vent {weather.windSpeedKmh} km/h</span>
                </div>
              </div>
            </div>

            {/* Shift Pill */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Car className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {upcomingShift ? "Prochaine Garde" : "Repos Ambulance"}
                </div>
                <div className="text-[11px] text-cyan-300 font-medium">
                  {upcomingShift ? `${upcomingShift.date} à ${upcomingShift.time}` : "Aucune garde urgente"}
                </div>
              </div>
            </div>

            {/* Vocal Briefing Button */}
            <button
              onClick={handleSpeakBriefing}
              className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSpeakingBriefing
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
              }`}
            >
              {isSpeakingBriefing ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Arrêter le Briefing</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Briefing Vocal J.A.R.V.I.S.</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Briefing & Weather vs Alarms Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Morning Briefing & Weather Card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Detailed Morning Weather & Advice */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Météo Matinale & Conditions de Route
                  </h3>
                  <p className="text-xs text-slate-500">
                    Localisation : {weather.city} &middot; Données actualisées
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Conditions Optimales
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Température</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{weather.temperatureC}°C</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Ressenti {weather.feelsLikeC}°C</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Vent</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{weather.windSpeedKmh}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">km/h Nord-Ouest</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>Humidité</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{weather.humidityPercent}%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Risque pluie : 15%</div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Conseil vestimentaire & transport de Georges :</span>
              </div>
              <p className="leading-relaxed">
                {weather.attireAdvice}
              </p>
            </div>
          </div>

          {/* Full Morning Briefing Script & Action Hub */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Briefing Intégral de Georges
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rapport matinal synthétisé pour Monsieur Fabrice
                  </p>
                </div>
              </div>

              <button
                onClick={handleSpeakBriefing}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-xl border border-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSpeakingBriefing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSpeakingBriefing ? "Arrêter lecture" : "Lire à voix haute"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed border border-slate-800 space-y-3">
              <div className="text-cyan-400 font-bold flex items-center gap-2 pb-1 border-b border-slate-800">
                <ShieldCheck className="w-4 h-4" />
                <span>TRANSMISSION VOCALE J.A.R.V.I.S. PROTOCOLE MATIN</span>
              </div>
              <p className="text-slate-300 whitespace-pre-line">
                {briefingScript}
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Gardes prévues</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{ambulanceShifts.length} tour(s)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Emails urgents</div>
                <div className="text-sm font-bold text-rose-700 mt-0.5">{unreadEmailsCount} messages</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Marchés CAC 40</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">+0.64%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Serveur Vieux PC</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">En ligne 100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Alarms & Morning Wake-up Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <AlarmClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Alarmes & Réveils
                  </h3>
                  <p className="text-xs text-slate-500">
                    {alarms.filter((a) => a.enabled).length} alarme(s) active(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingAlarm(true)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle alarme</span>
              </button>
            </div>

            {/* Add Alarm Form */}
            {isAddingAlarm && (
              <form onSubmit={handleCreateAlarm} className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Configurer une alarme
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAlarm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Fermer
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nom du réveil
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ex: Réveil Garde Ambulance 07h"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Heure de sonnerie
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-center"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sonnerie Stark
                    </label>
                    <select
                      value={newSound}
                      onChange={(e) => setNewSound(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    >
                      <option value="jarvis_arc">Arpège Réacteur ARK</option>
                      <option value="iron_man_chime">Carillon Iron Man</option>
                      <option value="gentle_pulse">Impulsion Douce</option>
                      <option value="stark_alert">Alerte Tactique</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jours de répétition
                  </label>
                  <div className="flex gap-1">
                    {weekDays.map((day) => {
                      const isSel = newDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-colors ${
                            isSel ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="briefingCheck"
                    checked={newBriefingOnWake}
                    onChange={(e) => setNewBriefingOnWake(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="briefingCheck" className="text-xs text-slate-700 font-medium">
                    Déclencher le briefing vocal J.A.R.V.I.S. au réveil
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => alarmAudio.playChime(newSound)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                  >
                    Tester son
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Enregistrer l'alarme
                  </button>
                </div>
              </form>
            )}

            {/* Alarms List */}
            <div className="space-y-3">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    alarm.enabled
                      ? "bg-white border-slate-300 shadow-xs"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono text-slate-900">
                          {alarm.time}
                        </span>
                        {alarm.briefingOnWake && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                            Briefing vocal
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {alarm.label}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <span>Répète :</span>
                        <span>{alarm.repeatDays.join(", ") || "Une fois"}</span>
                      </div>
                    </div>

                    {/* Toggle and Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTriggerAlarm(alarm)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Simuler la sonnerie de ce réveil"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      {/* On/Off Switch */}
                      <button
                        onClick={() => onToggleAlarm(alarm.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          alarm.enabled ? "bg-cyan-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            alarm.enabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onDeleteAlarm(alarm.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer l'alarme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>
                <strong>Commande vocale réveil :</strong> dites simplement à Georges <em>« Règle un réveil pour ma garde à 05h45 »</em> ou <em>« Donne-moi le briefing météo de la journée »</em>.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
