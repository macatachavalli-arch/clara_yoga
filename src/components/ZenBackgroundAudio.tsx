/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function ZenBackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create and configure the real nature recording audio element
    const audio = new Audio('/audio/naturaleza_clara.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0; // Starts at 0 for smooth fade-in
    audioRef.current = audio;

    const handleEnded = () => {
      // Loop backup for older browsers
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const fadeIn = (audio: HTMLAudioElement, targetVolume = 0.45) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.volume = 0;
    audio.play().then(() => {
      setIsPlaying(true);
      let vol = 0;
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.min(targetVolume, vol + 0.05);
        if (audioRef.current) audioRef.current.volume = vol;
        if (vol >= targetVolume) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 70);
    }).catch((err) => {
      console.warn('Audio play request blocked or unavailable:', err);
      setIsPlaying(false);
    });
  };

  const fadeOut = (audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    let vol = audio.volume;
    fadeIntervalRef.current = setInterval(() => {
      vol = Math.max(0, vol - 0.08);
      if (audioRef.current) audioRef.current.volume = vol;
      if (vol <= 0.01) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.pause();
        setIsPlaying(false);
      }
    }, 50);
  };

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      fadeOut(audio);
    } else {
      fadeIn(audio, 0.45);
    }
  };

  return (
    <button
      onClick={toggleSound}
      title={isPlaying ? "Silenciar sonido de la naturaleza" : "Escuchar ambiente de la naturaleza (arroyo, pájaros y cristal)"}
      className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-4 right-4 z-[75] flex items-center justify-center h-10 w-10 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#dcdcdc]/40 hover:border-[#dcdcdc] hover:bg-stone-900 transition-all shadow-lg cursor-pointer"
      style={{ color: '#dcdcdc' }}
      aria-label="Sonido sereno de naturaleza con agua, pájaros y cristal"
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5 animate-pulse" style={{ color: '#dcdcdc' }} />
      ) : (
        <VolumeX className="h-5 w-5 opacity-70" style={{ color: '#dcdcdc' }} />
      )}
    </button>
  );
}
