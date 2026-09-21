import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Mail, 
  Sparkles, 
  Printer, 
  Copy, 
  Send, 
  Check, 
  StickyNote, 
  Mic, 
  MicOff, 
  RefreshCw, 
  SlidersHorizontal, 
  Bookmark, 
  History, 
  Trash2, 
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Pencil
} from "lucide-react";
import { GeneratedLetter } from "../types";

interface LettersTabProps {
  onSaveAsNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onSendAsEmail?: (subject: string, body: string, recipient: string) => void;
}

export const LettersTab: React.FC<LettersTabProps> = ({
  onSaveAsNote,
  onSendAsEmail,
}) => {
  const [docType, setDocType] = useState<"courrier" | "email">("courrier");
  const [instructions, setInstructions] = useState("");
  const [senderName, setSenderName] = useState("Fabrice Moriau");
  const [senderAddress, setSenderAddress] = useState("14 Rue des Lilas, 75011 Paris\nfabrice.moriau@gmail.com");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [tone, setTone] = useState("Courtois et professionnel");
  const [length, setLength] = useState<"court" | "standard" | "detaille">("standard");
  const [keyPoints, setKeyPoints] = useState("");

  const [loading, setLoading] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<GeneratedLetter | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Stored history
  const [history, setHistory] = useState<GeneratedLetter[]>(() => {
    const saved = localStorage.getItem("georges_saved_letters");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: "sample-letter-1",
        documentType: "courrier",
        title: "Demande de résiliation abonnement avec préavis",
        dateLocation: "Paris, le 21 septembre 2026",
        senderBlock: "Fabrice Moriau\n14 Rue des Lilas, 75011 Paris\nfabrice.moriau@gmail.com",
        recipientBlock: "Service Résiliation Clients\nOpérateur Télécom\n75008 Paris",
        subject: "Objet : Demande de résiliation de mon abonnement box - Contrat N° 8492019",
        salutation: "Madame, Monsieur le Responsable,",
        bodyParagraphs: [
          "Par la présente lettre recommandée avec accusé de réception, je vous notifie ma décision de résilier mon contrat d'abonnement internet susmentionné, souscrit auprès de vos services.",
          "Conformément aux conditions générales de vente et à l'article L. 224-39 du Code de la consommation, je vous saurais gré de bien vouloir prendre en compte cette résiliation à compter du terme de mon préavis contractuel.",
          "Je vous remercie de m'adresser dans les meilleurs délais une confirmation écrite de cette résiliation, ainsi que la procédure de restitution des équipements mis à ma disposition.",
        ],
        valediction: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
        signature: "Fabrice Moriau",
        fullText: `Fabrice Moriau\n14 Rue des Lilas, 75011 Paris\nfabrice.moriau@gmail.com\n\nÀ l'attention de :\nService Résiliation Clients\nOpérateur Télécom\n75008 Paris\n\nParis, le 21 septembre 2026\n\nObjet : Demande de résiliation de mon abonnement box - Contrat N° 8492019\n\nMadame, Monsieur le Responsable,\n\nPar la présente lettre recommandée avec accusé de réception, je vous notifie ma décision de résilier mon contrat d'abonnement internet susmentionné, souscrit auprès de vos services.\n\nConformément aux conditions générales de vente et à l'article L. 224-39 du Code de la consommation, je vous saurais gré de bien vouloir prendre en compte cette résiliation à compter du terme de mon préavis contractuel.\n\nJe vous remercie de m'adresser dans les meilleurs délais une confirmation écrite de cette résiliation, ainsi que la procédure de restitution des équipements mis à ma disposition.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\nFabrice Moriau`,
        georgesAdvice: "Conseil de Georges : pensez à conserver le récépissé postal et à photographier le matériel avant expédition dans son emballage d'origine.",
        createdAt: "2026-09-20",
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("georges_saved_letters", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!currentLetter && history.length > 0) {
      setCurrentLetter(history[0]);
    }
  }, [history, currentLetter]);

  // Voice dictation using Web Speech API
  const handleToggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInstructions((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsDictating(false);
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      recognition.start();
    } catch (e) {
      setIsDictating(false);
    }
  };

  const handleGenerate = async () => {
    if (!instructions.trim() || loading) return;

    setLoading(true);
    setSavedSuccess(null);

    try {
      const res = await fetch("/api/letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType === "email" ? "email_personnalise" : "courrier_officiel",
          instructions: instructions.trim(),
          senderName,
          senderAddress,
          recipientName: recipientName.trim() || "Destinataire",
          recipientAddress: recipientAddress.trim(),
          tone,
          length,
          keyPoints,
        }),
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      const newDoc: GeneratedLetter = {
        id: `doc-${Date.now()}`,
        documentType: data.documentType || docType,
        title: data.title || `${docType === "courrier" ? "Courrier" : "Email"} pour ${recipientName || "destinataire"}`,
        dateLocation: data.dateLocation || "Paris, le " + new Date().toLocaleDateString("fr-FR"),
        senderBlock: data.senderBlock || senderName,
        recipientBlock: data.recipientBlock || recipientName,
        subject: data.subject || "Objet : Correspondance",
        salutation: data.salutation || "Madame, Monsieur,",
        bodyParagraphs: data.bodyParagraphs || [data.fullText],
        valediction: data.valediction || "Salutations distinguées,",
        signature: data.signature || senderName,
        fullText: data.fullText || "",
        georgesAdvice: data.georgesAdvice || "Document relu et validé par Georges.",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurrentLetter(newDoc);
      setHistory((prev) => [newDoc, ...prev]);
    } catch (err: any) {
      console.error("Generate letter error:", err);
      // Fallback
      const fallback: GeneratedLetter = {
        id: `doc-${Date.now()}`,
        documentType: docType,
        title: `Courrier préparé pour : ${recipientName || "Destinataire"}`,
        dateLocation: "Paris, le " + new Date().toLocaleDateString("fr-FR"),
        senderBlock: `${senderName}\n${senderAddress}`,
        recipientBlock: `${recipientName || "Destinataire"}\n${recipientAddress}`,
        subject: `Objet : ${instructions.slice(0, 45)}`,
        salutation: docType === "email" ? "Bonjour," : "Madame, Monsieur,",
        bodyParagraphs: [
          `Je vous adresse la présente afin de vous faire part de ma demande concernant : ${instructions}.`,
          `Je reste à votre entière disposition pour convenir des modalités pratiques.`,
        ],
        valediction: docType === "email" ? "Cordialement," : "Je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.",
        signature: senderName,
        fullText: `${senderName}\n\nObjet : ${instructions.slice(0, 45)}\n\nMadame, Monsieur,\n\nJe vous adresse la présente afin de vous faire part de ma demande concernant : ${instructions}.\n\nCordialement,\n${senderName}`,
        georgesAdvice: "Conseil de Georges : Vérifiez les coordonnées avant impression ou expédition.",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCurrentLetter(fallback);
      setHistory((prev) => [fallback, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!currentLetter) return;
    navigator.clipboard.writeText(currentLetter.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNote = () => {
    if (!currentLetter) return;
    onSaveAsNote(
      `Courrier : ${currentLetter.subject.replace("Objet :", "").trim()}`,
      currentLetter.fullText,
      "Travail"
    );
    setSavedSuccess("Courrier enregistré dans vos Notes avec succès !");
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const quickTemplates = [
    {
      title: "Résiliation de contrat / box",
      type: "courrier" as const,
      prompt: "Résiliation sans frais de mon abonnement internet box pour déménagement avec accusé de réception",
      recipient: "Service Clients Télécom",
      tone: "Formel et juridique",
    },
    {
      title: "Demande d'échéancier ou délai",
      type: "courrier" as const,
      prompt: "Demande polie et argumentée d'un étalement de paiement en 3 fois sans pénalité pour facture imprévue",
      recipient: "Service Comptabilité / Recouvrement",
      tone: "Courtois et professionnel",
    },
    {
      title: "Relance client devis impayé",
      type: "email" as const,
      prompt: "Relance élégante mais ferme pour le règlement de la facture arrivée à échéance depuis 10 jours",
      recipient: "Monsieur le Directeur Financier",
      tone: "Ferme et déterminé",
    },
    {
      title: "Remerciements & Proposition",
      type: "email" as const,
      prompt: "Remerciements chaleureux suite à notre échange et proposition d'un prochain point d'étape",
      recipient: "Marc Dupont",
      tone: "Chaleureux et bienveillant",
    },
  ];

  const applyTemplate = (t: typeof quickTemplates[0]) => {
    setDocType(t.type);
    setInstructions(t.prompt);
    setRecipientName(t.recipient);
    setTone(t.tone);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Rédacteur de Courriers & Mails sur-mesure
              </h2>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                À votre convenance
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Confiez à Georges la rédaction de vos lettres officielles, démarches administratives, courriers de résiliation ou courriels personnalisés selon vos critères exacts.
            </p>
          </div>

          {/* Quick Stats or Doc Type selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setDocType("courrier")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docType === "courrier"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Courrier Papier (A4 Officiel)</span>
            </button>
            <button
              onClick={() => setDocType("email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docType === "email"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Email Personnalisé</span>
            </button>
          </div>
        </div>

        {/* Quick Inspiration Templates */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Modèles rapides :</span>
          {quickTemplates.map((t, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(t)}
              className="text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition-colors flex items-center gap-1"
            >
              {t.type === "courrier" ? <FileText className="w-3 h-3 text-amber-500" /> : <Mail className="w-3 h-3 text-indigo-500" />}
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form (Left) & Live Document Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5 text-amber-500" />
              Vos Consignes pour Georges
            </h3>

            {/* Instruction Textarea with Voice Dictation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Décrivez ce que vous souhaitez écrire :
                </label>
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                    isDictating
                      ? "bg-rose-100 text-rose-700 animate-pulse"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Dicter à la voix"
                >
                  {isDictating ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-amber-600" />}
                  <span>{isDictating ? "Écoute en cours..." : "Dicter"}</span>
                </button>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Ex : Écris une lettre pour résilier mon contrat box sans frais car le débit n'est pas conforme au contrat. Reste très courtois mais ferme."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Destinataire (Nom ou Service)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex : Service Client Free / M. Le Maire"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Adresse postale ou email destinataire
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Ex : 75008 Paris / contact@..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Tone & Length Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tonalité souhaitée
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Courtois et professionnel">Courtois & Professionnel</option>
                  <option value="Formel et juridique">Formel & Juridique</option>
                  <option value="Ferme et déterminé">Ferme & Déterminé</option>
                  <option value="Chaleureux et bienveillant">Chaleureux & Bienveillant</option>
                  <option value="Diplomatique et nuancé">Diplomatique & Nuancé</option>
                  <option value="Concis et direct">Concis & Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Longueur du texte
                </label>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  {(["court", "standard", "detaille"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLength(l)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                        length === l
                          ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {l === "detaille" ? "Détaillé" : l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sender block adjustment (foldable/subtle) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Expéditeur par défaut : <strong>{senderName}</strong></span>
              </div>
            </div>

            {/* Main Action Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={!instructions.trim() || loading}
              className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                instructions.trim() && !loading
                  ? "bg-slate-900 text-amber-400 hover:bg-slate-800"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Georges rédige votre {docType === "courrier" ? "courrier" : "email"}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Georges, rédigez ce {docType === "courrier" ? "courrier" : "email"}</span>
                </>
              )}
            </button>
          </div>

          {/* History List */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Documents rédigés récemment ({history.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setCurrentLetter(h)}
                    className={`p-2 rounded-xl text-xs border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      currentLetter?.id === h.id
                        ? "bg-amber-50/70 border-amber-300 font-semibold text-slate-900"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {h.documentType === "courrier" ? (
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span className="truncate">{h.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{h.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Craft Document Preview & Actions */}
        <div className="lg:col-span-7">
          {currentLetter ? (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {currentLetter.documentType === "courrier" ? "Courrier officiel" : "Email rédigé"}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    Prêt à l'emploi
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyText}
                    className="text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Imprimer ou enregistrer en PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Imprimer / PDF</span>
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sauvegarder en Note</span>
                  </button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{savedSuccess}</span>
                </div>
              )}

              {/* Classical Paper Letterhead Layout (Printable) */}
              <div 
                id="printable-letter"
                className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-sm font-serif text-slate-900 min-h-[500px]"
              >
                {/* 1. Header: Sender (Left) & Recipient (Right) */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 text-sm font-sans">
                  {/* Sender Block */}
                  <div className="text-slate-800 leading-relaxed">
                    <p className="font-bold text-base text-slate-900">{currentLetter.senderBlock.split("\n")[0]}</p>
                    {currentLetter.senderBlock.split("\n").slice(1).map((line, i) => (
                      <p key={i} className="text-xs text-slate-600">{line}</p>
                    ))}
                  </div>

                  {/* Recipient Block */}
                  <div className="sm:text-right bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-slate-800 leading-relaxed max-w-xs">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Destinataire</p>
                    <p className="font-bold text-slate-900">{currentLetter.recipientBlock.split("\n")[0]}</p>
                    {currentLetter.recipientBlock.split("\n").slice(1).map((line, i) => (
                      <p key={i} className="text-xs text-slate-600">{line}</p>
                    ))}
                  </div>
                </div>

                {/* 2. Date and Location */}
                <div className="text-right text-xs font-sans text-slate-500 mb-6 italic">
                  {currentLetter.dateLocation}
                </div>

                {/* 3. Subject (Objet) */}
                <div className="font-sans font-bold text-sm sm:text-base text-slate-900 mb-6 pb-2 border-b border-slate-200">
                  {currentLetter.subject}
                </div>

                {/* 4. Salutation */}
                <div className="font-sans text-sm font-semibold text-slate-800 mb-5">
                  {currentLetter.salutation}
                </div>

                {/* 5. Body Paragraphs */}
                <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-800 text-justify">
                  {currentLetter.bodyParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* 6. Valediction */}
                <div className="mt-6 font-sans text-sm text-slate-800 leading-relaxed">
                  {currentLetter.valediction}
                </div>

                {/* 7. Signature */}
                <div className="mt-10 sm:mt-12 text-right font-sans">
                  <p className="text-xs text-slate-400 mb-1">Pour faire valoir ce que de droit,</p>
                  <p className="text-base font-bold text-slate-900">{currentLetter.signature}</p>
                  <div className="inline-block mt-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-400 font-mono">
                    Signé numériquement par Fabrice
                  </div>
                </div>
              </div>

              {/* Georges' Butler Advice Callout */}
              {currentLetter.georgesAdvice && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">La recommandation de Georges :</span>
                    <p className="leading-relaxed">{currentLetter.georgesAdvice}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Aucun document en cours</p>
              <p className="text-xs mt-1">Renseignez vos souhaits à gauche pour que Georges compose votre courrier.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
