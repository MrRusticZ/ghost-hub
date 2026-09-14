import {
  ChangelogItem,
  DataBundle,
  DataFile,
  DataLoadIssue,
  DataLoadIssueCode,
  Ghost,
  HuntMode,
  MapInfo,
  SanityRange,
  VoiceIntent,
  ContentMeta
} from "../types";

type RawRecord = Record<string, unknown>;

interface ManifestShape {
  version: string;
  updatedAt?: string;
  files: Record<string, string>;
}

interface DataFileShape {
  ghosts: string;
  maps: string;
  voiceIntents: string;
  changelog: string;
}

interface DataFileMap extends DataFileShape {
  manifest: string;
}

const DEFAULT_FILES: DataFileMap = {
  manifest: "/data/manifest.json",
  ghosts: "ghosts.json",
  maps: "maps.json",
  voiceIntents: "voice-commands.json",
  changelog: "changelog.json"
};

const REMOTE_SOURCE_MAP = {
  ghosts: "ghosts",
  maps: "maps",
  voiceIntents: "voiceIntents",
  changelog: "changelog"
} as const;

function makeIssue(code: DataLoadIssueCode, message: string, source?: "remote" | "local"): DataLoadIssue {
  return { code, message, source };
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function asStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value.map((entry) => entry.trim()).filter((entry) => entry.length > 0)
    : null;
}

function asNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asJsonUrl(base: string, candidate: unknown): string {
  if (!isRecord(candidate)) return "";
  const file = asString(candidate.value);
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  return `${base.replace(/\/$/, "")}/${String(file).replace(/^\/+/, "")}`;
}

function normalizeHuntDistance(value: unknown): Ghost["huntDistance"] | null {
  return value === "low" || value === "normal" || value === "high" ? value : null;
}

function normalizeDifficulty(value: unknown): Ghost["difficulty"] | null {
  return value === "Easy" || value === "Medium" || value === "Hard" || value === "Expert" ? value : null;
}

function normalizeSanityRange(value: unknown): SanityRange | null {
  if (!isRecord(value)) return null;
  const min = asNumber(value.min);
  const max = asNumber(value.max);
  if (min === null || max === null) return null;
  if (!Number.isInteger(min) || !Number.isInteger(max)) return null;
  if (min < 0 || max < 0 || min > 100 || max > 100 || min > max) return null;
  return { min, max };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

function parseManifest(raw: unknown, issues: DataLoadIssue[], source: "remote" | "local"): ManifestShape {
  if (!isRecord(raw)) {
    issues.push(makeIssue(`${source}-parse`, `Manifest payload is not a valid JSON object.`, source));
    return {
      version: "0",
      files: { ...DEFAULT_FILES },
      updatedAt: undefined
    };
  }

  const version = asString(raw.version) ?? "0";
  const files = isRecord(raw.files)
    ? raw.files
    : {};

  return {
    version,
    updatedAt: asString(raw.updatedAt) ?? undefined,
    files: {
      ghosts: asString(files.ghosts) || DEFAULT_FILES.ghosts,
      maps: asString(files.maps) || DEFAULT_FILES.maps,
      voiceIntents: asString(files.voiceIntents) || DEFAULT_FILES.voiceIntents,
      changelog: asString(files.changelog) || DEFAULT_FILES.changelog
    }
  };
}

function parseGhosts(raw: unknown, issues: DataLoadIssue[], source: "remote" | "local"): Ghost[] {
  if (!Array.isArray(raw)) {
    issues.push(makeIssue(`${source}-parse`, "Ghosts payload is not an array.", source));
    return [];
  }

  const out: Ghost[] = [];
  raw.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(makeIssue(`${source}-validation`, `Skipping ghost at index ${index}: invalid object.`, source));
      return;
    }

    const id = asString(entry.id);
    const name = asString(entry.name);
    const aliases = asStringArray(entry.aliases);
    const evidence = asStringArray(entry.evidence);
    const speed = asString(entry.speed);
    const sanityRange = normalizeSanityRange(entry.sanityRange);
    const huntDistance = normalizeHuntDistance(entry.huntDistance);
    const difficulty = normalizeDifficulty(entry.difficulty);
    const strengths = asStringArray(entry.strengths);
    const weaknesses = asStringArray(entry.weaknesses);
    const notes = asStringArray(entry.notes);
    const mapHints = asStringArray(entry.mapHints);

    if (!id || !name || !evidence || !sanityRange || !huntDistance || !difficulty || !strengths || !weaknesses || !notes || !mapHints) {
      issues.push(makeIssue(`${source}-validation`, `Skipping ghost ${id ?? `at index ${index}`}: missing required fields.`, source));
      return;
    }

    if (!aliases) {
      issues.push(makeIssue(`${source}-validation`, `Ghost ${id} missing aliases; defaulting to empty list.`, source));
    }

    if (!speed) {
      issues.push(makeIssue(`${source}-validation`, `Ghost ${id} missing speed; defaulting to "Normal".`, source));
    }

    out.push({
      id,
      name,
      aliases: aliases ?? [],
      evidence,
      speed: speed ?? "Normal",
      sanityRange,
      huntDistance,
      difficulty,
      strengths,
      weaknesses,
      notes,
      mapHints
    });
  });

  return out;
}

function parseMaps(raw: unknown, issues: DataLoadIssue[], source: "remote" | "local"): MapInfo[] {
  if (!Array.isArray(raw)) {
    issues.push(makeIssue(`${source}-parse`, "Maps payload is not an array.", source));
    return [];
  }

  const out: MapInfo[] = [];
  raw.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(makeIssue(`${source}-validation`, `Skipping map at index ${index}: invalid object.`, source));
      return;
    }

    const id = asString(entry.id);
    const name = asString(entry.name);
    const clues = asStringArray(entry.clues);
    const ghostHints = asStringArray(entry.ghostHints);

    if (!id || !name || !clues || !ghostHints) {
      issues.push(makeIssue(`${source}-validation`, `Skipping map ${id ?? `at index ${index}`}: missing required fields.`, source));
      return;
    }

    out.push({ id, name, clues, ghostHints });
  });

  return out;
}

function parseVoiceIntents(raw: unknown, issues: DataLoadIssue[], source: "remote" | "local"): VoiceIntent[] {
  if (!Array.isArray(raw)) {
    issues.push(makeIssue(`${source}-parse`, "Voice intent payload is not an array.", source));
    return [];
  }

  return raw
    .map((entry, index) => {
      if (!isRecord(entry)) {
        issues.push(makeIssue(`${source}-validation`, `Skipping voice intent at index ${index}: invalid object.`, source));
        return null;
      }

      const id = asString(entry.id);
      const intent = asString(entry.intent);
      const examples = asStringArray(entry.examples);

      if (!id || !intent || !examples) {
        issues.push(makeIssue(`${source}-validation`, `Skipping voice intent ${id ?? `at index ${index}`}: missing required fields.`, source));
        return null;
      }

      return { id, intent, examples };
    })
    .filter((entry): entry is VoiceIntent => entry !== null);
}

function parseChangelog(raw: unknown, issues: DataLoadIssue[], source: "remote" | "local"): ChangelogItem[] {
  if (!Array.isArray(raw)) {
    issues.push(makeIssue(`${source}-parse`, "Changelog payload is not an array.", source));
    return [];
  }

  return raw
    .map((entry, index) => {
      if (!isRecord(entry)) {
        issues.push(makeIssue(`${source}-validation`, `Skipping changelog entry at index ${index}: invalid object.`, source));
        return null;
      }

      const date = asString(entry.date);
      const note = asString(entry.note);
      if (!date || !note) {
        issues.push(makeIssue(`${source}-validation`, `Skipping changelog entry ${index}: missing date or note.`, source));
        return null;
      }
      return { date, note };
    })
    .filter((entry): entry is ChangelogItem => entry !== null);
}

async function loadFromSource(
  source: "remote" | "local",
  issues: DataLoadIssue[],
  remoteBase?: string
): Promise<DataBundle> {
  const isRemote = source === "remote";
  const base = isRemote ? remoteBase?.replace(/\/$/, "") : "";
  const manifestUrl = isRemote
    ? `${base}/manifest.json`
    : DEFAULT_FILES.manifest;

  const manifest = await fetchJson<unknown>(manifestUrl).catch((error) => {
    issues.push(
      makeIssue(
        isRemote ? "remote-manifest" : "local-manifest",
        isRemote
          ? `Failed to load manifest from ${manifestUrl}. ${error instanceof Error ? error.message : "Unknown error"}`
          : `Bundled manifest missing. ${error instanceof Error ? error.message : "Unknown error"}`
      , source)
    );
    throw error;
  });

  const parsedManifest = parseManifest(manifest, issues, source);
  const files = parsedManifest.files as ManifestShape["files"] & Partial<DataFileShape>;

  const fetchConfig: Array<{ key: keyof DataFileShape; target: string }> = (Object.keys(REMOTE_SOURCE_MAP) as Array<keyof DataFileShape>).map((key) => {
    const remoteKey = REMOTE_SOURCE_MAP[key];
    const file = asString(files[remoteKey]) || DEFAULT_FILES[key];
    const resolved = isRemote ? `${base}/${file.replace(/^\/+/, "")}` : `/${String(file).replace(/^\/+/, "")}`;
    return { key, target: resolved };
  });

  const payloads = await Promise.all(
    fetchConfig.map((entry) =>
      fetchJson<unknown>(entry.target).catch((error) => {
        issues.push(makeIssue(
          isRemote ? "remote-file" : "local-file",
          `Failed to load ${entry.key} from ${entry.target}. ${error instanceof Error ? error.message : "Unknown error"}`,
          source
        ));
        throw error;
      })
    )
  );

  const payloadMap: Record<keyof DataFileShape, unknown> = {
    ghosts: payloads[fetchConfig.findIndex((item) => item.key === "ghosts")],
    maps: payloads[fetchConfig.findIndex((item) => item.key === "maps")],
    voiceIntents: payloads[fetchConfig.findIndex((item) => item.key === "voiceIntents")],
    changelog: payloads[fetchConfig.findIndex((item) => item.key === "changelog")]
  };

  const ghosts = parseGhosts(payloadMap.ghosts, issues, source);
  const maps = parseMaps(payloadMap.maps, issues, source);
  const voiceIntents = parseVoiceIntents(payloadMap.voiceIntents, issues, source);
  const changelog = parseChangelog(payloadMap.changelog, issues, source);

  const contentMeta: ContentMeta = {
    version: parsedManifest.version || "0",
    updatedAt: parsedManifest.updatedAt,
    source,
    fetchedAt: new Date().toISOString(),
    remoteBase: isRemote ? base : undefined
  };

  if (ghosts.length === 0) {
    issues.push(makeIssue(
      isRemote ? "remote-validation" : "local-validation",
      `No valid ghost records were loaded from ${isRemote ? "remote" : "local"} source.`
    ));
    if (isRemote) {
      throw new Error("Remote data is invalid: no valid ghost records.");
    }
  }

  if (maps.length === 0) {
    issues.push(makeIssue(
      isRemote ? "remote-validation" : "local-validation",
      `No valid maps were loaded from ${isRemote ? "remote" : "local"} source.`
    ));
    if (isRemote) {
      throw new Error("Remote data is invalid: no valid maps.");
    }
  }

  return {
    version: contentMeta.version,
    ghosts,
    maps,
    voiceIntents,
    changelog,
    contentMeta
  };
}

export interface DataLoadResult {
  bundle: DataBundle;
  source: "remote" | "local";
  issues: DataLoadIssue[];
}

export async function loadDataBundle(remoteBase?: string | null): Promise<DataLoadResult> {
  const issues: DataLoadIssue[] = [];

  if (remoteBase) {
    try {
      const remote = await loadFromSource("remote", issues, remoteBase);
      return { bundle: remote, source: "remote", issues };
    } catch (error) {
      issues.push(
        makeIssue(
          "fallback",
          `Remote source failed. Falling back to bundled data. ${error instanceof Error ? error.message : "Unknown error"}.`
        )
      );
    }
  }

  try {
    const local = await loadFromSource("local", issues);
    return { bundle: local, source: "local", issues };
  } catch (error) {
    throw new Error(
      `Could not load local content bundle. ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
