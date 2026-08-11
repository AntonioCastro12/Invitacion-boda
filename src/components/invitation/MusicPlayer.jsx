import { Pause, Play } from "lucide-react";

export default function MusicPlayer({ playing, onToggle }) {
  return <button className="music-button" type="button" onClick={onToggle} aria-label={playing ? "Pausar música" : "Reproducir música"}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>;
}
