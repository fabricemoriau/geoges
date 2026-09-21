/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { ChatTab } from "./components/ChatTab";
import { LettersTab } from "./components/LettersTab";
import { FinanceTab } from "./components/FinanceTab";
import { CampaignTab } from "./components/CampaignTab";
import { EmailTab } from "./components/EmailTab";
import { AgendaTab } from "./components/AgendaTab";
import { NotesTab } from "./components/NotesTab";
import { HomeServerTab } from "./components/HomeServerTab";
import { JarvisVisionModal } from "./components/JarvisVisionModal";
import { AlarmClockTab } from "./components/AlarmClockTab";
import { PhoneAppsTab } from "./components/PhoneAppsTab";
import { AppPublisherTab } from "./components/AppPublisherTab";
import { CodeVaultTab } from "./components/CodeVaultTab";
import { 
  initialEmails, 
  initialNotes, 
  initialAgendaEvents,
  initialAlarms,
  initialAmbulanceShifts,
  initialHealthLogs,
  initialAppProject,
  initialBetaTesters,
  initialCodeVaultItems
} from "./data/initialData";
import { 
  EmailItem, 
  NoteItem, 
  AgendaEvent, 
  AIChatModel,
  AlarmItem,
  AmbulanceWorkShift,
  HealthLogEntry,
  AppProject,
  BetaTester,
  CodeVaultItem
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("chat");
  const [activeModel, setActiveModel] = useState<AIChatModel>("gemini-3.5-flash");

  // Vision Modal State (Photo Smartphone & Screenshot HUD)
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [visionModalMode, setVisionModalMode] = useState<"photo" | "screenshot">("photo");

  const handleOpenVisionModal = (mode: "photo" | "screenshot" = "photo") => {
    setVisionModalMode(mode);
    setIsVisionModalOpen(true);
  };

  // App data state with localStorage persistence
  const [emails, setEmails] = useState<EmailItem[]>(() => {
    const saved = localStorage.getItem("georges_emails");
    return saved ? JSON.parse(saved) : initialEmails;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem("georges_notes");
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem("georges_events");
    return saved ? JSON.parse(saved) : initialAgendaEvents;
  });

  // Alarms State
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem("georges_alarms");
    return saved ? JSON.parse(saved) : initialAlarms;
  });

  // Ambulance Shifts State (Phone App 1)
  const [ambulanceShifts, setAmbulanceShifts] = useState<AmbulanceWorkShift[]>(() => {
    const saved = localStorage.getItem("georges_ambulance_shifts");
    return saved ? JSON.parse(saved) : initialAmbulanceShifts;
  });

  // Health Logs State (Phone App 2)
  const [healthLogs, setHealthLogs] = useState<HealthLogEntry[]>(() => {
    const saved = localStorage.getItem("georges_health_logs");
    return saved ? JSON.parse(saved) : initialHealthLogs;
  });

  // App Project & Testers State (Publishing)
  const [appProject, setAppProject] = useState<AppProject>(() => {
    const saved = localStorage.getItem("georges_app_project");
    return saved ? JSON.parse(saved) : initialAppProject;
  });

  const [betaTesters, setBetaTesters] = useState<BetaTester[]>(() => {
    const saved = localStorage.getItem("georges_beta_testers");
    return saved ? JSON.parse(saved) : initialBetaTesters;
  });

  // Code Vault State (Captured via computer hotkey, voice, or clipboard)
  const [codes, setCodes] = useState<CodeVaultItem[]>(() => {
    const saved = localStorage.getItem("georges_codes");
    return saved ? JSON.parse(saved) : initialCodeVaultItems;
  });

  const [hotkeyToast, setHotkeyToast] = useState<{ message: string; code: string } | null>(null);

  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("georges_emails", JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem("georges_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("georges_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("georges_alarms", JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem("georges_ambulance_shifts", JSON.stringify(ambulanceShifts));
  }, [ambulanceShifts]);

  useEffect(() => {
    localStorage.setItem("georges_health_logs", JSON.stringify(healthLogs));
  }, [healthLogs]);

  useEffect(() => {
    localStorage.setItem("georges_app_project", JSON.stringify(appProject));
  }, [appProject]);

  useEffect(() => {
    localStorage.setItem("georges_beta_testers", JSON.stringify(betaTesters));
  }, [betaTesters]);

  useEffect(() => {
    localStorage.setItem("georges_codes", JSON.stringify(codes));
  }, [codes]);

  // Global Hotkey Listener: Alt + C or Ctrl + Shift + C or F8 to grab code from clipboard
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea and pressing normal keys
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      const isAltC = e.altKey && (e.key === "c" || e.key === "C" || e.code === "KeyC");
      const isCtrlShiftC = e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C" || e.code === "KeyC");
      const isF8 = e.key === "F8";

      if (isAltC || isCtrlShiftC || isF8) {
        // If it's a hotkey combination, we want to grab clipboard even inside inputs
        e.preventDefault();
        try {
          if (navigator.clipboard) {
            const text = await navigator.clipboard.readText();
            const clean = text ? text.trim() : "";
            if (clean) {
              // Smart detect category
              let cat: CodeVaultItem["category"] = "autre";
              let title = "Code attrapé au clavier [Alt+C]";
              if (/^\d{6}$/.test(clean.replace(/\s+/g, ""))) {
                cat = "2fa_sms";
                title = "Validation SMS / 2FA 6 chiffres";
              } else if (/^\d{4,5}[#*]?$/.test(clean)) {
                cat = "pin";
                title = "Code PIN / Digicode";
              } else if (clean.startsWith("ssh") || clean.includes("curl") || clean.includes("sudo")) {
                cat = "snippet";
                title = "Commande Terminal";
              } else if (clean.startsWith("AIza") || clean.startsWith("sk-")) {
                cat = "api_key";
                title = "Clé d'API Développeur";
              } else if (/^[A-Z0-9]{4,5}-[A-Z0-9]{4,5}/.test(clean)) {
                cat = "license";
                title = "Clé de Licence Logiciel";
              }

              const newCodeItem: CodeVaultItem = {
                id: `code-${Date.now()}`,
                title,
                code: clean,
                category: cat,
                serviceOrOrigin: "Attrapé sur Ordinateur",
                capturedVia: "hotkey",
                createdAt: "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isFavorite: false,
                notes: "Capturé instantanément via raccourci clavier global Alt+C"
              };

              setCodes((prev) => [newCodeItem, ...prev]);
              setHotkeyToast({
                message: `Code attrapé par Georges ! [${cat.toUpperCase()}]`,
                code: clean.slice(0, 18) + (clean.length > 18 ? "..." : "")
              });

              // Play Stark chime
              try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                  const ctx = new AudioCtx();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(1046, ctx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.15);
                  gain.gain.setValueAtTime(0.18, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
                }
              } catch (err) {}

              setTimeout(() => setHotkeyToast(null), 4000);
            }
          }
        } catch (err) {
          console.warn("Clipboard hotkey capture error:", err);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Code Vault Handlers
  const handleAddCode = (codeData: Omit<CodeVaultItem, "id" | "createdAt">) => {
    const newCode: CodeVaultItem = {
      ...codeData,
      id: `code-${Date.now()}`,
      createdAt: "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setCodes((prev) => [newCode, ...prev]);
  };

  const handleDeleteCode = (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleFavoriteCode = (id: string) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  // Handlers for cross-component actions
  const handleAddNote = (
    title: string,
    content: string,
    category: "Personnel" | "Travail" | "Serveur" | "Idées"
  ) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title,
      content,
      category,
      tags: ["Georges", category.toLowerCase()],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      isPinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleAddEvent = (
    title: string,
    date: string,
    time: string,
    category: "Pro" | "Perso" | "Serveur" | "Emailing" | "Garde Ambulance",
    location?: string
  ) => {
    const newEv: AgendaEvent = {
      id: `ev-${Date.now()}`,
      title,
      date,
      time,
      durationMinutes: category === "Garde Ambulance" ? 720 : 45,
      category,
      location: location || (category === "Garde Ambulance" ? "Secteur Urgences CHU" : "Bureau"),
      isCompleted: false,
    };
    setEvents((prev) => [newEv, ...prev]);
  };

  const handleToggleCompleteEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Alarm Handlers
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleAddAlarm = (alarmData: Omit<AlarmItem, "id">) => {
    const newAlarm: AlarmItem = {
      id: `alarm-${Date.now()}`,
      ...alarmData,
    };
    setAlarms((prev) => [newAlarm, ...prev]);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // Ambulance Shifts Handlers
  const handleAddShift = (shiftData: Omit<AmbulanceWorkShift, "id">) => {
    const newShift: AmbulanceWorkShift = {
      id: `shift-${Date.now()}`,
      ...shiftData,
    };
    setAmbulanceShifts((prev) => [newShift, ...prev]);
    // Also add to agenda
    handleAddEvent(
      `Vacation Ambulance ${shiftData.vehicle}`,
      shiftData.date,
      shiftData.startTime,
      "Garde Ambulance",
      "Équipage " + shiftData.partnerName
    );
  };

  const handleUpdateShiftStatus = (id: string, status: AmbulanceWorkShift["status"]) => {
    setAmbulanceShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleDeleteShift = (id: string) => {
    setAmbulanceShifts((prev) => prev.filter((s) => s.id !== id));
  };

  // Health Log Handlers
  const handleAddHealthLog = (data: Omit<HealthLogEntry, "id" | "bmi">) => {
    // calculate BMI with average height 1.82m
    const heightM = 1.82;
    const bmi = Number((data.weightKg / (heightM * heightM)).toFixed(1));
    const newLog: HealthLogEntry = {
      id: `health-${Date.now()}`,
      ...data,
      bmi,
    };
    setHealthLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteHealthLog = (id: string) => {
    setHealthLogs((prev) => prev.filter((h) => h.id !== id));
  };

  // Testers & App Project Handlers
  const handleAddTester = (testerData: Omit<BetaTester, "id" | "joinedAt">) => {
    const newTester: BetaTester = {
      id: `tester-${Date.now()}`,
      ...testerData,
      joinedAt: new Date().toLocaleDateString("fr-FR"),
    };
    setBetaTesters((prev) => [newTester, ...prev]);
  };

  const handleDeleteTester = (id: string) => {
    setBetaTesters((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateProject = (updated: Partial<AppProject>) => {
    setAppProject((prev) => ({ ...prev, ...updated }));
  };

  const unreadEmailsCount = emails.filter((e) => !e.isRead).length;
  const upcomingEventsCount = events.filter((e) => !e.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Executive Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeModel={activeModel}
        serverOnline={serverOnline}
        unreadCount={unreadEmailsCount}
        upcomingEventsCount={upcomingEventsCount}
        onOpenVisionModal={handleOpenVisionModal}
      />

      {/* Navigation Pills */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadEmailsCount={unreadEmailsCount}
        notesCount={notes.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === "chat" && (
          <ChatTab
            onNavigateToTab={setCurrentTab}
            onAddNote={handleAddNote}
            onAddEvent={handleAddEvent}
            unreadCount={unreadEmailsCount}
            onOpenVisionModal={handleOpenVisionModal}
            onAddCode={handleAddCode}
          />
        )}

        {currentTab === "alarm" && (
          <AlarmClockTab
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onAddAlarm={handleAddAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            agendaEvents={events}
            unreadEmailsCount={unreadEmailsCount}
          />
        )}

        {currentTab === "codes" && (
          <CodeVaultTab
            codes={codes}
            onAddCode={handleAddCode}
            onDeleteCode={handleDeleteCode}
            onToggleFavorite={handleToggleFavoriteCode}
            onSaveAsNote={handleAddNote}
          />
        )}

        {currentTab === "phone_apps" && (
          <PhoneAppsTab
            shifts={ambulanceShifts}
            onAddShift={handleAddShift}
            onUpdateShiftStatus={handleUpdateShiftStatus}
            onDeleteShift={handleDeleteShift}
            healthLogs={healthLogs}
            onAddHealthLog={handleAddHealthLog}
            onDeleteHealthLog={handleDeleteHealthLog}
          />
        )}

        {currentTab === "publisher" && (
          <AppPublisherTab
            project={appProject}
            testers={betaTesters}
            onAddTester={handleAddTester}
            onDeleteTester={handleDeleteTester}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {currentTab === "agenda" && (
          <AgendaTab
            events={events}
            onAddEvent={handleAddEvent}
            onToggleComplete={handleToggleCompleteEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentTab === "finance" && (
          <FinanceTab onAddNote={handleAddNote} />
        )}

        {currentTab === "letters" && (
          <LettersTab
            onSaveAsNote={handleAddNote}
            onSendAsEmail={(subject, body, recipient) => {
              const newMail: EmailItem = {
                id: `mail-${Date.now()}`,
                from: "fabrice.moriau@gmail.com",
                fromName: "Moi (Fabrice)",
                subject,
                date: "À l'instant",
                snippet: body.slice(0, 100),
                body,
                category: "important",
                urgency: "moyenne",
                isRead: true,
                isStarred: false,
                summary: `Email envoyé à ${recipient}`,
              };
              setEmails((prev) => [newMail, ...prev]);
              setCurrentTab("emails");
            }}
          />
        )}

        {currentTab === "campaigns" && (
          <CampaignTab onSaveAsNote={handleAddNote} />
        )}

        {currentTab === "emails" && (
          <EmailTab
            emails={emails}
            onUpdateEmails={setEmails}
            onAddNote={handleAddNote}
            onAddEvent={handleAddEvent}
            onNavigateToLetters={() => setCurrentTab("letters")}
          />
        )}

        {currentTab === "notes" && (
          <NotesTab
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePinNote}
          />
        )}

        {currentTab === "server" && (
          <HomeServerTab onAddNote={handleAddNote} />
        )}
      </main>

      {/* J.A.R.V.I.S. Multimodal Vision Modal (Phone Camera, Live HUD & Screenshot) */}
      <JarvisVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        initialMode={visionModalMode}
        onAddNote={handleAddNote}
        onNavigateToTab={setCurrentTab}
      />

      {/* Global Hotkey Code Captured HUD Toast */}
      {hotkeyToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 border-2 border-cyan-400 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40">
              <span className="font-mono text-xs font-bold animate-pulse">Alt+C</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300">{hotkeyToast.message}</span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-300 truncate mt-0.5">
                {hotkeyToast.code}
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentTab("codes");
                setHotkeyToast(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm"
            >
              Voir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

