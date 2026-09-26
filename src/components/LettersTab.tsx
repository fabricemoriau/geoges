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
  Trash2,
  Briefcase,
  Award,
  Download,
  Building,
  MapPin,
  CheckCircle2,
  Cpu,
  Layers
} from "lucide-react";
import { GeneratedLetter, JobOfferItem, TailoredResume, ConsultedAI } from "../types";
import { initialJobOffers, initialTailoredResumes } from "../data/initialData";
import { getApiUrl } from "../utils/api";

interface LettersTabProps {
  onSaveAsNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onSendAsEmail?: (subject: string, body: string, recipient: string) => void;
}

export const LettersTab: React.FC<LettersTabProps> = ({
  onSaveAsNote,
  onSendAsEmail,
}) => {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState<"letters" | "jobsearch" | "cv" | "multi_ai">("letters");

  // Rédacteur de Courrier State
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

  // Job Search State
  const [jobOffers, setJobOffers] = useState<JobOfferItem[]>(initialJobOffers);
  const [selectedJob, setSelectedJob] = useState<JobOfferItem | null>(jobOffers[0] || null);

  // Tailored Resume State
  const [resumes, setResumes] = useState<TailoredResume[]>(initialTailoredResumes);
  const [selectedResume, setSelectedResume] = useState<TailoredResume | null>(resumes[0] || null);
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);

  // Multi-AI Free Consensus State
  const [isConsultingMultiAI, setIsConsultingMultiAI] = useState(false);
  const [multiAIConsensus, setMultiAIConsensus] = useState<{ synthesis: string; consultedAIs: ConsultedAI[] } | null>(null);

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
        title: "Lettre de Motivation - Responsable Sécurité",
        dateLocation: "Paris, le " + new Date().toLocaleDateString("fr-FR"),
        senderBlock: "Fabrice Moriau\nfrancemaisonsecurite@gmail.com",
        recipientBlock: "Securitas & Protection Pro\nDirection des Ressources Humaines",
        subject: "Objet : Candidature au poste de Responsable Sécurité & Systèmes de Surveillance",
        salutation: "Madame, Monsieur le Directeur,",
        bodyParagraphs: [
          "Fort d'une solide expérience terrain en tant que Responsable Technique de France Maison Sécurité et professionnel de santé sanitaire, je vous adresse ma candidature pour le poste de Responsable Sécurité.",
          "Mon expertise éprouvée dans l'installation de centrales alarme, caméras IP 4K et gestion automatisée des dossiers clients via l'agent IA Georges constitue un atout majeur pour optimiser vos opérations.",
          "Disponible immédiatement, je serais ravi de vous rencontrer lors d'un entretien afin de vous exposer mes motivations.",
        ],
        valediction: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
        signature: "Fabrice Moriau",
        fullText: `Fabrice Moriau\nfrancemaisonsecurite@gmail.com\n\nÀ l'attention de :\nSecuritas & Protection Pro\nDirection des Ressources Humaines\n\nParis, le ${new Date().toLocaleDateString("fr-FR")}\n\nObjet : Candidature au poste de Responsable Sécurité & Systèmes de Surveillance\n\nMadame, Monsieur le Directeur,\n\nFort d'une solide expérience terrain en tant que Responsable Technique de France Maison Sécurité et professionnel de santé sanitaire, je vous adresse ma candidature pour le poste de Responsable Sécurité.\n\nMon expertise éprouvée dans l'installation de centrales alarme, caméras IP 4K et gestion automatisée des dossiers clients via l'agent IA Georges constitue un atout majeur pour optimiser vos opérations.\n\nDisponible immédiatement, je serais ravi de vous rencontrer lors d'un entretien afin de vous exposer mes motivations.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\nFabrice Moriau`,
        georgesAdvice: "Conseil de Georges : CV adapté joint, score de correspondance de 96%.",
        createdAt: new Date().toISOString().split("T")[0],
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
      const res = await fetch(getApiUrl("/api/letter/generate"), {
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

  // Generate Tailored CV for selected job offer
  const handleGenerateTailoredCV = (job: JobOfferItem) => {
    setIsGeneratingCV(true);
    setTimeout(() => {
      const newCV: TailoredResume = {
        id: `cv-${Date.now()}`,
        title: `CV Optimisé ATS - ${job.title}`,
        targetJobTitle: job.title,
        profileSummary: `Expert confirmé combinant 5+ ans de direction d'installations en sécurité privée (France Maison Sécurité) et régulation sanitaire d'urgence. Candidat directement opérationnel pour ${job.company}.`,
        keySkills: job.keyRequirements,
        experiences: [
          {
            role: "Responsable Technique & Installations",
            company: "France Maison Sécurité",
            duration: "2021 - Présent",
            description: "Direction opérationnelle et suivi automatisé de dossiers de télésurveillance et alarme.",
            bulletPoints: [
              "Supervision globale de 150+ installations vidéo IP et contrôle d'accès",
              "Gestion autonome des devis et relations clients via le majordome IA Georges"
            ]
          },
          {
            role: "Ambulancier & Régulation Sanitaire",
            company: "Transport Sanitaire ASSU / SAMU",
            duration: "2018 - Présent",
            description: "Interventions d'urgence et gestion de plannings.",
            bulletPoints: [
              "Gestion des tournées de garde et conception de l'application AmbuGuard Pro"
            ]
          }
        ],
        education: [
          {
            degree: "Diplôme d'État d'Ambulancier (DEA)",
            school: "IFA Santé",
            year: "2018"
          }
        ],
        tailoredForJobId: job.id,
        createdAt: new Date().toLocaleDateString("fr-FR")
      };

      setResumes([newCV, ...resumes]);
      setSelectedResume(newCV);
      setActiveTab("cv");
      setIsGeneratingCV(false);
    }, 1200);
  };

  // Trigger Multi-AI Free Consensus Consultation
  const handleConsultMultiAI = async (queryText: string) => {
    setIsConsultingMultiAI(true);
    try {
      const res = await fetch("/api/chat/multi-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Analyse et valide ma candidature / CV / Lettre : "${queryText}". Donne-moi les conseils pour maximiser le taux de réponse.`,
          activeAiIds: ["gemini-flash", "mistral-7b", "llama-3-3", "deepseek-r1", "qwen-2-5", "duckduckgo-ai"]
        })
      });

      if (!res.ok) throw new Error("Erreur multi-IA");
      const data = await res.json();
      setMultiAIConsensus({
        synthesis: data.synthesis,
        consultedAIs: data.consultedAIs || []
      });
      setActiveTab("multi_ai");
    } catch (err) {
      console.error("Multi-AI consultation error:", err);
    } finally {
      setIsConsultingMultiAI(false);
    }
  };

  const handleCopyText = () => {
    if (!currentLetter) return;
    navigator.clipboard.writeText(currentLetter.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Navigation Banner */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Rédacteur, Emploi & CV Sur-Mesure</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Consensus Multi-IA
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Courriers officiels, recherche d'emploi et CV personnalisés validés par les IA gratuites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("letters")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "letters"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Rédacteur Courrier/Mail
            </button>
            <button
              onClick={() => setActiveTab("jobsearch")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "jobsearch"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Recherche d'Emploi ({jobOffers.length})
            </button>
            <button
              onClick={() => setActiveTab("cv")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "cv"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              CV Sur-Mesure ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab("multi_ai")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "multi_ai"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Consensus Multi-IA Gratuites
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RÉDACTEUR DE COURRIER / MAIL */}
      {activeTab === "letters" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Rédacteur Assisté par Georges
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Que souhaitez-vous rédiger ? *
                  </label>
                  <div className="relative">
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={4}
                      placeholder="Ex: Lettre de motivation pour poste de Responsable Sécurité..."
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-hidden bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={handleToggleDictation}
                      className={`absolute right-3 bottom-3 p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        isDictating ? "bg-rose-500 text-white animate-pulse" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Destinataire</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Ex: Securitas DRH"
                      className="w-full border rounded-xl p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tonalité</label>
                    <input
                      type="text"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full border rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!instructions.trim() || loading}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    instructions.trim() && !loading
                      ? "bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>RÉDACTION PAR GEORGES...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Générer le Document Officiel</span>
                    </>
                  )}
                </button>

                {currentLetter && (
                  <button
                    onClick={() => handleConsultMultiAI(currentLetter.fullText)}
                    disabled={isConsultingMultiAI}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center justify-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>Soumettre au Consensus Multi-IA Gratuites</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Document Preview (7 cols) */}
          <div className="lg:col-span-7">
            {currentLetter ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 text-base">{currentLetter.title}</h3>
                  <span className="text-xs text-slate-400">{currentLetter.createdAt}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs sm:text-sm text-slate-800 whitespace-pre-line font-serif leading-relaxed">
                  {currentLetter.fullText}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCopyText}
                    className="bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copié !" : "Copier le texte"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Rédigez un courrier pour afficher l'aperçu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECHERCHE D'EMPLOI */}
      {activeTab === "jobsearch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Job List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Offres d'Emploi Ciblées sur le Web
              </h3>
              <p className="text-xs text-slate-500">
                Offres correspondant au profil de M. Moriau (Sécurité, Ambulance, Direction).
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {jobOffers.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 cursor-pointer text-xs space-y-2 transition-colors ${
                    selectedJob?.id === job.id ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{job.title}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Match {job.matchScore}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    {job.company} &middot; {job.location} ({job.contractType})
                  </div>

                  <div className="text-[10px] text-slate-400">Publié : {job.postedDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Job Detail & CV Trigger (7 cols) */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full">
                      {selectedJob.contractType}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Rémunération : {selectedJob.salary || "Selon profil"}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-600">
                    Société : <strong>{selectedJob.company}</strong> &middot; Lieu : <strong>{selectedJob.location}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Description du poste</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Compétences clés recherchées</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.keyRequirements.map((req, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleGenerateTailoredCV(selectedJob)}
                    disabled={isGeneratingCV}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Générer le CV Sur-Mesure pour cette offre</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez une offre pour afficher le détail.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CV SUR-MESURE */}
      {activeTab === "cv" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CVs list (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Vos CV Sur-Mesure
              </h3>
              <p className="text-xs text-slate-500">CV optimisés ATS personnalisés par Georges.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {resumes.map((cv) => (
                <div
                  key={cv.id}
                  onClick={() => setSelectedResume(cv)}
                  className={`p-3.5 cursor-pointer text-xs space-y-1 transition-colors ${
                    selectedResume?.id === cv.id ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs">{cv.title}</div>
                  <div className="text-[11px] text-slate-500">{cv.targetJobTitle}</div>
                  <div className="text-[10px] text-slate-400">Créé le : {cv.createdAt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected CV Display (8 cols) */}
          <div className="lg:col-span-8">
            {selectedResume ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedResume.title}</h2>
                    <p className="text-xs text-slate-500">Cible : {selectedResume.targetJobTitle}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                    Format ATS Valide
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Résumé de Profil</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedResume.profileSummary}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Expériences Professionnelles</h4>
                  <div className="space-y-3">
                    {selectedResume.experiences.map((exp, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
                        <div className="font-bold text-xs text-slate-900">{exp.role} - {exp.company}</div>
                        <div className="text-[10px] text-slate-400">{exp.duration}</div>
                        <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                        <ul className="list-disc list-inside text-xs text-slate-700 pt-1 space-y-0.5">
                          {exp.bulletPoints.map((bp, bidx) => (
                            <li key={bidx}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    onClick={() => handleConsultMultiAI(`CV : ${selectedResume.title}\n\nRésumé : ${selectedResume.profileSummary}`)}
                    disabled={isConsultingMultiAI}
                    className="bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Soumettre au Consensus Multi-IA</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez un CV pour l'afficher.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONSENSUS MULTI-IA GRATUITES */}
      {activeTab === "multi_ai" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Consensus & Évaluation des IA Gratuites du Marché
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Validation simultanée de votre candidature par Gemini, Mistral, Llama, DeepSeek, Qwen et DuckDuckGo AI.
            </p>
          </div>

          {multiAIConsensus ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed font-medium">
                <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Synthèse Décisionnelle de Georges
                </div>
                <div className="whitespace-pre-line">{multiAIConsensus.synthesis}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {multiAIConsensus.consultedAIs.map((ai) => (
                  <div key={ai.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{ai.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Score {ai.score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3">{ai.responseReceived}</p>
                    <div className="text-[10px] text-indigo-900 font-semibold bg-indigo-50 p-1.5 rounded">
                      Point fort : {ai.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-3">
              <p>Aucune consultation multi-IA en cours.</p>
              <button
                onClick={() => handleConsultMultiAI("Évalue ma candidature de Responsable Sécurité chez France Maison Sécurité.")}
                className="bg-slate-900 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lancer le Consensus Multi-IA de Démo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
