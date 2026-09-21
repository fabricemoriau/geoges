import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Bot, 
  X, 
  Check, 
  Square,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Camera,
  Monitor,
  Zap,
  Cpu
} from "lucide-react";

interface VoiceAssistantProps {
  onVoiceCommand: (transcript: string) => Promise<string | void>;
  onNavigateToTab?: (tab: string) => void;
  onOpenVisionModal?: (mode: "photo" | "screenshot") => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onVoiceCommand,
  onNavigateToTab,
  onOpenVisionModal,
}) => {
  // Voice active state
  const [isWakeWordListening, setIsWakeWordListening] = useState<boolean>(false);
  const [isActivelyCapturing, setIsActivelyCapturing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>("Dites « Georges », « Georgie » ou « Jarvis »");
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [voiceStyle, setVoiceStyle] = useState<"jarvis" | "classic">("jarvis");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Play Stark Industries / J.A.R.V.I.S. futuristic audio chimes using Web Audio API
  const playSoundEffect = (type: "jarvis_arc" | "comms_click" | "classic") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "jarvis_arc") {
        // Stark Arc Reactor harmonic pulse (G5 784Hz + D6 1175Hz + resonant harmonic tail)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start(ctx.currentTime + 0.08);
        osc1.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
      } else if (type === "comms_click") {
        // High-tech Stark helmet HUD radio squelch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(2200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else {
        // Classic butler chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Setup Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak text with J.A.R.V.I.S. Iron Man persona or Classic Majordome
  const speakText = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;

    // Stop any ongoing speech
    synthRef.current.cancel();

    // Clean markdown and formatting symbols for natural speech
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/•/g, ", ")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/https?:\/\/\S+/g, "lien");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-FR";

    if (voiceStyle === "jarvis") {
      // J.A.R.V.I.S. style: composed, baritone, crisp, deliberate, articulate
      utterance.rate = 1.02;
      utterance.pitch = 0.92;
      playSoundEffect("comms_click");
    } else {
      utterance.rate = 0.96;
      utterance.pitch = 0.98;
    }

    // Try to find a refined French voice (or British English style if French not available)
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("fr") && (v.name.includes("Thomas") || v.name.includes("Paul") || v.name.includes("Daniel") || v.name.includes("Henri") || v.name.includes("Google") || v.name.includes("Natural"))
    ) || voices.find((v) => v.lang.startsWith("fr"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Start continuous wake word recognition
  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Reconnaissance vocale non disponible sur ce navigateur.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsWakeWordListening(true);
        setStatusMessage("Écoute active : dites « Georges », « Georgie » ou « Jarvis »");
      };

      recognition.onresult = async (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        const lower = currentTranscript.trim().toLowerCase();
        setLastTranscript(currentTranscript);

        // Check for wake words: "georges", "georgie", "dis georges", "dis georgie", "jarvis", "dis jarvis", "ok georges", "hé georges"
        const wakeWords = [
          "georges", "georgie", "dis georges", "dis georgie", 
          "jarvis", "dis jarvis", "ok georges", "bonjour georges", 
          "hé georges", "allo georges", "allô georges"
        ];
        const matchedWakeWord = wakeWords.find((w) => lower.includes(w));

        if (matchedWakeWord && !isProcessing) {
          playSoundEffect(voiceStyle === "jarvis" ? "jarvis_arc" : "classic");
          setIsActivelyCapturing(true);
          setStatusMessage("J.A.R.V.I.S. à l'écoute, Monsieur Fabrice...");

          // Extract the command after the wake word if any
          const wakeIndex = lower.indexOf(matchedWakeWord);
          const afterWake = currentTranscript.slice(wakeIndex + matchedWakeWord.length).trim();
          const afterWakeLower = afterWake.toLowerCase();

          // Check for camera / photo / screenshot commands
          if (
            afterWakeLower.includes("photo") || 
            afterWakeLower.includes("caméra") || 
            afterWakeLower.includes("appareil photo") ||
            afterWakeLower.includes("prends une photo")
          ) {
            setIsActivelyCapturing(false);
            speakText("À vos ordres Monsieur Fabrice, j'active les capteurs optiques et la caméra de votre téléphone.");
            onOpenVisionModal?.("photo");
            return;
          }

          if (
            afterWakeLower.includes("capture d'écran") || 
            afterWakeLower.includes("capture écran") || 
            afterWakeLower.includes("screenshot") ||
            afterWakeLower.includes("fais une capture") ||
            afterWakeLower.includes("capture l'écran")
          ) {
            setIsActivelyCapturing(false);
            speakText("Initialisation du protocole de capture d'écran, Monsieur.");
            onOpenVisionModal?.("screenshot");
            return;
          }

          if (afterWake.length > 5) {
            // User spoke both the wake word and command together
            setIsProcessing(true);
            setStatusMessage(`Traitement : « ${afterWake} »...`);
            
            try {
              const reply = await onVoiceCommand(afterWake);
              if (reply && typeof reply === "string") {
                speakText(reply);
              }
            } finally {
              setIsProcessing(false);
              setIsActivelyCapturing(false);
              setStatusMessage("Dites « Georges » ou « Jarvis »");
            }
          } else {
            // User just said the wake word
            speakText("À vos ordres Monsieur Fabrice, je vous écoute.");
          }
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== "no-speech") {
          console.warn("Speech recognition error:", err.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user wanted wake-word listening kept on
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        } else {
          setIsWakeWordListening(false);
          setStatusMessage("Écoute vocale en pause.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("SpeechRecognition start error:", e);
      setStatusMessage("Microphone bloqué ou non supporté.");
    }
  };

  const stopRecognition = () => {
    isListeningRef.current = false;
    setIsWakeWordListening(false);
    setIsActivelyCapturing(false);
    setStatusMessage("Écoute vocale désactivée.");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleWakeWord = () => {
    if (isWakeWordListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  // Direct push-to-talk button
  const handleDirectPushToTalk = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    playSoundEffect(voiceStyle === "jarvis" ? "jarvis_arc" : "classic");
    setIsActivelyCapturing(true);
    setStatusMessage("J.A.R.V.I.S. vous écoute directement...");

    const directRec = new SpeechRecognition();
    directRec.lang = "fr-FR";
    directRec.continuous = false;
    directRec.interimResults = false;

    directRec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setLastTranscript(text);
      setIsActivelyCapturing(false);
      const textLower = text.toLowerCase();

      // Check for camera/screenshot voice commands directly
      if (
        textLower.includes("photo") || 
        textLower.includes("caméra") || 
        textLower.includes("appareil photo") ||
        textLower.includes("prends une photo")
      ) {
        speakText("À vos ordres Monsieur Fabrice, j'ouvre la caméra de votre téléphone.");
        onOpenVisionModal?.("photo");
        return;
      }

      if (
        textLower.includes("capture d'écran") || 
        textLower.includes("capture écran") || 
        textLower.includes("screenshot") ||
        textLower.includes("fais une capture")
      ) {
        speakText("Initialisation de la capture d'écran, Monsieur.");
        onOpenVisionModal?.("screenshot");
        return;
      }

      setIsProcessing(true);
      setStatusMessage(`Traitement : « ${text} »`);

      try {
        const reply = await onVoiceCommand(text);
        if (reply && typeof reply === "string") {
          speakText(reply);
        }
      } finally {
        setIsProcessing(false);
        setStatusMessage("À votre service, Monsieur.");
      }
    };

    directRec.onerror = () => {
      setIsActivelyCapturing(false);
      setStatusMessage("Prêt.");
    };

    directRec.onend = () => {
      setIsActivelyCapturing(false);
    };

    directRec.start();
  };

  return (
    <div className={`text-white rounded-2xl p-3 shadow-md mb-3 transition-all border ${
      voiceStyle === "jarvis" 
        ? "bg-slate-950 border-cyan-500/40 shadow-cyan-950/30" 
        : "bg-slate-900 border-slate-800"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Status Indicator with Stark Arc Reactor animation */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleDirectPushToTalk}
              disabled={isProcessing}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isActivelyCapturing
                  ? "bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/50 animate-pulse scale-105"
                  : isWakeWordListening
                  ? "bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40 hover:bg-cyan-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              title="Cliquer pour parler directement à Georges (Style Iron Man)"
            >
              {isActivelyCapturing ? (
                <div className="relative flex items-center justify-center">
                  <Radio className="w-5 h-5 animate-spin text-slate-950" />
                  <span className="absolute w-7 h-7 rounded-full border border-slate-950 animate-ping"></span>
                </div>
              ) : isWakeWordListening ? (
                <div className="relative flex items-center justify-center">
                  <Mic className="w-5 h-5 text-slate-950" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></div>
                </div>
              ) : (
                <MicOff className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                {voiceStyle === "jarvis" ? "J.A.R.V.I.S. (Iron Man)" : "Assistant Vocal Georges"}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                isWakeWordListening 
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-800" 
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {isWakeWordListening ? "Veille Vocale Active" : "En veille"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 font-sans">
              {isSpeaking ? "J.A.R.V.I.S. répond à haute voix..." : statusMessage}
            </p>
          </div>
        </div>

        {/* Right Voice & Vision Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          
          {/* Quick Photo Phone Trigger */}
          <button
            onClick={() => onOpenVisionModal?.("photo")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shadow-xs"
            title="Prendre une photo à partir de votre téléphone ou caméra"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Photo Téléphone</span>
          </button>

          {/* Quick Screenshot Trigger */}
          <button
            onClick={() => onOpenVisionModal?.("screenshot")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-xs"
            title="Prendre une capture d'écran de votre ordinateur ou application"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Capture d'écran</span>
          </button>

          {/* Toggle Voice Style (J.A.R.V.I.S. Iron Man vs Classique) */}
          <button
            onClick={() => {
              const next = voiceStyle === "jarvis" ? "classic" : "jarvis";
              setVoiceStyle(next);
              playSoundEffect(next === "jarvis" ? "jarvis_arc" : "classic");
            }}
            className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-mono border bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 cursor-pointer"
            title="Changer le timbre et style vocal"
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>{voiceStyle === "jarvis" ? "Style: Iron Man" : "Style: Classique"}</span>
          </button>

          {/* Speaking stop button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1 bg-rose-900 hover:bg-rose-800 text-rose-200 border border-rose-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer animate-pulse"
              title="Interrompre la voix"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Couper</span>
            </button>
          )}

          {/* Toggle Voice Output */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              voiceEnabled
                ? "bg-slate-800 text-cyan-300 border-cyan-500/40 hover:bg-slate-700"
                : "bg-slate-800/50 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
            title={voiceEnabled ? "Synthèse vocale J.A.R.V.I.S. activée" : "Synthèse vocale muette"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Wake Word Activation Toggle */}
          <button
            onClick={toggleWakeWord}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isWakeWordListening
                ? "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isWakeWordListening ? "Écoute Active" : "Activer « Dis Georges »"}</span>
          </button>
        </div>
      </div>

      {/* Spoken feedback banner when active */}
      {lastTranscript && isActivelyCapturing && (
        <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs text-cyan-200 font-mono bg-slate-950/80 p-2 rounded-lg">
          <span className="truncate">« {lastTranscript} »</span>
          <span className="text-[10px] text-cyan-400 shrink-0 ml-2">J.A.R.V.I.S. en écoute</span>
        </div>
      )}
    </div>
  );
};

