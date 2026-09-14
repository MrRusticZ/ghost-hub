import { ParsedCommand } from "../types";

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

function normalizeForVoice(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumberText(text: string): number | null {
  const words = text.match(/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|[0-9]+)\b/g);
  if (!words || words.length === 0) {
    return null;
  }

  const n = Number(words[0]);
  if (Number.isFinite(n) && n > 0) {
    return n;
  }
  return WORD_NUMBERS[words[0]] ?? null;
}

function parseSanity(text: string): number | null {
  const matches = text.match(/([0-9]{1,3})\s*%?/);
  if (!matches) return null;
  const parsed = Number(matches[1]);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 100) return null;
  return parsed;
}

function matchOneOf(text: string, patterns: string[]): boolean {
  return patterns.some((item) => text.includes(item));
}

function findMapMatch(normalizedText: string, mapNames: string[]): string | undefined {
  return mapNames.find((map) => {
    const normalizedMap = normalizeForVoice(map);
    return normalizedText.includes(normalizedMap);
  });
}

function findEvidenceMatches(rawText: string, evidenceWords: string[]): string[] {
  const normalized = normalizeForVoice(rawText);
  const results = new Set<string>();

  const knownSynonyms: Record<string, string[]> = {
    "emf 5": ["emf 5", "emf5", "emf"],
    "d.o.t.s.": ["d o t s", "dots", "d.o.t.s", "dots"],
    "fingerprints": ["fingerprints", "fingerprint", "fprints"],
    "freezing temperatures": ["freezing temperature", "freezing", "temperature"],
    "ghost writing": ["ghost writing", "writing"],
    "spirit box": ["spirit box", "spiritbox"],
    "uv": ["uv", "u v", "ultraviolet"],
    "ghost orb": ["ghost orb", "orb", "orbs"]
  };

  for (const evidence of evidenceWords) {
    const key = normalizeForVoice(evidence);
    const aliases = knownSynonyms[evidence.toLowerCase()] ?? [key];
    if (aliases.some((alias) => normalized.includes(normalizeForVoice(alias)))) {
      results.add(evidence);
    }
  }

  return Array.from(results);
}

export function parseVoiceCommand(text: string, evidenceWords: string[], mapNames: string[]): ParsedCommand {
  const normalized = normalizeForVoice(text.toLowerCase().trim());
  if (!normalized) {
    return { type: "none", sourceText: text };
  }

  if (matchOneOf(normalized, ["clear", "reset", "start over", "clear all", "new round"])) {
    return { type: "clear", sourceText: text };
  }

  if (matchOneOf(normalized, ["journal", "note", "save note", "snapshot"])) {
    return { type: "snapshot", sourceText: text };
  }

  const views =
    /finder/.test(normalized) ||
    /ghosts?/.test(normalized) ||
    /map/.test(normalized) ||
    /tool/.test(normalized) ||
    /journal/.test(normalized) ||
    /voice/.test(normalized) ||
    /setting/.test(normalized);
  if (matchOneOf(normalized, ["go to", "open", "switch", "show"]) && views) {
    if (normalized.includes("finder") || normalized.includes("ghost")) return { type: "switchView", view: "finder", sourceText: text };
    if (normalized.includes("map")) return { type: "switchView", view: "maps", sourceText: text };
    if (normalized.includes("tool")) return { type: "switchView", view: "tools", sourceText: text };
    if (normalized.includes("journal")) return { type: "switchView", view: "journal", sourceText: text };
    if (normalized.includes("voice")) return { type: "switchView", view: "voice", sourceText: text };
    if (normalized.includes("setting")) return { type: "switchView", view: "settings", sourceText: text };
  }

  if (matchOneOf(normalized, ["start timer", "run timer", "timer for", "set timer"])) {
    const raw = parseNumberText(normalized);
    const secondsRaw = normalized.match(/(\d+)\s*(?:sec|second)s?/)?.[1];
    if (secondsRaw) {
      return { type: "timer", minutes: 0, seconds: Number(secondsRaw), sourceText: text };
    }
    const minutes = raw;
    if (minutes !== null) {
      return { type: "timer", minutes, sourceText: text };
    }
  }

  if (matchOneOf(normalized, ["set sanity", "sanity at", "sanity is", "change sanity"])) {
    const value = parseSanity(normalized);
    if (value !== null) {
      return { type: "setSanity", sanity: value, sourceText: text };
    }
  }

  if (matchOneOf(normalized, ["include", "add", "check", "lock", "seen"])) {
    const found = findEvidenceMatches(normalized, evidenceWords);
    if (found.length > 0) {
      return { type: "includeEvidence", evidence: found, sourceText: text };
    }
  }

  if (matchOneOf(normalized, ["remove", "exclude", "discard", "not seen", "ignore"])) {
    const found = findEvidenceMatches(normalized, evidenceWords);
    if (found.length > 0) {
      return { type: "excludeEvidence", evidence: found, sourceText: text };
    }
  }

  const maybeMap = findMapMatch(normalized, mapNames);
  if (maybeMap) {
    return { type: "setMap", map: maybeMap, sourceText: text };
  }

  const maybeEvidence = evidenceWords.find((evidence) => normalized.includes(evidence.toLowerCase()));
  if (maybeEvidence && matchOneOf(normalized, ["remove", "clear", "not", "undo"])) {
    return { type: "removeEvidence", evidence: [maybeEvidence], sourceText: text };
  }

  return { type: "none", sourceText: text };
}
