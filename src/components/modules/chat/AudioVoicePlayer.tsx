/**
 * EDUKA - Audio Voice Note Player
 * Renders in-bubble playable voice note with play/pause,
 * waveform bars, and time duration counter.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioVoicePlayerProps {
  mediaUrl?: string;
  durationSeconds?: number;
  isSender?: boolean;
}

export const AudioVoicePlayer: React.FC<AudioVoicePlayerProps> = ({
  mediaUrl,
  durationSeconds = 12,
  isSender = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = durationSeconds || 12;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);

      if (mediaUrl && audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentProgress(0);
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setCurrentProgress(prog);
          }
        };
      } else {
        // Simulated playback for seeded notes
        let step = currentProgress >= 100 ? 0 : currentProgress;
        setCurrentProgress(step);
        const stepTimeMs = (duration * 1000) / 100;

        intervalRef.current = setInterval(() => {
          step += 1;
          if (step >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            setCurrentProgress(0);
          } else {
            setCurrentProgress(step);
          }
        }, stepTimeMs);
      }
    }
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeconds = Math.floor((currentProgress / 100) * duration);

  return (
    <div className="flex items-center space-x-3 py-1 min-w-[220px] max-w-[280px]">
      {mediaUrl && <audio ref={audioRef} src={mediaUrl} preload="auto" className="hidden" />}

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
          isSender
            ? 'bg-white text-[#075B46] hover:bg-slate-100'
            : 'bg-[#075B46] text-white hover:bg-[#064e3b]'
        }`}
        title={isPlaying ? 'Pòz' : 'Koute vokal la'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center space-x-1 h-5">
          {[40, 70, 90, 50, 100, 30, 80, 60, 95, 45, 85, 35, 75, 55, 90].map((h, i) => {
            const barProgress = (i / 15) * 100;
            const isPassed = currentProgress >= barProgress;
            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? isSender ? 'bg-white' : 'bg-[#075B46]'
                    : isSender ? 'bg-white/40' : 'bg-slate-300'
                }`}
                style={{ height: `${Math.max(4, (h / 100) * 20)}px` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
          <span className={isSender ? 'text-emerald-100' : 'text-slate-500'}>
            {isPlaying ? formatSecs(currentSeconds) : formatSecs(duration)}
          </span>
          <span className={`text-[10px] flex items-center gap-1 ${isSender ? 'text-emerald-200' : 'text-slate-400'}`}>
            <Volume2 className="w-3 h-3" />
            Vokal
          </span>
        </div>
      </div>
    </div>
  );
};
