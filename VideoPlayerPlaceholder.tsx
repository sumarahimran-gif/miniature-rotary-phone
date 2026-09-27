import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Lesson } from '../../types';
import { formatSecondsToTime } from '../../utils/formatters';

interface VideoPlayerProps {
  id?: string;
  lesson: Lesson;
  courseTitle: string;
  playbackToken?: string;
  watermarkUserText?: string;
  resumeSeconds?: number;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNextLesson?: boolean;
  hasPrevLesson?: boolean;
  onProgressUpdate?: (seconds: number) => void;
}

export const VideoPlayerPlaceholder: React.FC<VideoPlayerProps> = ({
  id = 'secure-video-player',
  lesson,
  courseTitle,
  playbackToken = 'token_expiring_in_3600s',
  watermarkUserText = 'STUDENT ACCESS · PROTECTED STREAM',
  resumeSeconds = 0,
  isCompleted = false,
  onToggleComplete,
  onProgressUpdate,
}) => {
  const totalSeconds = lesson.video?.durationSeconds || lesson.durationMinutes * 60 || 600;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(resumeSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [resolution, setResolution] = useState<string>('1080p (Adaptive)');
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [watermarkPos, setWatermarkPos] = useState<{ top: number; left: number }>({ top: 15, left: 15 });

  // Periodic subtle watermark drift
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: Math.floor(10 + Math.random() * 70),
        left: Math.floor(10 + Math.random() * 70),
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            if (onToggleComplete && !isCompleted) onToggleComplete();
            return totalSeconds;
          }
          const next = prev + 1 * playbackSpeed;
          if (onProgressUpdate && Math.floor(next) % 5 === 0) {
            onProgressUpdate(Math.floor(next));
          }
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, totalSeconds, onProgressUpdate, onToggleComplete, isCompleted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (onProgressUpdate) onProgressUpdate(val);
  };

  const handleSkip = (delta: number) => {
    setCurrentTime((prev) => {
      const next = Math.max(0, Math.min(totalSeconds, prev + delta));
      if (onProgressUpdate) onProgressUpdate(next);
      return next;
    });
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const resolutions = ['Auto (1080p)', '1080p HD', '720p', '480p'];

  return (
    <div
      id={id}
      className={`relative w-full bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] overflow-hidden flex flex-col transition-all duration-200 ${
        isTheater ? 'aspect-21/9 max-h-[75vh]' : 'aspect-16/9'
      }`}
    >
      {/* Video Viewport Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-[#0E0F12] select-none overflow-hidden">
        {/* Anti-piracy watermark */}
        <div
          className="absolute z-20 pointer-events-none text-[11px] font-mono tracking-wider text-[#9A9DA6]/25 select-none transition-all duration-1000"
          style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
        >
          {watermarkUserText}
        </div>

        {/* Security badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#16181D] border border-[rgba(242,241,237,0.08)] px-2.5 py-1 text-[11px] text-[#9A9DA6]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4C63D2]" />
          <span className="font-mono text-[#F2F1ED]">DRM Stream</span>
          <span className="text-[#9A9DA6] font-mono text-[10px]">({playbackToken.slice(0, 12)})</span>
        </div>

        {/* Grid pattern (hairline, not gradient) */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,rgba(242,241,237,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(242,241,237,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Center Play Button */}
        <button
          id={`${id}-center-play`}
          onClick={() => setIsPlaying(!isPlaying)}
          className="group relative z-20 w-16 h-16 bg-[#16181D] border border-[rgba(242,241,237,0.16)] text-[#F2F1ED] flex items-center justify-center hover:bg-[#4C63D2] hover:border-[#4C63D2] transition-colors cursor-pointer"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current text-[#F2F1ED]" />
          ) : (
            <Play className="w-6 h-6 fill-current text-[#F2F1ED] translate-x-0.5" />
          )}
        </button>

        {/* Course & Lesson Title when paused */}
        {!isPlaying && (
          <div className="absolute bottom-14 inset-x-6 z-20 text-center pointer-events-none">
            <span className="text-xs text-[#4C63D2] font-mono">
              {courseTitle}
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-normal text-[#F2F1ED] mt-1">
              {lesson.title}
            </h2>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="relative z-30 bg-[#16181D] border-t border-[rgba(242,241,237,0.08)] px-4 sm:px-6 py-3 flex flex-col gap-2">
        {/* Scrubber bar */}
        <div className="flex items-center gap-3">
          <input
            id={`${id}-scrub`}
            type="range"
            min={0}
            max={totalSeconds}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-[#0E0F12] appearance-none cursor-pointer accent-[#4C63D2] hover:h-1.5 transition-all"
            aria-label="Video timeline scrubber"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between text-[#F2F1ED] text-xs pt-0.5">
          {/* Left Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id={`${id}-play-btn`}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-[#F2F1ED] hover:text-[#4C63D2] transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              id={`${id}-rewind-10`}
              onClick={() => handleSkip(-10)}
              className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id={`${id}-forward-10`}
              onClick={() => handleSkip(10)}
              className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-[#0E0F12] appearance-none accent-[#4C63D2] cursor-pointer"
                aria-label="Volume level"
              />
            </div>

            {/* Time display */}
            <span className="text-[11px] font-mono text-[#9A9DA6]">
              {formatSecondsToTime(currentTime)} / {formatSecondsToTime(totalSeconds)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-2 py-0.5 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-[11px] font-mono text-[#F2F1ED] hover:border-[rgba(242,241,237,0.2)] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{playbackSpeed}x</span>
                <Settings className="w-3 h-3 text-[#9A9DA6]" />
              </button>

              {showSettings && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#16181D] border border-[rgba(242,241,237,0.08)] p-3 z-40 text-xs">
                  <div className="text-[11px] font-normal text-[#9A9DA6] mb-1.5">
                    Speed
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {speeds.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setPlaybackSpeed(s);
                          setShowSettings(false);
                        }}
                        className={`px-2 py-0.5 text-xs font-mono transition-colors ${
                          playbackSpeed === s
                            ? 'bg-[#4C63D2] text-[#F2F1ED]'
                            : 'bg-[#0E0F12] text-[#9A9DA6] hover:text-[#F2F1ED]'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] font-normal text-[#9A9DA6] mb-1.5">
                    Resolution
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {resolutions.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setResolution(r);
                          setShowSettings(false);
                        }}
                        className={`text-left text-xs px-2 py-1 transition-colors ${
                          resolution === r
                            ? 'bg-[#4C63D2]/20 text-[#4C63D2]'
                            : 'hover:bg-[#1C1F26] text-[#9A9DA6]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theater Mode */}
            <button
              onClick={() => setIsTheater(!isTheater)}
              className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] hidden md:block cursor-pointer"
              title="Theater mode"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => {
                const el = document.getElementById(id);
                if (el) {
                  if (!document.fullscreenElement) {
                    el.requestFullscreen?.().catch(() => {});
                  } else {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }
              }}
              className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
