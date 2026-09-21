export type AIChatModel = "gemini-3.5-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite";

export interface ConsultedAI {
  id: string;
  name: string;
  provider: string;
  modelBadge: string;
  isFree: boolean;
  avatarIcon?: string;
  promptSent: string; // The exact prompt Georges sent to this AI
  responseReceived: string; // The raw response from this AI
  keyTakeaway: string; // Summary of its key insight
  score?: number; // Match or relevance score 1-100
  status: "completed" | "in_progress" | "error";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
  quickActionExecuted?: string;
  isMultiAIConsultation?: boolean;
  consultedAIs?: ConsultedAI[];
  selectedChoiceAI?: string;
}

export interface GeneratedLetter {
  id: string;
  documentType: "courrier" | "email";
  title: string;
  dateLocation: string;
  senderBlock: string;
  recipientBlock: string;
  subject: string;
  salutation: string;
  bodyParagraphs: string[];
  valediction: string;
  signature: string;
  fullText: string;
  georgesAdvice?: string;
  createdAt: string;
}

export type ImageResolution = "1K" | "2K" | "4K";
export type ImageAspectRatio = "16:9" | "1:1" | "4:3" | "3:4" | "9:16";

export interface SubjectLineOption {
  subject: string;
  predictedOpenRate: string;
  type: string;
}

export interface EmailCampaign {
  id: string;
  campaignTitle: string;
  targetAudience: string;
  subjectLines: SubjectLineOption[];
  previewText: string;
  emailHeadline: string;
  subheadline: string;
  bodyHtml: string;
  keyTakeaways: string[];
  callToAction: {
    buttonText: string;
    targetUrl: string;
    subtext?: string;
  };
  psMessage?: string;
  suggestedVisualPrompt: string;
  generatedVisualUrl?: string;
  visualResolution?: ImageResolution;
  visualAspectRatio?: ImageAspectRatio;
  createdAt: string;
}

export type EmailCategory = "important" | "newsletter" | "facture" | "promo";
export type EmailUrgency = "haute" | "moyenne" | "basse";

export interface EmailItem {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  category: EmailCategory;
  urgency: EmailUrgency;
  isRead: boolean;
  isStarred: boolean;
  summary?: string;
  suggestedAction?: string;
  tags?: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: "Personnel" | "Travail" | "Serveur" | "Idées";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  category: "Pro" | "Perso" | "Serveur" | "Emailing" | "Garde Ambulance";
  shiftType?: "jour" | "nuit" | "vacation" | "astreinte" | "repos";
  description?: string;
  location?: string;
  isCompleted: boolean;
}

// Horloge & Réveil Matin J.A.R.V.I.S.
export interface AlarmItem {
  id: string;
  label: string;
  time: string; // HH:mm
  enabled: boolean;
  repeatDays: string[]; // ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  soundType: "jarvis_arc" | "gentle_pulse" | "stark_alert" | "iron_man_chime";
  briefingOnWake: boolean;
}

export interface MorningWeather {
  city: string;
  temperatureC: number;
  condition: string;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  summary: string;
  attireAdvice: string;
}

export interface MorningBriefing {
  id: string;
  generatedAt: string;
  weather: MorningWeather;
  agendaSummary: string;
  shiftsCount: number;
  tasksCount: number;
  financialSummary: string;
  spokenScript: string;
}

// Données Applications Téléphone : Vacation Ambulance & Santé
export interface AmbulanceWorkShift {
  id: string;
  date: string; // YYYY-MM-DD
  vehicle: string; // Ex: "Ambulance ASSU-3", "VSL-02"
  partnerName: string; // Coéquipier
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDurationMinutes: number;
  interventionsCount: number;
  kilometersStart: number;
  kilometersEnd: number;
  totalKm: number;
  notes: string;
  status: "en_cours" | "validé" | "transmis";
  lastSyncedAt?: string;
}

export interface HealthLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  weightKg: number;
  targetWeightKg?: number;
  systolicBp?: number; // Tension systolique ex: 125
  diastolicBp?: number; // Tension diastolique ex: 80
  sleepHours?: number;
  hydrationLiters?: number;
  comment?: string;
  bmi: number;
}

// Publication d'application & Campagne de Testeurs
export interface AppProject {
  id: string;
  name: string;
  category: string;
  version: string;
  platform: "Android (Google Play)" | "iOS (App Store / TestFlight)" | "Web PWA";
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes: string;
  asoKeywords: string[];
  testersNeededCount: number;
  currentTestersCount: number;
  status: "bêta_ouverte" | "préparation_store" | "en_revue" | "publiée";
}

export interface BetaTester {
  id: string;
  name: string;
  email: string;
  platform: "Android" | "iOS" | "Multi-plateforme";
  profile: "Ambulancier / Pro Santé" | "Bêta-testeur tech" | "Partenaire";
  status: "invité" | "actif" | "retour_reçu";
  feedback?: string;
  joinedAt: string;
}

export interface HomeServerDisk {
  disk: string;
  totalGb: number;
  usedGb: number;
  usagePercent: number;
  status: "healthy" | "warning" | "critical";
}

export interface HomeServerInfo {
  hostname: string;
  os: string;
  status: "online" | "offline" | "standby";
  ipAddress: string;
  localBridgePort: number;
  uptime: string;
  cpu: {
    model: string;
    usagePercent: number;
    temperatureC: number;
  };
  ram: {
    totalGb: number;
    usedGb: number;
    usagePercent: number;
  };
  storage: HomeServerDisk[];
  network: {
    downloadMbps: number;
    uploadMbps: number;
    totalDownloadedTodayGb: number;
  };
  activeServices: {
    name: string;
    status: string;
    port: number;
  }[];
}

export interface ServerFile {
  id: string;
  name: string;
  path: string;
  size: string;
  type: "pdf" | "excel" | "archive" | "image" | "text" | "code";
  modified: string;
  category: string;
}

// Bourse & Portefeuille Virtuel Types
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export type GeorgesStockVerdict = "Achat Fort" | "Achat" | "Conserver" | "Prudence";

export interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  currency: "EUR" | "USD";
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  sparkline: number[];
  georgesRecommendation: GeorgesStockVerdict;
  georgesThesis: string;
  newsCatalyst: string;
  riskLevel: "Prudent" | "Modéré" | "Dynamique";
  targetPrice: number;
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  averageBuyPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  sector: string;
  currency: "EUR" | "USD";
}

export interface PortfolioTransaction {
  id: string;
  type: "BUY" | "SELL";
  symbol: string;
  name: string;
  shares: number;
  price: number;
  totalAmount: number;
  date: string;
}

export interface VirtualPortfolio {
  cashBalance: number;
  initialCapital: number;
  positions: PortfolioPosition[];
  transactions: PortfolioTransaction[];
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  impact: "positif" | "neutre" | "prudence";
  relatedSymbols: string[];
  georgesTake: string;
}

export interface StockAnalysisResult {
  symbol: string;
  name: string;
  currentPrice?: number;
  recommendation: GeorgesStockVerdict;
  targetPriceEstimated: string;
  riskScore: string;
  executiveSummary: string;
  catalysts: string[];
  risks: string[];
  timingAdvice: string;
  georgesVerdict: string;
}

export interface CapturedMedia {
  id: string;
  type: "photo" | "screenshot";
  dataUrl: string;
  timestamp: string;
  title: string;
  sourceDevice: string;
  analysis?: string;
  isAnalyzing?: boolean;
}

export type CodeCategory = 
  | "2fa_sms" 
  | "password" 
  | "pin" 
  | "wifi" 
  | "license" 
  | "api_key" 
  | "snippet" 
  | "autre";

export interface CodeVaultItem {
  id: string;
  title: string;
  code: string;
  category: CodeCategory;
  serviceOrOrigin?: string;
  capturedVia: "voice" | "hotkey" | "clipboard" | "manual";
  createdAt: string;
  expiresAt?: string;
  isFavorite?: boolean;
  notes?: string;
}

