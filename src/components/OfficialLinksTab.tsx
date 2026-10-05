import React, { useState } from "react";
import {
  Globe,
  Building,
  ExternalLink,
  BookOpen,
  Search,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { OfficialSiteItem, EmbassyItem } from "../types";
import { initialOfficialSites, initialEmbassies } from "../data/initialData";

interface OfficialLinksTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const OfficialLinksTab: React.FC<OfficialLinksTabProps> = ({ onAddNote }) => {
  const [sites, setSites] = useState<OfficialSiteItem[]>(initialOfficialSites);
  const [embassies, setEmbassies] = useState<EmbassyItem[]>(initialEmbassies);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmbassies = embassies.filter(e =>
    e.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Sites Officiels & Ambassades</span>
              <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/35">
                Portails Officiels
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Liens directs vers l'administration française et annuaire des représentations diplomatiques à l'étranger
            </p>
          </div>
        </div>
      </div>

      {/* Official Sites Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Portails Officiels de l'Administration Française
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {site.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-2">{site.name}</h4>
                </div>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  title="Visiter le site"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{site.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Embassies Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            Annuaire des Ambassades & Consulats à l'Étranger
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par pays ou ville..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredEmbassies.map((emb) => (
            <div key={emb.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-base">{emb.country}</span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                  {emb.city}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{emb.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{emb.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emb.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <a
                  href={emb.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <span>Visiter le site consulaire</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
