import React, { useState } from "react";
import {
  FileCheck,
  Sparkles,
  ExternalLink,
  BookOpen,
  Building2,
  CheckCircle2
} from "lucide-react";
import { VisaItem } from "../types";
import { initialVisas } from "../data/initialData";

interface VisaTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const VisaTab: React.FC<VisaTabProps> = ({ onAddNote }) => {
  const [visas, setVisas] = useState<VisaItem[]>(initialVisas);
  const [selectedVisa, setSelectedVisa] = useState<VisaItem>(visas[0]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Visas & Titres de Séjour en France</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/35">
                Portail Officiel
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Listes des documents justificatifs pour primo-arrivants et renouvellements en préfecture
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Types de Titres & Visas
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {visas.map((v) => {
              const isSelected = selectedVisa.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVisa(v)}
                  className={`p-4 cursor-pointer text-xs space-y-1.5 transition-colors ${
                    isSelected ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                    {v.type}
                  </span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{v.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="border-b pb-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Procédure administrative
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{selectedVisa.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{selectedVisa.description}</p>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Liste des pièces justificatives à fournir
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                {selectedVisa.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-slate-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <a
                href={selectedVisa.officialLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
              >
                <span>Accéder au portail officiel ({selectedVisa.officialLink})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onAddNote(`Visa / Titre : ${selectedVisa.title}`, `Description :\n${selectedVisa.description}\n\nDocuments :\n${selectedVisa.requiredDocuments.join("\n")}`, "Travail")}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sauvegarder en Note</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
