import { MapInfo } from "../types";

interface MapSectionProps {
  maps: MapInfo[];
}

export function MapSection({ maps }: MapSectionProps) {
  return (
    <section>
      <header className="section-header">
        <h2>Ghost Atlas</h2>
        <p>Map-specific clues, event hints, and ghost affinity notes.</p>
      </header>

      <div className="results-grid">
        {maps.map((map) => (
          <article className="panel map-card" key={map.id}>
            <h3>{map.name}</h3>
            <div className="ghost-section">
              <strong>Core Clues</strong>
              <ul>
                {map.clues.map((clue) => (
                  <li key={`${map.id}-${clue}`}>{clue}</li>
                ))}
              </ul>
            </div>
            <div className="ghost-section">
              <strong>Common Ghost Hints</strong>
              <ul>
                {map.ghostHints.map((hint) => (
                  <li key={`${map.id}-hint-${hint}`}>{hint}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
