/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function ZenBackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startZenSound = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // 1. Soothing Ocean Waves / Gentle Breeze (Pink noise + modulated lowpass filter)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter for wave swell motion
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(280, ctx.currentTime);

      // LFO for wave swelling effect
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 1 cycle every ~10 seconds
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(220, ctx.currentTime); // modulate frequency

      lfo.connect(lfoGain);
      lfoGain.connect(waveFilter.frequency);

      noiseSource.connect(waveFilter);
      waveFilter.connect(masterGain);

      noiseSource.start();
      lfo.start();

      // 2. Gentle Zen Chime / Singing Bowl tones at 432Hz harmonics
      const playChime = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const freqs = [216, 288, 324, 432, 576]; // Zen pentatonic scale
        const freq = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.8);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 8);

        osc.connect(chimeGain);
        chimeGain.connect(masterGain);

        osc.start();
        osc.stop(ctx.currentTime + 8.5);
      };

      // Play initial warm chime
      setTimeout(() => playChime(), 800);

      // Interval for periodic soft chimes
      const chimeInterval = setInterval(() => {
        playChime();
      }, 7500);

      (ctx as unknown as { _chimeInterval: NodeJS.Timeout })._chimeInterval = chimeInterval;

      setIsPlaying(true);
    } catch (e) {
      console.error('Audio initialization error:', e);
    }
  };

  const stopZenSound = () => {
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current as unknown as { _chimeInterval?: NodeJS.Timeout } & AudioContext;
      if (ctx._chimeInterval) clearInterval(ctx._chimeInterval);
      ctx.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopZenSound();
    } else {
      startZenSound();
    }
  };

  useEffect(() => {
    // Attempt auto-start sound on load or on first user gesture anywhere on page
    const tryAutoPlay = () => {
      startZenSound();
    };

    tryAutoPlay();

    const handleFirstGesture = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        startZenSound();
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      window.removeEventListener('mousemove', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);
    window.addEventListener('scroll', handleFirstGesture);
    window.addEventListener('mousemove', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      window.removeEventListener('mousemove', handleFirstGesture);
      stopZenSound();
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      title={isPlaying ? "Silenciar ambiente zen" : "Activar sonido zen"}
      className="fixed bottom-4 right-4 z-40 flex items-center justify-center h-10 w-10 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#dcdcdc]/40 hover:border-[#dcdcdc] hover:bg-stone-900 transition-all shadow-lg cursor-pointer"
      style={{ color: '#dcdcdc' }}
      aria-label="Sonidos de la naturaleza zen"
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5 animate-pulse" style={{ color: '#dcdcdc' }} />
      ) : (
        <VolumeX className="h-5 w-5 opacity-70" style={{ color: '#dcdcdc' }} />
      )}
    </button>
  );
}
