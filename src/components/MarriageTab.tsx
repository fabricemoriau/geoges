import React, { useState } from "react";
import {
  HeartHandshake,
  FileText,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { MarriageGuideItem } from "../types";
import { initialMarriageGuides } from "../data/initialData";

interface MarriageTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const MarriageTab: React.FC<MarriageTabProps> = ({ onAddNote }) => {
  const [guides, setGuides] = useState<MarriageGuideItem[]>(initialMarriageGuides);
  const [selectedGuide, setSelectedGuide] = useState<MarriageGuideItem>(guides[0]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Se Marier à l'Étranger</span>
              <span className="text-xs bg-rose-500/20 text-rose-300 font-semibold px-2.5 py-0.5 rounded-full border border-rose-500/35">
                Guide Consulaire
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Marche à suivre officielle, Certificat de Capacité à Mariage (CCAM) et Transcription de mariage
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-600" />
              Étapes Clés du Mariage
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {guides.map((g) => {
              const isSelected = selectedGuide.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuide(g)}
                  className={`p-4 cursor-pointer text-xs space-y-1.5 transition-colors ${
                    isSelected ? "bg-rose-50/80 border-l-4 border-rose-600" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                    {g.category}
                  </span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{g.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="border-b pb-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Procédure officielle
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{selectedGuide.title}</h2>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Marche à suivre étape par étape
              </h4>
              <div className="space-y-2">
                {selectedGuide.steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs sm:text-sm text-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed mt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                Documents à fournir au Consulat / Ambassade
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                {selectedGuide.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Georges Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Conseil d'expert Expat
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedGuide.tips}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onAddNote(`Guide Mariage : ${selectedGuide.title}`, `${selectedGuide.title}\n\nÉtapes :\n${selectedGuide.steps.join("\n")}\n\nDocuments :\n${selectedGuide.requiredDocuments.join("\n")}`, "Travail")}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sauvegarder dans mes Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
