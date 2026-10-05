import React from "react";
import { 
  MessageSquare, 
  Megaphone, 
  Mail, 
  StickyNote, 
  Calendar, 
  Server, 
  FileText, 
  TrendingUp, 
  AlarmClock, 
  Smartphone, 
  Rocket,
  Key,
  HeartHandshake,
  FileCheck,
  HeartPulse,
  FolderLock,
  Globe
} from "lucide-react";

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadEmailsCount: number;
  notesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  unreadEmailsCount,
  notesCount,
}) => {
  const tabs = [
    {
      id: "chat",
      label: "Assistant Georges",
      sub: "Chat & Voix « Dis Georges »",
      icon: MessageSquare,
      badge: "Vocal",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "marriage",
      label: "Mariage Étranger",
      sub: "CCAM & Transcription",
      icon: HeartHandshake,
      badge: "Expat",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "visas",
      label: "Visas & Séjour",
      sub: "Titres de séjour France",
      icon: FileCheck,
      badge: "Admin",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "social",
      label: "Sécurité Sociale",
      sub: "CPAM, Vitale & CFE",
      icon: HeartPulse,
      badge: "Santé",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "vault",
      label: "Coffre Papiers",
      sub: "Passeports & Scans",
      icon: FolderLock,
      badge: "Sécurisé",
      badgeColor: "bg-cyan-100 text-cyan-800",
    },
    {
      id: "links",
      label: "Sites & Ambassades",
      sub: "Portails officiels",
      icon: Globe,
      badge: "Liens",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "alarm",
      label: "Réveil & Météo",
      sub: "Horloge & Briefing",
      icon: AlarmClock,
      badge: null,
    },
    {
      id: "codes",
      label: "Coffre de Codes",
      sub: "Capture & Raccourci",
      icon: Key,
      badge: null,
    },
    {
      id: "phone_apps",
      label: "Apps Téléphone",
      sub: "Vacations & Santé",
      icon: Smartphone,
      badge: null,
    },
    {
      id: "publisher",
      label: "Publication App",
      sub: "Google Play",
      icon: Rocket,
      badge: null,
    },
    {
      id: "agenda",
      label: "Agenda & Gardes",
      sub: "Planning",
      icon: Calendar,
      badge: null,
    },
    {
      id: "finance",
      label: "Bourse & Portefeuille",
      sub: "Conseils IA",
      icon: TrendingUp,
      badge: null,
    },
    {
      id: "letters",
      label: "Courriers & Mails",
      sub: "Rédaction sur-mesure",
      icon: FileText,
      badge: null,
    },
    {
      id: "campaigns",
      label: "Campagnes Marketing",
      sub: "Emails & Visuels",
      icon: Megaphone,
      badge: null,
    },
    {
      id: "emails",
      label: "Boîte Mail & Tri",
      sub: "Tri IA",
      icon: Mail,
      badge: unreadEmailsCount > 0 ? `${unreadEmailsCount} nouv.` : null,
      badgeColor: "bg-rose-100 text-rose-700",
    },
    {
      id: "notes",
      label: "Prise de Notes",
      sub: "Mémos",
      icon: StickyNote,
      badge: notesCount > 0 ? `${notesCount}` : null,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: "server",
      label: "Serveur PC",
      sub: "Fichiers",
      icon: Server,
      badge: null,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-slate-800 text-amber-300 border border-slate-700"
                            : tab.badgeColor || "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] hidden md:block ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
