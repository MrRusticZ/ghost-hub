import { ChangeEvent } from "react";
import { FinderFilters, Ghost, MapInfo } from "../types";
import { getEvidenceCatalog, buildCandidateGhosts } from "../data/filters";
import { GhostCard } from "./GhostCard";
import { useState, useEffect } from "react";

interface FinderSectionProps {
  ghosts: Ghost[];
  maps: MapInfo[];
  filters: FinderFilters;
  onFiltersChange: (filters: FinderFilters) => void;
}

function toHumanNumber(value: number | null): string {
  if (value === null) return "";
  return String(value);
}

export function FinderSection({ ghosts, maps, filters, onFiltersChange }: FinderSectionProps) {
  const [copyState, setCopyState] = useState("");
  const evidenceCatalog = getEvidenceCatalog(ghosts);
  const candidates = buildCandidateGhosts(ghosts, filters);

  const updateFilters = (patch: Partial<FinderFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const onEvidenceCycle = (evidence: string) => {
    const isIncluded = filters.includeEvidence.includes(evidence);
    const isExcluded = filters.excludeEvidence.includes(evidence);

    if (isIncluded) {
      updateFilters({
        includeEvidence: filters.includeEvidence.filter((item) => item !== evidence),
        excludeEvidence: [...filters.excludeEvidence, evidence]
      });
      return;
    }

    if (isExcluded) {
      updateFilters({
        excludeEvidence: filters.excludeEvidence.filter((item) => item !== evidence)
      });
      return;
    }

    updateFilters({
      includeEvidence: [...filters.includeEvidence, evidence]
    });
  };

  const clear = () => {
    updateFilters({
      includeEvidence: [],
      excludeEvidence: [],
      map: "",
      sanity: null,
      huntMode: "any"
    });
  };

  const onSanityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (event.target.value === "") {
      updateFilters({ sanity: null });
      return;
    }
    if (Number.isFinite(parsed)) {
      updateFilters({ sanity: parsed });
    }
  };

  const copyCandidates = async () => {
    if (candidates.length === 0) {
      setCopyState("No candidates to copy yet.");
      return;
    }

    const payload = candidates
      .slice(0, 12)
      .map((candidate, index) => `${index + 1}. ${candidate.ghost.name} (${candidate.confidence}%)`)
      .join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setCopyState(`Copied top ${Math.min(candidates.length, 12)} candidates to clipboard.`);
      } else {
        setCopyState("Clipboard API unavailable in this browser.");
      }
    } catch {
      setCopyState("Failed to copy candidates. Browser blocked clipboard access.");
    }
  };

  useEffect(() => {
    if (!copyState) return;
    const timer = window.setTimeout(() => setCopyState(""), 2000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const isBlankSession = candidates.length === evidenceCatalog.length && !filters.map && filters.sanity === null && filters.includeEvidence.length === 0 && filters.excludeEvidence.length === 0;

  return (
    <section>
      <header className="section-header">
        <div>
          <h2>Ghost Finder</h2>
          <p>
            Use the evidence chips to lock, exclude, or clear filters. This engine works with
            incomplete evidence and supports map/sanity/hunt mode context.
          </p>
        </div>
        <button className="outline-btn" onClick={clear} type="button">
          Clear All
        </button>
      </header>

      <div className="panel">
        <h3>Evidence State</h3>
        <div className="chip-grid">
          {evidenceCatalog.map((evidence) => {
            const include = filters.includeEvidence.includes(evidence);
            const exclude = filters.excludeEvidence.includes(evidence);
            return (
              <button
                key={evidence}
                className={`chip chip-toggle ${include ? "included" : ""} ${exclude ? "excluded" : ""}`}
                onClick={() => onEvidenceCycle(evidence)}
                type="button"
                title={`${evidence}: click once include, twice exclude, third clear`}
                aria-label={`${evidence} evidence state control`}
              >
                {evidence}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filters-grid">
        <div className="panel">
          <h3>Map Filter</h3>
          <select
            value={filters.map}
            onChange={(event) => updateFilters({ map: event.target.value })}
          >
            <option value="">Any map</option>
            {maps.map((map) => (
              <option key={map.id} value={map.name}>
                {map.name}
              </option>
            ))}
          </select>
        </div>

        <div className="panel">
          <h3>Current Sanity</h3>
          <label className="label-row">
            <input
              type="number"
              min={0}
              max={100}
              value={toHumanNumber(filters.sanity)}
              onChange={onSanityChange}
              placeholder="Leave blank for unknown"
            />
            <small>0–100%</small>
          </label>
        </div>

        <div className="panel">
          <h3>Hunt State</h3>
          <select
            value={filters.huntMode}
            onChange={(event) => updateFilters({ huntMode: event.target.value as FinderFilters["huntMode"] })}
          >
            <option value="any">Any</option>
            <option value="active">Active hunt</option>
            <option value="idle">Idle calm</option>
          </select>
        </div>
      </div>

      <h3 className="results-title">Top Candidates ({candidates.length})</h3>
      <div className="actions-row">
        <button
          type="button"
          onClick={copyCandidates}
          className="outline-btn"
          aria-label="Copy candidate list"
        >
          Copy top candidates
        </button>
        <small aria-live="polite">{copyState}</small>
      </div>

      {isBlankSession ? (
        <div className="panel help-cards">
          <h3>Quick start</h3>
          <ul>
            <li>Tap an evidence chip to lock it as confirmed evidence.</li>
            <li>Tap again to mark evidence as impossible for this round.</li>
            <li>Use map and sanity to quickly narrow down likely ghosts.</li>
          </ul>
        </div>
      ) : null}

      <div className="results-grid">
        {candidates.length === 0 ? (
          <div className="panel">
            <h3>No matches</h3>
            <p>Try reducing exclusions and broadening your evidence set.</p>
            <div className="help-cards">
              <article className="help-card">
                <strong>Tip:</strong> Mark "not seen" evidence with exclusion only if you are confident.
              </article>
              <article className="help-card">
                <strong>Tip:</strong> If you have a map selected, remove it while testing sanity windows.
              </article>
            </div>
          </div>
        ) : (
          candidates.map((candidate) => <GhostCard key={candidate.ghost.id} candidate={candidate} />)
        )}
      </div>
    </section>
  );
}
