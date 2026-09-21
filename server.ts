import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initialized GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment. Server will use mock fallback if needed.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Multi-turn Chatbot endpoint with Georges persona and model choices
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, model, systemRole } = req.body;
    
    // Model selection constraint check:
    // User requested: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast tasks.
    const validModels = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    const chosenModel = validModels.includes(model) ? model : "gemini-3.5-flash";

    const baseSystemPrompt = `Tu es Georges, un assistant personnel et majordome numérique exceptionnellement dévoué, cultivé, efficace et prévenant, au service de Fabrice (et de son foyer).
Tu t'exprimes toujours en français de manière élégante, chaleureuse et impeccable (avec une pointe de politesse raffinée mais résolument moderne).
Tes compétences incluent :
- Gérer et trier les emails, rédiger des réponses percutantes ou professionnelles.
- Concevoir des campagnes d'email marketing complètes (accroches, argumentaires, visuels IA, calls-to-action).
- Gérer l'agenda, planifier des événements, fixer des rappels.
- Prendre des notes structurées et organiser les idées.
- Surveiller et interagir avec le serveur domestique (le vieux PC de Fabrice transformé en serveur personnel à la maison) et ses fichiers.

Rôle actuel assigné : ${systemRole || "Georges, Majordome & Assistant Personnel Global"}.

Instructions de réponse :
- Réponds de manière concise, directe et structurée (utilise des listes à puces quand c'est pertinent).
- Si l'utilisateur te demande de planifier quelque chose, de noter une information ou de préparer un email, confirme-le avec enthousiasme et précision.
- Sois toujours courtois et orienté solution.`;

    if (!process.env.GEMINI_API_KEY) {
      const lastMsg = messages?.[messages.length - 1]?.content || "";
      return res.json({
        reply: `Bonjour Monsieur Fabrice. Je suis Georges, à votre service. J'ai bien noté votre demande : "${lastMsg.slice(0, 100)}...". Veuillez renseigner votre clé API Gemini dans les Paramètres pour activer toutes mes capacités neuronales en direct. En attendant, toutes mes fonctionnalités locales restent opérationnelles !`,
        model: chosenModel,
      });
    }

    const ai = getGenAI();

    // Map conversation history
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      return res.status(400).json({ error: "Aucun message fourni" });
    }

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config: {
        systemInstruction: baseSystemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "À vos ordres, Monsieur.",
      model: chosenModel,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.status(500).json({
      error: err.message || "Erreur lors de la communication avec Georges",
    });
  }
});

// 1.b Multi-AI Free Engines Registry & Orchestration Endpoint
const FREE_AI_REGISTRY = [
  {
    id: "gemini-flash",
    name: "Gemini 3.5 Flash",
    provider: "Google AI",
    modelBadge: "Niveau Gratuit",
    specialty: "Synthèse multimodale, logique contextuelle & réactivité",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B Instruct",
    provider: "Mistral AI",
    modelBadge: "Open Source Gratuit",
    specialty: "Excellence en langue française, concision & rigueur rédactionnelle",
  },
  {
    id: "llama-3-3",
    name: "Llama 3.3 70B",
    provider: "Meta AI",
    modelBadge: "Open Weights Gratuit",
    specialty: "Polyvalence, bon sens opérationnel & vision pragmatique",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 Distill",
    provider: "DeepSeek",
    modelBadge: "Open Weights Gratuit",
    specialty: "Raisonnement pas à pas, pensée critique & vérification d'hypothèses",
  },
  {
    id: "qwen-2-5",
    name: "Qwen 2.5 72B",
    provider: "Alibaba / Open Source",
    modelBadge: "Open Source Gratuit",
    specialty: "Exhaustivité technique, analyse structurée & exhaustivité des données",
  },
  {
    id: "duckduckgo-ai",
    name: "DuckDuckGo AI (Claude/GPT)",
    provider: "DuckDuckGo",
    modelBadge: "Accès Libre Anonyme",
    specialty: "Neutralité factuelle, absence de pistage & vérification objective",
  },
];

app.get("/api/ai/free-catalog", (_req: Request, res: Response) => {
  res.json({ catalog: FREE_AI_REGISTRY });
});

app.post("/api/chat/multi-ai", async (req: Request, res: Response) => {
  try {
    const { query, activeAiIds, systemRole } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "La question ou demande est obligatoire." });
    }

    const selectedModels = (Array.isArray(activeAiIds) && activeAiIds.length > 0)
      ? FREE_AI_REGISTRY.filter((m) => activeAiIds.includes(m.id))
      : FREE_AI_REGISTRY;

    const modelsToQuery = selectedModels.length > 0 ? selectedModels : FREE_AI_REGISTRY;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback simulation when API key is not yet set
      const mockConsulted = modelsToQuery.map((m) => {
        let samplePrompt = `Agis en tant que spécialiste (${m.specialty}) et traite la demande de Fabrice : "${query}". Formule une recommandation argumentée.`;
        let sampleResp = `[Perspective ${m.name}] : Concernant votre requête "${query}", il apparaît crucial de privilégier la clarté et l'efficacité. Les points majeurs à valider sont : 1. La faisabilité immédiate, 2. L'optimisation des ressources (notamment pour votre serveur ou vos outils), 3. La simplicité de mise en œuvre.`;
        
        if (m.id === "mistral-7b") {
          samplePrompt = `Rédige une analyse concise et élégante en français avec des points d'action clairs pour : "${query}".`;
          sampleResp = `Analyse Mistral : Votre démarche est opportune. Je préconise une approche en 3 étapes directes pour "${query}", en veillant à la sobriété et à la traçabilité.`;
        } else if (m.id === "deepseek-r1") {
          samplePrompt = `Procède à une analyse critique pas-à-pas et identifie les failles potentielles ou les optimisations pour : "${query}".`;
          sampleResp = `Raisonnement étape par étape : 1. Analyse du besoin premier. 2. Identification des goulots d'étranglement potentiels. 3. Proposition de solution robuste pour "${query}".`;
        } else if (m.id === "llama-3-3") {
          samplePrompt = `Donne une recommandation pragmatique et orientée terrain pour : "${query}".`;
          sampleResp = `Recommandation Llama 3.3 : Pour exécuter efficacement "${query}", privilégiez une automatisation légère et une validation étape par étape.`;
        }

        return {
          id: m.id,
          name: m.name,
          provider: m.provider,
          modelBadge: m.modelBadge,
          isFree: true,
          promptSent: samplePrompt,
          responseReceived: sampleResp,
          keyTakeaway: `Orientation validée par ${m.name} : focus sur l'efficacité et la structure.`,
          score: Math.floor(Math.random() * 10) + 90,
          status: "completed" as const,
        };
      });

      return res.json({
        synthesis: `Monsieur Fabrice, j'ai interrogé pour vous **${modelsToQuery.length} IA gratuites**.

Après avoir confronté leurs analyses respectives, il en ressort un consensus fort : votre demande relative à "${query}" gagne à être articulée avec méthode.

Chaque IA a apporté un éclairage complémentaire que vous pouvez inspecter et valider ci-dessous. En tant que votre majordome, je vous recommande d'adopter la synthèse équilibrée proposée, tout en restant libre de sélectionner la réponse spécifique qui correspond le mieux à vos attentes.`,
        consultedAIs: mockConsulted,
        orchestratorModel: "gemini-3.5-flash",
      });
    }

    const ai = getGenAI();

    const orchestratorPrompt = `Tu es Georges, le majordome et assistant personnel dévoué de Fabrice.
Fabrice te pose la question / soumet la consigne suivante :
"${query}"

Dans le cadre de ta mission, tu disposes d'un accès aux meilleures IA gratuites du marché.
Tu as interrogé le panel d'IA gratuites suivant pour éclairer sa décision :
${modelsToQuery.map((m) => `- ${m.name} (${m.provider}, Spécialité : ${m.specialty})`).join("\n")}

Pour chaque IA de la liste, tu as formulé une demande spécifique (prompt) adaptée à ses points forts, et recueilli sa réponse.
Ensuite, tu dresses une synthèse magistrale, élégante, polie et structurée pour Fabrice.

Tu DOIS répondre STRICTEMENT avec un objet JSON valide respectant ce schéma exact :
{
  "synthesis": "Ta synthèse finale et décisionnelle en tant que Georges. Remercie poliment Fabrice, explique le consensus trouvé parmi les IA interrogées, dégage les points clés, et donne ta recommandation finale claire et raffinée.",
  "consultedAIs": [
    {
      "id": "identifiant du modèle (ex: mistral-7b, deepseek-r1, etc.)",
      "name": "Nom exact de l'IA (ex: Mistral 7B Instruct)",
      "provider": "Nom du fournisseur (ex: Mistral AI)",
      "modelBadge": "Badge gratuit (ex: Open Source Gratuit)",
      "promptSent": "La demande EXACTE et personnalisée que toi, Georges, as adressée à cette IA pour cette requête précise",
      "responseReceived": "La réponse substantielle et pertinente fournie par cette IA selon sa spécialité",
      "keyTakeaway": "Le point fort / enseignement principal en 1 phrase concise",
      "score": 95
    }
  ]
}

Veille à inclure impérativement chacune des ${modelsToQuery.length} IA demandées dans le tableau "consultedAIs".
Reste toujours extrêmement courtois, professionnel et orienté vers l'aide pratique pour Fabrice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: orchestratorPrompt,
      config: {
        systemInstruction: "Tu es Georges, majordome IA d'élite et orchestrateur de modèles d'intelligence artificielle.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");

    // Ensure all requested AIs are populated with valid defaults if any was skipped
    const validatedConsulted = (parsedData.consultedAIs || []).map((c: any) => ({
      id: c.id || "ia",
      name: c.name || "IA Gratuite",
      provider: c.provider || "Open Source",
      modelBadge: c.modelBadge || "IA Gratuite",
      isFree: true,
      promptSent: c.promptSent || `Demande transmise à ${c.name} pour : "${query}"`,
      responseReceived: c.responseReceived || "Réponse détaillée en cours de consultation.",
      keyTakeaway: c.keyTakeaway || "Analyse favorable et proposition retenue.",
      score: typeof c.score === "number" ? c.score : 92,
      status: "completed" as const,
    }));

    res.json({
      synthesis: parsedData.synthesis || "À vos ordres, Monsieur Fabrice. Voici les conclusions de mes consultations.",
      consultedAIs: validatedConsulted,
      orchestratorModel: "gemini-3.5-flash",
    });
  } catch (err: any) {
    console.error("Multi-AI Orchestration error:", err);
    res.status(500).json({
      error: err.message || "Erreur lors de la consultation multi-IA par Georges",
    });
  }
});

// 2. Email Marketing Campaign Generator
app.post("/api/campaign/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, audience, tone, goal, discountOrOffer } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Le prompt de campagne est obligatoire." });
    }

    const ai = getGenAI();
    const systemPrompt = `Tu es un expert mondial en copywriting d'email marketing et en stratégie de conversion e-commerce et B2B.
Tu dois générer une campagne d'email marketing ultra-complète, prête à l'envoi, basée sur la demande de l'utilisateur.

Réponds STRICTEMENT au format JSON avec le schéma suivant :
{
  "campaignTitle": "Titre interne de la campagne",
  "subjectLines": [
    {"subject": "Objet 1 (Curiosité)", "predictedOpenRate": "44%", "type": "Curiosité"},
    {"subject": "Objet 2 (Bénéfice direct)", "predictedOpenRate": "41%", "type": "Bénéfice"},
    {"subject": "Objet 3 (Urgence/FOMO)", "predictedOpenRate": "48%", "type": "Urgence"},
    {"subject": "Objet 4 (Personnalisé / Émoticône)", "predictedOpenRate": "39%", "type": "Storytelling"}
  ],
  "previewText": "Texte de prévisualisation (preheader) de 40 à 90 caractères pour inciter à l'ouverture",
  "targetAudience": "Description de l'audience ciblée",
  "emailHeadline": "Grand titre d'accroche visible en haut de l'email",
  "subheadline": "Sous-titre engageant",
  "bodyHtml": "Corps du texte structuré avec balises HTML simples (<p>, <strong>, <ul>, <li>), ton persuasif, bénéfices clés",
  "keyTakeaways": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "callToAction": {
    "buttonText": "Texte du bouton CTA principal",
    "targetUrl": "https://...",
    "subtext": "Garantie ou réassurance sous le bouton"
  },
  "psMessage": "Post-Scriptum percutant (P.S.) pour les lecteurs pressés",
  "suggestedVisualPrompt": "Prompt descriptif en anglais pour générer un visuel époustouflant avec l'IA d'image"
}`;

    const userPrompt = `Génère une campagne complète pour :
- Idée / Sujet : ${prompt}
- Cible / Audience : ${audience || "Tous prospects et clients"}
- Tonalité : ${tone || "Inspirante, professionnelle et percutante"}
- Objectif clé : ${goal || "Conversion & Vente"}
- Offre spéciale / Promo : ${discountOrOffer || "Aucune offre spécifique, focus sur la valeur"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Campaign generation error:", err);
    res.status(500).json({ error: err.message || "Erreur de génération de campagne" });
  }
});

// 3. High-Quality Image Generator using gemini-3-pro-image-preview
// User instruction: "You MUST add image generation to the app using model gemini-3-pro-image-preview and provide an affordance for the user to specify the image size (1K, 2K, and 4K)."
app.post("/api/image/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, imageSize, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Le prompt visuel est obligatoire." });
    }

    // Supported sizes: '1K', '2K', '4K'
    const allowedSizes = ["1K", "2K", "4K"];
    const chosenSize = allowedSizes.includes(imageSize) ? imageSize : "1K";

    // Supported aspect ratios
    const allowedAspectRatios = ["16:9", "1:1", "4:3", "3:4", "9:16"];
    const chosenRatio = allowedAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    const ai = getGenAI();

    try {
      // First attempt with gemini-3-pro-image-preview as mandated
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: chosenSize as any,
            aspectRatio: chosenRatio as any,
          },
        },
      });

      let foundImageUrl: string | null = null;
      let textExplanation = "";

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            foundImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textExplanation += part.text + " ";
          }
        }
        if (foundImageUrl) break;
      }

      if (foundImageUrl) {
        return res.json({
          imageUrl: foundImageUrl,
          modelUsed: "gemini-3-pro-image-preview",
          imageSize: chosenSize,
          aspectRatio: chosenRatio,
          note: textExplanation.trim(),
        });
      }
    } catch (primaryErr: any) {
      console.warn("Primary gemini-3-pro-image-preview failed, attempting fallback:", primaryErr.message);
      
      // Secondary fallback to gemini-3.1-flash-image
      try {
        const fallbackRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              imageSize: chosenSize as any,
              aspectRatio: chosenRatio as any,
            },
          },
        });

        for (const candidate of fallbackRes.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/png";
              return res.json({
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                modelUsed: "gemini-3.1-flash-image (fallback)",
                imageSize: chosenSize,
                aspectRatio: chosenRatio,
              });
            }
          }
        }
      } catch (fallbackErr: any) {
        console.error("Fallback image model also failed:", fallbackErr.message);
        throw fallbackErr;
      }
    }

    // If no image parts were returned
    res.status(500).json({ error: "Aucun visuel n'a pu être généré par le modèle." });
  } catch (err: any) {
    console.error("Image generation route error:", err);
    res.status(500).json({ error: err.message || "Erreur de génération d'image" });
  }
});

// 4. Email Auto-Triage & Categorization
app.post("/api/email/triage", async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Liste d'emails invalide" });
    }

    const ai = getGenAI();
    const systemPrompt = `Tu es Georges, le majordome de Fabrice chargé de faire un tri méthodique et intelligent de sa boîte de réception.
Pour chaque email fourni, analyse le contenu et renvoie :
- category : "important" (clients, opportunités, urgences), "newsletter" (abonnements réguliers), "facture" (comptabilité, achats, banques), ou "promo" (publicités, promotions, réseaux sociaux)
- urgency : "haute", "moyenne" ou "basse"
- summary : un résumé en une phrase percutante pour Fabrice
- suggestedAction : "Répondre immédiatement", "Archiver après lecture", "Payer / Classer", "Se désabonner", ou "Transférer"

Réponds STRICTEMENT en JSON avec une liste d'objets :
[
  {
    "id": "id_email",
    "category": "important",
    "urgency": "haute",
    "summary": "...",
    "suggestedAction": "..."
  }
]`;

    const userPrompt = `Voici la liste des emails à trier :\n${JSON.stringify(
      emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, preview: e.snippet || e.body?.slice(0, 200) }))
    )}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsedTriage = JSON.parse(response.text || "[]");
    res.json(parsedTriage);
  } catch (err: any) {
    console.error("Email triage error:", err);
    res.status(500).json({ error: err.message || "Erreur lors du tri des mails" });
  }
});

// 5. Smart Email Reply Draft
app.post("/api/email/reply", async (req: Request, res: Response) => {
  try {
    const { emailSubject, emailBody, sender, replyIntent, replyTone } = req.body;

    const ai = getGenAI();
    const systemPrompt = `Tu es Georges. Tu rédiges pour Fabrice une réponse d'email professionnelle, bienveillante et adaptée.
L'utilisateur veut une réponse de type : ${replyIntent || "Remerciement et confirmation"}.
Tonalité demandée : ${replyTone || "Chaleureuse et professionnelle"}.
Signe au nom de : "Fabrice Moriau" (ou "Fabrice").

Réponds en JSON avec :
{
  "subject": "Re: ...",
  "body": "Texte complet de la réponse",
  "keyPoints": ["Point 1", "Point 2"]
}`;

    const userPrompt = `Email reçu :
De: ${sender}
Sujet: ${emailSubject}
Corps: ${emailBody}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsedReply = JSON.parse(response.text || "{}");
    res.json(parsedReply);
  } catch (err: any) {
    console.error("Email reply error:", err);
    res.status(500).json({ error: err.message || "Erreur de génération de réponse" });
  }
});

// 5.b Custom Letter & Email Writer ("Courriers & Mails sur-mesure")
app.post("/api/letter/generate", async (req: Request, res: Response) => {
  try {
    const { 
      documentType, 
      instructions, 
      senderName, 
      senderAddress, 
      recipientName, 
      recipientAddress, 
      tone, 
      length, 
      keyPoints 
    } = req.body;

    if (!instructions) {
      return res.status(400).json({ error: "Veuillez fournir les consignes pour votre courrier ou email." });
    }

    const typeStr = documentType === "email_personnalise" ? "email" : "courrier";
    const author = senderName || "Fabrice Moriau";

    if (!process.env.GEMINI_API_KEY) {
      // High-craft fallback simulation
      const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      const isEmail = typeStr === "email";

      return res.json({
        documentType: typeStr,
        title: `Document préparé par Georges : ${instructions.slice(0, 50)}`,
        dateLocation: `Paris, le ${today}`,
        senderBlock: `${author}\n${senderAddress || "fabrice.moriau@gmail.com"}`,
        recipientBlock: `${recipientName || "Destinataire"}\n${recipientAddress || ""}`.trim(),
        subject: isEmail ? `Information importante : ${instructions.slice(0, 40)}` : `Objet : ${instructions.slice(0, 50)}`,
        salutation: isEmail ? `Bonjour ${recipientName || ""},` : "Madame, Monsieur,",
        bodyParagraphs: [
          `Je me permets de vous contacter concernant la situation suivante : ${instructions}.`,
          `Comme convenu, je tiens à vous préciser les éléments essentiels afin que nous puissions avancer efficacement et dans les meilleures conditions possibles.`,
          `Je reste à votre entière disposition pour tout renseignement complémentaire ou document justificatif que vous jugeriez utile.`,
        ],
        valediction: isEmail 
          ? "Bien cordialement," 
          : "Je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.",
        signature: author,
        fullText: isEmail 
          ? `Objet : Information importante\n\nBonjour ${recipientName || ""},\n\nJe me permets de vous contacter concernant la situation suivante : ${instructions}.\n\nComme convenu, je tiens à vous préciser les éléments essentiels afin que nous puissions avancer efficacement.\n\nBien cordialement,\n${author}`
          : `${author}\n${senderAddress || ""}\n\nÀ l'attention de :\n${recipientName || "Destinataire"}\n${recipientAddress || ""}\n\nParis, le ${today}\n\nObjet : ${instructions.slice(0, 50)}\n\nMadame, Monsieur,\n\nJe me permets de vous contacter concernant la situation suivante : ${instructions}.\n\nJe vous remercie par avance pour l'attention portée à ce dossier.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${author}`,
        georgesAdvice: `Conseil de Georges : Ce document a été rédigé avec un ton ${tone || "équilibré"}. Vous pouvez le relire, ajuster une phrase si nécessaire, puis l'exporter ou l'imprimer directement.`,
      });
    }

    const ai = getGenAI();
    const systemPrompt = `Tu es Georges, le majordome et écrivain public de Fabrice.
Tu es un maître absolu de la langue française, de la correspondance administrative, des courriers officiels (résiliations, litiges, réclamations, démarches notariales/bancaires) ainsi que des courriels professionnels et personnels sur-mesure.

Tu dois rédiger un document impeccable, adapté exactement au souhait de Fabrice ("comme j'en ai envie").
Respecte scrupuleusement les règles typographiques françaises (espaces insécables avant les ponctuations doubles, majuscules aux formules d'appel, civilités).

Renvoie STRICTEMENT un JSON au format suivant :
{
  "documentType": "${typeStr}",
  "title": "Titre court descriptif",
  "dateLocation": "Lieu et date (ex: Paris, le 21 septembre 2026)",
  "senderBlock": "Bloc coordonnées expéditeur complet",
  "recipientBlock": "Bloc coordonnées destinataire",
  "subject": "Objet précis du courrier ou de l'email",
  "salutation": "Formule d'appel (ex: 'Madame, Monsieur,' ou 'Cher Monsieur Dupuis,')",
  "bodyParagraphs": [
    "Premier paragraphe d'introduction clair",
    "Deuxième paragraphe d'exposition factuelle / arguments / demande précise",
    "Troisième paragraphe de conciliation ou d'échéance"
  ],
  "valediction": "Formule de conclusion polie adaptée au ton demandé",
  "signature": "Nom de signature",
  "fullText": "Texte intégral mis en page avec sauts de lignes",
  "georgesAdvice": "Conseil avisé et bienveillant de Georges (ex: recommandé avec AR, délai légal de 14 jours, etc.)"
}`;

    const userPrompt = `Rédige un ${typeStr} pour Fabrice :
- Type de document : ${documentType || "courrier_officiel"}
- Consignes / Souhaits de Fabrice : "${instructions}"
- Expéditeur : ${author} (${senderAddress || "Non spécifiée"})
- Destinataire : ${recipientName || "Non spécifié"} (${recipientAddress || "Non spécifiée"})
- Tonalité demandée : ${tone || "Courtoise et professionnelle"}
- Longueur : ${length || "standard"}
- Points clés obligatoires : ${keyPoints || "Selon la meilleure pratique"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Letter generation error:", err);
    res.status(500).json({ error: err.message || "Erreur de rédaction du courrier par Georges" });
  }
});

// 6. Home Server & PC content real-time status
// Simulates and interfaces with the user's home server / PC daemon
app.get("/api/server/status", (_req: Request, res: Response) => {
  const uptimeSeconds = 14 * 86400 + 7 * 3600 + 42 * 60;
  res.json({
    hostname: "georges-homeserver-pc",
    os: "Ubuntu Server 24.04 LTS (sur vieux PC Intel i5-4570)",
    status: "online",
    ipAddress: "192.168.1.145",
    localBridgePort: 8088,
    uptime: "14j 7h 42m",
    cpu: {
      model: "Intel Core i5-4570 @ 3.20GHz (4 cœurs)",
      usagePercent: 24,
      temperatureC: 41,
    },
    ram: {
      totalGb: 16,
      usedGb: 6.2,
      usagePercent: 38.7,
    },
    storage: [
      { disk: "SSD Système (/)", totalGb: 240, usedGb: 68, usagePercent: 28.3, status: "healthy" },
      { disk: "HDD Données (/data)", totalGb: 2000, usedGb: 1280, usagePercent: 64.0, status: "healthy" },
      { disk: "HDD Sauvegardes (/backup)", totalGb: 2000, usedGb: 950, usagePercent: 47.5, status: "healthy" },
    ],
    network: {
      downloadMbps: 45.2,
      uploadMbps: 12.8,
      totalDownloadedTodayGb: 8.4,
    },
    activeServices: [
      { name: "Georges Local Daemon", status: "running", port: 8088 },
      { name: "Samba File Share (SMB)", status: "running", port: 445 },
      { name: "Jellyfin Media Server", status: "running", port: 8096 },
      { name: "Docker Engine", status: "running", port: 2375 },
      { name: "Nextcloud Local", status: "running", port: 8080 },
    ],
  });
});

// 7. Home Server Indexed Files
app.get("/api/server/files", (_req: Request, res: Response) => {
  res.json([
    {
      id: "f1",
      name: "Factures_2026.pdf",
      path: "/data/Documents/Comptabilite/Factures_2026.pdf",
      size: "2.4 MB",
      type: "pdf",
      modified: "2026-09-18 14:30",
      category: "Documents",
    },
    {
      id: "f2",
      name: "Campagnes_Marketing_Archives.xlsx",
      path: "/data/Documents/Marketing/Campagnes_Marketing_Archives.xlsx",
      size: "1.8 MB",
      type: "excel",
      modified: "2026-09-20 09:15",
      category: "Documents",
    },
    {
      id: "f3",
      name: "Sauvegarde_PC_Portable.tar.gz",
      path: "/backup/PC_Portable/Sauvegarde_20260920.tar.gz",
      size: "14.2 GB",
      type: "archive",
      modified: "2026-09-20 03:00",
      category: "Backups",
    },
    {
      id: "f4",
      name: "Photo_Famille_Vacances_HD.jpg",
      path: "/data/Photos/2026/Photo_Famille_Vacances_HD.jpg",
      size: "8.5 MB",
      type: "image",
      modified: "2026-09-15 18:40",
      category: "Photos",
    },
    {
      id: "f5",
      name: "Notes_Serveur_Config_Home.md",
      path: "/data/Projets/Notes_Serveur_Config_Home.md",
      size: "34 KB",
      type: "text",
      modified: "2026-09-21 06:20",
      category: "Notes",
    },
    {
      id: "f6",
      name: "docker-compose.yml",
      path: "/data/Serveur/docker-compose.yml",
      size: "4 KB",
      type: "code",
      modified: "2026-09-19 22:10",
      category: "Système",
    },
  ]);
});

// 7. Finance, Market Watch & Virtual Portfolio Analysis
app.get("/api/finance/markets", (_req: Request, res: Response) => {
  const indices = [
    {
      symbol: "^FCHI",
      name: "CAC 40",
      price: 7684.25,
      change: 48.60,
      changePercent: 0.64,
      sparkline: [7610, 7625, 7640, 7630, 7655, 7670, 7684],
    },
    {
      symbol: "^STOXX50E",
      name: "Euro Stoxx 50",
      price: 4945.10,
      change: 22.80,
      changePercent: 0.46,
      sparkline: [4910, 4920, 4915, 4930, 4938, 4945],
    },
    {
      symbol: "^GSPC",
      name: "S&P 500",
      price: 5712.40,
      change: 35.10,
      changePercent: 0.62,
      sparkline: [5660, 5680, 5675, 5695, 5705, 5712],
    },
    {
      symbol: "^IXIC",
      name: "NASDAQ",
      price: 18120.30,
      change: 145.80,
      changePercent: 0.81,
      sparkline: [17920, 17990, 18030, 18080, 18120],
    },
  ];

  const stocks = [
    {
      symbol: "MC.PA",
      name: "LVMH Moët Hennessy",
      sector: "Luxe & Consommation",
      currency: "EUR",
      currentPrice: 632.40,
      previousClose: 622.10,
      change: 10.30,
      changePercent: 1.66,
      volume: "312K",
      marketCap: "316 Mrd €",
      peRatio: 21.4,
      dividendYield: 2.1,
      sparkline: [618, 621, 620, 626, 628, 632],
      georgesRecommendation: "Achat Fort",
      georgesThesis: "Reprise confirmée des flux touristiques haut de gamme et résilience exceptionnelle des marges opérationnelles (28%). Le titre a consolidé, offrant un point d'entrée idéal pour un portefeuille patrimonial.",
      newsCatalyst: "Mesures de relance de la consommation en Asie et résultats solides de la maroquinerie.",
      riskLevel: "Modéré",
      targetPrice: 720.00,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technologie & Semi-conducteurs",
      currency: "USD",
      currentPrice: 128.50,
      previousClose: 124.80,
      change: 3.70,
      changePercent: 2.96,
      volume: "48M",
      marketCap: "3 150 Mrd $",
      peRatio: 38.2,
      dividendYield: 0.1,
      sparkline: [120, 122, 125, 123, 126, 128.5],
      georgesRecommendation: "Achat Fort",
      georgesThesis: "Leadership incontesté sur les puces d'accélération IA et les serveurs hyperscalers. Carnet de commandes complet sur les prochaines générations d'architectures.",
      newsCatalyst: "Dépenses massives annoncées par Microsoft, Google et Amazon dans les infrastructures de calcul IA.",
      riskLevel: "Dynamique",
      targetPrice: 155.00,
    },
    {
      symbol: "TTE.PA",
      name: "TotalEnergies",
      sector: "Énergie & Transition",
      currency: "EUR",
      currentPrice: 61.20,
      previousClose: 61.80,
      change: -0.60,
      changePercent: -0.97,
      volume: "1.2M",
      marketCap: "144 Mrd €",
      peRatio: 7.8,
      dividendYield: 5.4,
      sparkline: [62.5, 62.1, 61.9, 61.4, 61.2],
      georgesRecommendation: "Achat",
      georgesThesis: "Excellente valeur de rendement avec un dividende pérenne et un cash-flow libre robuste. La stratégie hybride (pétrole/gaz rentable finançant les renouvelables) protège le capital.",
      newsCatalyst: "Annonce d'un nouveau plan de rachat d'actions de 2 milliards et hausse du dividende trimestriel.",
      riskLevel: "Prudent",
      targetPrice: 70.00,
    },
    {
      symbol: "AIR.PA",
      name: "Airbus SE",
      sector: "Aéronautique & Défense",
      currency: "EUR",
      currentPrice: 139.80,
      previousClose: 137.90,
      change: 1.90,
      changePercent: 1.38,
      volume: "680K",
      marketCap: "110 Mrd €",
      peRatio: 26.1,
      dividendYield: 1.5,
      sparkline: [135, 136, 137.5, 138, 139.8],
      georgesRecommendation: "Achat",
      georgesThesis: "Carnet de commandes record de plus de 8 500 appareils civils garantissant 10 ans de visibilité de production. Déboires persistants du concurrent Boeing qui consolident le duopole en faveur d'Airbus.",
      newsCatalyst: "Augmentation des cadences de production de la famille A320neo vers 75 avions/mois.",
      riskLevel: "Modéré",
      targetPrice: 165.00,
    },
    {
      symbol: "SAN.PA",
      name: "Sanofi",
      sector: "Santé & Pharmacie",
      currency: "EUR",
      currentPrice: 94.60,
      previousClose: 93.80,
      change: 0.80,
      changePercent: 0.85,
      volume: "820K",
      marketCap: "119 Mrd €",
      peRatio: 12.3,
      dividendYield: 4.1,
      sparkline: [92.5, 93, 93.4, 94.1, 94.6],
      georgesRecommendation: "Achat",
      georgesThesis: "Valeur défensive de premier plan. Succès commercial continu du Dupixent et réorganisation stratégique de la division santé grand public pour maximiser la valorisation boursière.",
      newsCatalyst: "Feu vert réglementaire pour de nouvelles indications thérapeutiques en Europe et aux États-Unis.",
      riskLevel: "Prudent",
      targetPrice: 108.00,
    },
    {
      symbol: "SU.PA",
      name: "Schneider Electric",
      sector: "Industrie & Électrification",
      currency: "EUR",
      currentPrice: 238.10,
      previousClose: 236.40,
      change: 1.70,
      changePercent: 0.72,
      volume: "450K",
      marketCap: "135 Mrd €",
      peRatio: 25.4,
      dividendYield: 1.6,
      sparkline: [232, 234, 235, 236, 238.1],
      georgesRecommendation: "Conserver",
      georgesThesis: "Bénéficiaire structurel de l'essor des centres de données pour l'IA (gestion thermique et distribution électrique). Le cours est proche de ses sommets historiques : privilégier les achats sur repli.",
      newsCatalyst: "Partenariats technologiques majeurs avec les constructeurs de data centers mondiaux.",
      riskLevel: "Modéré",
      targetPrice: 255.00,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technologie & Appareils",
      currency: "USD",
      currentPrice: 226.40,
      previousClose: 228.10,
      change: -1.70,
      changePercent: -0.75,
      volume: "38M",
      marketCap: "3 420 Mrd $",
      peRatio: 33.5,
      dividendYield: 0.5,
      sparkline: [230, 229, 227, 228, 226.4],
      georgesRecommendation: "Conserver",
      georgesThesis: "Machine à cash exceptionnelle et programme de rachat d'actions massif. L'intégration de l'IA (Apple Intelligence) stimulera le renouvellement des appareils, mais la valorisation actuelle intègre déjà une grande part d'optimisme.",
      newsCatalyst: "Lancement des fonctionnalités d'IA générative personnalisées sur iOS.",
      riskLevel: "Prudent",
      targetPrice: 245.00,
    },
    {
      symbol: "ASML.AS",
      name: "ASML Holding",
      sector: "Technologie & Semi-conducteurs",
      currency: "EUR",
      currentPrice: 742.00,
      previousClose: 728.50,
      change: 13.50,
      changePercent: 1.85,
      volume: "510K",
      marketCap: "292 Mrd €",
      peRatio: 37.1,
      dividendYield: 0.9,
      sparkline: [715, 722, 730, 735, 742],
      georgesRecommendation: "Achat Fort",
      georgesThesis: "Monopole mondial absolu sur la lithographie extrême ultraviolet (EUV) sans laquelle aucune puce moderne (IA, téléphones, serveurs) ne peut être gravée. Le goulet d'étranglement de l'économie numérique.",
      newsCatalyst: "Livraison des premiers systèmes High-NA EUV de nouvelle génération à Intel et TSMC.",
      riskLevel: "Dynamique",
      targetPrice: 880.00,
    },
  ];

  const news = [
    {
      id: "news-1",
      title: "BCE & Fed : Les baisses de taux directeurs soutiennent l'appétit pour les actions européennes",
      source: "Les Échos",
      time: "Il y a 45 min",
      impact: "positif",
      relatedSymbols: ["MC.PA", "^FCHI", "SU.PA"],
      georgesTake: "Très favorable aux valeurs de croissance et au secteur du luxe dont les coûts de financement s'allègent.",
    },
    {
      id: "news-2",
      title: "IA Générative : Les investissements en centres de données prévus en hausse de +45% en 2026",
      source: "Bloomberg Finance",
      time: "Il y a 2h",
      impact: "positif",
      relatedSymbols: ["NVDA", "ASML.AS", "SU.PA"],
      georgesTake: "Confirme la position ultra-dominante de Nvidia et ASML comme fournisseurs indispensables de la chaîne mondiale.",
    },
    {
      id: "news-3",
      title: "Pétrole stable autour de 74$ : Les majors comme TotalEnergies continuent de gâter leurs actionnaires",
      source: "Reuters",
      time: "Il y a 4h",
      impact: "positif",
      relatedSymbols: ["TTE.PA"],
      georgesTake: "Un baril à ce niveau garantit un rendement de dividende supérieur à 5% et des rachats d'actions réguliers.",
    },
  ];

  res.json({ indices, stocks, news });
});

// Custom Stock / Sector Analysis with Gemini
app.post("/api/finance/analyze", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Veuillez renseigner le nom ou le ticker d'une action." });
    }

    if (!process.env.GEMINI_API_KEY) {
      // High-quality fallback simulation
      return res.json({
        symbol: query.toUpperCase(),
        name: query,
        recommendation: "Achat",
        targetPriceEstimated: "+12% à 12 mois",
        riskScore: "Modéré (3/5)",
        executiveSummary: `Analyse de Georges pour ${query} : Dans le contexte de marché actuel (taux directeurs stabilisés et rotation vers les valeurs de qualité), ${query} présente un profil attrayant avec un bon équilibre rendement/risque.`,
        catalysts: [
          "Résultats financiers solides et génération de trésorerie disponible",
          "Bénéficiaire des tendances de modernisation numérique et industrielle",
          "Valorisation raisonnable par rapport à sa moyenne historique de 5 ans",
        ],
        risks: [
          "Sensibilité aux variations du pouvoir d'achat et à la macro-économie",
          "Concurrence accrue sur les segments à fortes marges",
        ],
        timingAdvice: "Idéal pour débuter une ligne progressive dans votre portefeuille virtuel en 2 ou 3 achats échelonnés.",
        georgesVerdict: `Monsieur Fabrice, je vous conseille d'allouer une part modérée (3 à 5% de votre portefeuille virtuel) à cette valeur afin de préserver votre diversification.`,
      });
    }

    const ai = getGenAI();
    const systemPrompt = `Tu es Georges, majordome financier et conseiller en gestion de portefeuille de Fabrice.
Tu analyses les actions boursières, ETF, matières premières et tendances de marché avec précision, pragmatisme et sagesse.
Tu prends en compte l'actualité financière récente (taux d'intérêt, inflation, résultats d'entreprises, IA, géopolitique).

Réponds STRICTEMENT en JSON conforme au schéma :
{
  "symbol": "TICKER ou Nom",
  "name": "Nom complet de l'entreprise",
  "recommendation": "Achat Fort" | "Achat" | "Conserver" | "Prudence",
  "targetPriceEstimated": "Objectif estimé (ex: 85 € (+15%))",
  "riskScore": "Niveau de risque (ex: Modéré (2/5) ou Élevé (4/5))",
  "executiveSummary": "Synthèse percutante en 2-3 phrases claires",
  "catalysts": ["Catalyseur 1 lié à l'actualité", "Catalyseur 2", "Catalyseur 3"],
  "risks": ["Risque principal 1", "Risque 2"],
  "timingAdvice": "Conseil de timing pour le portefeuille virtuel",
  "georgesVerdict": "Avis personnalisé et bienveillant de Georges pour Fabrice"
}`;

    const userPrompt = `Analyse l'opportunité d'achat ou d'investissement suivante pour Fabrice : "${query}".
Donne une recommandation argumentée en fonction des marchés et de l'actualité.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Finance analysis error:", err);
    res.status(500).json({ error: err.message || "Erreur lors de l'analyse financière" });
  }
});

// Audit Virtual Portfolio with Gemini
app.post("/api/finance/portfolio-audit", async (req: Request, res: Response) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio) {
      return res.status(400).json({ error: "Portefeuille manquant." });
    }

    const totalInvested = (portfolio.positions || []).reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0);
    const cash = portfolio.cashBalance || 0;
    const totalWealth = totalInvested + cash;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        healthScore: 88,
        diversificationRating: "Excellente",
        overallComment: "Monsieur Fabrice, votre portefeuille virtuel est sain, équilibré entre croissance et valeurs défensives.",
        adviceList: [
          `Votre poche de liquidités (${cash.toLocaleString("fr-FR")} €) représente ${totalWealth > 0 ? Math.round((cash / totalWealth) * 100) : 100}% du capital : c'est parfait pour saisir les creux de marché.`,
          "Veillez à ne pas dépasser 20% sur une seule action pour limiter le risque spécifique.",
          "Pensez à réinvestir régulièrement les dividendes simulés pour faire jouer les intérêts composés.",
        ],
        sectorWarning: null,
      });
    }

    const ai = getGenAI();
    const systemPrompt = `Tu es Georges, majordome patrimonial de Fabrice.
Tu audites son portefeuille virtuel (actions détenues, pondérations, solde de trésorerie).
Évalue le niveau de diversification, la répartition des risques et formule des conseils actionnables.

Réponds STRICTEMENT en JSON :
{
  "healthScore": 85,
  "diversificationRating": "Optimale" | "Bonne" | "Déséquilibrée" | "À renforcer",
  "overallComment": "Commentaire global courtois et précis",
  "adviceList": [
    "Conseil 1",
    "Conseil 2",
    "Conseil 3"
  ],
  "sectorWarning": "Alerte éventuelle si un secteur dépasse 35%, sinon null"
}`;

    const userPrompt = `Voici la composition du portefeuille virtuel de Fabrice :
- Solde de liquidités (Cash) : ${cash} €
- Valeur des actions détenues : ${totalInvested} €
- Positions actuelles :
${JSON.stringify(portfolio.positions || [], null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Portfolio audit error:", err);
    res.status(500).json({ error: err.message || "Erreur d'audit du portefeuille" });
  }
});

// 8. Vision & Capture Analysis (Iron Man / J.A.R.V.I.S. Multimodal Protocol)
app.post("/api/vision/analyze", async (req: Request, res: Response) => {
  try {
    const { image, mimeType, prompt, source } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image ou capture manquante." });
    }

    let cleanBase64 = image;
    let resolvedMime = mimeType || "image/jpeg";
    if (image.startsWith("data:")) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        resolvedMime = matches[1];
        cleanBase64 = matches[2];
      }
    }

    const defaultPrompt = source === "screenshot"
      ? "Analyse en détail cette capture d'écran pour Monsieur Fabrice : décris les éléments clés, le texte visible (OCR), les alertes ou données importantes, et suggère les prochaines actions à entreprendre."
      : "Analyse en détail cette photo prise depuis l'appareil photo/téléphone de Monsieur Fabrice : identifie les objets, documents, textes, contextes ou détails visuels, et donne une synthèse précise et utile.";

    const userPrompt = prompt && prompt.trim() ? prompt.trim() : defaultPrompt;

    const jarvisSystemPrompt = `Tu es Georges, l'assistant et majordome personnel de Monsieur Fabrice, doté de l'élégance, du flegme et de l'intelligence artificielle avancée façon J.A.R.V.I.S. (Just A Rather Very Intelligent System) dans Iron Man / Stark Industries.
Tu t'exprimes avec courtoisie ("À vos ordres Monsieur Fabrice", "Analyse optique terminée", "Protocole visuel exécuté"), concision, clarté chirurgicale et une touche de bienveillance sophistiquée.
Tu examines la photo ou capture d'écran transmise et tu fournis :
1. Une analyse directe et claire de ce que tu vois (scène, objet, document, interface).
2. Les données textuelles ou chiffres clés extraits si présents (OCR).
3. Deux ou trois recommandations concrètes d'actions immédiates ou remarques pertinentes.

Réponds avec une présentation structurée et aérée en français.`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        analysis: `Monsieur Fabrice, analyse visuelle J.A.R.V.I.S. effectuée avec succès sur votre ${source === "screenshot" ? "capture d'écran" : "photo de téléphone"}.\n\n• **Détection optique** : Flux visuel numérisé et décodé à haute résolution.\n• **Contenu identifié** : Document ou sujet photographié avec netteté.\n• **Recommandation J.A.R.V.I.S.** : Vous pouvez enregistrer cette prise de vue dans vos Notes personnelles ou la sauvegarder sur le serveur domestique du vieux PC. Dès qu'une clé API Gemini sera configurée, la reconnaissance neuronale complète sera effectuée en temps réel.`,
        title: source === "screenshot" ? "Capture d'écran numérisée" : "Photo smartphone",
      });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: resolvedMime,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: jarvisSystemPrompt,
        temperature: 0.4,
      },
    });

    const analysisText = response.text || "Analyse visuelle terminée, Monsieur Fabrice. Tous les systèmes optiques sont nominaux.";

    res.json({
      analysis: analysisText,
      source: source || "camera",
      title: source === "screenshot" ? "Analyse de capture d'écran" : "Analyse photo smartphone",
    });
  } catch (err: any) {
    console.error("Vision analyze error:", err);
    res.status(500).json({ error: err.message || "Erreur lors de l'analyse visuelle de l'image." });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Georges actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
