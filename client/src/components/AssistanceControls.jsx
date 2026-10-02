import { SquareIcon, PlayIcon } from './Icons';

/**
 * AssistanceControls Component
 * Large brutalist action button matching reference aesthetic:
 * - START DETECTION (idle)
 * - STOP DETECTION (active)
 */
export default function AssistanceControls({
  isAssisting,
  onToggleAssistance,
}) {
  return (
    <section className="main-action-section" aria-label="Main Assistance Trigger">
      <button
        type="button"
        id="main-assistance-button"
        className={`btn-brutalist-main ${
          isAssisting ? 'btn-brutalist-main--stop' : 'btn-brutalist-main--start'
        }`}
        onClick={onToggleAssistance}
        aria-pressed={isAssisting}
        aria-label={isAssisting ? 'Stop Detection' : 'Start Detection'}
      >
        <span className="btn-main-icon" aria-hidden="true">
          {isAssisting ? (
            <SquareIcon size={20} strokeWidth={2.4} />
          ) : (
            <PlayIcon size={20} strokeWidth={2.4} />
          )}
        </span>
        <span className="btn-main-label">
          {isAssisting ? 'STOP DETECTION' : 'START DETECTION'}
        </span>
      </button>
    </section>
  );
}
