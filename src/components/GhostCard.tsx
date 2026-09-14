import { CandidateGhost } from "../types";

interface GhostCardProps {
  candidate: CandidateGhost;
}

export function GhostCard({ candidate }: GhostCardProps) {
  const { ghost, confidence, reasons } = candidate;

  return (
    <article className="ghost-card">
      <header className="ghost-card__header">
        <h3>{ghost.name}</h3>
        <span className="ghost-card__score">{confidence}%</span>
      </header>

      <div className="chip-row">
        <span className="chip ghost-card__difficulty">{ghost.difficulty}</span>
        <span className="chip">{ghost.speed}</span>
        <span className="chip">Sanity {ghost.sanityRange.min}-{ghost.sanityRange.max}%</span>
        <span className="chip">Evidence {ghost.evidence.length}</span>
      </div>

      <section className="ghost-section">
        <strong>Evidence:</strong>
        <div className="chip-row">
          {ghost.evidence.map((entry) => (
            <span className="chip chip--outline" key={entry}>
              {entry}
            </span>
          ))}
        </div>
      </section>

      <section className="ghost-section">
        <strong>Strength:</strong> {ghost.strengths.join(", ")}
      </section>
      <section className="ghost-section">
        <strong>Weakness:</strong> {ghost.weaknesses.join(", ")}
      </section>
      <section className="ghost-section">
        <strong>Notes:</strong>
        <ul>
          {ghost.notes.map((note) => (
            <li key={`${ghost.id}-${note}`}>{note}</li>
          ))}
        </ul>
      </section>

      <details className="ghost-section">
        <summary>Why this score?</summary>
        <ul>
          {reasons.map((reason) => (
            <li key={`${ghost.id}-${reason}`}>{reason}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}
