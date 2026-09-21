import React, { useState } from "react";
import { 
  Smartphone, 
  Car, 
  Activity, 
  Heart, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  Download, 
  RefreshCw, 
  Share2, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingDown,
  User,
  Scale,
  Gauge
} from "lucide-react";
import { AmbulanceWorkShift, HealthLogEntry } from "../types";
import { alarmAudio } from "../utils/alarmAudio";

interface PhoneAppsTabProps {
  shifts: AmbulanceWorkShift[];
  onAddShift: (shift: Omit<AmbulanceWorkShift, "id">) => void;
  onUpdateShiftStatus: (id: string, status: AmbulanceWorkShift["status"]) => void;
  onDeleteShift: (id: string) => void;
  healthLogs: HealthLogEntry[];
  onAddHealthLog: (entry: Omit<HealthLogEntry, "id" | "bmi">) => void;
  onDeleteHealthLog: (id: string) => void;
}

export const PhoneAppsTab: React.FC<PhoneAppsTabProps> = ({
  shifts,
  onAddShift,
  onUpdateShiftStatus,
  onDeleteShift,
  healthLogs,
  onAddHealthLog,
  onDeleteHealthLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"ambulance" | "health" | "gateway">("ambulance");

  // Ambulance shift form state
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [shiftDate, setShiftDate] = useState("2026-09-22");
  const [shiftVehicle, setShiftVehicle] = useState("Ambulance ASSU-03 (Urgences)");
  const [shiftPartner, setShiftPartner] = useState("Marc V. (DEA)");
  const [shiftStart, setShiftStart] = useState("07:00");
  const [shiftEnd, setShiftEnd] = useState("19:00");
  const [shiftBreak, setShiftBreak] = useState(45);
  const [shiftInterventions, setShiftInterventions] = useState(6);
  const [shiftKmStart, setShiftKmStart] = useState(142595);
  const [shiftKmEnd, setShiftKmEnd] = useState(142810);
  const [shiftNotes, setShiftNotes] = useState("");
  const [isSyncingPhone, setIsSyncingPhone] = useState(false);

  // Health log form state
  const [isAddingHealth, setIsAddingHealth] = useState(false);
  const [healthWeight, setHealthWeight] = useState(78.1);
  const [healthSystolic, setHealthSystolic] = useState(122);
  const [healthDiastolic, setHealthDiastolic] = useState(78);
  const [healthSleep, setHealthSleep] = useState(7.0);
  const [healthHydration, setHealthHydration] = useState(2.0);
  const [healthComment, setHealthComment] = useState("");

  // Quick dictation input for Georges auto-fill
  const [quickVoiceShiftPrompt, setQuickVoiceShiftPrompt] = useState("");

  const handleSimulateSync = () => {
    setIsSyncingPhone(true);
    alarmAudio.playChime("iron_man_chime");
    setTimeout(() => {
      setIsSyncingPhone(false);
    }, 1200);
  };

  // Submit ambulance shift
  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const totalKm = Math.max(0, shiftKmEnd - shiftKmStart);
    onAddShift({
      date: shiftDate,
      vehicle: shiftVehicle,
      partnerName: shiftPartner,
      startTime: shiftStart,
      endTime: shiftEnd,
      breakDurationMinutes: Number(shiftBreak),
      interventionsCount: Number(shiftInterventions),
      kilometersStart: Number(shiftKmStart),
      kilometersEnd: Number(shiftKmEnd),
      totalKm,
      notes: shiftNotes || "Vacation enregistrée et vérifiée.",
      status: "validé",
      lastSyncedAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setIsAddingShift(false);
    alarmAudio.playChime("stark_alert");
  };

  // Auto-fill shift with Georges
  const handleGeorgesFillShift = () => {
    setShiftVehicle("Ambulance ASSU-03 (Urgences)");
    setShiftPartner("Marc V. (DEA)");
    setShiftStart("07:00");
    setShiftEnd("19:00");
    setShiftBreak(45);
    setShiftInterventions(6);
    setShiftKmStart(142595);
    setShiftKmEnd(142820);
    setShiftNotes("Transmission régulation SAMU 15 effectuée. Bilan matériel O2 & monitoring conforme. 4 transports CHU.");
    alarmAudio.playChime("jarvis_arc");
  };

  // Submit health entry
  const handleCreateHealth = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHealthLog({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      weightKg: Number(healthWeight),
      targetWeightKg: 76.5,
      systolicBp: Number(healthSystolic),
      diastolicBp: Number(healthDiastolic),
      sleepHours: Number(healthSleep),
      hydrationLiters: Number(healthHydration),
      comment: healthComment || "Pesée enregistrée via Georges.",
    });
    setIsAddingHealth(false);
    alarmAudio.playChime("iron_man_chime");
  };

  const latestHealth = healthLogs[0] || {
    weightKg: 78.2,
    bmi: 23.6,
    systolicBp: 122,
    diastolicBp: 78,
  };

  const initialWeight = healthLogs[healthLogs.length - 1]?.weightKg || 80.2;
  const weightDiff = (latestHealth.weightKg - initialWeight).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      
      {/* Top Banner: Smartphone Integration Status */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Passerelle Applications Téléphone
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIAISON ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Smartphone de Fabrice connecté &middot; Accès direct aux applications de travail et carnet de santé
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSimulateSync}
            disabled={isSyncingPhone}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPhone ? "animate-spin text-cyan-400" : ""}`} />
            <span>{isSyncingPhone ? "Synchronisation en cours..." : "Synchroniser Téléphone"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("ambulance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "ambulance"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Car className="w-4 h-4 text-cyan-400" />
          <span>Application Travail : Vacation Ambulance</span>
        </button>

        <button
          onClick={() => setActiveSubTab("health")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "health"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Application : Mon Carnet de Santé</span>
        </button>

        <button
          onClick={() => setActiveSubTab("gateway")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "gateway"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Passerelle Webhook & Raccourcis</span>
        </button>
      </div>

      {/* 1. AMBULANCE WORKDAY / VACATION APP */}
      {activeSubTab === "ambulance" && (
        <div className="space-y-6">
          
          {/* Header & Quick Action */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Feuille de Route & Vacation Ambulance
                </h3>
                <span className="text-xs bg-cyan-50 text-cyan-800 font-semibold px-2.5 py-0.5 rounded-full border border-cyan-200">
                  Application AmbuGuard
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Remplissez et transmettez votre journée de travail en un instant ou demandez à Georges de le faire vocalement.
              </p>
            </div>

            <button
              onClick={() => setIsAddingShift(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Remplir ma journée de travail</span>
            </button>
          </div>

          {/* Add / Fill Shift Form */}
          {isAddingShift && (
            <form onSubmit={handleCreateShift} className="bg-white rounded-3xl border-2 border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-bold text-slate-900 uppercase">
                    Remplissage de votre Journée de Travail
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeorgesFillShift}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Pré-remplir avec Georges</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingShift(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date de la vacation</label>
                  <input
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Véhicule sanitaire</label>
                  <select
                    value={shiftVehicle}
                    onChange={(e) => setShiftVehicle(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Ambulance ASSU-03 (Urgences)">Ambulance ASSU-03 (Urgences)</option>
                    <option value="Ambulance ASSU-01">Ambulance ASSU-01</option>
                    <option value="VSL-02 (Transports programmés)">VSL-02 (Transports programmés)</option>
                    <option value="TPMR-04 (PMR)">TPMR-04 (PMR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coéquipier (Équipage)</label>
                  <input
                    type="text"
                    value={shiftPartner}
                    onChange={(e) => setShiftPartner(e.target.value)}
                    placeholder="Ex: Marc V. (DEA), Nathalie B."
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prise de poste</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fin de poste</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pause repas (minutes)</label>
                  <input
                    type="number"
                    value={shiftBreak}
                    onChange={(e) => setShiftBreak(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Compteur départ (km)</label>
                  <input
                    type="number"
                    value={shiftKmStart}
                    onChange={(e) => setShiftKmStart(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Compteur retour (km)</label>
                  <input
                    type="number"
                    value={shiftKmEnd}
                    onChange={(e) => setShiftKmEnd(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre d'interventions</label>
                  <input
                    type="number"
                    value={shiftInterventions}
                    onChange={(e) => setShiftInterventions(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations, transmissions SAMU & bilans patients
                </label>
                <textarea
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Ex: 3 urgences régulées SAMU 15 (traumatologie, détresse respi), 2 sorties CHU. Matériel O2 vérifié."
                  rows={2}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Total calculé : <strong>{Math.max(0, shiftKmEnd - shiftKmStart)} km</strong> parcourus
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingShift(false)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    Valider & Transmettre à l'application
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List of Shifts */}
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {shift.vehicle}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          shift.status === "transmis"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {shift.status === "transmis" ? "Transmis au bureau" : "Validé"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5" />
                          {shift.date}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {shift.partnerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onDeleteShift(shift.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Kilométrage total</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{shift.totalKm} km</div>
                    <div className="text-[10px] text-slate-400">{shift.kilometersStart} → {shift.kilometersEnd}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Interventions</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{shift.interventionsCount} transports</div>
                    <div className="text-[10px] text-slate-400">SAMU 15 & Hôpitaux</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Pause réglementaire</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{shift.breakDurationMinutes} min</div>
                    <div className="text-[10px] text-slate-400">Respectée</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Dernière synchro</div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">{shift.lastSyncedAt || "À jour"}</div>
                  </div>
                </div>

                {shift.notes && (
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Notes & Bilan : </span>
                    {shift.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HEALTH LOG / CARNET DE SANTÉ APP */}
      {activeSubTab === "health" && (
        <div className="space-y-6">
          
          {/* Header & Quick Action */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Mon Carnet de Santé & Suivi Biométique
                </h3>
                <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full border border-rose-200">
                  Application Connectée
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Georges enregistre vos pesées, calcule votre IMC et surveille vos constantes de santé.
              </p>
            </div>

            <button
              onClick={() => setIsAddingHealth(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Noter mon poids</span>
            </button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Poids actuel</span>
                <Scale className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {latestHealth.weightKg} <span className="text-base font-normal text-slate-500">kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{weightDiff} kg depuis le départ</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Indice IMC</span>
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {latestHealth.bmi}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                Corpulence normale (18.5 - 24.9)
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Objectif de forme</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                76.5 <span className="text-base font-normal text-slate-500">kg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Reste {(latestHealth.weightKg - 76.5).toFixed(1)} kg à stabiliser
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Tension artérielle</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {latestHealth.systolicBp}/{latestHealth.diastolicBp}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                mmHg &middot; Pression optimale
              </div>
            </div>
          </div>

          {/* Add Health Modal / Form */}
          {isAddingHealth && (
            <form onSubmit={handleCreateHealth} className="bg-white rounded-3xl border-2 border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-500" />
                  Nouvelle Pesée & Constantes
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingHealth(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={healthWeight}
                    onChange={(e) => setHealthWeight(Number(e.target.value))}
                    className="w-full text-base font-bold border border-slate-300 rounded-lg p-2 text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tension (Systolique / Diastolique)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={healthSystolic}
                      onChange={(e) => setHealthSystolic(Number(e.target.value))}
                      placeholder="120"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 text-center"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={healthDiastolic}
                      onChange={(e) => setHealthDiastolic(Number(e.target.value))}
                      placeholder="80"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sommeil (heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={healthSleep}
                    onChange={(e) => setHealthSleep(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hydratation (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={healthHydration}
                    onChange={(e) => setHealthHydration(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commentaire ou sensation</label>
                <input
                  type="text"
                  value={healthComment}
                  onChange={(e) => setHealthComment(e.target.value)}
                  placeholder="Ex: Pesée à jeun avant départ en garde. Bonne énergie."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingHealth(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Enregistrer dans mon carnet
                </button>
              </div>
            </form>
          )}

          {/* Historical Log Table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              Historique des pesées et mesures récentes
            </h4>

            <div className="divide-y divide-slate-100">
              {healthLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-xs">
                      {log.weightKg}k
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{log.date} à {log.time}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          IMC {log.bmi}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tension : {log.systolicBp}/{log.diastolicBp} mmHg &middot; Sommeil : {log.sleepHours}h &middot; {log.comment}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHealthLog(log.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. GATEWAY & SHORTCUTS CONNECTOR */}
      {activeSubTab === "gateway" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connecteur Téléphone : Raccourcis iPhone & Automatisations Android
              </h3>
              <p className="text-xs text-slate-500">
                Permet à Georges d'échanger des données en temps réel avec vos applications natives installées.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-600" />
                Raccourcis iOS (Apple Shortcuts)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous pouvez lier l'application <strong>« Santé d'Apple »</strong> et votre <strong>« Feuille d'heures Ambulance »</strong> en ajoutant un raccourci Webhook vers Georges.
              </p>
              <div className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                POST https://georges-bridge.local/api/sync/health
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Android Tasker & MacroDroid
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déclenchement automatique de la feuille de vacation dès que votre téléphone se connecte au Bluetooth de votre ambulance (ASSU-03).
              </p>
              <div className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                TRIGGER: Bluetooth_Connected(ASSU_03) → Call_Georges
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-xs text-cyan-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <span>
              <strong>Liaison sécurisée de bout en bout :</strong> Toutes vos données de santé et de vacations restent privées et hébergées sur votre machine et votre serveur maison.
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
