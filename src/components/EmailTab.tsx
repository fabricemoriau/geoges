import React, { useState } from "react";
import { 
  Mail, 
  Sparkles, 
  Star, 
  Trash2, 
  Archive, 
  Inbox, 
  Send, 
  CheckCheck, 
  AlertCircle, 
  Tag, 
  Calendar, 
  StickyNote, 
  MessageSquare, 
  RefreshCw, 
  Filter, 
  Search,
  ExternalLink,
  ChevronRight,
  Reply,
  FileText
} from "lucide-react";
import { EmailCategory, EmailItem, EmailUrgency } from "../types";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(emails[0] || null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageSuccessNotice, setTriageSuccessNotice] = useState(false);

  // Reply generator state
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<{ subject: string; body: string } | null>(null);
  const [replyIntent, setReplyIntent] = useState("Confirmation & Remerciement");
  const [replyTone, setReplyTone] = useState("Chaleureuse et professionnelle");

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const filteredEmails = emails.filter((email) => {
    const matchesCategory =
      selectedCategory === "all" ? true : email.category === selectedCategory;
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = emails.filter((e) => !e.isRead).length;
  const importantCount = emails.filter((e) => e.category === "important").length;
  const facturesCount = emails.filter((e) => e.category === "facture").length;

  const handleTriage = async () => {
    setIsTriaging(true);
    setTriageSuccessNotice(false);

    try {
      const res = await fetch("/api/email/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
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
      const res = await fetch("/api/email/reply", {
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
      from: "fabrice.moriau@gmail.com",
      fromName: "Moi (Fabrice)",
      subject: composeSubject,
      date: "À l'instant",
      snippet: composeBody.slice(0, 100),
      body: composeBody,
      category: "important",
      urgency: "moyenne",
      isRead: true,
      isStarred: false,
      summary: "Email rédigé et envoyé par Fabrice.",
    };
    onUpdateEmails([newMail, ...emails]);
    setIsComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  const getCategoryBadge = (cat: EmailCategory) => {
    switch (cat) {
      case "important":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Important</span>;
      case "facture":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Facture</span>;
      case "newsletter":
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Newsletter</span>;
      case "promo":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Promo</span>;
    }
  };

  const getUrgencyBadge = (urg: EmailUrgency) => {
    switch (urg) {
      case "haute":
        return <span className="w-2 h-2 rounded-full bg-rose-500" title="Urgence haute"></span>;
      case "moyenne":
        return <span className="w-2 h-2 rounded-full bg-amber-500" title="Urgence moyenne"></span>;
      case "basse":
        return <span className="w-2 h-2 rounded-full bg-slate-300" title="Urgence basse"></span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
      {/* Top Banner & Triage Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              Boîte de réception & Tri Intelligent
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Géré par Georges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {emails.length} emails indexés &middot; <strong className="text-slate-800">{unreadCount} non lus</strong> &middot; {importantCount} prioritaires &middot; {facturesCount} factures
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tri Automatique Button */}
          <button
            onClick={handleTriage}
            disabled={isTriaging}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isTriaging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Georges analyse et trie la boîte...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Trier automatiquement avec Georges</span>
              </>
            )}
          </button>

          {onNavigateToLetters && (
            <button
              onClick={onNavigateToLetters}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Rédiger une lettre officielle ou un email sur-mesure"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Rédiger Courrier/Mail</span>
            </button>
          )}

          <button
            onClick={() => setIsComposeOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Écrire</span>
          </button>
        </div>
      </div>

      {triageSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl p-3 px-4 flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Georges a réorganisé vos emails, généré les résumés exécutifs et assigné les niveaux d'urgence avec succès.</span>
        </div>
      )}

      {/* Main Container: Email List on Left, Detail & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Filters & Email List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search and Category Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 shadow-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par expéditeur, sujet ou mot-clé..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "Tous" },
                { id: "important", label: "Importants" },
                { id: "facture", label: "Factures" },
                { id: "newsletter", label: "Newsletters" },
                { id: "promo", label: "Promos" },
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
                Aucun email ne correspond à cette recherche.
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
                      <div className="flex items-center gap-2 overflow-hidden">
                        {getUrgencyBadge(item.urgency)}
                        <span className={`truncate text-xs ${!item.isRead ? "font-bold text-slate-900" : "text-slate-700"}`}>
                          {item.fromName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
                    </div>

                    <div className={`text-xs line-clamp-1 ${!item.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {item.subject}
                    </div>

                    {/* Georges one-line summary if triaged */}
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

        {/* Right column: Selected Email Detailed View & AI Assistant Actions (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
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
                      className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${
                        selectedEmail.isStarred ? "text-amber-500" : "text-slate-400"
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedEmail.category)}
                  <span className="text-xs text-slate-500 font-medium">
                    Urgence : <strong>{selectedEmail.urgency}</strong>
                  </span>
                </div>
              </div>

              {/* Georges AI Executive Assistant Summary Card */}
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
                  {selectedEmail.summary || "Georges n'a pas encore analysé ce courriel en détail. Cliquez sur 'Trier automatiquement' pour générer une synthèse instantanée."}
                </p>

                {/* Quick actions for Georges */}
                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onAddNote(
                        `Suite email : ${selectedEmail.subject}`,
                        `Expéditeur : ${selectedEmail.fromName}\nRésumé : ${selectedEmail.summary || selectedEmail.snippet}\nAction : ${selectedEmail.suggestedAction || "À traiter"}`,
                        selectedEmail.category === "facture" ? "Travail" : "Personnel"
                      );
                    }}
                    className="text-xs bg-white hover:bg-amber-100 text-slate-800 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <StickyNote className="w-3 h-3 text-amber-700" />
                    Ajouter aux notes
                  </button>

                  <button
                    onClick={() => {
                      onAddEvent(
                        `Point suite email : ${selectedEmail.fromName}`,
                        "2026-09-22",
                        "14:00",
                        "Pro"
                      );
                    }}
                    className="text-xs bg-white hover:bg-amber-100 text-slate-800 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Calendar className="w-3 h-3 text-amber-700" />
                    Planifier un rappel
                  </button>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-2 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed min-h-[160px] bg-slate-50/50 rounded-xl border border-slate-100">
                {selectedEmail.body}
              </div>

              {/* Smart Reply Section with Georges */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Reply className="w-3.5 h-3.5 text-indigo-600" />
                    Rédiger une réponse avec Georges
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Intention de réponse
                    </label>
                    <select
                      value={replyIntent}
                      onChange={(e) => setReplyIntent(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Confirmation & Remerciement">Confirmation & Remerciement</option>
                      <option value="Acceptation du devis / proposition">Acceptation du devis / proposition</option>
                      <option value="Demande de report de date">Demande de report de date</option>
                      <option value="Refus courtois">Refus courtois</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tonalité
                    </label>
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
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isGeneratingReply ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Georges rédige le brouillon...</span>
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
                    <div className="font-semibold text-slate-800">
                      Objet : {generatedReply.subject}
                    </div>
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
              Sélectionnez un email pour afficher le contenu et les analyses de Georges.
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
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
