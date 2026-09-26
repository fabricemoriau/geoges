import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Sparkles,
  Car,
  ClipboardList,
  Check,
  Mic,
  Send,
  AlertCircle
} from "lucide-react";
import { AgendaEvent, UserRequestItem } from "../types";
import { initialUserRequests } from "../data/initialData";

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
  const [subTab, setSubTab] = useState<"agenda" | "requests">("agenda");

  // Agenda Event Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("2026-09-22");
  const [newTime, setNewTime] = useState("07:00");
  const [newCategory, setNewCategory] = useState<AgendaEvent["category"]>("Garde Ambulance");
  const [newLocation, setNewLocation] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  // Requests Register State
  const [requests, setRequests] = useState<UserRequestItem[]>(initialUserRequests);
  const [newRequestText, setNewRequestText] = useState("");
  const [newRequestCategory, setNewRequestCategory] = useState<UserRequestItem["category"]>("Email");

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

  // Record a new Request in Registre des Demandes
  const handleAddRequest = () => {
    if (!newRequestText.trim()) return;
    const req: UserRequestItem = {
      id: `req-${Date.now()}`,
      requestText: newRequestText,
      source: "texte",
      category: newRequestCategory,
      status: "en_cours",
      georgesNotes: "Demande enregistrée par Georges. Traitement immédiat.",
      recordedAt: "À l'instant"
    };

    setRequests([req, ...requests]);
    setNewRequestText("");
  };

  const handleToggleRequestStatus = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === "traitée" ? "en_cours" : "traitée";
          return {
            ...r,
            status: nextStatus,
            completedAt: nextStatus === "traitée" ? "À l'instant" : undefined
          };
        }
        return r;
      })
    );
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
      {/* Top Banner & Subtab Switcher */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Agenda, Rappels & Registre des Demandes</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  By Georges
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Suivi du planning, rappels et enregistrement en direct des ordres de Monsieur Fabrice Moriau
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setSubTab("agenda")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "agenda"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Agenda & Gardes ({events.length})
            </button>
            <button
              onClick={() => setSubTab("requests")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === "requests"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Registre des Demandes ({requests.length})
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: AGENDA & PLANNING */}
      {subTab === "agenda" && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Aujourd'hui & Prochains Événements</h3>
              <p className="text-xs text-slate-500">Planning synchronisé avec vos vacations d'ambulance et vos réunions.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuickAddAmbulanceShift("jour")}
                className="bg-cyan-900 hover:bg-cyan-800 text-cyan-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Garde Ambulance</span>
              </button>

              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAdding ? "Fermer" : "Ajouter un événement"}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 text-xs shadow-md">
              <div className="font-bold text-slate-900 text-sm">Nouveau Rendez-vous / Garde</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Intitulé</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Réunion ou Garde ASSU"
                    className="w-full border rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Heure</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full border rounded-xl p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  Enregistrer l'événement
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {filtered.map((ev) => (
              <div
                key={ev.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleComplete(ev.id)}
                    className={`mt-0.5 p-1 rounded-full border transition-colors ${
                      ev.isCompleted ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryColor(ev.category)}`}>
                        {ev.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{ev.date} à {ev.time}</span>
                    </div>

                    <div className={`text-xs sm:text-sm font-bold ${ev.isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {ev.title}
                    </div>

                    {ev.location && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  className="text-slate-400 hover:text-rose-600 p-2 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: REGISTRE DES DEMANDES DE MONSIEUR */}
      {subTab === "requests" && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                Registre des Demandes & Ordres de Monsieur Fabrice Moriau
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Chaque consigne ou demande dictée à Georges est enregistrée ici avec suivi d'exécution en temps réel.
              </p>
            </div>

            {/* Request Input Form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newRequestText}
                onChange={(e) => setNewRequestText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRequest()}
                placeholder="Consigne ou ordre pour Georges (ex: Télécharger le dossier FMS sur mon tel)..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden"
              />

              <select
                value={newRequestCategory}
                onChange={(e) => setNewRequestCategory(e.target.value as UserRequestItem["category"])}
                className="border border-slate-300 rounded-xl px-3 py-2.5 text-xs bg-white"
              >
                <option value="Email">Email</option>
                <option value="Dossier">Dossier</option>
                <option value="Recherche Web">Recherche Web</option>
                <option value="Réseaux Sociaux">Réseaux Sociaux</option>
                <option value="Emploi">Emploi</option>
                <option value="Agenda">Agenda</option>
              </select>

              <button
                onClick={handleAddRequest}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

          {/* Requests Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {requests.map((req) => (
              <div key={req.id} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {req.category}
                    </span>
                    <span className="text-xs text-slate-400">Source : {req.source} &middot; {req.recordedAt}</span>
                  </div>

                  <button
                    onClick={() => handleToggleRequestStatus(req.id)}
                    className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 transition-all ${
                      req.status === "traitée"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{req.status === "traitée" ? "Traitée / Validée" : "En cours de traitement"}</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-900">{req.requestText}</div>

                {req.georgesNotes && (
                  <div className="text-xs text-indigo-950 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{req.georgesNotes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
