"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MusicPlayer = forwardRef(function MusicPlayer({ src }, ref) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  useImperativeHandle(ref, () => ({ play }), []);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) await play();
    else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="music-player">
      <audio ref={audioRef} src={src} loop preload="metadata" onPause={() => setPlaying(false)} />
      <button
        type="button"
        className={`music-player__button${playing ? " is-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Reproducir música"}
        aria-pressed={playing}
      >
        {playing ? <Volume2 size={19} /> : <VolumeX size={19} />}
        <span className="music-player__rings" aria-hidden="true" />
      </button>
    </div>
  );
});

export default MusicPlayer;
