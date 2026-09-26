import React, { useState } from "react";
import { 
  Mail, 
  Sparkles, 
  Star, 
  Trash2, 
  Send,
  CheckCheck, 
  ShieldAlert,
  RefreshCw, 
  Search,
  Reply,
  FileText,
  FolderKanban,
  Download,
  UserCheck,
  UserX,
  MessageSquare,
  Building2,
  FileSpreadsheet,
  FileCheck,
  Plus,
  ArrowRight
} from "lucide-react";
import {
  EmailCategory,
  EmailItem,
  EmailUrgency,
  EmailAccount,
  CaseDossierItem,
  ContactConversation
} from "../types";
import { initialCaseDossiers, initialContacts } from "../data/initialData";
import { getApiUrl } from "../utils/api";

interface EmailTabProps {
  emails: EmailItem[];
  onUpdateEmails: (updated: EmailItem[]) => void;
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onAddEvent: (title: string, date: string, time: string, category: "Pro" | "Perso" | "Serveur" | "Emailing") => void;
  onNavigateToLetters?: () => void;
}

export const EmailTab: React.FC<EmailTabProps> = ({
  emails,
  onUpdateEmails,
  onAddNote,
  onAddEvent,
  onNavigateToLetters,
}) => {
  // Account filter
  const [activeAccount, setActiveAccount] = useState<"all" | EmailAccount>("all");

  // Sub tab view
  const [subTab, setSubTab] = useState<"inbox" | "triaging" | "dossiers" | "contacts">("inbox");

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(emails[0] || null);

  // Triaging state
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageSuccessNotice, setTriageSuccessNotice] = useState(false);

  // Reply generator state
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<{ subject: string; body: string } | null>(null);
  const [replyIntent, setReplyIntent] = useState("Confirmation & Remerciement");
  const [replyTone, setReplyTone] = useState("Chaleureuse et professionnelle");

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeAccount, setComposeAccount] = useState<EmailAccount>("fabrice.moriau@gmail.com");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Case Dossiers State
  const [dossiers, setDossiers] = useState<CaseDossierItem[]>(initialCaseDossiers);
  const [selectedDossier, setSelectedDossier] = useState<CaseDossierItem | null>(dossiers[0] || null);
  const [isCreateDossierOpen, setIsCreateDossierOpen] = useState(false);
  const [newDossierTitle, setNewDossierTitle] = useState("");
  const [newDossierClient, setNewDossierClient] = useState("");
  const [newDossierAccount, setNewDossierAccount] = useState<EmailAccount>("francemaisonsecurite@gmail.com");

  // Contacts state
  const [contacts, setContacts] = useState<ContactConversation[]>(initialContacts);
  const [selectedContact, setSelectedContact] = useState<ContactConversation | null>(contacts[0] || null);
  const [newContactMessage, setNewContactMessage] = useState("");

  // Filter emails by account and search/category
  const accountFilteredEmails = emails.filter((email) => {
    if (activeAccount === "all") return true;
    return email.account === activeAccount;
  });

  const filteredEmails = accountFilteredEmails.filter((email) => {
    const matchesCategory =
      selectedCategory === "all" ? true : email.category === selectedCategory;
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = accountFilteredEmails.filter((e) => !e.isRead).length;
  const pendingTriageCount = accountFilteredEmails.filter((e) => e.triagingRecommendation === "supprimer_bloquer" && e.senderDecision !== "bloque").length;

  const handleTriage = async () => {
    setIsTriaging(true);
    setTriageSuccessNotice(false);

    try {
      const res = await fetch(getApiUrl("/api/email/triage"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: accountFilteredEmails }),
      });

      if (!res.ok) throw new Error("Erreur de tri");

      const triagedResults = await res.json();
      if (Array.isArray(triagedResults)) {
        const triageMap = new Map(triagedResults.map((t: any) => [t.id, t]));

        const updated = emails.map((item) => {
          const match: any = triageMap.get(item.id);
          if (match) {
            return {
              ...item,
              category: match.category as EmailCategory,
              urgency: match.urgency as EmailUrgency,
              summary: match.summary || item.summary,
              suggestedAction: match.suggestedAction || item.suggestedAction,
              triagingRecommendation: (match.category === "promo" || match.urgency === "basse") ? "supprimer_bloquer" as const : "garder" as const
            };
          }
          return item;
        });

        onUpdateEmails(updated);
        setTriageSuccessNotice(true);
        setTimeout(() => setTriageSuccessNotice(false), 5000);
      }
    } catch (err) {
      console.error("Triage error:", err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSetSenderDecision = (emailId: string, decision: "garder" | "bloque") => {
    const updated = emails.map((item) => {
      if (item.id === emailId) {
        return {
          ...item,
          senderDecision: decision,
          isRead: decision === "bloque" ? true : item.isRead
        };
      }
      return item;
    });
    onUpdateEmails(updated);
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = emails.map((em) =>
      em.id === id ? { ...em, isRead: !em.isRead } : em
    );
    onUpdateEmails(updated);
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, isRead: !prev.isRead } : null);
    }
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = emails.map((em) =>
      em.id === id ? { ...em, isStarred: !em.isStarred } : em
    );
    onUpdateEmails(updated);
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  const handleDeleteEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = emails.filter((em) => em.id !== id);
    onUpdateEmails(updated);
    if (selectedEmail?.id === id) {
      setSelectedEmail(updated[0] || null);
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedEmail) return;
    setIsGeneratingReply(true);

    try {
      const res = await fetch(getApiUrl("/api/email/reply"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailSubject: selectedEmail.subject,
          emailBody: selectedEmail.body,
          sender: selectedEmail.fromName,
          replyIntent,
          replyTone,
        }),
      });

      if (!res.ok) throw new Error("Erreur génération réponse");
      const data = await res.json();
      setGeneratedReply({
        subject: data.subject || `Re: ${selectedEmail.subject}`,
        body: data.body || "Merci pour votre message.",
      });
    } catch (err) {
      console.error("Reply generation error:", err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendCompose = () => {
    if (!composeTo || !composeSubject) return;
    const newMail: EmailItem = {
      id: `mail-${Date.now()}`,
      account: composeAccount,
      from: composeAccount,
      fromName: composeAccount.includes("francemaison") ? "France Maison Sécurité (M. Moriau)" : "Moi (Fabrice Moriau)",
      subject: composeSubject,
      date: "À l'instant",
      snippet: composeBody.slice(0, 100),
      body: composeBody,
      category: "important",
      urgency: "moyenne",
      isRead: true,
      isStarred: false,
      summary: `Email envoyé depuis le compte ${composeAccount}.`,
      triagingRecommendation: "garder",
      senderDecision: "garder"
    };
    onUpdateEmails([newMail, ...emails]);
    setIsComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  // Download document to phone/computer
  const handleDownloadDocument = (doc: { fileName: string; content: string }) => {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Create Dossier
  const handleCreateDossier = () => {
    if (!newDossierTitle) return;
    const newDos: CaseDossierItem = {
      id: `dos-${Date.now()}`,
      dossierNumber: `FMS-2026-${Math.floor(Math.random() * 90 + 10)}`,
      title: newDossierTitle,
      account: newDossierAccount,
      clientOrSubject: newDossierClient || "Client Particulier",
      category: "France Maison Sécurité",
      status: "en_cours",
      summary: "Dossier ouvert par Monsieur Fabrice Moriau. Pièces jointes téléchargeables.",
      documents: [
        {
          id: `doc-${Date.now()}`,
          fileName: `Synthese_${newDossierTitle.replace(/\s+/g, "_")}.txt`,
          fileType: "txt",
          sizeKb: 120,
          content: `DOSSIER TECHNIQUE & SUIVI
Réf : ${newDossierTitle}
Compte : ${newDossierAccount}
Client : ${newDossierClient}
Date : ${new Date().toLocaleDateString("fr-FR")}

Ce dossier est géré par Georges pour le compte de Monsieur Fabrice Moriau.`,
          createdAt: new Date().toLocaleDateString("fr-FR")
        }
      ],
      updatedAt: "À l'instant"
    };
    setDossiers([newDos, ...dossiers]);
    setSelectedDossier(newDos);
    setIsCreateDossierOpen(false);
    setNewDossierTitle("");
    setNewDossierClient("");
  };

  // Contact chat message submit
  const handleSendContactMessage = () => {
    if (!selectedContact || !newContactMessage.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "user" as const,
      text: newContactMessage,
      timestamp: "À l'instant"
    };

    const georgesAutoReply = {
      id: `m-g-${Date.now()}`,
      sender: "georges" as const,
      text: `[Georges] Message transmis à ${selectedContact.contactName}. Un accusé de réception a été envoyé depuis le compte ${selectedContact.account}.`,
      timestamp: "À l'instant"
    };

    const updated = contacts.map((c) => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          lastMessage: newContactMessage,
          updatedAt: "À l'instant",
          messages: [...c.messages, newMsg, georgesAutoReply]
        };
      }
      return c;
    });

    setContacts(updated);
    setSelectedContact((prev) => prev ? {
      ...prev,
      lastMessage: newContactMessage,
      messages: [...prev.messages, newMsg, georgesAutoReply]
    } : null);
    setNewContactMessage("");
  };

  const getCategoryBadge = (cat: EmailCategory) => {
    switch (cat) {
      case "important":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Important</span>;
      case "fms_client":
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Client FMS</span>;
      case "facture":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Facture</span>;
      case "newsletter":
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Newsletter</span>;
      case "promo":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Promo</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold">{cat}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
      {/* Account Switcher Bar */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Gestionnaire d'Emails & Suivi de Dossiers</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Dual Account IA
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Gestion automatisée pour <strong>fabrice.moriau@gmail.com</strong> et <strong>francemaisonsecurite@gmail.com</strong>
              </p>
            </div>
          </div>

          {/* Account selector buttons */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveAccount("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAccount === "all"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Tous les comptes
            </button>
            <button
              onClick={() => setActiveAccount("fabrice.moriau@gmail.com")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAccount === "fabrice.moriau@gmail.com"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              fabrice.moriau@gmail.com
            </button>
            <button
              onClick={() => setActiveAccount("francemaisonsecurite@gmail.com")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAccount === "francemaisonsecurite@gmail.com"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              francemaisonsecurite@gmail.com
            </button>
          </div>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubTab("inbox")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "inbox"
                ? "bg-white text-slate-950 shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Boîte de Réception ({unreadCount})</span>
          </button>

          <button
            onClick={() => setSubTab("triaging")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "triaging"
                ? "bg-white text-slate-950 shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Propositions de Tri ({pendingTriageCount})</span>
          </button>

          <button
            onClick={() => setSubTab("dossiers")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "dossiers"
                ? "bg-white text-slate-950 shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <FolderKanban className="w-4 h-4 text-indigo-400" />
            <span>Suivi de Dossiers & Téléchargements ({dossiers.length})</span>
          </button>

          <button
            onClick={() => setSubTab("contacts")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "contacts"
                ? "bg-white text-slate-950 shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Contacts & Conversation ({contacts.length})</span>
          </button>
        </div>
      </div>

      {triageSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl p-3 px-4 flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Georges a réorganisé vos emails et identifié les expéditeurs à conserver ou à bloquer.</span>
        </div>
      )}

      {/* SUBTAB 1: INBOX & EMAIL DETAIL */}
      {subTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher sujet, expéditeur..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Écrire</span>
                </button>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "Tous" },
                  { id: "important", label: "Importants" },
                  { id: "fms_client", label: "FMS Clients" },
                  { id: "facture", label: "Factures" },
                  { id: "newsletter", label: "Newsletters" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                      selectedCategory === cat.id
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Items List */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs max-h-[600px] overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Aucun email ne correspond pour ce compte.
                </div>
              ) : (
                filteredEmails.map((item) => {
                  const isSelected = selectedEmail?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedEmail(item);
                        if (!item.isRead) handleToggleRead(item.id);
                      }}
                      className={`p-3.5 transition-colors cursor-pointer text-xs space-y-1.5 ${
                        isSelected
                          ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                          : item.isRead
                          ? "bg-white hover:bg-slate-50 text-slate-600"
                          : "bg-slate-50/80 hover:bg-slate-100 text-slate-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[160px]">
                          {item.account}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-xs ${!item.isRead ? "font-bold text-slate-900" : "text-slate-700"}`}>
                          {item.fromName}
                        </span>
                      </div>

                      <div className={`text-xs line-clamp-1 ${!item.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                        {item.subject}
                      </div>

                      {item.summary && (
                        <div className="text-[11px] text-indigo-900 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/60 line-clamp-1 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{item.summary}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(item.category)}
                        </div>

                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            onClick={(e) => handleToggleStar(item.id, e)}
                            className={`p-1 rounded hover:bg-slate-200/60 ${
                              item.isStarred ? "text-amber-500 fill-amber-500" : ""
                            }`}
                          >
                            <Star className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteEmail(item.id, e)}
                            className="p-1 rounded hover:bg-slate-200/60 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: Detailed Email View (7 cols) */}
          <div className="lg:col-span-7">
            {selectedEmail ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-200 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-block text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 mb-1">
                        Compte : {selectedEmail.account}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {selectedEmail.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{selectedEmail.fromName}</span>
                        <span className="text-slate-400">&lt;{selectedEmail.from}&gt;</span>
                        <span>&middot;</span>
                        <span className="text-slate-400">{selectedEmail.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleStar(selectedEmail.id)}
                        className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 ${
                          selectedEmail.isStarred ? "text-amber-500" : "text-slate-400"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(selectedEmail.id)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getCategoryBadge(selectedEmail.category)}
                  </div>
                </div>

                {/* Georges AI Summary */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Synthèse exécutif de Georges
                    </div>
                    {selectedEmail.suggestedAction && (
                      <span className="text-[11px] font-semibold bg-white text-slate-800 px-2 py-0.5 rounded-full border border-amber-200">
                        Action : {selectedEmail.suggestedAction}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedEmail.summary || "Synthèse en attente de tri automatique par Georges."}
                  </p>
                </div>

                {/* Email Body */}
                <div className="p-3 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed min-h-[160px] bg-slate-50/50 rounded-xl border border-slate-100">
                  {selectedEmail.body}
                </div>

                {/* Smart Reply */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Reply className="w-3.5 h-3.5 text-indigo-600" />
                    Rédiger une réponse assistée par Georges
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Intention</label>
                      <select
                        value={replyIntent}
                        onChange={(e) => setReplyIntent(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                      >
                        <option value="Confirmation & Remerciement">Confirmation & Remerciement</option>
                        <option value="Acceptation du devis / proposition">Acceptation du devis / proposition</option>
                        <option value="Demande de précision">Demande de précision</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tonalité</label>
                      <select
                        value={replyTone}
                        onChange={(e) => setReplyTone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                      >
                        <option value="Chaleureuse et professionnelle">Chaleureuse et professionnelle</option>
                        <option value="Directe et concise">Directe et concise</option>
                        <option value="Très formelle">Très formelle</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReply}
                    disabled={isGeneratingReply}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isGeneratingReply ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Georges rédige la réponse...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Générer la réponse personnalisée</span>
                      </>
                    )}
                  </button>

                  {generatedReply && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                      <div className="font-semibold text-slate-800">Objet : {generatedReply.subject}</div>
                      <div className="whitespace-pre-line text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                        {generatedReply.body}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedReply.body);
                            alert("Réponse copiée dans le presse-papiers !");
                          }}
                          className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-medium"
                        >
                          Copier la réponse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez un email pour afficher le détail.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PROPOSITIONS DE TRI IA (GARDER / BLOQUER) */}
      {subTab === "triaging" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Propositions de Tri & Gestion des Expéditeurs
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Georges analyse la réputation des expéditeurs et vous propose de les garder ou de les bloquer/supprimer.
              </p>
            </div>

            <button
              onClick={handleTriage}
              disabled={isTriaging}
              className="bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriaging ? "animate-spin" : ""}`} />
              <span>Relancer l'Analyse IA</span>
            </button>
          </div>

          <div className="space-y-3">
            {accountFilteredEmails.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {item.account}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.fromName}</span>
                    <span className="text-xs text-slate-400">&lt;{item.from}&gt;</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{item.subject}</div>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.snippet}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.senderDecision === "bloque" ? (
                    <span className="bg-rose-100 text-rose-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" />
                      Expéditeur Bloqué / Purge
                    </span>
                  ) : item.senderDecision === "garder" ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Expéditeur Conservation
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSetSenderDecision(item.id, "garder")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Garder l'expéditeur
                      </button>
                      <button
                        onClick={() => handleSetSenderDecision(item.id, "bloque")}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Supprimer & Bloquer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SUIVI DE DOSSIERS & TÉLÉCHARGEMENTS */}
      {subTab === "dossiers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dossiers list (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  Dossiers de M. Moriau
                </h3>
                <button
                  onClick={() => setIsCreateDossierOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Suivi centralisé des pièces client, devis FMS et agréments administratifs.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {dossiers.map((dos) => {
                const isSelected = selectedDossier?.id === dos.id;
                return (
                  <div
                    key={dos.id}
                    onClick={() => setSelectedDossier(dos)}
                    className={`p-3.5 cursor-pointer text-xs space-y-1.5 transition-colors ${
                      isSelected ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 bg-indigo-100/60 px-2 py-0.5 rounded text-[10px]">
                        N° {dos.dossierNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{dos.updatedAt}</span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs">{dos.title}</div>
                    <div className="text-[11px] text-slate-500">Client/Sujet : {dos.clientOrSubject}</div>
                    <div className="text-[10px] text-slate-400">Compte : {dos.account}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier Detail & Download (8 cols) */}
          <div className="lg:col-span-8">
            {selectedDossier ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Dossier N° {selectedDossier.dossierNumber}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Statut : {selectedDossier.status.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">{selectedDossier.title}</h2>
                  <p className="text-xs text-slate-600">
                    Sujet / Client : <strong>{selectedDossier.clientOrSubject}</strong> &middot; Compte associé : <strong>{selectedDossier.account}</strong>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Synthèse du dossier</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedDossier.summary}</p>
                </div>

                {/* Documents list and Download to phone */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Pièces Justificatives & Documents téléchargeables
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedDossier.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-indigo-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{doc.fileName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{doc.sizeKb} Ko &middot; {doc.createdAt}</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {doc.fileType}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg text-[11px]">
                          {doc.content}
                        </p>

                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Télécharger sur mon Téléphone / PC</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez un dossier pour afficher les documents.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: CONTACTS & DIALOGUE */}
      {subTab === "contacts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contacts list (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Conversations & Contacts
              </h3>
              <p className="text-xs text-slate-500">
                Dialoguez et faites écrire Georges directement avec vos interlocuteurs.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {contacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`p-3.5 cursor-pointer text-xs space-y-1 transition-colors ${
                      isSelected ? "bg-emerald-50/80 border-l-4 border-emerald-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{c.contactName}</span>
                      <span className="text-[10px] text-slate-400">{c.updatedAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{c.lastMessage}</div>
                    <div className="text-[10px] font-semibold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                      {c.account}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Interactive Chat (8 cols) */}
          <div className="lg:col-span-8">
            {selectedContact ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs flex flex-col h-[600px]">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedContact.contactName}</h3>
                    <p className="text-xs text-slate-500">{selectedContact.contactEmail} &middot; Compte : {selectedContact.account}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    Actif
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {selectedContact.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === "user"
                          ? "items-end"
                          : m.sender === "georges"
                          ? "items-center"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] text-xs p-3 rounded-2xl space-y-1 ${
                          m.sender === "user"
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : m.sender === "georges"
                            ? "bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-center"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                        <span className="text-[9px] opacity-60 block text-right">{m.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input box */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newContactMessage}
                    onChange={(e) => setNewContactMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendContactMessage()}
                    placeholder="Écrire un message ou demander à Georges de répondre..."
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden"
                  />
                  <button
                    onClick={handleSendContactMessage}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez un contact pour dialoguer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouveau Dossier */}
      {isCreateDossierOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Nouveau Dossier de Suivi</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre du dossier</label>
                <input
                  type="text"
                  value={newDossierTitle}
                  onChange={(e) => setNewDossierTitle(e.target.value)}
                  placeholder="Ex: Installation Alarme Résidence Les Pins"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client ou Sujet</label>
                <input
                  type="text"
                  value={newDossierClient}
                  onChange={(e) => setNewDossierClient(e.target.value)}
                  placeholder="Ex: M. Dupont / Copropriété"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte rattaché</label>
                <select
                  value={newDossierAccount}
                  onChange={(e) => setNewDossierAccount(e.target.value as EmailAccount)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="francemaisonsecurite@gmail.com">francemaisonsecurite@gmail.com</option>
                  <option value="fabrice.moriau@gmail.com">fabrice.moriau@gmail.com</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateDossierOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateDossier}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Créer le dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Nouveau Message</h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte d'envoi</label>
                <select
                  value={composeAccount}
                  onChange={(e) => setComposeAccount(e.target.value as EmailAccount)}
                  className="w-full border rounded-lg p-2 bg-white"
                >
                  <option value="fabrice.moriau@gmail.com">fabrice.moriau@gmail.com</option>
                  <option value="francemaisonsecurite@gmail.com">francemaisonsecurite@gmail.com</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destinataire</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="contact@exemple.com"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objet</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Objet du message"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={6}
                  placeholder="Rédigez votre message..."
                  className="w-full border rounded-lg p-2 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSendCompose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Envoyer le message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
