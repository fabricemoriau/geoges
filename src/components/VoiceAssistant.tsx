import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Radio,
  Sparkles, 
  Volume2,
  VolumeX,
  Square,
  Cpu
} from "lucide-react";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { getApiUrl } from "../utils/api";

interface VoiceAssistantProps {
  onVoiceCommand: (transcript: string) => Promise<string | void>;
  onNavigateToTab?: (tab: string) => void;
  onOpenVisionModal?: (mode: "photo" | "screenshot") => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onVoiceCommand,
}) => {
  const [isWakeWordListening, setIsWakeWordListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>("Dites « Georges »");
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(false);

  const isListeningRef = useRef<boolean>(false);

  // 1. VÉRIFICATION DU SERVEUR (Toutes les 5 secondes)
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(getApiUrl("/api/health"));
        setServerOnline(res.ok);
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. PARLER (Synthèse vocale forcée)
  const speakText = async (text: string) => {
    if (!voiceEnabled) return;

    // Stop toute écoute avant de parler pour ne pas s'entendre
    try { await SpeechRecognition.stop(); } catch(e) {}

    setIsSpeaking(true);
    setStatusMessage("Georges parle...");

    try {
      // Chercher une voix masculine française
      const { voices } = await TextToSpeech.getSupportedVoices();
      const maleVoice = voices.find(v =>
        v.lang.startsWith("fr") &&
        (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("thomas") || v.name.toLowerCase().includes("paul"))
      );

      await TextToSpeech.speak({
        text: text.replace(/\*/g, ""),
        lang: "fr-FR",
        voice: maleVoice ? voices.indexOf(maleVoice) : undefined,
        pitch: 0.8, // Voix grave
        rate: 0.95,
        volume: 1.0,
        category: "ambient",
      });
    } catch (err) {
      console.error("Erreur TTS:", err);
    } finally {
      setIsSpeaking(false);
      setStatusMessage("Georges a fini.");
      // Relancer l'écoute automatique si elle était active
      if (isListeningRef.current) {
        setTimeout(() => startRecognition(), 300);
      }
    }
  };

  // 3. ÉCOUTER (Reconnaissance native stable)
  const startRecognition = async () => {
    try {
      const isAvailable = await SpeechRecognition.available();
      if (!isAvailable) {
        setStatusMessage("Micro indisponible.");
        return;
      }

      await SpeechRecognition.requestPermissions();

      setIsWakeWordListening(true);
      isListeningRef.current = true;
      setStatusMessage("Georges vous écoute...");

      await SpeechRecognition.start({
        language: "fr-FR",
        partialResults: true,
        popup: false,
      });

      // Nettoyer les anciens écouteurs
      await SpeechRecognition.removeAllListeners();

      SpeechRecognition.addListener("partialResults", (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const text = data.matches[0];
          setLastTranscript(text);
          const lower = text.trim().toLowerCase();

          // Détection du mot clé
          if (lower.includes("georges") || lower.includes("jarvis") || lower.includes("bonjour")) {
            if (!isProcessing && !isSpeaking) {
              handleProcessCommand(text);
            }
          }
        }
      });

    } catch (e) {
      setStatusMessage("Erreur micro.");
      setIsWakeWordListening(false);
    }
  };

  const handleProcessCommand = async (text: string) => {
    setIsProcessing(true);
    setStatusMessage("Réflexion...");
    try {
      const reply = await onVoiceCommand(text);
      if (reply) {
        await speakText(reply);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecognition = async () => {
    isListeningRef.current = false;
    setIsWakeWordListening(false);
    try {
      await SpeechRecognition.stop();
      setStatusMessage("En veille.");
    } catch (e) {}
  };

  // 4. BOUCLE DE SÉCURITÉ (Relance si Android coupe)
  useEffect(() => {
    const watcher = setInterval(() => {
      if (isListeningRef.current && !isSpeaking && !isProcessing) {
        // Si Georges devrait écouter mais ne dit rien, on le réveille
        startRecognition();
      }
    }, 10000); // Toutes les 10 secondes
    return () => clearInterval(watcher);
  }, [isSpeaking, isProcessing]);

  return (
    <div className={`p-4 rounded-3xl border-2 transition-all ${
      serverOnline ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-900/20" : "bg-slate-900 border-rose-500/50"
    }`}>
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => isWakeWordListening ? stopRecognition() : startRecognition()}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isWakeWordListening ? "bg-cyan-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"
            }`}
          >
            {isWakeWordListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serverOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">
                {serverOnline ? "Georges Connecté" : "Serveur PC Déconnecté"}
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">{statusMessage}</p>
            {lastTranscript && isWakeWordListening && (
              <p className="text-[10px] text-cyan-200/60 font-mono truncate max-w-[200px]">"{lastTranscript}"</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-xl border transition-all ${
              voiceEnabled ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {isSpeaking && (
            <button onClick={() => TextToSpeech.stop()} className="p-3 rounded-xl bg-rose-500 text-white">
              <Square className="w-5 h-5 fill-current" />
            </button>
          )}
        </div>
      </div>

      {!serverOnline && (
        <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[10px] text-rose-300 font-bold text-center">
          ⚠️ Vérifiez que le serveur "bun dev" tourne sur votre PC et que l'IP est correcte.
        </div>
      )}
    </div>
  );
};
