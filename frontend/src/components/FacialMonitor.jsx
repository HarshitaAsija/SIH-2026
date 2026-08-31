import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, ShieldCheck, Activity, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * FacialMonitor
 *
 * - Captures webcam frames for real-time passive distress assessment.
 * - Requires explicit opt-in consent.
 * - Sends frames to /api/v1/facial-assessment for in-memory scoring.
 * - Displays live biomarker breakdown, dominant emotion, distress score, and FACS indicators.
 */

const SNAPSHOT_INTERVAL_MS = 3500;

export default function FacialMonitor({ sessionId, apiBase = "/api/v1" }) {
  const [consent, setConsent] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [alertActive, setAlertActive] = useState(false);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
      });
      streamRef.current = stream;
      setStreaming(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Video play:", e));
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access was denied or unavailable in this browser.");
      setStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStreaming(false);
  }, []);

  useEffect(() => {
    if (streaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.log("Play stream:", e));
    }
  }, [streaming]);

  const captureAndSend = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    setIsCapturing(true);

    const width = video.videoWidth > 0 ? video.videoWidth : 640;
    const height = video.videoHeight > 0 ? video.videoHeight : 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsCapturing(false);
        return;
      }
      const form = new FormData();
      form.append("session_id", sessionId || "intake-session");
      form.append("frame", blob, "frame.jpg");

      try {
        const res = await fetch(`${apiBase}/facial-assessment`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Assessment request failed");
        const data = await res.json();
        setLastResult(data);
        if (data.alert_triggered || data.pain_proxy_flag) {
          setAlertActive(true);
        }
      } catch (err) {
        console.error("Facial monitor connection error:", err);
      } finally {
        setIsCapturing(false);
      }
    }, "image/jpeg", 0.85);
  }, [sessionId, apiBase]);

  useEffect(() => {
    if (consent && streaming && !alertActive) {
      const initialTimer = setTimeout(captureAndSend, 1200);
      intervalRef.current = setInterval(captureAndSend, SNAPSHOT_INTERVAL_MS);
      return () => {
        clearTimeout(initialTimer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [consent, streaming, alertActive, captureAndSend]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 text-text shadow-sm space-y-4">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-primary/10 rounded-2xl text-primary border border-primary/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text flex items-center space-x-1.5">
              <span>Facial Distress Signal Analyzer</span>
              {streaming && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  LIVE
                </span>
              )}
            </h3>
            <p className="text-[10px] text-text-muted">
              Optional passive signal detection &middot; 0 raw frames saved
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {consent && streaming && (
            <button
              type="button"
              onClick={captureAndSend}
              disabled={isCapturing}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-dark text-xs font-bold border border-primary/30 transition-all disabled:opacity-50"
              title="Trigger an immediate scan"
            >
              <RefreshCw className={`w-3 h-3 ${isCapturing ? 'animate-spin' : ''}`} />
              <span>{isCapturing ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          )}

          <label className="flex items-center gap-2 text-xs font-bold text-primary-dark cursor-pointer bg-background hover:bg-surface px-3 py-1.5 rounded-xl border border-border transition-all">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                const on = e.target.checked;
                setConsent(on);
                if (on) startCamera();
                else stopCamera();
              }}
              className="accent-primary rounded"
            />
            <span>{consent ? "Analysis Enabled" : "Enable Facial Monitor"}</span>
          </label>
        </div>
      </div>

      {/* Alert Banner */}
      {alertActive && (
        <div className="rounded-2xl border border-risk-critical/40 bg-risk-critical-bg p-3.5 text-xs text-risk-critical font-semibold flex items-center space-x-3 animate-pulse shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Elevated Facial Distress Signal Detected</p>
            <p className="text-[11px] opacity-90 font-normal">
              FACS pain-adjacent pattern identified. Session routed for priority human counsellor check-in.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {consent && streaming ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Column: Live Camera Video Viewport */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-900 shadow-inner flex items-center justify-center min-h-[220px]">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Futuristic Reticle Overlay */}
            <div className="absolute inset-4 pointer-events-none border border-primary/30 rounded-xl flex items-center justify-center">
              <div className="w-24 h-24 border border-dashed border-emerald-400/40 rounded-full animate-ping opacity-20" />
            </div>

            {/* Video Overlay HUD Top */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center space-x-1.5 border border-white/20">
              <span className={`w-2 h-2 rounded-full ${isCapturing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-mono font-medium">{isCapturing ? 'Analyzing Biomarkers...' : 'Camera Active'}</span>
            </div>

            {/* Video Overlay HUD Bottom */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white/90 flex items-center space-x-1 border border-white/20 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>In-Memory Only</span>
            </div>
          </div>

          {/* Right Column: Live Analysis & Signal Metrics Panel */}
          <div className="rounded-2xl border border-border bg-background p-4 text-xs space-y-3 shadow-inner flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-dark flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Real-Time Biomarker Output</span>
                </span>
                <span className="text-[10px] font-mono text-text-muted bg-surface px-2 py-0.5 rounded border border-border">
                  SVI Weight: 10%
                </span>
              </div>

              {/* Dominant Signal & Facial Distress Score */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-surface p-2.5 rounded-xl border border-border space-y-0.5">
                  <span className="text-[10px] text-text-muted font-medium block">Dominant Signal</span>
                  <span className="text-sm font-extrabold text-primary-dark block truncate">
                    {lastResult?.dominant_emotion || (isCapturing ? "Analyzing..." : "Calibrating...")}
                  </span>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border space-y-0.5">
                  <span className="text-[10px] text-text-muted font-medium block">Facial Distress Score</span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-base font-extrabold ${
                      (lastResult?.score || 0) >= 60 
                        ? 'text-risk-critical' 
                        : (lastResult?.score || 0) >= 30 
                        ? 'text-risk-moderate' 
                        : 'text-risk-low'
                    }`}>
                      {lastResult?.score != null ? Math.round(lastResult.score) : 0}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">/100</span>
                  </div>
                </div>
              </div>

              {/* Emotion Probability Bars */}
              {lastResult?.emotion_breakdown && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Expression Sub-Scores
                  </span>
                  {Object.entries(lastResult.emotion_breakdown).slice(0, 4).map(([emo, val]) => (
                    <div key={emo} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-text font-medium capitalize">
                        <span>{emo}</span>
                        <span className="font-mono text-text-muted">{(val * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border/50">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(4, val * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reasons / Diagnostic Text */}
              {lastResult?.reasons?.length > 0 && (
                <div className="pt-1 text-[11px] text-text-muted italic bg-surface p-2 rounded-xl border border-border leading-tight">
                  "{lastResult.reasons.join(" • ")}"
                </div>
              )}
            </div>

            <p className="text-[10px] text-text-muted leading-tight border-t border-border pt-2">
              Privacy Guaranteed: Frame data is processed strictly in temporary server memory and discarded instantly after computing features.
            </p>
          </div>

        </div>
      ) : (
        <div className="p-4 bg-background border border-border rounded-2xl text-xs text-text-muted leading-relaxed flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl">
            Facial analysis is optional and disabled by default. Enabling activates your camera to extract non-verbal distress indicators (eyebrow tension, ocular strain) in memory. No video or photos are saved.
          </p>
          <button
            type="button"
            onClick={() => {
              setConsent(true);
              startCamera();
            }}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary-dark transition-all"
          >
            Start Camera
          </button>
        </div>
      )}

      {error && <p className="text-xs text-risk-critical font-bold">{error}</p>}
    </div>
  );
}