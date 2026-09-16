/**
 * EDUKA - Audio Voice Note Recorder
 * Uses MediaRecorder to capture voice audio notes,
 * with live timer, waveform pulse, cancel and send actions.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface AudioVoiceRecorderProps {
  onSendVoice: (audioDataUrl: string, durationSeconds: number) => void;
  onCancel: () => void;
}

export const AudioVoiceRecorder: React.FC<AudioVoiceRecorderProps> = ({
  onSendVoice,
  onCancel
}) => {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    let active = true;

    async function initRecorder() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;

          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.start(250);
        }
      } catch (err) {
        console.warn('Microphone permission or support unavailable in current container:', err);
      }
    }

    initRecorder();

    return () => {
      active = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopAndSend = () => {
    setIsRecording(false);
    const duration = Math.max(1, recordingSeconds);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendVoice(base64Audio, duration);
        };
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback voice note payload
      onSendVoice('', duration);
    }
  };

  const handleCancel = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onCancel();
  };

  return (
    <div className="flex items-center justify-between w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center space-x-3">
        {/* Pulsing indicator */}
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping absolute" />
          <span className="w-3 h-3 rounded-full bg-red-600 relative" />
        </div>

        <div className="flex items-center space-x-2">
          <Mic className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-semibold text-emerald-900 font-mono">
            {formatSeconds(recordingSeconds)}
          </span>
          <span className="text-xs text-emerald-700 hidden sm:inline">
            Anrejistreman vokal an kour...
          </span>
        </div>

        {/* Audio Wave Simulation */}
        <div className="flex items-center space-x-1 pl-2">
          <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse" />
          <span className="w-1 h-5 bg-emerald-700 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-2 bg-emerald-600 rounded-full animate-pulse delay-150" />
          <span className="w-1 h-6 bg-emerald-800 rounded-full animate-pulse delay-100" />
          <span className="w-1 h-4 bg-emerald-600 rounded-full animate-pulse delay-200" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Cancel button */}
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs flex items-center gap-1"
          title="Anile"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span className="hidden sm:inline text-xs text-red-700">Anile</span>
        </button>

        {/* Send audio button */}
        <button
          type="button"
          onClick={handleStopAndSend}
          className="px-3.5 py-1.5 bg-[#075B46] hover:bg-[#064e3b] text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Voye Vokal</span>
        </button>
      </div>
    </div>
  );
};
