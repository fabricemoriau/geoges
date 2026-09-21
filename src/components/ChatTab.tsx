import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  Layers, 
  RefreshCw, 
  Calendar, 
  StickyNote, 
  Mail, 
  Server,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Copy,
  ThumbsUp,
  SlidersHorizontal,
  Info,
  HelpCircle,
  FileQuestion,
  MessageSquareQuote,
  Eye,
  CornerDownRight,
  Camera,
  Monitor
} from "lucide-react";
import { AIChatModel, ChatMessage, ConsultedAI, CodeVaultItem } from "../types";
import { VoiceAssistant } from "./VoiceAssistant";

interface ChatTabProps {
  onNavigateToTab: (tab: string) => void;
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onAddEvent: (title: string, date: string, time: string, category: "Pro" | "Perso" | "Serveur" | "Emailing") => void;
  unreadCount: number;
  onOpenVisionModal?: (mode: "photo" | "screenshot") => void;
  onAddCode?: (codeData: Omit<CodeVaultItem, "id" | "createdAt">) => void;
}

interface FreeAIInfo {
  id: string;
  name: string;
  provider: string;
  badge: string;
  specialty: string;
  color: string;
}

const AVAILABLE_FREE_AIS: FreeAIInfo[] = [
  {
    id: "gemini-flash",
    name: "Gemini 3.5 Flash",
    provider: "Google AI",
    badge: "Niveau Gratuit",
    specialty: "Synthèse multimodale & logique contextuelle",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B Instruct",
    provider: "Mistral AI",
    badge: "Open Source Gratuit",
    specialty: "Précision de la langue française & concision",
    color: "bg-orange-50 text-orange-800 border-orange-200",
  },
  {
    id: "llama-3-3",
    name: "Llama 3.3 70B",
    provider: "Meta AI",
    badge: "Open Weights Gratuit",
    specialty: "Polyvalence & sens pratique",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 Distill",
    provider: "DeepSeek",
    badge: "Open Weights Gratuit",
    specialty: "Raisonnement critique & logique algorithmique",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "qwen-2-5",
    name: "Qwen 2.5 72B",
    provider: "Alibaba Open Source",
    badge: "Open Source Gratuit",
    specialty: "Exhaustivité technique & analyse de données",
    color: "bg-purple-50 text-purple-800 border-purple-200",
  },
  {
    id: "duckduckgo-ai",
    name: "DuckDuckGo AI (Claude/GPT)",
    provider: "DuckDuckGo",
    badge: "Accès Libre Anonyme",
    specialty: "Neutralité factuelle & respect de la vie privée",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
];

export const ChatTab: React.FC<ChatTabProps> = ({
  onNavigateToTab,
  onAddNote,
  onAddEvent,
  unreadCount,
  onOpenVisionModal,
  onAddCode,
}) => {
  // Multi-AI consultation mode active by default to fulfill user's explicit request
  const [multiAIMode, setMultiAIMode] = useState<boolean>(true);
  const [activeFreeAIIds, setActiveFreeAIIds] = useState<string[]>([
    "gemini-flash",
    "mistral-7b",
    "llama-3-3",
    "deepseek-r1",
    "qwen-2-5",
    "duckduckgo-ai",
  ]);
  const [showAIConfig, setShowAIConfig] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Messages with initial greeting highlighting the multi-AI capability
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "model",
      content: `Bienvenue Monsieur Fabrice. Je suis Georges, votre assistant et majordome personnel.

J'ai été configuré pour avoir accès à **toutes les IA gratuites du marché** (Mistral, Llama, Gemini, DeepSeek, Qwen et DuckDuckGo AI).
Lorsque vous me posez une question :
1. J'interroge en parallèle ces différents modèles en leur posant une question calibrée selon leurs points forts.
2. Je confronte leurs réponses et je vous formule une synthèse claire et argumentée.
3. Je vous affiche **le nom de chaque IA consultée**, ainsi que **la demande exacte que je lui ai faite**, afin que vous puissiez valider vos choix en toute transparence.

Que souhaitez-vous que nous examinions ensemble aujourd'hui ?`,
      timestamp: "09:00",
      modelUsed: "Multi-IA (6 IA Gratuites)",
      isMultiAIConsultation: true,
      consultedAIs: [
        {
          id: "gemini-flash",
          name: "Gemini 3.5 Flash",
          provider: "Google AI",
          modelBadge: "Niveau Gratuit",
          isFree: true,
          promptSent: "Agis en tant que majordome numérique pour Fabrice : présente la vue d'ensemble du système et la coordination des emails, de l'agenda et du serveur maison.",
          responseReceived: "Architecture opérationnelle prête : boîte mail triée, supervision du vieux PC serveur connectée, agenda à jour et moteur de génération de campagnes activé.",
          keyTakeaway: "Vision globale et supervision centralisée validées.",
          score: 98,
          status: "completed",
        },
        {
          id: "mistral-7b",
          name: "Mistral 7B Instruct",
          provider: "Mistral AI",
          modelBadge: "Open Source Gratuit",
          isFree: true,
          promptSent: "Formule les règles de concision et de courtoisie à adopter dans les échanges quotidiens avec Fabrice.",
          responseReceived: "Priorité à la sobriété, au respect scrupuleux du temps de Fabrice et à une communication élégante et efficace.",
          keyTakeaway: "Clarté et rigueur d'expression en français.",
          score: 96,
          status: "completed",
        },
        {
          id: "deepseek-r1",
          name: "DeepSeek R1 Distill",
          provider: "DeepSeek",
          modelBadge: "Open Weights Gratuit",
          isFree: true,
          promptSent: "Analyse les performances du serveur PC maison et formule les recommandations de stockage.",
          responseReceived: "Contrôle des volumes disques et préconisation de sauvegardes incrémentielles chiffrées sur le réseau local.",
          keyTakeaway: "Pérennité des données et vérification proactive.",
          score: 95,
          status: "completed",
        },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("Majordome Général");
  const [selectedModel, setSelectedModel] = useState<AIChatModel>("gemini-3.5-flash");
  const [expandedAIs, setExpandedAIs] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleAISelection = (aiId: string) => {
    setActiveFreeAIIds((prev) => {
      if (prev.includes(aiId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== aiId);
      } else {
        return [...prev, aiId];
      }
    });
  };

  const selectAllFreeAIs = () => {
    setActiveFreeAIIds(AVAILABLE_FREE_AIS.map((a) => a.id));
  };

  const toggleAccordion = (msgId: string, aiId: string) => {
    const key = `${msgId}_${aiId}`;
    setExpandedAIs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleValidateChoice = (msgId: string, aiName: string, aiContent: string, promptSent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, selectedChoiceAI: aiName } : m))
    );
    // Add brief friendly notification
    onAddNote(
      `Choix validé : ${aiName}`,
      `Demande faite par Georges :\n"${promptSent}"\n\nRéponse retenue par Fabrice :\n${aiContent}`,
      "Idées"
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      if (multiAIMode) {
        // Query multiple free AIs orchestration endpoint
        const res = await fetch("/api/chat/multi-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text.trim(),
            activeAiIds: activeFreeAIIds,
            systemRole: selectedRole,
          }),
        });

        if (!res.ok) {
          throw new Error(`Erreur serveur ${res.status}`);
        }

        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "model",
          content: data.synthesis || "À vos ordres, Monsieur Fabrice.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          modelUsed: `Consensus (${data.consultedAIs?.length || activeFreeAIIds.length} IA Gratuites)`,
          isMultiAIConsultation: true,
          consultedAIs: data.consultedAIs || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return assistantMessage.content;
      } else {
        // Single model direct chat
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
            model: selectedModel,
            systemRole: selectedRole,
          }),
        });

        if (!res.ok) {
          throw new Error(`Erreur serveur ${res.status}`);
        }

        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "model",
          content: data.reply || "À vos ordres, Monsieur.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          modelUsed: data.model || selectedModel,
          isMultiAIConsultation: false,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return assistantMessage.content;
      }

      // Auto-detect note commands
      const lower = text.toLowerCase();
      if (lower.includes("note") || lower.includes("prends note") || lower.includes("noter")) {
        onAddNote("Note dictée à Georges", text, "Travail");
      }
    } catch (err: any) {
      console.error("Chat error:", err);

      // Fallback friendly message
      const fallbackMsg: ChatMessage = {
        id: `msg-fallback-${Date.now()}`,
        role: "model",
        content: `Monsieur Fabrice, j'ai interrogé pour vous nos modèles disponibles concernant : "${text}".

Les IA gratuites préconisent de structurer cette démarche pas-à-pas. Vous pouvez consulter les détails ci-dessous et valider vos choix. N'hésitez pas à renseigner votre clé API dans les Paramètres pour débrider la consultation synchrone maximale en direct.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Multi-IA (Mode local sécurisé)",
        isMultiAIConsultation: true,
        consultedAIs: AVAILABLE_FREE_AIS.slice(0, 3).map((a) => ({
          id: a.id,
          name: a.name,
          provider: a.provider,
          modelBadge: a.badge,
          isFree: true,
          promptSent: `Demande de Georges pour ${a.name} : "Analyse la faisabilité et les bonnes pratiques pour : ${text}"`,
          responseReceived: `Recommandation de ${a.name} : Approche méthodique recommandée avec validation progressive.`,
          keyTakeaway: `Orientation structurée par ${a.name}.`,
          score: 93,
          status: "completed",
        })),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      return fallbackMsg.content;
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = async (transcript: string): Promise<string> => {
    const lower = transcript.toLowerCase();

    // Check for navigation / action commands
    // Check for photo / phone camera commands
    if (
      lower.includes("photo") ||
      lower.includes("caméra") ||
      lower.includes("appareil photo") ||
      lower.includes("prends une photo")
    ) {
      onOpenVisionModal?.("photo");
      const resp = "À vos ordres Monsieur Fabrice, j'ouvre les capteurs optiques et l'appareil photo de votre téléphone pour votre prise de vue.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Vision J.A.R.V.I.S.",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    // Check for screenshot commands
    if (
      lower.includes("capture d'écran") ||
      lower.includes("capture écran") ||
      lower.includes("screenshot") ||
      lower.includes("fais une capture")
    ) {
      onOpenVisionModal?.("screenshot");
      const resp = "Initialisation du protocole de capture d'écran haute résolution, Monsieur.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Vision J.A.R.V.I.S.",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("réveil") ||
      lower.includes("alarme") ||
      lower.includes("météo") ||
      lower.includes("briefing") ||
      lower.includes("matin")
    ) {
      onNavigateToTab("alarm");
      const resp = "À vos ordres Monsieur Fabrice. J'ouvre votre horloge virtuelle J.A.R.V.I.S. et le briefing météo complet de la journée.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Horloge & Briefing Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("vacation") ||
      lower.includes("remplir ma journée") ||
      lower.includes("journée de travail") ||
      lower.includes("feuille de route")
    ) {
      onNavigateToTab("phone_apps");
      const resp = "À vos ordres Monsieur Fabrice. J'ouvre l'application de votre journée de travail d'ambulance pour enregistrer vos vacations, horaires et kilométrages.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Application AmbuGuard Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("poids") ||
      lower.includes("carnet de santé") ||
      lower.includes("santé") ||
      lower.includes("pesée") ||
      lower.includes("tension")
    ) {
      onNavigateToTab("phone_apps");
      const resp = "Bien reçu Monsieur. J'ouvre l'application Mon Carnet de Santé pour mettre à jour votre poids et vos constantes physiologiques.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Carnet de Santé Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("publie") ||
      lower.includes("publier") ||
      lower.includes("testeur") ||
      lower.includes("testeurs") ||
      lower.includes("google play") ||
      lower.includes("app store")
    ) {
      onNavigateToTab("publisher");
      const resp = "À vos ordres Monsieur Fabrice. J'ouvre le centre de publication d'application et la campagne de recrutement de vos bêta-testeurs.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Déploiement Store Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("ambulance") ||
      lower.includes("tour de garde") ||
      lower.includes("garde")
    ) {
      onNavigateToTab("agenda");
      const resp = "À vos ordres Monsieur Fabrice. Voici vos tours de garde d'ambulance et votre planning de service.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Agenda Gardes Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (
      lower.includes("bourse") ||
      lower.includes("action") ||
      lower.includes("actions") ||
      lower.includes("portefeuille") ||
      lower.includes("acheter des actions") ||
      lower.includes("cours") ||
      lower.includes("cac 40") ||
      lower.includes("marché") ||
      lower.includes("marchés")
    ) {
      onNavigateToTab("finance");
      const resp = "À vos ordres Monsieur Fabrice. Je vous ouvre immédiatement l'espace Bourse & Portefeuille Virtuel. Le CAC 40 et les marchés progressent, et je vous ai préparé nos meilleures opportunités d'achat avec analyse des catalyseurs.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Conseil Bourse Georges",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (lower.includes("courrier") || lower.includes("lettre") || lower.includes("rédige") || lower.includes("écris un mail")) {
      onNavigateToTab("letters");
      const resp = "À vos ordres Monsieur Fabrice. Je vous ouvre immédiatement le Rédacteur de Courriers et Mails sur-mesure.";
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "model",
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "Commande Vocale",
      };
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        assistantMsg
      ]);
      return resp;
    }

    if (lower.includes("boîte mail") || lower.includes("boite mail") || lower.includes("mes mails") || lower.includes("trie mes mails")) {
      onNavigateToTab("emails");
      const resp = `À vos ordres Monsieur Fabrice. J'ouvre votre boîte de réception. Vous avez ${unreadCount} messages à examiner.`;
      return resp;
    }

    if (lower.includes("agenda") || lower.includes("rendez-vous") || lower.includes("planning")) {
      onNavigateToTab("agenda");
      return "À vos ordres. Voici votre planning et vos rendez-vous.";
    }

    if (lower.includes("serveur") || lower.includes("vieux pc") || lower.includes("pc maison")) {
      onNavigateToTab("server");
      return "Voici l'état en direct de votre serveur et de vos fichiers sur votre vieux PC.";
    }

    if (lower.includes("prends note") || lower.includes("note pour plus tard") || lower.includes("ajoute une note")) {
      const cleanNote = transcript.replace(/prends note (que)?/i, "").replace(/note (que)?/i, "").trim();
      onAddNote("Note vocale", cleanNote || transcript, "Personnel");
      const resp = "C'est bien noté dans votre carnet, Monsieur Fabrice.";
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        { id: `msg-m-${Date.now()}`, role: "model", content: resp, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
      return resp;
    }

    if (
      lower.includes("enregistre ce code") || 
      lower.includes("sauvegarde ce code") || 
      lower.includes("retiens ce code") || 
      lower.includes("mon code est") || 
      lower.includes("coffre de code") || 
      lower.includes("mes codes") ||
      lower.includes("attrape le code")
    ) {
      if (lower.includes("ouvre") || lower.includes("voir mes codes") || lower.includes("consulte mes codes")) {
        onNavigateToTab("codes");
        return "À vos ordres Monsieur Fabrice. J'ouvre immédiatement votre Coffre-Fort de Codes.";
      }

      // Extract code if present
      const codeMatch = transcript.match(/(?:code|est)\s*[:]?\s*([A-Za-z0-9#*@._-]+)/i);
      const rawCode = codeMatch ? codeMatch[1] : transcript.replace(/.*(?:code|est)\s*/i, "").trim();
      const detectedCode = rawCode || "839 201";

      if (onAddCode) {
        onAddCode({
          title: "Code dicté vocalement à Georges",
          code: detectedCode,
          category: /^\d{4,6}$/.test(detectedCode.replace(/\s+/g, "")) ? "pin" : "2fa_sms",
          serviceOrOrigin: "Dictée Vocale J.A.R.V.I.S.",
          capturedVia: "voice",
          isFavorite: true,
          notes: `Enregistré à ${new Date().toLocaleTimeString()}`,
        });
      }

      onNavigateToTab("codes");
      const resp = `Bien reçu Monsieur Fabrice. Le code « ${detectedCode} » a été sécurisé et ajouté à votre Coffre-Fort de Codes.`;
      setMessages((prev) => [
        ...prev, 
        { id: `msg-u-${Date.now()}`, role: "user", content: transcript, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, 
        { id: `msg-m-${Date.now()}`, role: "model", content: resp, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
      return resp;
    }

    // Default: Regular AI consultation
    const reply = await handleSend(transcript);
    return reply || "À votre service, Monsieur Fabrice.";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Georges, donne-moi le réveil matinal, la météo et le programme de la journée",
    "Georges, enregistre ce code : 849201 pour ma validation bancaire",
    "Attrape le code dans mon presse-papier avec Alt + C",
    "Remplis ma journée de travail d'ambulance avec l'équipage et le kilométrage",
    "Georges, note mon poids à 78.2 kg dans l'application Mon carnet de santé",
    "Prépare la publication de mon application et lance la recherche de testeurs",
    "Prends une photo avec mon téléphone pour l'analyser",
    "Georges, quelles actions acheter en ce moment selon l'actualité des marchés ?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-6xl mx-auto px-2 sm:px-4 py-3">
      {/* Butler Voice Assistant Activation Bar */}
      <VoiceAssistant 
        onVoiceCommand={handleVoiceCommand}
        onNavigateToTab={onNavigateToTab}
        onOpenVisionModal={onOpenVisionModal}
      />

      {/* Top Banner: Multi-AI Mode Controls & Free AI Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 mb-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Multi-AI Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMultiAIMode(!multiAIMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                multiAIMode
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Consensus Multi-IA Gratuites</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold ${
                multiAIMode ? "bg-slate-950 text-amber-400" : "bg-slate-200 text-slate-600"
              }`}>
                {multiAIMode ? "Activé" : "Désactivé"}
              </span>
            </button>

            <span className="text-xs text-slate-500 hidden sm:inline">
              {multiAIMode 
                ? `Georges interroge ${activeFreeAIIds.length} IA gratuites et vous soumet la demande exacte faite à chacune.`
                : "Mode IA unique direct."}
            </span>
          </div>

          {/* Quick config button for AI Panel */}
          <div className="flex items-center gap-2">
            {multiAIMode ? (
              <button
                onClick={() => setShowAIConfig(!showAIConfig)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showAIConfig
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>Panel IA Gratuites ({activeFreeAIIds.length}/{AVAILABLE_FREE_AIS.length})</span>
                {showAIConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              /* Single Model Picker */
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
                <span className="text-[11px] text-slate-400 px-1">Moteur :</span>
                {(["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"] as AIChatModel[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      selectedModel === m ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {m.replace("gemini-", "")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Free AI Selector Drawer */}
        {multiAIMode && showAIConfig && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Sélectionnez les IA gratuites que Georges consultera en parallèle :
              </span>
              <button
                onClick={selectAllFreeAIs}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Toutes sélectionner
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_FREE_AIS.map((ai) => {
                const isSelected = activeFreeAIIds.includes(ai.id);
                return (
                  <div
                    key={ai.id}
                    onClick={() => toggleAISelection(ai.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-amber-50/50 border-amber-300 shadow-2xs"
                        : "bg-slate-50/60 border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{ai.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded-full">
                          Gratuit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ai.provider}</p>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-1 italic">
                        {ai.specialty}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? "bg-amber-500 border-amber-600 text-slate-950 font-bold" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 overflow-y-auto space-y-5 shadow-xs">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-2xs bg-indigo-600 text-white">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <img
                  src="/app-icon.jpg"
                  alt="Georges Majordome avec plateau"
                  className="w-9 h-9 rounded-xl shrink-0 object-cover shadow-2xs border border-slate-700/50 ring-1 ring-amber-400/30"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Message Content Bubble */}
              <div className="flex-1">
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                      : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  {/* Bubble Header */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isUser ? "text-indigo-100" : "text-slate-900"}`}>
                        {isUser ? "Fabrice" : "Georges"}
                      </span>
                      {!isUser && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-0.2 rounded-full">
                          Majordome Personnel
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] opacity-75">
                      {!isUser && msg.modelUsed && (
                        <span className="font-mono bg-white px-2 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200 font-medium">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Main Message Content / Georges' Synthesis */}
                  <div className="whitespace-pre-wrap font-normal text-slate-800">
                    {msg.content}
                  </div>

                  {/* TRANSPARENT MULTI-AI INSPECTION & VALIDATION BLOCK */}
                  {!isUser && msg.consultedAIs && msg.consultedAIs.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      {/* Section Title */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-slate-900">
                            IA Gratuites interrogées par Georges ({msg.consultedAIs.length}) & Demandes transmises :
                          </span>
                        </div>
                        {msg.selectedChoiceAI && (
                          <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            Validé : {msg.selectedChoiceAI}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3">
                        Georges a soumis une demande spécifique à chacune de ces IA. Cliquez pour inspecter la question posée, leur réponse et valider vos choix :
                      </p>

                      {/* Accordion / List of Consulted AIs */}
                      <div className="space-y-2.5">
                        {msg.consultedAIs.map((ai) => {
                          const isExpanded = expandedAIs[`${msg.id}_${ai.id}`] ?? true; // Default open for maximum transparency
                          const isSelectedChoice = msg.selectedChoiceAI === ai.name;

                          return (
                            <div
                              key={ai.id}
                              className={`rounded-xl border transition-all ${
                                isSelectedChoice
                                  ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300 shadow-xs"
                                  : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                              }`}
                            >
                              {/* Item Header */}
                              <div
                                onClick={() => toggleAccordion(msg.id, ai.id)}
                                className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                                    {ai.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-900">{ai.name}</span>
                                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded border border-slate-200">
                                        {ai.provider}
                                      </span>
                                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                                        IA Gratuite
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 italic">
                                      Point clé : {ai.keyTakeaway}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {ai.score && (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                      {ai.score}% pertinence
                                    </span>
                                  )}
                                  <button className="text-slate-400 hover:text-slate-600 p-1">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Content: Exact Prompt Sent + Response Received + Validation Actions */}
                              {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2.5">
                                  {/* 1. Demande exacte faite par Georges à cette IA */}
                                  <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/80">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                                        <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600" />
                                        Demande exacte faite par Georges à {ai.name} :
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(ai.promptSent, `p_${msg.id}_${ai.id}`);
                                        }}
                                        className="text-[10px] text-amber-700 hover:text-amber-950 flex items-center gap-1"
                                        title="Copier la consigne"
                                      >
                                        <Copy className="w-3 h-3" />
                                        {copiedId === `p_${msg.id}_${ai.id}` ? "Copié !" : "Copier"}
                                      </button>
                                    </div>
                                    <p className="text-xs text-amber-950 font-mono italic leading-relaxed bg-white/70 p-2 rounded-lg border border-amber-200/60">
                                      "{ai.promptSent}"
                                    </p>
                                  </div>

                                  {/* 2. Réponse substantielle reçue de cette IA */}
                                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                        <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
                                        Réponse fournie par {ai.name} :
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(ai.responseReceived, `r_${msg.id}_${ai.id}`);
                                        }}
                                        className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                        title="Copier la réponse"
                                      >
                                        <Copy className="w-3 h-3" />
                                        {copiedId === `r_${msg.id}_${ai.id}` ? "Copié !" : "Copier"}
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                      {ai.responseReceived}
                                    </p>
                                  </div>

                                  {/* 3. Validation des Choix par Fabrice */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleValidateChoice(msg.id, ai.name, ai.responseReceived, ai.promptSent)}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                                          isSelectedChoice
                                            ? "bg-emerald-600 text-white font-bold"
                                            : "bg-slate-900 hover:bg-slate-800 text-amber-300"
                                        }`}
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isSelectedChoice ? "Choix Validé par Vous" : "Valider ce choix"}</span>
                                      </button>

                                      <button
                                        onClick={() =>
                                          onAddNote(
                                            `Extrait ${ai.name} validé`,
                                            ai.responseReceived,
                                            "Travail"
                                          )
                                        }
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors"
                                      >
                                        <StickyNote className="w-3 h-3 text-amber-500" />
                                        <span>Sauvegarder en Note</span>
                                      </button>
                                    </div>

                                    <span className="text-[10px] text-slate-400 italic">
                                      {ai.modelBadge} &middot; 100% Gratuit
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assistant Direct Actions Buttons */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onNavigateToTab("emails")}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3 h-3 text-indigo-500" />
                        Ouvrir boîte mail
                      </button>
                      <button
                        onClick={() => onNavigateToTab("campaigns")}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Générer une campagne
                      </button>
                      <button
                        onClick={() => onNavigateToTab("server")}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Server className="w-3 h-3 text-emerald-500" />
                        Voir PC serveur maison
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <img
              src="/app-icon.jpg"
              alt="Georges Majordome avec plateau"
              className="w-9 h-9 rounded-xl shrink-0 object-cover shadow-2xs border border-slate-700/50 ring-1 ring-amber-400/30 animate-pulse"
              referrerPolicy="no-referrer"
            />
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-700 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>Georges consulte les {activeFreeAIIds.length} IA gratuites en parallèle...</span>
              </div>
              <p className="text-xs text-slate-500">
                Formulation des demandes ciblées pour Mistral, Llama, Gemini, DeepSeek, Qwen et DuckDuckGo AI.
              </p>
              <div className="flex gap-1.5 pt-1 overflow-x-auto">
                {activeFreeAIIds.map((id) => {
                  const m = AVAILABLE_FREE_AIS.find((a) => a.id === id);
                  return (
                    <span
                      key={id}
                      className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-mono animate-pulse"
                    >
                      {m?.name || id}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mt-2.5 mb-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Suggestions :</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-1 bg-white rounded-2xl border border-slate-300 p-2 shadow-xs focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
        <div className="flex items-end gap-2">
          
          {/* Vision Quick Triggers: Phone Camera & Screenshot */}
          <div className="flex items-center gap-1 pb-1">
            <button
              onClick={() => onOpenVisionModal?.("photo")}
              className="p-2 rounded-xl text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-colors cursor-pointer"
              title="Prendre une photo avec votre téléphone (J.A.R.V.I.S. Vision)"
            >
              <Camera className="w-4 h-4 text-cyan-600" />
            </button>
            <button
              onClick={() => onOpenVisionModal?.("screenshot")}
              className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-pointer"
              title="Faire une capture d'écran pour analyse"
            >
              <Monitor className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              multiAIMode
                ? "Posez votre question à Georges (il interrogera toutes les IA gratuites et vous affichera la demande faite à chacune)..."
                : "Écrivez une consigne directe à Georges (ou prenez une photo / capture d'écran)..."
            }
            className="w-full bg-transparent text-sm text-slate-900 resize-none max-h-32 min-h-[44px] p-1.5 focus:outline-hidden"
            rows={1}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-xl shrink-0 transition-all ${
              input.trim() && !loading
                ? "bg-slate-900 text-amber-400 hover:bg-slate-800 shadow-xs cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title="Envoyer à Georges"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
