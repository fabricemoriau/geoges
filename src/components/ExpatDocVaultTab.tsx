import React, { useState } from "react";
import {
  FolderLock,
  Plus,
  Trash2,
  FileText,
  Camera,
  Upload,
  ShieldCheck,
  Check,
  Eye,
  Download
} from "lucide-react";
import { ExpatScanDocument } from "../types";
import { initialExpatScans } from "../data/initialData";

interface ExpatDocVaultTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const ExpatDocVaultTab: React.FC<ExpatDocVaultTabProps> = ({ onAddNote }) => {
  const [documents, setDocuments] = useState<ExpatScanDocument[]>(() => {
    const saved = localStorage.getItem("georges_expat_scans");
    return saved ? JSON.parse(saved) : initialExpatScans;
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<ExpatScanDocument["documentType"]>("passeport");
  const [docNotes, setDocNotes] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<ExpatScanDocument | null>(documents[0] || null);

  const handleSaveDocument = () => {
    if (!docTitle.trim()) return;
    const newDoc: ExpatScanDocument = {
      id: `scan-${Date.now()}`,
      title: docTitle,
      documentType: docType,
      uploadDate: new Date().toLocaleDateString("fr-FR"),
      notes: docNotes || "Document scanné et stocké en toute sécurité.",
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem("georges_expat_scans", JSON.stringify(updated));
    setSelectedDoc(newDoc);
    setIsUploadOpen(false);
    setDocTitle("");
    setDocNotes("");
  };

  const handleDelete = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem("georges_expat_scans", JSON.stringify(updated));
    if (selectedDoc?.id === id) {
      setSelectedDoc(updated[0] || null);
    }
  };

  const handleDownload = (doc: ExpatScanDocument) => {
    const blob = new Blob([`TITRE : ${doc.title}\nTYPE : ${doc.documentType}\nDATE : ${doc.uploadDate}\nNOTES : ${doc.notes}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Coffre-Fort Numérique & Papiers Scannés</span>
              <span className="text-xs bg-cyan-400/20 text-cyan-300 font-semibold px-2.5 py-0.5 rounded-full border border-cyan-400/35">
                Sécurisé Mobile
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Stockez et retrouvez à tout moment vos passeports, titres de séjour et actes d'état civil sur votre téléphone
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un document scanné</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Documents Enregistrés ({documents.length})
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aucun document dans le coffre-fort.
              </div>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 cursor-pointer text-xs space-y-1.5 transition-colors ${
                      isSelected ? "bg-cyan-50/80 border-l-4 border-cyan-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{doc.title}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Document Details (8 cols) */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                    {selectedDoc.documentType}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{selectedDoc.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Ajouté le : {selectedDoc.uploadDate}</p>
                </div>

                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Notes & Métadonnées</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{selectedDoc.notes}</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Télécharger le justificatif sur le téléphone</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              Sélectionnez un document pour l'afficher.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Document */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Ajouter un document au coffre-fort</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre du document</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Ex: Passeport, Titre de séjour, Acte de naissance..."
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type de pièce</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as ExpatScanDocument["documentType"])}
                  className="w-full border rounded-xl p-2.5 bg-white"
                >
                  <option value="passeport">Passeport</option>
                  <option value="titre_sejour">Titre de séjour</option>
                  <option value="acte_naissance">Acte de naissance</option>
                  <option value="justificatif_domicile">Justificatif de domicile</option>
                  <option value="autre">Autre document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes ou remarques</label>
                <textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  rows={3}
                  placeholder="Date de validité, numéro de pièce..."
                  className="w-full border rounded-xl p-2.5 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDocument}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 shadow-xs"
              >
                Enregistrer dans le coffre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
