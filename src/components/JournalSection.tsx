import { useEffect, useMemo, useState } from "react";
import { FinderFilters, JournalSnapshot } from "../types";

interface JournalSectionProps {
  filters: FinderFilters;
  snapshotRequest: number | null;
  onSnapshotHandled: () => void;
}

export function JournalSection({ filters, snapshotRequest, onSnapshotHandled }: JournalSectionProps) {
  const STORAGE_KEY = "phasmophia-journal-snapshots-v1";
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<JournalSnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  const createSnapshot = (noteOverride?: string) => {
    const next: JournalSnapshot = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      note: noteOverride ?? notes.trim(),
      filters: {
        includeEvidence: [...filters.includeEvidence],
        excludeEvidence: [...filters.excludeEvidence],
        map: filters.map,
        sanity: filters.sanity,
        huntMode: filters.huntMode
      }
    };
    setHistory((previous) => {
      const nextHistory = [next, ...previous].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
    setNotes("");
  };

  const saveSnapshot = () => {
    createSnapshot();
  };

  useEffect(() => {
    if (snapshotRequest) {
      createSnapshot("Snapshot created by voice command");
      onSnapshotHandled();
    }
  }, [snapshotRequest, onSnapshotHandled]);

  const deleteSnapshot = (id: string) => {
    setHistory((previous) => {
      const nextHistory = previous.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const snapshotText = useMemo(() => {
    return JSON.stringify(
      {
        includeEvidence: filters.includeEvidence,
        excludeEvidence: filters.excludeEvidence,
        map: filters.map,
        sanity: filters.sanity,
        huntMode: filters.huntMode
      },
      null,
      2
    );
  }, [filters]);

  return (
    <section>
      <header className="section-header">
        <h2>Session Journal</h2>
        <p>Capture session context and evidence states for fast handover between rounds.</p>
      </header>

      <section className="panel">
        <h3>Save Snapshot</h3>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What happened this round? e.g. ghost events, map interactions, player count"
        />
        <div className="row">
          <pre className="snapshot-box">{snapshotText}</pre>
        </div>
        <button type="button" onClick={saveSnapshot}>
          Save Snapshot
        </button>
      </section>

      <div className="panel">
        <h3>Past Snapshots</h3>
        {history.length === 0 ? (
          <p className="muted">No snapshots yet.</p>
        ) : (
          history.map((item) => (
            <article key={item.id} className="snapshot">
              <header>
                <h4>{new Date(item.createdAt).toLocaleString()}</h4>
                <button onClick={() => deleteSnapshot(item.id)} type="button">
                  Delete
                </button>
              </header>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
