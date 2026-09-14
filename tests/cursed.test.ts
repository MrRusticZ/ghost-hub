import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  CURSED_GUIDES,
  OUIJA_QUESTIONS,
  PAW_WISHES,
  TAROT_CARDS,
  atLeastOne,
  mirrorCost,
  matchesCursed,
} from "../src/hub/cursedData";
import media from "../src/hub/cursed-media.json";
import { CURSED_ITEMS } from "../src/hub/reference";
import { MAPS } from "../src/hub/content";

test("every existing cursed route has a dossier, sourced imagery and a valid atlas destination", () => {
  assert.deepEqual(
    CURSED_GUIDES.map((g) => g.id),
    CURSED_ITEMS.map((g) => g.id),
  );
  assert.equal(new Set(CURSED_GUIDES.map((g) => g.id)).size, 7);
  for (const guide of CURSED_GUIDES) {
    for (const id of [
      guide.id,
      guide.spawn.image,
      guide.extraImage,
      guide.clip,
    ].filter(Boolean))
      assert.ok(
        media.find((m) => m.id === id),
        `${id}: missing media`,
      );
    assert.ok(
      MAPS.some((m) => m.id === guide.spawn.map),
      guide.name + " atlas link",
    );
    assert.ok(guide.revision > 0 && guide.revisionDate);
  }
});

test("30 credited media files retain their verified bytes and four genuine animations", () => {
  assert.equal(media.length, 30);
  assert.equal(new Set(media.map((m) => m.id)).size, 30);
  for (const record of media) {
    const bytes = readFileSync(
      new URL("../src/hub/assets/cursed/" + record.file, import.meta.url),
    );
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", record.id);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", record.id);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      record.sha256,
      record.id,
    );
    assert.equal(
      bytes.includes(Buffer.from("ANIM")),
      record.animated,
      record.id,
    );
    assert.equal(bytes.length, record.bytes);
    assert.ok(record.width > 0 && record.height > 0);
    assert.equal(new URL(record.source).hostname, "phasmophobia.fandom.com");
    assert.ok(record.uploader);
  }
  assert.equal(media.filter((m) => m.animated).length, 4);
  assert.ok(
    media.filter((m) => !m.animated).reduce((sum, m) => sum + m.bytes, 0) <
      2_100_000,
    "Still images should stay within the 2.1 MB budget",
  );
});

test("tarot probabilities form a complete distribution and every card has actual artwork", () => {
  assert.equal(TAROT_CARDS.length, 10);
  assert.equal(
    TAROT_CARDS.reduce((sum, c) => sum + c.chance, 0),
    100,
  );
  for (const card of TAROT_CARDS)
    assert.ok(media.find((m) => m.id === card.id && !m.animated));
  assert.equal(PAW_WISHES.length, 10);
  assert.equal(new Set(PAW_WISHES.map((w) => w.id)).size, 10);
});

test("mirror planner charges the larger cost, never the sum of minimum and duration", () => {
  assert.equal(mirrorCost(0.5), 20);
  assert.equal(mirrorCost(2), 20);
  assert.equal(mirrorCost(4), 30);
  assert.equal(mirrorCost(12), 90);
  assert.equal(mirrorCost(Number.NaN), 20);
  assert.equal(mirrorCost(-4), 20);
});

test("deck odds model independent draws rather than guaranteed rare cards", () => {
  assert.equal(atLeastOne(1, 0), 0);
  assert.ok(Math.abs(atLeastOne(1, 1) - 1) < 1e-10);
  assert.ok(Math.abs(atLeastOne(1, 10) - 9.561792499) < 1e-8);
  assert.ok(Math.abs(atLeastOne(10, 10) - 65.13215599) < 1e-8);
  assert.ok(Math.abs(atLeastOne(2, 10) - 18.292719311) < 1e-8);
  assert.equal(atLeastOne(100, 1), 100);
});

test("item search combines purpose and unordered words; deliberate hunt is never presented as a free answer", () => {
  const mirror = CURSED_GUIDES[0];
  assert.ok(matchesCursed(mirror, "room mirror", "Locate"));
  assert.ok(matchesCursed(mirror, "  MIRROR  20% ", "All"));
  assert.equal(matchesCursed(mirror, "mirror", "Recovery"), false);
  assert.equal(matchesCursed(mirror, "banana", "All"), false);
  const zero = OUIJA_QUESTIONS.filter((q) => q.cost === 0);
  assert.equal(zero.length, 1);
  assert.equal(zero[0].category, "Deliberate hunt");
  assert.equal(OUIJA_QUESTIONS.find((q) => q.category === "Bone")?.cost, 20);
});
