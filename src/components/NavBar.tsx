import { AppView } from "../types";

type ViewTab = {
  key: AppView;
  label: string;
};

interface NavBarProps {
  active: AppView;
  onChange: (view: AppView) => void;
}

const TABS: ViewTab[] = [
  { key: "finder", label: "Ghost Finder" },
  { key: "maps", label: "Ghost Atlas" },
  { key: "tools", label: "Tools" },
  { key: "journal", label: "Journal" },
  { key: "voice", label: "Voice" },
  { key: "changelog", label: "Changelog" },
  { key: "settings", label: "Settings" }
];

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <nav className="nav">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${active === tab.key ? "active" : ""}`}
          aria-pressed={active === tab.key}
          aria-label={`Switch to ${tab.label}`}
          title={`Switch to ${tab.label}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
