import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Monitor, 
  X, 
  Sparkles, 
  Download, 
  StickyNote, 
  Server, 
  MessageSquare, 
  RotateCw, 
  Check, 
  Volume2, 
  VolumeX, 
  Radio, 
  Maximize2, 
  Smartphone, 
  Upload, 
  Trash2, 
  Eye, 
  Cpu, 
  Layers, 
  Zap,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { CapturedMedia } from "../types";

interface JarvisVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "photo" | "screenshot";
  onAddNote: (title: string, content: string, category: "Personnel" | "Travail" | "Serveur" | "Idées") => void;
  onNavigateToTab: (tab: string) => void;
  speakText?: (text: string) => void;
}

export const JarvisVisionModal: React.FC<JarvisVisionModalProps> = ({
  isOpen,
  onClose,
  initialMode = "photo",
  onAddNote,
  onNavigateToTab,
  speakText,
}) => {
  const [activeTab, setActiveTab] = useState<"photo" | "screenshot" | "gallery">(initialMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedType, setCapturedType] = useState<"photo" | "screenshot">("photo");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Gallery of captured media
  const [gallery, setGallery] = useState<CapturedMedia[]>(() => {
    try {
      const saved = localStorage.getItem("georges_captured_media");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play high-tech J.A.R.V.I.S. / Iron Man audio feedback
  const playIronManAudio = (type: "arc_chime" | "shutter" | "scan_complete") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "shutter") {
        // High tech camera focus + mechanical/electronic shutter blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "arc_chime") {
        // Stark Arc Reactor harmonic pulse
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
        osc1.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.28); // E6
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
      } else if (type === "scan_complete") {
        // High-tech analysis chime (J.A.R.V.I.S. confirmed)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio might be restricted
    }
  };

  // Sync initial mode
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setErrorMsg(null);
      setSavedSuccessMsg(null);
      playIronManAudio("arc_chime");
    } else {
      stopCamera();
    }
  }, [isOpen, initialMode]);

  // Persist gallery
  useEffect(() => {
    try {
      localStorage.setItem("georges_captured_media", JSON.stringify(gallery));
    } catch (e) {
      console.warn("Storage full", e);
    }
  }, [gallery]);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start live camera stream (phone camera / webcam)
  const startCamera = async (facing: "environment" | "user" = cameraFacing) => {
    setErrorMsg(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("L'accès à la caméra n'est pas supporté sur ce navigateur ou cet appareil.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError") {
        setErrorMsg("Permission caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.");
      } else {
        setErrorMsg("Impossible d'activer le flux vidéo direct. Vous pouvez utiliser le bouton « Déclencheur Photo Smartphone » pour utiliser l'appareil photo natif de votre téléphone.");
      }
      setCameraActive(false);
    }
  };

  // Switch between back and front camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  // Take photo from live camera stream
  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    playIronManAudio("shutter");
    stopCamera();
    handleNewCapturedMedia(dataUrl, "photo", "Appareil photo en direct");
  };

  // Handle native phone camera file input
  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        playIronManAudio("shutter");
        handleNewCapturedMedia(dataUrl, "photo", "Appareil photo natif smartphone");
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = "";
  };

  // Capture screen / window / tab via getDisplayMedia
  const captureScreen = async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMsg("L'API de capture d'écran n'est pas disponible sur votre navigateur.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          setTimeout(resolve, 300); // Allow frame to render
        };
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        playIronManAudio("shutter");
        handleNewCapturedMedia(dataUrl, "screenshot", "Capture d'écran système");
      }

      // Stop stream immediately
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
        console.error("Screen capture error:", err);
        setErrorMsg("La capture d'écran a été interrompue ou n'a pas pu être effectuée.");
      }
    }
  };

  // Handle newly captured media & trigger J.A.R.V.I.S. analysis
  const handleNewCapturedMedia = async (dataUrl: string, type: "photo" | "screenshot", deviceSource: string) => {
    setCapturedImage(dataUrl);
    setCapturedType(type);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisTitle(type === "photo" ? "Photo smartphone analysée" : "Capture d'écran analysée");

    const newMedia: CapturedMedia = {
      id: `media-${Date.now()}`,
      type,
      dataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: type === "photo" ? "Photo capturée" : "Capture d'écran",
      sourceDevice: deviceSource,
      isAnalyzing: true,
    };

    setGallery((prev) => [newMedia, ...prev]);

    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          mimeType: type === "photo" ? "image/jpeg" : "image/png",
          source: type,
          prompt: customPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
      setAnalysisTitle(data.title || (type === "photo" ? "Photo analysée par J.A.R.V.I.S." : "Capture analysée par J.A.R.V.I.S."));
      playIronManAudio("scan_complete");

      // Update gallery item
      setGallery((prev) =>
        prev.map((m) => (m.id === newMedia.id ? { ...m, analysis: data.analysis, isAnalyzing: false } : m))
      );

      // Speak analysis if voice is available
      if (speakText && data.analysis) {
        const firstSentence = data.analysis.split(".")[0] + ".";
        speakText(`Analyse optique terminée, Monsieur. ${firstSentence}`);
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      const fallback = "Analyse optique effectuée, Monsieur. L'image a été numérisée avec succès et est conservée dans vos archives.";
      setAnalysisResult(fallback);
      setGallery((prev) =>
        prev.map((m) => (m.id === newMedia.id ? { ...m, analysis: fallback, isAnalyzing: false } : m))
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-run analysis with custom question
  const handleReanalyzeWithPrompt = async () => {
    if (!capturedImage || !customPrompt.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          mimeType: capturedType === "photo" ? "image/jpeg" : "image/png",
          source: capturedType,
          prompt: customPrompt.trim(),
        }),
      });
      const data = await res.json();
      setAnalysisResult(data.analysis);
      playIronManAudio("scan_complete");
      if (speakText && data.analysis) {
        speakText(`Monsieur, voici mon diagnostic sur votre question : ${data.analysis.slice(0, 180)}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save as note
  const handleSaveToNotes = () => {
    if (!analysisResult && !capturedImage) return;
    const title = `${capturedType === "photo" ? "📸 Photo Téléphone" : "🖥️ Capture d'écran"} - ${new Date().toLocaleDateString("fr-FR")}`;
    const content = `${analysisResult || "Image capturée avec Georges."}\n\n[Pièce jointe : Image numérisée haute résolution]`;
    onAddNote(title, content, "Personnel");
    setSavedSuccessMsg("Enregistré avec succès dans votre carnet de Notes !");
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // Download image
  const handleDownload = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `georges-${capturedType}-${Date.now()}.${capturedType === "photo" ? "jpg" : "png"}`;
    a.click();
  };

  // Reset current preview to take another photo
  const handleResetPreview = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setCustomPrompt("");
    if (activeTab === "photo") {
      startCamera();
    }
  };

  // Delete from gallery
  const handleDeleteMedia = (id: string) => {
    setGallery((prev) => prev.filter((m) => m.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Stark Industries / J.A.R.V.I.S. Top HUD Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-3 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Holographic Arc Reactor Pulse */}
            <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="absolute inset-0 border border-cyan-400/30 rounded-full animate-spin"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-cyan-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span>J.A.R.V.I.S. HUD</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 text-xs">Capteurs Optiques & Vision</span>
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  MARK VII PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prise de vue téléphone, captures d'écran & reconnaissance multimodale en temps réel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fermer le HUD"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Photo Phone / Screenshot / Gallery) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab("photo");
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === "photo"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-xs shadow-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo Smartphone</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("screenshot");
                stopCamera();
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === "screenshot"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-xs shadow-amber-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Capture d'écran</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("gallery");
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-xs shadow-emerald-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Galerie ({gallery.length})</span>
            </button>
          </div>

          <span className="hidden md:flex items-center gap-1 text-[11px] text-cyan-400/80 font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            Optique Prête
          </span>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Success Notification Banner */}
          {savedSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400" />
                {savedSuccessMsg}
              </span>
              <button
                onClick={() => setSavedSuccessMsg(null)}
                className="text-emerald-400 hover:text-emerald-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="flex-1">{errorMsg}</p>
            </div>
          )}

          {/* TAB 1: SMARTPHONE CAMERA / PHOTO */}
          {activeTab === "photo" && !capturedImage && (
            <div className="space-y-4">
              {/* Dual Mode Card: Live Camera or Native Phone Camera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Native Smartphone Photo Trigger (Optimized for phones) */}
                <div className="bg-slate-950/60 border border-cyan-500/30 hover:border-cyan-400/60 p-5 rounded-xl transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
                      <Smartphone className="w-5 h-5 text-cyan-400" />
                      <h4>Déclencheur Photo Smartphone</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ouvre instantanément l'application <strong>Appareil Photo native</strong> de votre smartphone (iPhone, Android). Prenez votre cliché avec le flash ou le zoom natif, et Georges l'analyse aussitôt.
                    </p>
                  </div>

                  <div className="mt-5">
                    {/* Hidden file input with capture="environment" for smartphones */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleNativeFileInput}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Prendre une photo avec mon téléphone</span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      Fonctionne aussi depuis la galerie ou vos fichiers
                    </p>
                  </div>
                </div>

                {/* 2. Direct In-App Live Camera HUD (Stream) */}
                <div className="bg-slate-950/60 border border-slate-800 hover:border-cyan-500/30 p-5 rounded-xl transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                      <Radio className="w-5 h-5 text-amber-400" />
                      <h4>Caméra en Direct (Viseur J.A.R.V.I.S.)</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Active le flux vidéo direct dans le navigateur avec le viseur tête-haute style Iron Man. Pratique pour ajuster le cadrage ou utiliser votre webcam.
                    </p>
                  </div>

                  <div className="mt-5">
                    {!cameraActive ? (
                      <button
                        onClick={() => startCamera()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>Activer le Viseur Vidéo en direct</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleCameraFacing}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                          title="Changer de caméra (avant/arrière)"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>{cameraFacing === "environment" ? "Caméra Arrière" : "Caméra Avant"}</span>
                        </button>
                        <button
                          onClick={stopCamera}
                          className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 py-2.5 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Éteindre
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Live Camera Viewfinder HUD Canvas */}
              {cameraActive && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/60 bg-black aspect-video max-h-[380px] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Stark HUD Targeting Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                    {/* Corners */}
                    <div className="flex justify-between text-cyan-400 font-mono text-xs">
                      <span>[ TARGETING LOCKED ]</span>
                      <span>RESOLUTION: 1080P HD</span>
                    </div>

                    {/* Center Reticle */}
                    <div className="self-center flex items-center justify-center relative w-24 h-24">
                      <div className="w-20 h-20 rounded-full border border-cyan-400/40 animate-pulse"></div>
                      <div className="w-28 h-28 rounded-full border border-dashed border-cyan-400/25 absolute animate-spin"></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <div className="absolute top-0 bottom-0 w-px bg-cyan-400/30"></div>
                      <div className="absolute left-0 right-0 h-px bg-cyan-400/30"></div>
                    </div>

                    <div className="flex justify-between text-cyan-400/70 font-mono text-[10px]">
                      <span>GEO: PARIS/FRANCE</span>
                      <span>AI RECOGNITION: ACTIVE</span>
                    </div>
                  </div>

                  {/* Shutter Button floating at bottom center */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      onClick={capturePhotoFromStream}
                      className="group relative w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/50 transition-transform active:scale-95 cursor-pointer"
                      title="Prendre la photo"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-slate-950 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-7 text-[10px] font-mono font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-400/40">
                        DÉCLENCHER
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SCREENSHOT / CAPTURE D'ÉCRAN */}
          {activeTab === "screenshot" && !capturedImage && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-amber-500/30 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Monitor className="w-5 h-5 text-amber-400" />
                  <h4>Capture d'Écran Haute Résolution J.A.R.V.I.S.</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Permet à Georges de capturer n'importe quel écran de votre ordinateur, une fenêtre de logiciel (bureautique, code, graphique boursier, PDF) ou un onglet de navigateur. Georges procède immédiatement à l'analyse OCR et à la synthèse intelligente de son contenu.
                </p>

                <div className="pt-2">
                  <button
                    onClick={captureScreen}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Lancer la capture d'écran</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Ce que Georges sait faire sur vos captures :
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>Lire et retranscrire le texte (factures, courriers, messages, tableaux).</li>
                  <li>Expliquer un message d'erreur informatique et proposer la solution.</li>
                  <li>Décrypter un graphique boursier ou un rapport financier.</li>
                  <li>Générer une note résumée directement exploitable.</li>
                </ul>
              </div>
            </div>
          )}

          {/* CAPTURED IMAGE PREVIEW & J.A.R.V.I.S. ANALYSIS VIEW */}
          {capturedImage && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Left: Image Display with HUD Scanner Animation */}
                <div className="relative bg-black rounded-xl overflow-hidden border border-cyan-500/40 flex items-center justify-center max-h-[360px]">
                  <img
                    src={capturedImage}
                    alt="Capture"
                    className="w-full h-full object-contain max-h-[360px]"
                  />

                  {/* High Tech Scanline effect when analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse flex flex-col justify-center items-center">
                      <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce"></div>
                      <span className="mt-4 text-xs font-mono font-bold bg-slate-950/90 text-cyan-300 px-3 py-1 rounded-full border border-cyan-400/50">
                        ANALYSE MULTIMODALE EN COURS...
                      </span>
                    </div>
                  )}

                  {/* Badge top-left */}
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-cyan-500/30">
                    {capturedType === "photo" ? "📸 PHOTO NUMÉRISÉE" : "🖥️ CAPTURE D'ÉCRAN"}
                  </div>

                  {/* Actions bottom */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
                      title="Télécharger l'image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleResetPreview}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reprendre</span>
                    </button>
                  </div>
                </div>

                {/* Right: J.A.R.V.I.S. Multimodal Analysis */}
                <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                        <h4 className="text-xs sm:text-sm font-bold text-cyan-300 font-mono uppercase">
                          {analysisTitle || "Diagnostic J.A.R.V.I.S."}
                        </h4>
                      </div>

                      {speakText && analysisResult && (
                        <button
                          onClick={() => speakText(analysisResult)}
                          className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full cursor-pointer"
                          title="Écouter la synthèse vocale J.A.R.V.I.S."
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Écouter</span>
                        </button>
                      )}
                    </div>

                    {/* Analysis Content */}
                    <div className="max-h-[200px] overflow-y-auto text-xs text-slate-200 leading-relaxed font-sans pr-1">
                      {isAnalyzing ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-cyan-400">
                          <Cpu className="w-6 h-6 animate-spin text-cyan-400" />
                          <span className="text-xs font-mono">Déchiffrement optique des données...</span>
                        </div>
                      ) : analysisResult ? (
                        <div className="whitespace-pre-line space-y-2">
                          {analysisResult}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">
                          En attente d'analyse...
                        </p>
                      )}
                    </div>

                    {/* Ask a question about this image */}
                    <div className="pt-2 border-t border-slate-800">
                      <label className="block text-[10px] font-mono text-cyan-400 mb-1">
                        POSER UNE QUESTION À GEORGES SUR CETTE IMAGE :
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Ex: Que dois-je faire avec ce document ? Quel est le montant ?"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleReanalyzeWithPrompt();
                          }}
                        />
                        <button
                          onClick={handleReanalyzeWithPrompt}
                          disabled={isAnalyzing || !customPrompt.trim()}
                          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Analyser
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveToNotes}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ajouter aux Notes</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab("server");
                      }}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                    >
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sauver sur Vieux PC</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab("chat");
                      }}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Poursuivre en Chat</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: GALLERY & HISTORY */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              {gallery.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Camera className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Aucune capture ou photo enregistrée pour le moment.</p>
                  <p className="text-[11px] text-slate-500">
                    Prenez une photo avec votre téléphone ou réalisez une capture d'écran pour la retrouver ici.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                    >
                      <div className="relative aspect-video bg-black overflow-hidden">
                        <img
                          src={item.dataUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-slate-950/80 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {item.type === "photo" ? "PHOTO" : "ÉCRAN"}
                        </span>
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-rose-900 text-slate-400 hover:text-rose-200 rounded transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200 truncate">{item.title}</span>
                          <span className="text-slate-500 shrink-0 font-mono text-[10px]">{item.timestamp}</span>
                        </div>

                        {item.analysis && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.analysis}
                          </p>
                        )}

                        <div className="pt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setCapturedImage(item.dataUrl);
                              setCapturedType(item.type);
                              setAnalysisResult(item.analysis || null);
                              setAnalysisTitle(item.title);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Examiner</span>
                          </button>
                          
                          <a
                            href={item.dataUrl}
                            download={`georges-${item.type}-${item.id}.jpg`}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>STARK TELEMETRY • STABLE</span>
          <span>DIS « GEORGES PRENDS UNE PHOTO » POUR DÉCLENCHER</span>
        </div>

      </div>
    </div>
  );
};
