import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  History,
  Newspaper,
  Plus,
  Minus,
  X,
  SlidersHorizontal,
  Bot
} from "lucide-react";
import {
  MarketIndex,
  StockItem,
  VirtualPortfolio,
  PortfolioPosition,
  PortfolioTransaction,
  MarketNewsItem,
  StockAnalysisResult,
  GeorgesStockVerdict,
} from "../types";

const INITIAL_PORTFOLIO: VirtualPortfolio = {
  cashBalance: 12500,
  initialCapital: 20000,
  positions: [
    {
      symbol: "MC.PA",
      name: "LVMH Moët Hennessy",
      shares: 6,
      averageBuyPrice: 615.0,
      totalInvested: 3690.0,
      currentPrice: 632.4,
      currentValue: 3794.4,
      gainLoss: 104.4,
      gainLossPercent: 2.83,
      sector: "Luxe & Consommation",
      currency: "EUR",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 15,
      averageBuyPrice: 118.0,
      totalInvested: 1770.0,
      currentPrice: 128.5,
      currentValue: 1927.5,
      gainLoss: 157.5,
      gainLossPercent: 8.9,
      sector: "Technologie & Semi-conducteurs",
      currency: "USD",
    },
    {
      symbol: "TTE.PA",
      name: "TotalEnergies",
      shares: 30,
      averageBuyPrice: 59.8,
      totalInvested: 1794.0,
      currentPrice: 61.2,
      currentValue: 1836.0,
      gainLoss: 42.0,
      gainLossPercent: 2.34,
      sector: "Énergie & Transition",
      currency: "EUR",
    },
  ],
  transactions: [
    {
      id: "tx-1",
      type: "BUY",
      symbol: "MC.PA",
      name: "LVMH Moët Hennessy",
      shares: 6,
      price: 615.0,
      totalAmount: 3690.0,
      date: "2026-09-12 10:15",
    },
    {
      id: "tx-2",
      type: "BUY",
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 15,
      price: 118.0,
      totalAmount: 1770.0,
      date: "2026-09-15 14:30",
    },
    {
      id: "tx-3",
      type: "BUY",
      symbol: "TTE.PA",
      name: "TotalEnergies",
      shares: 30,
      price: 59.8,
      totalAmount: 1794.0,
      date: "2026-09-18 09:45",
    },
  ],
};

interface FinanceTabProps {
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ onAddNote }) => {
  const [activeSubTab, setActiveSubTab] = useState<"markets" | "portfolio" | "custom">("markets");
  
  // Market Data state
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  // Virtual Portfolio state (stored in localStorage)
  const [portfolio, setPortfolio] = useState<VirtualPortfolio>(() => {
    try {
      const saved = localStorage.getItem("georges_virtual_portfolio");
      return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
    } catch {
      return INITIAL_PORTFOLIO;
    }
  });

  // Filter states
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Order Simulator Modal state
  const [orderModalStock, setOrderModalStock] = useState<StockItem | null>(null);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [orderShares, setOrderShares] = useState<number>(5);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Custom AI Stock Analysis state
  const [customStockQuery, setCustomStockQuery] = useState("");
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<StockAnalysisResult | null>(null);

  // Portfolio Audit Modal state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Save portfolio to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("georges_virtual_portfolio", JSON.stringify(portfolio));
    } catch (e) {
      console.error("Failed to save portfolio:", e);
    }
  }, [portfolio]);

  // Fetch market data
  const fetchMarkets = async () => {
    setIsLoadingMarkets(true);
    try {
      const res = await fetch("/api/finance/markets");
      if (res.ok) {
        const data = await res.json();
        setIndices(data.indices || []);
        setStocks(data.stocks || []);
        setNews(data.news || []);

        // Recalculate portfolio position values with latest prices
        setPortfolio((prev) => {
          const updatedPositions = prev.positions.map((pos) => {
            const currentStock = (data.stocks || []).find((s: StockItem) => s.symbol === pos.symbol);
            const currentPrice = currentStock ? currentStock.currentPrice : pos.currentPrice;
            const currentValue = Number((pos.shares * currentPrice).toFixed(2));
            const gainLoss = Number((currentValue - pos.totalInvested).toFixed(2));
            const gainLossPercent = Number(((gainLoss / pos.totalInvested) * 100).toFixed(2));
            return {
              ...pos,
              currentPrice,
              currentValue,
              gainLoss,
              gainLossPercent,
            };
          });
          return {
            ...prev,
            positions: updatedPositions,
          };
        });
      }
    } catch (err) {
      console.error("Error loading markets:", err);
    } finally {
      setIsLoadingMarkets(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  // Portfolio aggregates
  const totalStockValue = portfolio.positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalInvestedAmount = portfolio.positions.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalWealth = portfolio.cashBalance + totalStockValue;
  const overallGainLoss = totalStockValue - totalInvestedAmount;
  const overallGainLossPercent = totalInvestedAmount > 0 ? (overallGainLoss / totalInvestedAmount) * 100 : 0;

  // Execute Order
  const handleExecuteOrder = () => {
    if (!orderModalStock || orderShares <= 0) return;

    const price = orderModalStock.currentPrice;
    const totalAmount = Number((orderShares * price).toFixed(2));

    if (orderType === "BUY") {
      if (portfolio.cashBalance < totalAmount) {
        alert("Solde d'espèces virtuel insuffisant pour cet achat.");
        return;
      }

      setPortfolio((prev) => {
        const existingIndex = prev.positions.findIndex((p) => p.symbol === orderModalStock.symbol);
        let updatedPositions = [...prev.positions];

        if (existingIndex >= 0) {
          const current = updatedPositions[existingIndex];
          const newShares = current.shares + orderShares;
          const newTotalInvested = Number((current.totalInvested + totalAmount).toFixed(2));
          const newAvgPrice = Number((newTotalInvested / newShares).toFixed(2));
          const newCurrentVal = Number((newShares * price).toFixed(2));
          const newGainLoss = Number((newCurrentVal - newTotalInvested).toFixed(2));
          const newGainLossPct = Number(((newGainLoss / newTotalInvested) * 100).toFixed(2));

          updatedPositions[existingIndex] = {
            ...current,
            shares: newShares,
            averageBuyPrice: newAvgPrice,
            totalInvested: newTotalInvested,
            currentPrice: price,
            currentValue: newCurrentVal,
            gainLoss: newGainLoss,
            gainLossPercent: newGainLossPct,
          };
        } else {
          updatedPositions.push({
            symbol: orderModalStock.symbol,
            name: orderModalStock.name,
            shares: orderShares,
            averageBuyPrice: price,
            totalInvested: totalAmount,
            currentPrice: price,
            currentValue: totalAmount,
            gainLoss: 0,
            gainLossPercent: 0,
            sector: orderModalStock.sector,
            currency: orderModalStock.currency,
          });
        }

        const newTx: PortfolioTransaction = {
          id: `tx-${Date.now()}`,
          type: "BUY",
          symbol: orderModalStock.symbol,
          name: orderModalStock.name,
          shares: orderShares,
          price,
          totalAmount,
          date: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
        };

        return {
          ...prev,
          cashBalance: Number((prev.cashBalance - totalAmount).toFixed(2)),
          positions: updatedPositions,
          transactions: [newTx, ...prev.transactions],
        };
      });

      setOrderSuccessMsg(`Ordre exécuté : Achat de ${orderShares} x ${orderModalStock.name} pour ${totalAmount.toLocaleString("fr-FR")} €.`);
    } else {
      // SELL
      const existing = portfolio.positions.find((p) => p.symbol === orderModalStock.symbol);
      if (!existing || existing.shares < orderShares) {
        alert("Vous ne possédez pas suffisamment d'actions de cette ligne.");
        return;
      }

      setPortfolio((prev) => {
        let updatedPositions = [...prev.positions];
        const existingIndex = updatedPositions.findIndex((p) => p.symbol === orderModalStock.symbol);
        const current = updatedPositions[existingIndex];
        const remainingShares = current.shares - orderShares;

        if (remainingShares === 0) {
          updatedPositions.splice(existingIndex, 1);
        } else {
          const shareProportion = remainingShares / current.shares;
          const newTotalInvested = Number((current.totalInvested * shareProportion).toFixed(2));
          const newCurrentVal = Number((remainingShares * price).toFixed(2));
          const newGainLoss = Number((newCurrentVal - newTotalInvested).toFixed(2));
          const newGainLossPct = Number(((newGainLoss / newTotalInvested) * 100).toFixed(2));

          updatedPositions[existingIndex] = {
            ...current,
            shares: remainingShares,
            totalInvested: newTotalInvested,
            currentValue: newCurrentVal,
            gainLoss: newGainLoss,
            gainLossPercent: newGainLossPct,
          };
        }

        const newTx: PortfolioTransaction = {
          id: `tx-${Date.now()}`,
          type: "SELL",
          symbol: orderModalStock.symbol,
          name: orderModalStock.name,
          shares: orderShares,
          price,
          totalAmount,
          date: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
        };

        return {
          ...prev,
          cashBalance: Number((prev.cashBalance + totalAmount).toFixed(2)),
          positions: updatedPositions,
          transactions: [newTx, ...prev.transactions],
        };
      });

      setOrderSuccessMsg(`Ordre exécuté : Vente de ${orderShares} x ${orderModalStock.name} créditée (+${totalAmount.toLocaleString("fr-FR")} €).`);
    }

    setTimeout(() => {
      setOrderSuccessMsg(null);
      setOrderModalStock(null);
    }, 1800);
  };

  // Run Custom Stock Analysis with Gemini
  const handleAnalyzeCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStockQuery.trim()) return;

    setIsAnalyzingCustom(true);
    setCustomAnalysis(null);

    try {
      const res = await fetch("/api/finance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customStockQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomAnalysis(data);
      }
    } catch (err) {
      console.error("Custom analysis error:", err);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  // Run Portfolio Audit with Gemini
  const handleAuditPortfolio = async () => {
    setIsAuditing(true);
    setIsAuditModalOpen(true);
    try {
      const res = await fetch("/api/finance/portfolio-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Reset Portfolio to Initial
  const handleResetPortfolio = () => {
    if (window.confirm("Réinitialiser le portefeuille virtuel à son capital de départ de 20 000 € ?")) {
      setPortfolio(INITIAL_PORTFOLIO);
    }
  };

  // Filter stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchesSector = selectedSector === "all" ? true : stock.sector.includes(selectedSector);
    const matchesVerdict =
      selectedVerdictFilter === "all"
        ? true
        : selectedVerdictFilter === "buy"
        ? stock.georgesRecommendation === "Achat Fort" || stock.georgesRecommendation === "Achat"
        : stock.georgesRecommendation === selectedVerdictFilter;
    const matchesSearch =
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesVerdict && matchesSearch;
  });

  // Calculate sector distribution for chart/visual
  const sectorMap: { [key: string]: number } = {};
  portfolio.positions.forEach((p) => {
    sectorMap[p.sector] = (sectorMap[p.sector] || 0) + p.currentValue;
  });
  const sectorList = Object.entries(sectorMap).map(([sector, val]) => ({
    sector,
    value: val,
    percent: totalStockValue > 0 ? (val / totalStockValue) * 100 : 0,
  }));

  const getVerdictBadge = (verdict: GeorgesStockVerdict) => {
    switch (verdict) {
      case "Achat Fort":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Achat":
        return "bg-teal-50 text-teal-700 border-teal-200 font-semibold";
      case "Conserver":
        return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      case "Prudence":
        return "bg-amber-50 text-amber-800 border-amber-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Top Banner: Virtual Portfolio Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg shadow-sm">
                G
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Bourse & Portefeuille Virtuel
                </h2>
                <span className="text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  Conseillé par Georges
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Surveillance des marchés financiers, analyse de l'actualité en temps réel et recommandations d'actions
              à l'achat. Gérez vos positions virtuelles en toute sécurité sans risquer un centime réel.
            </p>
          </div>

          {/* Quick Portfolio Stats */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Valeur Totale</span>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {totalWealth.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-0.5">
                {overallGainLoss >= 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    +{overallGainLoss.toFixed(1)} € (+{overallGainLossPercent.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium flex items-center">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {overallGainLoss.toFixed(1)} € ({overallGainLossPercent.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Liquidités (Cash)</span>
              <div className="text-lg sm:text-xl font-bold text-amber-400 tracking-tight">
                {portfolio.cashBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
              <span className="text-[10px] text-slate-400">
                {portfolio.positions.length} lignes actives
              </span>
            </div>

            <button
              onClick={handleAuditPortfolio}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-stretch justify-center"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Auditer par Georges</span>
            </button>
          </div>
        </div>

        {/* Major Market Indices Carousel */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          {indices.map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold text-white">{idx.name}</span>
                  <span
                    className={`font-semibold flex items-center text-[11px] ${
                      isPos ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPos ? "+" : ""}
                    {idx.changePercent}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {idx.price.toLocaleString("fr-FR")}
                  </span>
                  <span className={`text-[11px] ${isPos ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                    {isPos ? "+" : ""}
                    {idx.change.toFixed(2)} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("markets")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "markets"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Marchés & Recommandations IA ({stocks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("portfolio")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "portfolio"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-600" />
            <span>Mon Portefeuille ({portfolio.positions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("custom")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "custom"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4 text-indigo-600" />
            <span>Analyse Action sur-mesure</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMarkets}
            disabled={isLoadingMarkets}
            className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rafraîchir les cours en temps réel"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMarkets ? "animate-spin text-amber-600" : ""}`} />
            <span className="hidden sm:inline">Actualiser les cours</span>
          </button>

          <button
            onClick={handleResetPortfolio}
            className="text-xs text-slate-500 hover:text-rose-700 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="Réinitialiser le capital virtuel à 20 000 €"
          >
            Réinitialiser capital
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MARKETS & RECOMMENDATIONS */}
      {activeSubTab === "markets" && (
        <div className="space-y-6">
          {/* Market News Flash */}
          {news.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-xs sm:text-sm">
                <Newspaper className="w-4 h-4 text-amber-700" />
                <span>Le Décryptage de Georges sur l'Actualité des Marchés</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {news.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl p-3 border border-amber-200/60 shadow-xs text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-medium text-amber-800">{n.source}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs mb-1.5 line-clamp-2">{n.title}</p>
                    <div className="bg-amber-50/50 p-2 rounded-lg text-slate-700 text-[11px] border border-amber-100">
                      <strong className="text-amber-900 font-semibold">Conseil Georges :</strong> {n.georgesTake}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une action (LVMH, Nvidia, TotalEnergies, Airbus...)"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">Tous les secteurs</option>
                <option value="Luxe">Luxe & Consommation</option>
                <option value="Technologie">Tech & Semi-conducteurs</option>
                <option value="Énergie">Énergie</option>
                <option value="Aéronautique">Aéronautique</option>
                <option value="Santé">Santé</option>
                <option value="Industrie">Industrie</option>
              </select>

              <select
                value={selectedVerdictFilter}
                onChange={(e) => setSelectedVerdictFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">Tous les avis</option>
                <option value="buy">Recommandés à l'achat</option>
                <option value="Achat Fort">Achat Fort uniquement</option>
                <option value="Conserver">Conserver</option>
              </select>
            </div>
          </div>

          {/* Stocks Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStocks.map((stock) => {
              const isPos = stock.change >= 0;
              const hasInPortfolio = portfolio.positions.find((p) => p.symbol === stock.symbol);

              return (
                <div
                  key={stock.symbol}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Company & Live Price */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                            {stock.symbol}
                          </span>
                          <span className="text-xs text-slate-500">{stock.sector}</span>
                          {hasInPortfolio && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2 py-0.2 rounded-full">
                              En portefeuille ({hasInPortfolio.shares} act.)
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{stock.name}</h3>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 tracking-tight">
                          {stock.currentPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {stock.currency === "EUR" ? "€" : "$"}
                        </div>
                        <div className={`text-xs font-semibold flex items-center justify-end ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                          {isPos ? "+" : ""}
                          {stock.change.toFixed(2)} ({isPos ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>

                    {/* Stock Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-500 mb-3">
                      <div>
                        <span className="block text-[10px] text-slate-400">P/E Ratio</span>
                        <strong className="text-slate-800">{stock.peRatio}x</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Dividende</span>
                        <strong className="text-slate-800">{stock.dividendYield}%</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Cible estimée</span>
                        <strong className="text-emerald-700 font-semibold">{stock.targetPrice} {stock.currency === "EUR" ? "€" : "$"}</strong>
                      </div>
                    </div>

                    {/* Georges Recommendation & Investment Thesis */}
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-amber-600" />
                          <span>Avis de Georges :</span>
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getVerdictBadge(stock.georgesRecommendation)}`}>
                          {stock.georgesRecommendation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed mb-2">
                        {stock.georgesThesis}
                      </p>
                      <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
                        <span className="font-semibold text-amber-800">Catalyseur :</span>
                        <span>{stock.newsCatalyst}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setOrderModalStock(stock);
                        setOrderType("BUY");
                        setOrderShares(5);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Acheter au virtuel</span>
                    </button>

                    {hasInPortfolio && (
                      <button
                        onClick={() => {
                          setOrderModalStock(stock);
                          setOrderType("SELL");
                          setOrderShares(hasInPortfolio.shares);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Vendre</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onAddNote(
                          `Opportunité Bourse : ${stock.name} (${stock.symbol})`,
                          `Recommandation : ${stock.georgesRecommendation}\nCours : ${stock.currentPrice} ${stock.currency}\nObjectif : ${stock.targetPrice} ${stock.currency}\n\nThèse de Georges : ${stock.georgesThesis}\n\nCatalyseur : ${stock.newsCatalyst}`,
                          "Idées"
                        );
                        alert(`Note sur ${stock.name} enregistrée dans votre carnet !`);
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl transition-colors cursor-pointer"
                      title="Enregistrer cette opportunité dans mes notes"
                    >
                      Prendre note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: VIRTUAL PORTFOLIO */}
      {activeSubTab === "portfolio" && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">Actions Détenues</span>
              <div className="text-2xl font-bold text-slate-900">
                {totalStockValue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Investi initialement : {totalInvestedAmount.toLocaleString("fr-FR")} €
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">Plus-Value Totale Latente</span>
              <div className={`text-2xl font-bold ${overallGainLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {overallGainLoss >= 0 ? "+" : ""}
                {overallGainLoss.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € ({overallGainLossPercent >= 0 ? "+" : ""}
                {overallGainLossPercent.toFixed(2)}%)
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sur {portfolio.positions.length} lignes en portefeuille
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">Liquidités Disponibles</span>
              <div className="text-2xl font-bold text-amber-600">
                {portfolio.cashBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Prêtes pour de nouvelles opportunités
              </p>
            </div>
          </div>

          {/* Sector Breakdown */}
          {sectorList.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-600" />
                <span>Répartition Sectorielle de vos Investissements Virtuels</span>
              </h3>
              <div className="space-y-2.5">
                {sectorList.map((sec) => (
                  <div key={sec.sector} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sec.sector}</span>
                      <span className="text-slate-600">
                        {sec.value.toLocaleString("fr-FR")} € ({sec.percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sec.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Lignes d'actions en portefeuille ({portfolio.positions.length})
              </h3>
              <span className="text-xs text-slate-500">
                Valorisation mise à jour en temps réel
              </span>
            </div>

            {portfolio.positions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Aucune action en portefeuille pour le moment. Consultez l'onglet « Marchés & Recommandations » pour faire vos premiers achats virtuels !
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Valeur</th>
                      <th className="py-3 px-4">Quantité</th>
                      <th className="py-3 px-4">PRU (Achat)</th>
                      <th className="py-3 px-4">Cours actuel</th>
                      <th className="py-3 px-4">Valeur totale</th>
                      <th className="py-3 px-4">Plus-Value (€ / %)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portfolio.positions.map((pos) => {
                      const isGain = pos.gainLoss >= 0;
                      return (
                        <tr key={pos.symbol} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{pos.name}</span>
                            <span className="font-mono text-[11px] text-slate-500">{pos.symbol}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {pos.shares}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {pos.averageBuyPrice.toLocaleString("fr-FR")} €
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {pos.currentPrice.toLocaleString("fr-FR")} €
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {pos.currentValue.toLocaleString("fr-FR")} €
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-0.5 ${
                                isGain ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {isGain ? "+" : ""}
                              {pos.gainLoss.toFixed(2)} € ({isGain ? "+" : ""}
                              {pos.gainLossPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                const st = stocks.find((s) => s.symbol === pos.symbol) || {
                                  symbol: pos.symbol,
                                  name: pos.name,
                                  currentPrice: pos.currentPrice,
                                  sector: pos.sector,
                                  currency: pos.currency,
                                } as StockItem;
                                setOrderModalStock(st);
                                setOrderType("BUY");
                                setOrderShares(5);
                              }}
                              className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Renforcer la position"
                            >
                              + Acheter
                            </button>
                            <button
                              onClick={() => {
                                const st = stocks.find((s) => s.symbol === pos.symbol) || {
                                  symbol: pos.symbol,
                                  name: pos.name,
                                  currentPrice: pos.currentPrice,
                                  sector: pos.sector,
                                  currency: pos.currency,
                                } as StockItem;
                                setOrderModalStock(st);
                                setOrderType("SELL");
                                setOrderShares(pos.shares);
                              }}
                              className="text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Vendre / Alléger la position"
                            >
                              Vendre
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transactions Log */}
          {portfolio.transactions.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Historique des Ordres Exécutés ({portfolio.transactions.length})</span>
              </h3>
              <div className="space-y-2">
                {portfolio.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                          tx.type === "BUY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {tx.type === "BUY" ? "Achat" : "Vente"}
                      </span>
                      <div>
                        <strong className="text-slate-900">{tx.name}</strong>
                        <span className="text-slate-500 ml-1.5">
                          {tx.shares} actions @ {tx.price.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {tx.totalAmount.toLocaleString("fr-FR")} €
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: CUSTOM STOCK ANALYSIS WITH GEMINI */}
      {activeSubTab === "custom" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="max-w-2xl mb-4">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Demandez à Georges d'analyser n'importe quelle action ou secteur
              </h3>
              <p className="text-xs text-slate-500">
                Indiquez le nom ou le ticker d'une entreprise (ex: Hermès, Tesla, BNP Paribas, Sanofi, ETF World...) :
                Georges étudie les fondamentaux, les catalyseurs d'actualité et vous donne son diagnostic clair.
              </p>
            </div>

            <form onSubmit={handleAnalyzeCustom} className="flex gap-2">
              <input
                type="text"
                value={customStockQuery}
                onChange={(e) => setCustomStockQuery(e.target.value)}
                placeholder="Ex : Hermès, Tesla, BNP Paribas, ETF S&P 500, Kering..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={isAnalyzingCustom || !customStockQuery.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingCustom ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Georges analyse les marchés...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Analyser avec Georges</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Analysis Result */}
          {customAnalysis && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-md">
                      {customAnalysis.symbol}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getVerdictBadge(customAnalysis.recommendation)}`}>
                      {customAnalysis.recommendation}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{customAnalysis.name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Objectif estimé</span>
                    <strong className="text-emerald-700 text-sm font-bold">{customAnalysis.targetPriceEstimated}</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Risque</span>
                    <strong className="text-slate-800 text-sm font-bold">{customAnalysis.riskScore}</strong>
                  </div>
                </div>
              </div>

              {/* Executive summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-600" />
                  <span>Synthèse du Majordome :</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {customAnalysis.executiveSummary}
                </p>
              </div>

              {/* Catalysts & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Catalyseurs & Points Forts d'Actualité</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {customAnalysis.catalysts.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">&bull;</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
                  <h5 className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Risques à Surveiller</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {customAnalysis.risks.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">&bull;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Timing & Verdict */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Conseil d'allocation pour Fabrice :</span>
                </div>
                <p className="leading-relaxed">{customAnalysis.georgesVerdict}</p>
                <p className="text-[11px] text-amber-800 font-medium pt-1">
                  Timing recommandé : {customAnalysis.timingAdvice}
                </p>
              </div>

              {/* Save as note */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onAddNote(
                      `Analyse Action : ${customAnalysis.name} (${customAnalysis.symbol})`,
                      `Recommandation : ${customAnalysis.recommendation}\nCible : ${customAnalysis.targetPriceEstimated}\nRisque : ${customAnalysis.riskScore}\n\nSynthèse : ${customAnalysis.executiveSummary}\n\nVerdict : ${customAnalysis.georgesVerdict}`,
                      "Idées"
                    );
                    alert(`Analyse de ${customAnalysis.name} enregistrée dans votre carnet !`);
                  }}
                  className="text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Enregistrer dans mes Notes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ORDER SIMULATOR */}
      {orderModalStock && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Simulation d'ordre virtuel
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {orderType === "BUY" ? "Acheter" : "Vendre"} {orderModalStock.name}
                </h3>
              </div>
              <button
                onClick={() => setOrderModalStock(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{orderSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cours d'exécution</span>
                    <strong className="text-sm font-bold text-slate-900">
                      {orderModalStock.currentPrice.toLocaleString("fr-FR")} €
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Liquidités actuelles</span>
                    <strong className="text-sm font-bold text-amber-600">
                      {portfolio.cashBalance.toLocaleString("fr-FR")} €
                    </strong>
                  </div>
                </div>

                {/* Shares counter */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Nombre d'actions à {orderType === "BUY" ? "acheter" : "céder"} :
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOrderShares((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={orderShares}
                      onChange={(e) => setOrderShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center font-bold text-base py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      onClick={() => setOrderShares((prev) => prev + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1 text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Montant total estimé :</span>
                    <strong className="text-slate-900">
                      {(orderShares * orderModalStock.currentPrice).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Frais de courtage :</span>
                    <span className="text-emerald-600 font-semibold">0,00 € (Offert par Georges)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setOrderModalStock(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleExecuteOrder}
                    className={`flex-1 py-2.5 font-bold rounded-xl text-white transition-colors cursor-pointer shadow-xs ${
                      orderType === "BUY" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    Confirmer l'{orderType === "BUY" ? "Achat" : "Vente"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PORTFOLIO AUDIT BY GEORGES */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 font-bold flex items-center justify-center">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Audit Patrimonial de Georges</h3>
                  <p className="text-[11px] text-slate-500">Analyse de diversification et gestion des risques</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAuditing ? (
              <div className="py-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Georges analyse la pondération de vos lignes et votre exposition sectorielle...
                </p>
              </div>
            ) : auditResult ? (
              <div className="space-y-4 text-xs">
                {/* Health & Diversification */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Score de Santé</span>
                    <strong className="text-xl font-bold text-emerald-600">
                      {auditResult.healthScore} / 100
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Diversification</span>
                    <strong className="text-xl font-bold text-slate-900">
                      {auditResult.diversificationRating}
                    </strong>
                  </div>
                </div>

                {/* Overall comment */}
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-amber-950 leading-relaxed">
                  <strong className="text-amber-900 block font-semibold mb-1">Avis du Majordome :</strong>
                  {auditResult.overallComment}
                </div>

                {/* Advice list */}
                <div className="space-y-2">
                  <strong className="text-slate-900 block font-semibold">Conseils d'ajustement :</strong>
                  <ul className="space-y-1.5">
                    {auditResult.adviceList.map((adv: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsAuditModalOpen(false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Bien compris, merci Georges
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
