import React from "react";
import { Bot, Server, Sparkles, CheckCircle2, Clock, Mail, Calendar, StickyNote, Mic, TrendingUp, Camera, Monitor } from "lucide-react";
import { AIChatModel } from "../types";

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeModel: AIChatModel;
  serverOnline: boolean;
  unreadCount: number;
  upcomingEventsCount: number;
  onOpenVisionModal?: (mode: "photo" | "screenshot") => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeModel,
  serverOnline,
  unreadCount,
  upcomingEventsCount,
  onOpenVisionModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Assistant Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange("chat")}
            title="Georges - Accueil & Chat"
          >
            <div className="relative">
              <img
                src="/app-icon.jpg"
                alt="Georges Majordome avec plateau"
                className="w-11 h-11 rounded-xl object-cover shadow-sm border border-slate-700/40 ring-2 ring-amber-400/30 group-hover:ring-amber-400 transition-all"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
                  Georges
                </h1>
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  Majordome IA
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Assistant de Fabrice &middot; Mariage, Visas, Sécurité Sociale, Papiers & Droits des Expatriés
              </p>
            </div>
          </div>

          {/* Real-time Status Badges & Quick Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Server Status Pill */}
            <button
              onClick={() => onTabChange("server")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                serverOnline
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
              title="Passerelle Serveur PC Maison"
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PC Maison :</span>
              <span className="font-semibold">{serverOnline ? "En ligne" : "Veille"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Unread Emails Badge */}
            <button
              onClick={() => onTabChange("emails")}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Boîte de réception"
            >
              <Mail className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Agenda Alert */}
            <button
              onClick={() => onTabChange("agenda")}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Agenda"
            >
              <Calendar className="w-4 h-4" />
              {upcomingEventsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {upcomingEventsCount}
                </span>
              )}
            </button>

            {/* Quick Bourse Shortcut */}
            <button
              onClick={() => onTabChange("finance")}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cours de la bourse & Portefeuille virtuel"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>CAC 40 : <strong className="text-emerald-700">+0.64%</strong></span>
            </button>

            {/* Quick Vision / Photo / Screenshot Button */}
            {onOpenVisionModal && (
              <button
                onClick={() => onOpenVisionModal("photo")}
                className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="J.A.R.V.I.S. Vision : Prendre une photo avec téléphone ou capture d'écran"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Photo & Écran</span>
                <span className="text-[10px] font-mono bg-cyan-400 text-slate-950 font-bold px-1 rounded">HUD</span>
              </button>
            )}

            {/* Quick Action: Ask Georges */}
            <button
              onClick={() => onTabChange("chat")}
              className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Activer la commande vocale ou discuter avec Georges"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>« Dis Georges »</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
