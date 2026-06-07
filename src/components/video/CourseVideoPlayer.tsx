import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  Gauge,
  RotateCcw,
} from "lucide-react";
import { useVideoHeartbeat } from "@/hooks/useVideoHeartbeat";

/**
 * Udemy-style custom video player (React + native <video>).
 *
 *  - Native browser controls are DISABLED; we render our own dark overlay UI.
 *  - Raw-MP4 mitigations: controlsList="nodownload", right-click blocked.
 *  - localStorage stores ONLY preferences (volume, playback speed) — never progress.
 *  - Progress/completion is owned by the server via useVideoHeartbeat (anti-cheat).
 */

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const PREF_KEY = "prometrica_player_prefs";

function loadPrefs(): { volume: number; rate: number } {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        volume: typeof p.volume === "number" ? p.volume : 1,
        rate: typeof p.rate === "number" ? p.rate : 1,
      };
    }
  } catch {
    /* ignore */
  }
  return { volume: 1, rate: 1 };
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  src: string;
  lessonId: number;
  onEnded?: () => void;
  /** Fired once when the server confirms genuine watch-through completion. */
  onAutoCompleted?: () => void;
  poster?: string;
}

export function CourseVideoPlayer({ src, lessonId, onEnded, onAutoCompleted, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const prefs = useRef(loadPrefs());

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(prefs.current.volume);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(prefs.current.rate);
  const [showSpeed, setShowSpeed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Anti-cheat heartbeat (server owns completion) ──────────────────────────
  useVideoHeartbeat({
    lessonId,
    isPlaying,
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    getDuration: () => videoRef.current?.duration ?? 0,
    onCompleted: () => onAutoCompleted?.(),
  });

  // Apply stored preferences once metadata is ready.
  const applyPrefs = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = prefs.current.volume;
    v.playbackRate = prefs.current.rate;
  }, []);

  const persistPrefs = useCallback((next: Partial<{ volume: number; rate: number }>) => {
    prefs.current = { ...prefs.current, ...next };
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs.current));
    } catch {
      /* ignore */
    }
  }, []);

  // ─── Play / pause ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  // ─── Seeking ────────────────────────────────────────────────────────────────
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
  };

  // ─── Volume ─────────────────────────────────────────────────────────────────
  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = Number(e.target.value);
    v.volume = vol;
    v.muted = vol === 0;
    setVolume(vol);
    setMuted(vol === 0);
    persistPrefs({ volume: vol });
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // ─── Speed ──────────────────────────────────────────────────────────────────
  const setSpeed = (r: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = r;
    setRate(r);
    setShowSpeed(false);
    persistPrefs({ rate: r });
  };

  // ─── Fullscreen ─────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // ─── Auto-hide controls while playing ───────────────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2800);
  }, []);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body)
        return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowRight") skip(5);
      else if (e.key === "ArrowLeft") skip(-5);
      else if (e.key === "f") toggleFullscreen();
      else if (e.key === "m") toggleMute();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group relative h-full w-full select-none overflow-hidden bg-black"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={showControls}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      {/* Native video — controls disabled, download hint blocked */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 h-full w-full bg-black"
        playsInline
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture={false}
        onClick={togglePlay}
        onPlay={() => { setIsPlaying(true); setIsEnded(false); showControls(); }}
        onPause={() => { setIsPlaying(false); setControlsVisible(true); }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration || 0); applyPrefs(); }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          const b = e.currentTarget.buffered;
          if (b.length) setBuffered(b.end(b.length - 1));
        }}
        onEnded={() => { setIsPlaying(false); setIsEnded(true); setControlsVisible(true); onEnded?.(); }}
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/90" />
        </div>
      )}

      {/* Center play / replay overlay (paused or ended) */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/60 backdrop-blur transition hover:scale-105 hover:bg-black/75">
            {isEnded ? (
              <RotateCcw className="h-9 w-9 text-white" />
            ) : (
              <Play className="ml-1 h-10 w-10 text-white" fill="currentColor" />
            )}
          </span>
        </button>
      )}

      {/* ─── Control bar ─────────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Seek bar */}
        <div className="group/seek relative mb-2 h-1.5 w-full">
          {/* buffered */}
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
          {/* played */}
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="any"
            value={currentTime}
            onChange={onSeek}
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent
                       [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100"
            aria-label="Seek"
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} className="hover:text-primary" aria-label="Play/Pause">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="hover:text-primary" aria-label="Mute">
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={onVolume}
              className="h-1 w-16 cursor-pointer accent-primary"
              aria-label="Volume"
            />
          </div>

          {/* Time */}
          <span className="text-xs font-medium tabular-nums text-white/80">
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeed((s) => !s)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold hover:text-primary"
                aria-label="Playback speed"
              >
                <Gauge className="h-4 w-4" />
                {rate}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-8 right-0 w-24 overflow-hidden rounded-lg bg-zinc-900/95 py-1 shadow-xl ring-1 ring-white/10">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 ${
                        s === rate ? "font-bold text-primary" : "text-white/90"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-primary" aria-label="Fullscreen">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
