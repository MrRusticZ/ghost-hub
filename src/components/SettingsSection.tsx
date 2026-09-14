import { ChangeEvent, FormEvent } from "react";

interface SettingsSectionProps {
  dataSourceUrl: string;
  onDataSourceChange: (value: string) => void;
}

export function SettingsSection({ dataSourceUrl, onDataSourceChange }: SettingsSectionProps) {
  const applySource = (event: FormEvent) => {
    event.preventDefault();
    const field = event.currentTarget.querySelector("input");
    if (field) {
      onDataSourceChange(field.value.trim());
    }
  };

  const clearSnapshot = () => {
    localStorage.removeItem("phasmophobia-finder-filters-v1");
    localStorage.removeItem("phasmophobia-data-source-v1");
    localStorage.removeItem("phasmophia-journal-snapshots-v1");
  };

  return (
    <section>
      <header className="section-header">
        <h2>Settings</h2>
        <p>Configure remote data source and local behavior.</p>
      </header>

      <form className="panel" onSubmit={applySource}>
        <h3>Remote data folder (GitHub-hosted, optional)</h3>
        <div className="row">
          <input
            value={dataSourceUrl}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onDataSourceChange(event.target.value)}
            placeholder="https://raw.githubusercontent.com/USER/REPO/refs/heads/main/public/data"
          />
          <button type="submit">Reload</button>
        </div>
        <small>
          If set, files like <code>manifest.json</code> and data json files are loaded from your URL.
        </small>
      </form>

      <div className="panel">
        <h3>Local Session</h3>
        <p className="muted">
          Settings, filters, and journal snapshots are stored in browser local storage for offline continuity.
        </p>
        <button onClick={clearSnapshot} type="button" className="danger">
          Reset Local Storage
        </button>
      </div>
    </section>
  );
}
