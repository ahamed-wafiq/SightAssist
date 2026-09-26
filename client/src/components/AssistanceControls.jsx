/**
 * AssistanceControls Component
 * Oversized, high-contrast main action button for mobile users:
 * - START ASSISTANCE (idle)
 * - STOP ASSISTANCE (active)
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
        className={`btn-main-action ${
          isAssisting ? 'btn-main-action--stop' : 'btn-main-action--start'
        }`}
        onClick={onToggleAssistance}
        aria-pressed={isAssisting}
        aria-label={isAssisting ? 'Stop Assistance' : 'Start Assistance'}
      >
        <span className="btn-main-icon" aria-hidden="true">
          {isAssisting ? '⏹' : '▶'}
        </span>
        <span className="btn-main-label">
          {isAssisting ? 'STOP ASSISTANCE' : 'START ASSISTANCE'}
        </span>
      </button>
    </section>
  );
}
