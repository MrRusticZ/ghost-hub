import { CandidateGhost, Ghost, FinderFilters } from "../types";

export function getEvidenceCatalog(ghosts: Ghost[]): string[] {
  const values = new Set<string>();
  for (const ghost of ghosts) {
    for (const evidence of ghost.evidence) {
      values.add(evidence);
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function buildCandidateGhosts(
  ghosts: Ghost[],
  filters: FinderFilters
): CandidateGhost[] {
  const result: CandidateGhost[] = [];

  for (const ghost of ghosts) {
    const reasons: string[] = [];
    const excluded = filters.excludeEvidence.find((item) => ghost.evidence.includes(item));
    if (excluded) {
      reasons.push(`Rejected because ${excluded} cannot appear on ${ghost.name}.`);
      continue;
    }

    const missing = filters.includeEvidence.filter((item) => !ghost.evidence.includes(item));
    if (missing.length > 0) {
      continue;
    }

    let confidence = filters.includeEvidence.length === 0 ? 45 : 60;

    const includeBoost = filters.includeEvidence.length * 8;
    confidence += includeBoost;

    if (!filters.map) {
      // no map filter
    } else if (ghost.mapHints.length === 0) {
      reasons.push("Ghost has no map restriction in data. Score is unchanged.");
    } else if (ghost.mapHints.includes(filters.map)) {
      confidence += 12;
      reasons.push(`Strong match: map evidence mentions ${filters.map}.`);
    } else {
      confidence -= 12;
      reasons.push(`Usually less seen on ${filters.map}.`);
    }

    if (filters.sanity !== null) {
      const min = ghost.sanityRange.min;
      const max = ghost.sanityRange.max;
      if (filters.sanity >= min && filters.sanity <= max) {
        confidence += 10;
        reasons.push("Current sanity fits this ghost's typical window.");
      } else {
        confidence -= 8;
        reasons.push("Current sanity outside typical range for this ghost.");
      }
    }

    if (filters.huntMode === "active" && ghost.huntDistance === "high") {
      confidence += 10;
      reasons.push("Fast hunt distance fits active hunting behavior.");
    } else if (filters.huntMode === "active" && ghost.huntDistance === "low") {
      confidence -= 8;
      reasons.push("Low hunt distance often means this ghost can be slower in approach.");
    } else if (filters.huntMode === "idle" && ghost.huntDistance === "low") {
      confidence += 6;
      reasons.push("Low hunt distance tends to match calm-state behavior.");
    }

    confidence = Math.max(18, Math.min(100, confidence));
    result.push({ ghost, confidence, reasons });
  }

  return result.sort((left, right) => right.confidence - left.confidence);
}
