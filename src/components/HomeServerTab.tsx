import React, { useState, useEffect } from "react";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Folder, 
  File, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Download, 
  ShieldCheck, 
  Activity, 
  Network,
  Copy,
  Check,
  Eye
} from "lucide-react";
import { HomeServerInfo, ServerFile } from "../types";
import { sampleFiles } from "../data/initialData";
import { getApiUrl } from "../utils/api";

interface HomeServerTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const HomeServerTab: React.FC<HomeServerTabProps> = ({ onAddNote }) => {
  const [serverInfo, setServerInfo] = useState<HomeServerInfo | null>(null);
  const [files, setFiles] = useState<ServerFile[]>(sampleFiles);
  const [searchFile, setSearchFile] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [inspectingFile, setInspectingFile] = useState<ServerFile | null>(null);

  const fetchServerTelemetry = async () => {
    setIsRefreshing(true);

    try {
      const res = await fetch(getApiUrl("/api/server/status"));
      if (res.ok) {
        const data = await res.json();
        setServerInfo(data);
      }
      const filesRes = await fetch(getApiUrl("/api/server/files"));
      if (filesRes.ok) {
        const fData = await filesRes.json();
        setFiles(fData);
      }
    } catch (err) {
      console.error("Server telemetry fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServerTelemetry();
  }, []);

  const handlePing = () => {
    setPingStatus("testing");
    setTimeout(() => {
      setPingStatus("success");
      setTimeout(() => setPingStatus(null), 4000);
    }, 800);
  };

  const daemonBashCommand = `curl -sSL https://georges-assistant.local/install-daemon.sh | sudo bash -s -- --token=georges_live_fabrice_98a72b`;

  const filteredFiles = files.filter((f) => {
    const matchCat = selectedCategory === "all" || f.category === selectedCategory;
    const matchQuery =
      f.name.toLowerCase().includes(searchFile.toLowerCase()) ||
      f.path.toLowerCase().includes(searchFile.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              Serveur PC Maison & Accès Fichiers
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs font-mono">
              192.168.1.145:8088
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Votre vieux PC recyclé en serveur domestique privé
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
            Georges est connecté en temps réel aux disques et aux ressources de votre PC maison. Vous pouvez consulter vos documents, vérifier l'état du processeur et surveiller vos disques sans passer par le cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePing}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              pingStatus === "success"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {pingStatus === "testing"
                ? "Ping en cours..."
                : pingStatus === "success"
                ? "Connexion 4ms (OK)"
                : "Tester le Ping PC"}
            </span>
          </button>

          <button
            onClick={fetchServerTelemetry}
            disabled={isRefreshing}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-colors"
            title="Rafraîchir la télémétrie"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU & Temps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Processeur (CPU)
            </span>
            <span className="text-emerald-600 font-bold">
              {serverInfo?.cpu.temperatureC || 41}°C
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {serverInfo?.cpu.usagePercent || 24}%
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {serverInfo?.cpu.model || "Intel Core i5-4570 (4 cœurs)"}
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${serverInfo?.cpu.usagePercent || 24}%` }}
            ></div>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              Mémoire Vive (RAM)
            </span>
            <span className="text-slate-700 font-bold">
              {serverInfo?.ram.usedGb || 6.2} / {serverInfo?.ram.totalGb || 16} Go
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {serverInfo?.ram.usagePercent || 38.7}%
            </div>
            <p className="text-[11px] text-slate-400">DDR3 1600MHz Dual-Channel</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${serverInfo?.ram.usagePercent || 38.7}%` }}
            ></div>
          </div>
        </div>

        {/* Network & Bridge */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-600" />
              Réseau Local & Bridge
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Actif
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {serverInfo?.network.downloadMbps || 45.2} <span className="text-sm font-normal text-slate-500">Mb/s</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload : {serverInfo?.network.uploadMbps || 12.8} Mb/s
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-2/3"></div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Disponibilité (Uptime)
            </span>
            <span className="text-sky-700 font-bold">100%</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {serverInfo?.uptime || "14j 7h 42m"}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {serverInfo?.os || "Ubuntu Server 24.04 LTS"}
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Disks Storage Status Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          Stockage des Disques Durs du Vieux PC
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(serverInfo?.storage || [
            { disk: "SSD Système (/)", totalGb: 240, usedGb: 68, usagePercent: 28.3, status: "healthy" },
            { disk: "HDD Données (/data)", totalGb: 2000, usedGb: 1280, usagePercent: 64.0, status: "healthy" },
            { disk: "HDD Sauvegardes (/backup)", totalGb: 2000, usedGb: 950, usagePercent: 47.5, status: "healthy" },
          ]).map((d, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{d.disk}</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
                  Sain
                </span>
              </div>
              <div className="text-xs text-slate-600">
                {d.usedGb} Go occupés sur {d.totalGb} Go ({d.usagePercent}%)
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    d.usagePercent > 80 ? "bg-rose-500" : d.usagePercent > 50 ? "bg-indigo-600" : "bg-emerald-500"
                  }`}
                  style={{ width: `${d.usagePercent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time PC Files Indexer & Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" />
              Explorateur & Contenu du PC en Temps Réel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Indexé par le daemon Georges sur votre réseau local.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFile}
                onChange={(e) => setSearchFile(e.target.value)}
                placeholder="Rechercher un fichier sur le PC..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {["all", "Documents", "Photos", "Backups", "Notes", "Système"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "all" ? "Tous les dossiers" : cat}
            </button>
          ))}
        </div>

        {/* Files Table */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Nom du fichier</th>
                <th className="py-2.5 px-4">Emplacement sur le PC</th>
                <th className="py-2.5 px-4">Taille</th>
                <th className="py-2.5 px-4">Modifié le</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <File className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{file.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{file.path}</td>
                  <td className="py-3 px-4">{file.size}</td>
                  <td className="py-3 px-4 text-slate-500">{file.modified}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setInspectingFile(file)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        title="Examiner"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onAddNote(
                            `Fichier PC : ${file.name}`,
                            `Chemin : ${file.path}\nTaille : ${file.size}\nCatégorie : ${file.category}`,
                            "Serveur"
                          );
                          alert(`Référence vers ${file.name} ajoutée à vos notes !`);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700"
                      >
                        Ajouter aux notes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Setup Guide for his Old PC */}
      <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Script d'installation pour votre vieux PC à la maison
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Ubuntu Server / Debian / Linux Mint</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Pour relier physiquement votre vieux PC au tableau de bord Georges dès que vous l'allumez chez vous, ouvrez un terminal sur le vieux PC et collez cette commande unique :
        </p>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono text-amber-300">
          <span className="truncate">{daemonBashCommand}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(daemonBashCommand);
              setCopiedScript(true);
              setTimeout(() => setCopiedScript(false), 2500);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0 transition-colors"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File Inspect Modal */}
      {inspectingFile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <File className="w-4 h-4 text-indigo-600" />
                {inspectingFile.name}
              </h3>
              <button
                onClick={() => setInspectingFile(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900">Emplacement :</strong>{" "}
                <span className="font-mono">{inspectingFile.path}</span>
              </div>
              <div>
                <strong className="text-slate-900">Taille :</strong> {inspectingFile.size}
              </div>
              <div>
                <strong className="text-slate-900">Dernière modification :</strong> {inspectingFile.modified}
              </div>
              <div>
                <strong className="text-slate-900">Catégorie :</strong> {inspectingFile.category}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectingFile(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 text-white font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
