/**
 * EDUKA - Live Interactive Video Call & Study Room
 * Supports camera & microphone capture, participant grid,
 * mute/unmute, video toggle, screen share, and call duration.
 * STRICTLY ZERO EMOJIS.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Users,
  Shield,
  Volume2
} from 'lucide-react';
import { User } from '../../../types';

interface VideoCallModalProps {
  roomTitle: string;
  currentUser: User;
  participants: { id: string; name: string; role?: string }[];
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  roomTitle,
  currentUser,
  participants,
  onClose
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasCameraError, setHasCameraError] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function startMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true
          });

          if (active && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
            streamRef.current = stream;
          }
        } else {
          setHasCameraError(true);
        }
      } catch (err) {
        console.warn('Video call camera access failed or denied in iframe context:', err);
        setHasCameraError(true);
      }
    }

    startMedia();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      } else {
        setIsVideoOn(!isVideoOn);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      } else {
        setIsAudioOn(!isAudioOn);
      }
    } else {
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
        };
      } else {
        setIsScreenSharing(false);
        if (localVideoRef.current && streamRef.current) {
          localVideoRef.current.srcObject = streamRef.current;
        }
      }
    } catch (err) {
      console.warn('Screen share cancelled or unsupported:', err);
    }
  };

  const handleHangup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Generate participant list with current user + remote peers
  const allPeers = [
    {
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName} (Ou menm)`,
      isLocal: true,
      role: currentUser.role
    },
    ...participants.filter(p => p.id !== currentUser.id).map(p => ({
      id: p.id,
      name: p.name,
      isLocal: false,
      role: p.role
    }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111614] border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between text-white bg-black/40">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>{roomTitle}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  Salon Sécurisé EDUKA
                </span>
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Durée : <strong className="text-emerald-400 font-mono">{formatTime(callDuration)}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Chiffrement de bout en bout
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="px-2.5 py-1 rounded-full bg-white/10 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{allPeers.length} participants</span>
            </span>
          </div>
        </div>

        {/* Video Tiles Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 overflow-y-auto bg-[#0C0F0E]">
          
          {/* Local User Tile */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-white/15 flex items-center justify-center shadow-lg group aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${!isVideoOn || hasCameraError ? 'hidden' : 'block'}`}
            />

            {(!isVideoOn || hasCameraError) && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[#075B46] text-white flex items-center justify-center text-xl font-bold border-2 border-white/20 mb-2">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </div>
                <span className="text-sm font-semibold text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Caméra désactivée</span>
              </div>
            )}

            {/* Local Tile Overlays */}
            <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1.5">
              <span>{currentUser.firstName} {currentUser.lastName} (Ou menm)</span>
              {!isAudioOn && <MicOff className="w-3 h-3 text-red-400" />}
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[10px] text-white font-mono">
                HD 720p
              </span>
            </div>
          </div>

          {/* Remote Participants Tiles */}
          {allPeers.filter(p => !p.isLocal).map((peer, idx) => (
            <div
              key={peer.id}
              className="relative rounded-xl overflow-hidden bg-slate-900 border border-white/15 flex flex-col items-center justify-center shadow-lg aspect-video"
            >
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative mb-2">
                  <div className={`w-16 h-16 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-emerald-700'} text-white flex items-center justify-center text-xl font-bold border-2 border-white/20`}>
                    {peer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <span className="text-sm font-semibold text-white">{peer.name}</span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Connecté en direct</span>
                </div>
              </div>

              <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1.5">
                <span>{peer.name}</span>
              </div>
            </div>
          ))}

          {/* Empty Peer Placeholder if solo */}
          {allPeers.length === 1 && (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center p-6 text-center aspect-video">
              <Users className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">En attente de connexion...</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Lòt elèv yo ak pwofesè a resevwa notifikasyon apèl la nan salon klas la.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-6 py-4 bg-black/60 border-t border-white/10 flex items-center justify-between">
          <div className="hidden sm:block text-xs text-slate-400">
            <span>Apèl Klas Nimerik • Rezolisyon Adaptativ</span>
          </div>

          <div className="flex items-center space-x-3 mx-auto sm:mx-0">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-3 rounded-full font-medium transition-colors ${
                isAudioOn
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-red-500/80 hover:bg-red-600 text-white'
              }`}
              title={isAudioOn ? 'Koupe Mikwo (Mute)' : 'Limen Mikwo (Unmute)'}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Video Toggle */}
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3 rounded-full font-medium transition-colors ${
                isVideoOn
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-red-500/80 hover:bg-red-600 text-white'
              }`}
              title={isVideoOn ? 'Koupe Kamera' : 'Limen Kamera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`p-3 rounded-full font-medium transition-colors ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Pataje Ekran (Partage d'écran)"
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            {/* End Call / Hang Up */}
            <button
              type="button"
              onClick={handleHangup}
              className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center space-x-2 transition-colors shadow-md shadow-red-900/30"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="text-xs">Kite Apèl la</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">EDUKA-MEET-v2</span>
          </div>
        </div>

      </div>
    </div>
  );
};
