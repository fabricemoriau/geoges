import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Sparkles,
  CalendarDays,
  Filter,
  Car,
  ShieldPlus
} from "lucide-react";
import { AgendaEvent } from "../types";

interface AgendaTabProps {
  events: AgendaEvent[];
  onAddEvent: (title: string, date: string, time: string, category: "Pro" | "Perso" | "Serveur" | "Emailing" | "Garde Ambulance", location?: string) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("2026-09-22");
  const [newTime, setNewTime] = useState("07:00");
  const [newCategory, setNewCategory] = useState<AgendaEvent["category"]>("Garde Ambulance");
  const [newLocation, setNewLocation] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddEvent(newTitle.trim(), newDate, newTime, newCategory, newLocation);
    setNewTitle("");
    setNewLocation("");
    setIsAdding(false);
  };

  const handleQuickAddAmbulanceShift = (presetType: "jour" | "nuit" | "vsl" | "astreinte") => {
    if (presetType === "jour") {
      setNewTitle("Garde Ambulance de Jour (ASSU-03 - SAMU 15)");
      setNewTime("07:00");
      setNewCategory("Garde Ambulance");
      setNewLocation("Secteur d'intervention & Urgences");
    } else if (presetType === "nuit") {
      setNewTitle("Garde Ambulance de Nuit (Équipage Urgences)");
      setNewTime("19:00");
      setNewCategory("Garde Ambulance");
      setNewLocation("Poste de secours & CHU");
    } else if (presetType === "vsl") {
      setNewTitle("Vacation VSL - Transports Sanitaires Programmés");
      setNewTime("08:00");
      setNewCategory("Garde Ambulance");
      setNewLocation("Cliniques & Consultations");
    } else {
      setNewTitle("Astreinte SMUR / Ambulance");
      setNewTime("20:00");
      setNewCategory("Garde Ambulance");
      setNewLocation("À domicile / Bip de garde");
    }
    setIsAdding(true);
  };

  const filtered = events.filter(
    (ev) => selectedCat === "all" || ev.category === selectedCat
  );

  const getCategoryColor = (cat: AgendaEvent["category"]) => {
    switch (cat) {
      case "Garde Ambulance":
        return "bg-cyan-50 text-cyan-800 border-cyan-300 font-bold";
      case "Pro":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Serveur":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Emailing":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Perso":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              Agenda & Tours de Garde
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Coordonné par Georges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Aujourd'hui : Lundi 21 Septembre 2026 &middot; {events.length} rendez-vous et gardes planifiés.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Ambulance Button */}
          <button
            onClick={() => handleQuickAddAmbulanceShift("jour")}
            className="bg-cyan-900 hover:bg-cyan-800 text-cyan-300 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Car className="w-4 h-4 text-cyan-400" />
            <span>+ Garde Ambulance</span>
          </button>

          <button
            onClick={() => {
              setNewCategory("Pro");
              setNewTitle("");
              setNewTime("14:00");
              setIsAdding(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Planifier un événement</span>
          </button>
        </div>
      </div>

      {/* Quick Ambulance Presets Banner */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">Ajout rapide de vos tours de garde :</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickAddAmbulanceShift("jour")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-medium transition-colors"
          >
            ☀️ Garde Jour (07h-19h)
          </button>
          <button
            onClick={() => handleQuickAddAmbulanceShift("nuit")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
          >
            🌙 Garde Nuit (19h-07h)
          </button>
          <button
            onClick={() => handleQuickAddAmbulanceShift("vsl")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-medium transition-colors"
          >
            🚐 Vacation VSL (08h-17h)
          </button>
          <button
            onClick={() => handleQuickAddAmbulanceShift("astreinte")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium transition-colors"
          >
            ⚡ Astreinte SMUR
          </button>
        </div>
      </div>

      {/* Add Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border-2 border-slate-800 p-5 sm:p-6 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Nouveau rendez-vous ou tour de garde
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'événement ou de la garde</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Garde Ambulance de Jour ASSU-03, Réunion..."
                className="w-full text-xs border rounded-lg p-2.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full text-xs border rounded-lg p-2.5 bg-white font-medium"
              >
                <option value="Garde Ambulance">🚑 Garde Ambulance / Tournée</option>
                <option value="Pro">Professionnel</option>
                <option value="Serveur">Serveur PC Maison</option>
                <option value="Emailing">Campagnes & Emailing</option>
                <option value="Perso">Personnel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs border rounded-lg p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Heure</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lieu / Secteur</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ex: Secteur Urgences CHU, Bureau"
                  className="w-full text-xs border rounded-lg p-2.5"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Enregistrer dans l'agenda
            </button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["all", "Garde Ambulance", "Pro", "Serveur", "Emailing", "Perso"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCat === cat
                ? "bg-slate-900 text-white font-semibold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "all" ? "Tous les événements" : cat}
          </button>
        ))}
      </div>

      {/* Agenda Event Cards */}
      <div className="space-y-3">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              ev.isCompleted ? "opacity-60 bg-slate-50 border-slate-200" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleComplete(ev.id)}
                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  ev.isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-indigo-600"
                }`}
              >
                {ev.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {ev.category === "Garde Ambulance" && (
                    <Car className="w-4 h-4 text-cyan-600 shrink-0" />
                  )}
                  <h3 className={`text-sm font-bold ${ev.isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}>
                    {ev.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(ev.category)}`}>
                    {ev.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.time} ({ev.durationMinutes} min)</span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.description && (
                  <p className="text-xs text-slate-600 mt-1">
                    {ev.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => onDeleteEvent(ev.id)}
                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
