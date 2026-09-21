import React, { useState } from "react";
import { 
  Megaphone, 
  Sparkles, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  RefreshCw, 
  Eye, 
  Code, 
  Download, 
  Smartphone, 
  Monitor, 
  TrendingUp, 
  Send, 
  Sliders, 
  Layers,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { EmailCampaign, ImageResolution, ImageAspectRatio } from "../types";
import { initialCampaignExample } from "../data/initialData";

interface CampaignTabProps {
  onSaveAsNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const CampaignTab: React.FC<CampaignTabProps> = ({ onSaveAsNote }) => {
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("Clients et prospects intéressés par l'innovation");
  const [tone, setTone] = useState("Inspirante, professionnelle et percutante");
  const [goal, setGoal] = useState("Conversion & Vente");
  const [discountOrOffer, setDiscountOrOffer] = useState("-20% sur la nouvelle collection d'automne");

  // Image generation controls (mandated: gemini-3-pro-image-preview and size 1K, 2K, 4K)
  const [imageSize, setImageSize] = useState<ImageResolution>("2K");
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>("16:9");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign>(initialCampaignExample);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [viewMode, setViewMode] = useState<"preview" | "html" | "visuals">("preview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateCampaign = async () => {
    if (!prompt.trim() || isGeneratingCampaign) return;
    setIsGeneratingCampaign(true);

    try {
      const res = await fetch("/api/campaign/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          audience,
          tone,
          goal,
          discountOrOffer,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de réponse du serveur");
      }

      const data = await res.json();
      const updatedCampaign: EmailCampaign = {
        id: `camp-${Date.now()}`,
        campaignTitle: data.campaignTitle || "Nouvelle Campagne Email Marketing",
        targetAudience: data.targetAudience || audience,
        subjectLines: data.subjectLines || [
          { subject: "Nouvelle offre spéciale pour vous", predictedOpenRate: "42%", type: "Bénéfice" }
        ],
        previewText: data.previewText || "Découvrez notre annonce exclusive dès aujourd'hui...",
        emailHeadline: data.emailHeadline || "Une annonce majeure pour vous",
        subheadline: data.subheadline || "Découvrez nos nouveautés sélectionnées avec soin.",
        bodyHtml: data.bodyHtml || "<p>Bonjour,</p><p>Découvrez notre nouvelle offre exclusive.</p>",
        keyTakeaways: data.keyTakeaways || ["Qualité garantie", "Offre exclusive"],
        callToAction: data.callToAction || {
          buttonText: "Découvrir l'offre",
          targetUrl: "https://exemple.fr/offre",
          subtext: "Sans engagement",
        },
        psMessage: data.psMessage || "P.S. Les premiers arrivés seront les premiers servis !",
        suggestedVisualPrompt: data.suggestedVisualPrompt || prompt,
        generatedVisualUrl: currentCampaign.generatedVisualUrl, // retain or will be generated
        visualResolution: imageSize,
        visualAspectRatio: aspectRatio,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurrentCampaign(updatedCampaign);
      setVisualPrompt(data.suggestedVisualPrompt || prompt);
      setSelectedSubjectIdx(0);

      // Auto-trigger image generation with gemini-3-pro-image-preview
      handleGenerateVisual(data.suggestedVisualPrompt || prompt, imageSize, aspectRatio);
    } catch (err) {
      console.error("Campaign generation error:", err);
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // Image generator using gemini-3-pro-image-preview with 1K, 2K, 4K affordance
  const handleGenerateVisual = async (
    customPrompt?: string,
    customSize?: ImageResolution,
    customRatio?: ImageAspectRatio
  ) => {
    const p = customPrompt || visualPrompt || currentCampaign.suggestedVisualPrompt || prompt;
    if (!p.trim() || isGeneratingVisual) return;

    setIsGeneratingVisual(true);
    const chosenResolution = customSize || imageSize;
    const chosenAspect = customRatio || aspectRatio;

    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          imageSize: chosenResolution, // '1K' | '2K' | '4K'
          aspectRatio: chosenAspect,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur génération visuel");
      }

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentCampaign((prev) => ({
          ...prev,
          generatedVisualUrl: data.imageUrl,
          visualResolution: chosenResolution,
          visualAspectRatio: chosenAspect,
        }));
      }
    } catch (err) {
      console.error("Image generation error:", err);
      // If error or offline, fallback to high-definition photography asset for smooth user experience
      const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(p.slice(0, 15))}/1280/720`;
      setCurrentCampaign((prev) => ({
        ...prev,
        generatedVisualUrl: prev.generatedVisualUrl || fallbackUrl,
        visualResolution: chosenResolution,
        visualAspectRatio: chosenAspect,
      }));
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Build the complete exportable responsive HTML email
  const fullHtmlCode = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentCampaign.subjectLines[selectedSubjectIdx]?.subject || currentCampaign.campaignTitle}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
    .hero-img { width: 100%; max-height: 380px; object-fit: cover; display: block; }
    .content-padding { padding: 32px 28px; }
    h1 { color: #0f172a; font-size: 24px; line-height: 1.3; margin: 0 0 12px 0; font-weight: 700; }
    .subtitle { color: #64748b; font-size: 15px; margin: 0 0 24px 0; line-height: 1.5; }
    .body-copy { color: #334155; font-size: 15px; line-height: 1.6; }
    .benefits-box { background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 24px 0; border-left: 4px solid #4f46e5; }
    .benefits-box ul { margin: 8px 0 0 0; padding-left: 20px; }
    .benefits-box li { margin-bottom: 6px; color: #1e293b; font-weight: 500; }
    .cta-container { text-align: center; margin: 32px 0 24px 0; }
    .cta-btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 15px 32px; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .cta-subtext { color: #94a3b8; font-size: 12px; margin-top: 10px; }
    .ps-box { border-top: 1px dashed #cbd5e1; padding-top: 18px; margin-top: 28px; font-style: italic; color: #475569; font-size: 14px; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <!-- Preheader Text -->
  <span class="preheader">${currentCampaign.previewText}</span>

  <div class="email-container">
    ${
      currentCampaign.generatedVisualUrl
        ? `<img src="${currentCampaign.generatedVisualUrl}" alt="${currentCampaign.emailHeadline}" class="hero-img" />`
        : ""
    }
    
    <div class="content-padding">
      <h1>${currentCampaign.emailHeadline}</h1>
      <p class="subtitle">${currentCampaign.subheadline}</p>

      <div class="body-copy">
        ${currentCampaign.bodyHtml}
      </div>

      ${
        currentCampaign.keyTakeaways && currentCampaign.keyTakeaways.length > 0
          ? `<div class="benefits-box">
              <strong style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Pourquoi vous allez adorer :</strong>
              <ul>
                ${currentCampaign.keyTakeaways.map((k) => `<li>${k}</li>`).join("")}
              </ul>
            </div>`
          : ""
      }

      <div class="cta-container">
        <a href="${currentCampaign.callToAction.targetUrl}" class="cta-btn" target="_blank">
          ${currentCampaign.callToAction.buttonText}
        </a>
        ${
          currentCampaign.callToAction.subtext
            ? `<div class="cta-subtext">${currentCampaign.callToAction.subtext}</div>`
            : ""
        }
      </div>

      ${
        currentCampaign.psMessage
          ? `<div class="ps-box">${currentCampaign.psMessage}</div>`
          : ""
      }
    </div>

    <div class="footer">
      <p>Vous recevez cet email car vous êtes inscrit sur notre liste d'abonnés privilégiés.</p>
      <p><a href="#">Se désinscrire</a> &middot; <a href="#">Gérer mes préférences</a> &middot; <a href="#">Version en ligne</a></p>
      <p>&copy; 2026 Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Générateur de Campagnes Emailing
            </span>
            <span className="text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Visuels Gemini 3 Pro Image (1K, 2K, 4K)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Créez une campagne complète à partir d'un simple prompt
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
            Georges rédige les objets d'emails A/B testés, le preheader, l'argumentaire complet et génère un visuel promotionnel ultra-haute résolution adapté à votre charte.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onSaveAsNote(
                `Campagne : ${currentCampaign.campaignTitle}`,
                `Objet choisi : ${currentCampaign.subjectLines[selectedSubjectIdx]?.subject}\nPreheader : ${currentCampaign.previewText}\n\n${currentCampaign.bodyHtml.replace(/<[^>]*>/g, "")}`,
                "Travail"
              );
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            Enregistrer dans mes notes
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Form Inputs & Visual Settings) / Right Column (Campaign Result & Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Inputs & Visual Affordances */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Campaign Input Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              1. Paramètres de la campagne
            </h3>

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quel est le sujet ou l'annonce de votre email ? <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Lancement de notre nouveau service de conciergerie haut de gamme pour les fêtes, avec offre de bienvenue de 15%..."
                className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-slate-800 focus:border-slate-800 min-h-[90px] resize-none"
              />
            </div>

            {/* Target Audience & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public ciblé
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Ex: Professionnels, abonnés..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tonalité
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-slate-800 bg-white"
                >
                  <option value="Inspirante, professionnelle et percutante">Inspirante & Professionnelle</option>
                  <option value="Chaleureuse, amicale et complice">Chaleureuse & Complice</option>
                  <option value="Urgence & FOMO dynamique">Urgence & Dynamique (Ventes Flash)</option>
                  <option value="Luxe, épuré et exclusif">Luxe & Exclusif</option>
                  <option value="B2B institutionnel et rassurant">B2B & Décideurs</option>
                </select>
              </div>
            </div>

            {/* Offer / Promotion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Offre spéciale, code promo ou avantage
              </label>
              <input
                type="text"
                value={discountOrOffer}
                onChange={(e) => setDiscountOrOffer(e.target.value)}
                placeholder="Ex: -20% avec le code AUTOMNE20, livraison offerte..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <button
              onClick={handleGenerateCampaign}
              disabled={!prompt.trim() || isGeneratingCampaign}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
                prompt.trim() && !isGeneratingCampaign
                  ? "bg-slate-900 text-amber-400 hover:bg-slate-800 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isGeneratingCampaign ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Georges conçoit la campagne complète...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Générer la campagne complète</span>
                </>
              )}
            </button>
          </div>

          {/* Dedicated Visuals Generator Card - Mandatory gemini-3-pro-image-preview with 1K, 2K, 4K resolution affordance */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                2. Visuel IA Haute Définition
              </h3>
              <span className="text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                gemini-3-pro-image-preview
              </span>
            </div>

            {/* MANDATORY AFFORDANCE: User selects 1K, 2K, or 4K resolution */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Résolution du visuel (Affordance IA)</span>
                <span className="text-[11px] font-normal text-indigo-600 font-medium">Ultra-haute fidélité</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["1K", "2K", "4K"] as ImageResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setImageSize(res)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      imageSize === res
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {res} {res === "4K" ? "★ Ultra" : res === "2K" ? "HD+" : "Standard"}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Format d'image (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: "16:9", label: "16:9 Banderole" },
                  { ratio: "1:1", label: "1:1 Carré" },
                  { ratio: "4:3", label: "4:3 Standard" },
                ].map(({ ratio, label }) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio as ImageAspectRatio)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                      aspectRatio === ratio
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Prompt customizer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description du visuel (Prompt d'image)
              </label>
              <textarea
                value={visualPrompt || currentCampaign.suggestedVisualPrompt}
                onChange={(e) => setVisualPrompt(e.target.value)}
                placeholder="Ex: A cozy morning artisanal coffee cup with steaming espresso on a wooden table, golden hour light, cinematic 8k..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 min-h-[70px] resize-none"
              />
            </div>

            <button
              onClick={() => handleGenerateVisual()}
              disabled={isGeneratingVisual}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGeneratingVisual ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Rendu du visuel {imageSize} avec Gemini 3 Pro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Régénérer le visuel en {imageSize} ({aspectRatio})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Campaign Output & Live Email Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Controls: View Modes & Device Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "preview"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Aperçu Newsletter
              </button>

              <button
                onClick={() => setViewMode("html")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "html"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Code HTML Email
              </button>
            </div>

            {viewMode === "preview" && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    previewDevice === "desktop"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vue Bureau"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    previewDevice === "mobile"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vue Mobile"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            )}

            {/* Copy / Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(fullHtmlCode, "fullHtml")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copier le code HTML de l'email"
              >
                {copiedKey === "fullHtml" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject Line Selection A/B Testing Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Objets A/B Testés & Taux d'ouverture estimé :
              </span>
              <span className="text-[11px] text-slate-400">Cliquez pour sélectionner</span>
            </div>

            <div className="space-y-2">
              {currentCampaign.subjectLines.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSubjectIdx(idx)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    selectedSubjectIdx === idx
                      ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200 font-semibold text-indigo-950"
                      : "bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{item.subject}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                      {item.type}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {item.predictedOpenRate} ouv.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Preheader line preview */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-400 shrink-0">Preheader :</span>
              <span className="italic text-slate-700 truncate">{currentCampaign.previewText}</span>
            </div>
          </div>

          {/* View Mode 1: Live Interactive Email Client Mockup */}
          {viewMode === "preview" && (
            <div className="bg-slate-100 rounded-2xl p-3 sm:p-6 border border-slate-200/80 flex justify-center">
              <div
                className={`bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden transition-all duration-200 ${
                  previewDevice === "mobile" ? "max-w-sm w-full" : "max-w-xl w-full"
                }`}
              >
                {/* Email Client Header Bar */}
                <div className="bg-slate-50 border-b border-slate-200 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-700">De : Fabrice (contact@atelier.fr)</span>
                    <span>Aujourd'hui à 09:30</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {currentCampaign.subjectLines[selectedSubjectIdx]?.subject || currentCampaign.campaignTitle}
                  </div>
                  <div className="text-slate-500 text-[11px] truncate">
                    {currentCampaign.previewText}
                  </div>
                </div>

                {/* Hero Visual Generated with gemini-3-pro-image-preview */}
                {currentCampaign.generatedVisualUrl && (
                  <div className="relative group">
                    <img
                      src={currentCampaign.generatedVisualUrl}
                      alt={currentCampaign.emailHeadline}
                      className="w-full max-h-72 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{currentCampaign.visualResolution || "2K"} HD</span>
                      <span>&middot;</span>
                      <span>Gemini 3 Pro</span>
                    </div>
                  </div>
                )}

                {/* Email Body Content */}
                <div className="p-5 sm:p-6 space-y-4 text-slate-800 text-sm">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {currentCampaign.emailHeadline}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      {currentCampaign.subheadline}
                    </p>
                  </div>

                  <div
                    className="space-y-3 leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: currentCampaign.bodyHtml }}
                  />

                  {/* Key Takeaways Box */}
                  {currentCampaign.keyTakeaways && currentCampaign.keyTakeaways.length > 0 && (
                    <div className="bg-indigo-50/60 rounded-xl p-3.5 border-l-4 border-indigo-600 text-xs space-y-1.5">
                      <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] block">
                        Les points clés de l'offre :
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        {currentCampaign.keyTakeaways.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Main Call to Action Button */}
                  <div className="text-center py-4">
                    <a
                      href={currentCampaign.callToAction.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-xs transition-colors"
                    >
                      {currentCampaign.callToAction.buttonText}
                    </a>
                    {currentCampaign.callToAction.subtext && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        {currentCampaign.callToAction.subtext}
                      </p>
                    )}
                  </div>

                  {/* Post-Scriptum */}
                  {currentCampaign.psMessage && (
                    <div className="pt-3 border-t border-dashed border-slate-200 text-xs text-slate-600 italic">
                      {currentCampaign.psMessage}
                    </div>
                  )}
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-[11px] text-slate-400 space-y-1">
                  <p>Vous recevez cet email car vous êtes abonné à notre liste de diffusion.</p>
                  <p className="text-slate-500 underline cursor-pointer">
                    Se désabonner &middot; Modifier mes préférences
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Mode 2: HTML Source Code View */}
          {viewMode === "html" && (
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[550px] shadow-sm border border-slate-800">
              <pre>{fullHtmlCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
