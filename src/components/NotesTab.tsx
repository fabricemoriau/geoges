import React, { useState } from "react";
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Trash2, 
  Tag, 
  Search, 
  Calendar, 
  Mic, 
  Sparkles,
  CheckCircle2,
  FileText
} from "lucide-react";
import { NoteItem } from "../types";

interface NotesTabProps {
  notes: NoteItem[];
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"Personnel" | "Travail" | "Serveur" | "Idées">("Personnel");
  const [isRecording, setIsRecording] = useState(false);

  const filteredNotes = notes.filter((n) => {
    const matchCat = selectedCategory === "all" ? true : n.category === selectedCategory;
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;
    onAddNote(
      newTitle.trim() || "Note sans titre",
      newContent.trim(),
      newCategory
    );
    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
  };

  const handleSimulatedVoiceDictation = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setNewTitle("Rappel course et matériel serveur");
      setNewContent(
        "Georges, pense à vérifier la température du processeur du vieux PC et commander deux adaptateurs SATA vers USB 3.0 pour les disques de sauvegarde."
      );
      setNewCategory("Serveur");
      setIsCreating(true);
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              Prise de Notes & Mémos
            </h2>
            <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
              Cahier de Georges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {notes.length} notes mémorisées &middot; Georges note instantanément vos idées, configurations et rappels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulatedVoiceDictation}
            disabled={isRecording}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
              isRecording
                ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
            title="Dicter une consigne à Georges"
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span>{isRecording ? "Georges écoute..." : "Dicter à Georges"}</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle note</span>
          </button>
        </div>
      </div>

      {/* Creation Drawer / Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white rounded-2xl border-2 border-slate-800 p-5 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              Prendre en note pour Georges
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de la note ou consigne..."
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-white"
              >
                <option value="Personnel">Catégorie : Personnel</option>
                <option value="Travail">Catégorie : Travail</option>
                <option value="Serveur">Catégorie : Serveur PC</option>
                <option value="Idées">Catégorie : Idées & Créatif</option>
              </select>
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            placeholder="Écrivez le contenu, listes à puces, adresses IP ou rappels..."
            className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-slate-800 resize-none font-mono"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Enregistrer la note
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {["all", "Personnel", "Travail", "Serveur", "Idées"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "Toutes les notes" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les notes..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 flex flex-col justify-between transition-all ${
              note.isPinned
                ? "border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded hover:bg-slate-100 ${
                      note.isPinned ? "text-amber-600" : "text-slate-300"
                    }`}
                    title={note.isPinned ? "Détacher" : "Épingler"}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {note.category}
              </span>

              <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                {note.content}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{note.createdAt}</span>
              <div className="flex items-center gap-1">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-50 px-1.5 py-0.5 rounded text-slate-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
