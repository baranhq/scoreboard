import { Pause, Play, RotateCcw } from "lucide-react";

export function DemoPlaybackControls({
  playing,
  labels,
  onToggle,
  onReset,
  showReset = true,
  onDark = false,
}: {
  playing: boolean;
  labels: { play: string; pause: string; reset: string };
  onToggle: () => void;
  onReset: () => void;
  showReset?: boolean;
  onDark?: boolean;
}) {
  const color = onDark ? "text-white hover:bg-white/10" : "text-ink hover:bg-forest/10";

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label={playing ? labels.pause : labels.play}
        aria-pressed={!playing}
        title={playing ? labels.pause : labels.play}
        onClick={onToggle}
        className={`inline-flex size-11 items-center justify-center rounded-lg transition-colors motion-reduce:transition-none ${color}`}
      >
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
      </button>
      {showReset && (
        <button
          type="button"
          aria-label={labels.reset}
          title={labels.reset}
          onClick={onReset}
          className={`inline-flex size-11 items-center justify-center rounded-lg transition-colors motion-reduce:transition-none ${color}`}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
