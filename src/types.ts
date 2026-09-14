export type AppView =
  | "finder"
  | "maps"
  | "tools"
  | "journal"
  | "voice"
  | "settings"
  | "changelog";

export type HuntMode = "any" | "active" | "idle";

export interface SanityRange {
  min: number;
  max: number;
}

export interface ContentMeta {
  version: string;
  updatedAt?: string;
  source?: "local" | "remote";
  fetchedAt: string;
  remoteBase?: string;
}

export interface Ghost {
  id: string;
  name: string;
  aliases: string[];
  evidence: string[];
  speed: string;
  sanityRange: SanityRange;
  huntDistance: "low" | "normal" | "high";
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  strengths: string[];
  weaknesses: string[];
  notes: string[];
  mapHints: string[];
}

export interface MapInfo {
  id: string;
  name: string;
  clues: string[];
  ghostHints: string[];
}

export interface VoiceIntent {
  id: string;
  intent: string;
  examples: string[];
}

export interface ChangelogItem {
  date: string;
  note: string;
}

export interface DataBundle {
  version: string;
  ghosts: Ghost[];
  maps: MapInfo[];
  voiceIntents: VoiceIntent[];
  changelog: ChangelogItem[];
  contentMeta: ContentMeta;
}

export type LoadIssueCode =
  | "remote-manifest"
  | "remote-file"
  | "remote-parse"
  | "remote-validation"
  | "fallback"
  | "local-manifest"
  | "local-file"
  | "local-parse"
  | "local-validation"
  | "unknown";

export interface LoadIssue {
  code: LoadIssueCode;
  message: string;
  source?: "remote" | "local";
}

export interface FinderFilters {
  includeEvidence: string[];
  excludeEvidence: string[];
  map: string;
  sanity: number | null;
  huntMode: HuntMode;
}

export interface CandidateGhost {
  ghost: Ghost;
  confidence: number;
  reasons: string[];
}

export interface JournalSnapshot {
  id: string;
  createdAt: string;
  note: string;
  filters: Omit<FinderFilters, "sanity" | "huntMode"> & {
    sanity: number | null;
    huntMode: HuntMode;
  };
}

export interface ParsedCommand {
  type:
    | "clear"
    | "includeEvidence"
    | "excludeEvidence"
    | "removeEvidence"
    | "setMap"
    | "setSanity"
  | "timer"
  | "switchView"
  | "snapshot"
  | "none";
  evidence?: string[];
  map?: string;
  sanity?: number;
  minutes?: number;
  seconds?: number;
  view?: AppView;
  sourceText: string;
  intentSource?: "speech" | "manual";
}
