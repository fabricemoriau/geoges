import React, { useState } from "react";
import {
  HeartPulse,
  Sparkles,
  FileText,
  CheckCircle2,
  BookOpen,
  ShieldCheck
} from "lucide-react";
import { SocialSecurityItem } from "../types";
import { initialSocialSecurity } from "../data/initialData";

interface SocialSecurityTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const SocialSecurityTab: React.FC<SocialSecurityTabProps> = ({ onAddNote }) => {
  const [items, setItems] = useState<SocialSecurityItem[]>(initialSocialSecurity);
  const [selectedItem, setSelectedItem] = useState<SocialSecurityItem>(items[0]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Sécurité Sociale & Santé en France</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/35">
                Couverture Maladie
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Affiliation CPAM, obtention de la carte Vitale, rattachement et CFE pour expatriés
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Sujets Santé & Couverture
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map((it) => {
              const isSelected = selectedItem.id === it.id;
              return (
                <div
                  key={it.id}
                  onClick={() => setSelectedItem(it)}
                  className={`p-4 cursor-pointer text-xs space-y-1.5 transition-colors ${
                    isSelected ? "bg-emerald-50/80 border-l-4 border-emerald-600" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {it.topic}
                  </span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{it.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="border-b pb-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Démarches de santé
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{selectedItem.title}</h2>
            </div>

            {selectedItem.steps && selectedItem.steps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Étapes à suivre
                </h4>
                <div className="space-y-2">
                  {selectedItem.steps.map((st, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs sm:text-sm text-slate-800 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{st}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.requiredDocuments && selectedItem.requiredDocuments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Pièces justificatives requises
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  {selectedItem.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onAddNote(`Santé Expat : ${selectedItem.title}`, `Étapes :\n${selectedItem.steps.join("\n")}\n\nDocuments :\n${selectedItem.requiredDocuments.join("\n")}`, "Personnel")}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Sauvegarder dans mes Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
