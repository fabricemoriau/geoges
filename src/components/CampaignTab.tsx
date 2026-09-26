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
  ExternalLink,
  Share2,
  Linkedin,
  Facebook,
  MessageSquare,
  Hash,
  Plus
} from "lucide-react";
import { EmailCampaign, ImageResolution, ImageAspectRatio, SocialMediaPost } from "../types";
import { initialCampaignExample, initialSocialPosts } from "../data/initialData";
import { getApiUrl } from "../utils/api";

interface CampaignTabProps {
  onSaveAsNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const CampaignTab: React.FC<CampaignTabProps> = ({ onSaveAsNote }) => {
  // Navigation Subtab: Emailing vs Social Media
  const [mainTab, setMainTab] = useState<"emailing" | "social">("emailing");

  // Email Campaign State
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("Clients et prospects intéressés par l'innovation");
  const [tone, setTone] = useState("Inspirante, professionnelle et percutante");
  const [goal, setGoal] = useState("Conversion & Vente");
  const [discountOrOffer, setDiscountOrOffer] = useState("-20% sur la nouvelle collection d'automne");

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

  // Social Media State
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>(initialSocialPosts);
  const [selectedPlatform, setSelectedPlatform] = useState<"linkedin" | "facebook">("linkedin");
  const [socialTopic, setSocialTopic] = useState("");
  const [socialAudience, setSocialAudience] = useState("Professionnels et décideurs");
  const [socialTone, setSocialTone] = useState("Expertise, inspirant et moderne");
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [selectedSocialPost, setSelectedSocialPost] = useState<SocialMediaPost | null>(socialPosts[0] || null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateCampaign = async () => {
    if (!prompt.trim() || isGeneratingCampaign) return;
    setIsGeneratingCampaign(true);

    try {
      const res = await fetch(getApiUrl("/api/campaign/generate"), {
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
        generatedVisualUrl: currentCampaign.generatedVisualUrl,
        visualResolution: imageSize,
        visualAspectRatio: aspectRatio,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurrentCampaign(updatedCampaign);
      setVisualPrompt(data.suggestedVisualPrompt || prompt);
      setSelectedSubjectIdx(0);

      handleGenerateVisual(data.suggestedVisualPrompt || prompt, imageSize, aspectRatio);
    } catch (err) {
      console.error("Campaign generation error:", err);
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

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
      const res = await fetch(getApiUrl("/api/image/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          imageSize: chosenResolution,
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

  // Generate Social Media Post
  const handleGenerateSocialPost = async () => {
    if (!socialTopic.trim()) return;
    setIsGeneratingSocial(true);

    try {
      const isLinkedIn = selectedPlatform === "linkedin";
      const accountName = isLinkedIn ? "Fabrice Moriau" : "France Maison Sécurité - Page Officielle";

      const generatedContent = isLinkedIn
        ? `💼 **${socialTopic}**

Dans notre secteur d'activité, la rigueur et l'innovation sont les clés de la réussite.

Voici les 3 leviers fondamentaux que nous appliquons quotidiennement :
1️⃣ Analyse précise des besoins et étude de faisabilité
2️⃣ Automatisation des tâches à faible valeur ajoutée avec l'agent IA Georges
3️⃣ Garantie d'un service irréprochable et suivi de dossier personnalisé

Quelles sont vos priorités pour cette année ? Échangeons en commentaires !

#Pro #Innovation #Sécurité #FranceMaisonSécurité #GeorgesIA`
        : `🔥 **${socialTopic}** !

Chez France Maison Sécurité, votre sérénité et votre sécurité sont notre priorité absolue.

Découvrez nos solutions connectées de télésurveillance 4K et d'alarme pour protéger votre domicile et votre entreprise.

💡 Profitez de votre diagnostic offert et personnalisé par nos experts !

👉 Contactez-nous directement en MP ou sur francemaisonsecurite@gmail.com pour en savoir plus.`;

      const newPost: SocialMediaPost = {
        id: `post-${Date.now()}`,
        platform: selectedPlatform,
        accountName,
        title: socialTopic,
        content: generatedContent,
        hashtags: isLinkedIn ? ["#Pro", "#Innovation", "#IA"] : ["#Sécurité", "#Sérénité", "#FranceMaisonSécurité"],
        status: "brouillon",
        suggestedVisualPrompt: `A high-end professional photographic composition illustrating ${socialTopic}`,
        createdAt: "À l'instant"
      };

      setSocialPosts([newPost, ...socialPosts]);
      setSelectedSocialPost(newPost);
      setSocialTopic("");
    } catch (err) {
      console.error("Social post generation error:", err);
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const fullHtmlCode = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentCampaign.subjectLines[selectedSubjectIdx]?.subject || currentCampaign.campaignTitle}</title>
</head>
<body>
  <div style="max-width: 600px; margin: 20px auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    ${currentCampaign.generatedVisualUrl ? `<img src="${currentCampaign.generatedVisualUrl}" style="width:100%; max-height:380px; object-fit:cover;" />` : ""}
    <div style="padding: 24px;">
      <h1>${currentCampaign.emailHeadline}</h1>
      <p>${currentCampaign.subheadline}</p>
      <div>${currentCampaign.bodyHtml}</div>
    </div>
  </div>
</body>
</html>`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner & Switcher */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Marketing & Réseaux Sociaux</span>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  By Georges
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Génération de campagnes d'emailing persuasives et création de posts LinkedIn & Facebook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setMainTab("emailing")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainTab === "emailing"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Campagnes Emailing
            </button>
            <button
              onClick={() => setMainTab("social")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainTab === "social"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Réseaux Sociaux (LinkedIn / Facebook)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EMAILING CAMPAIGNS */}
      {mainTab === "emailing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Générateur de Campagne IA
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Sujet ou Produit à promouvoir *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="Ex: Lancement de nos contrats d'alarme et vidéo-protection pour particuliers et professionnels..."
                    className="w-full border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cible / Audience</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tonalité</label>
                    <input
                      type="text"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateCampaign}
                  disabled={!prompt.trim() || isGeneratingCampaign}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    prompt.trim() && !isGeneratingCampaign
                      ? "bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isGeneratingCampaign ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Georges rédige la campagne...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Générer la Campagne Complète</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Preview (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">{currentCampaign.campaignTitle}</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                  Cible : {currentCampaign.targetAudience}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-slate-900">Objet retentissant :</div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold">
                  {currentCampaign.subjectLines[0]?.subject || currentCampaign.campaignTitle}
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-white text-xs sm:text-sm text-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 text-base">{currentCampaign.emailHeadline}</h4>
                <p className="text-slate-600 italic">{currentCampaign.subheadline}</p>
                <div className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
                  {currentCampaign.bodyHtml.replace(/<[^>]*>?/gm, '')}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleCopy(fullHtmlCode, "html")}
                    className="bg-slate-900 text-amber-400 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === "html" ? "Code HTML Copié !" : "Copier le code HTML"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOCIAL MEDIA POSTS (LINKEDIN & FACEBOOK) */}
      {mainTab === "social" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Post Generator Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-600" />
                  Créateur de Post Réseaux Sociaux
                </h3>
              </div>

              {/* Platform selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setSelectedPlatform("linkedin")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPlatform === "linkedin"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => setSelectedPlatform("facebook")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPlatform === "facebook"
                      ? "bg-sky-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Sujet ou message clé du post *
                  </label>
                  <textarea
                    value={socialTopic}
                    onChange={(e) => setSocialTopic(e.target.value)}
                    rows={3}
                    placeholder={
                      selectedPlatform === "linkedin"
                        ? "Ex: Pourquoi la vidéo-protection 4K connectée révolutionne la sécurité des PME..."
                        : "Ex: Offre de rentrée : diagnostic sécurité gratuit de votre maison..."
                    }
                    className="w-full border border-slate-300 rounded-xl p-3 focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cible</label>
                    <input
                      type="text"
                      value={socialAudience}
                      onChange={(e) => setSocialAudience(e.target.value)}
                      className="w-full border rounded-xl p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tonalité</label>
                    <input
                      type="text"
                      value={socialTone}
                      onChange={(e) => setSocialTone(e.target.value)}
                      className="w-full border rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateSocialPost}
                  disabled={!socialTopic.trim() || isGeneratingSocial}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    socialTopic.trim() && !isGeneratingSocial
                      ? "bg-slate-900 hover:bg-slate-800 text-amber-400 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isGeneratingSocial ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>RÉDACTION EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Rédiger le Post {selectedPlatform === "linkedin" ? "LinkedIn" : "Facebook"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Social Posts Display & History (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedSocialPost ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    {selectedSocialPost.platform === "linkedin" ? (
                      <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-blue-200">
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </span>
                    ) : (
                      <span className="bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-sky-200">
                        <Facebook className="w-3.5 h-3.5" />
                        Facebook
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900">{selectedSocialPost.accountName}</span>
                  </div>

                  <span className="text-[10px] text-slate-400">{selectedSocialPost.createdAt}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                  {selectedSocialPost.content}
                </div>

                {selectedSocialPost.hashtags && selectedSocialPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSocialPost.hashtags.map((tag, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-indigo-500" />
                        {tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    onClick={() => handleCopy(selectedSocialPost.content, selectedSocialPost.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === selectedSocialPost.id ? "Post Copié !" : "Copier le Post"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Sélectionnez ou géneréz un post réseau social.
              </div>
            )}

            {/* List of existing social posts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vos Posts Réseaux Sociaux Récents
              </h4>

              <div className="space-y-2">
                {socialPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedSocialPost(post)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                      selectedSocialPost?.id === post.id
                        ? "bg-indigo-50/80 border-indigo-300"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{post.platform.toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500">&middot; {post.accountName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">{post.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
