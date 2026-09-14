import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { EQUIPMENT } from "../src/hub/content";
import { EQUIPMENT_GUIDES, filterEquipment } from "../src/hub/equipmentData";
import media from "../src/hub/equipment-media.json";

test("equipment upgrade preserves every route and supplies all 63 distinct tiers", () => {
  assert.deepEqual(
    EQUIPMENT_GUIDES.map((x) => x.id),
    EQUIPMENT.map((x) => x.id),
  );
  assert.equal(EQUIPMENT_GUIDES.length, 21);
  assert.equal(EQUIPMENT_GUIDES.filter((x) => x.starter).length, 8);
  const images = new Set<string>();
  for (const gear of EQUIPMENT_GUIDES) {
    assert.equal(gear.tiers.length, 3);
    assert.ok(gear.revision > 0 && gear.price > 0 && gear.max > 0);
    for (const tier of gear.tiers) {
      assert.ok(
        tier.name &&
          tier.difference &&
          tier.level >= 1 &&
          tier.stats.length > 0,
      );
      assert.ok(media.some((m) => m.id === tier.image));
      images.add(tier.image);
    }
    for (const id of gear.pairs) {
      assert.ok(EQUIPMENT_GUIDES.some((g) => g.id === id));
      assert.notEqual(id, gear.id);
    }
  }
  assert.equal(images.size, 63);
});
test("all 64 equipment media files match their source ledger and stay below 1.6 MB", () => {
  assert.equal(media.length, 64);
  assert.equal(new Set(media.map((m) => m.id)).size, 64);
  for (const m of media) {
    const bytes = readFileSync(
      new URL("../src/hub/assets/equipment/" + m.file, import.meta.url),
    );
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", m.id);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", m.id);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      m.sha256,
      m.id,
    );
    assert.equal(bytes.length, m.bytes);
    assert.ok(
      m.uploader && m.source.startsWith("https://phasmophobia.fandom.com/"),
    );
  }
  assert.ok(media.reduce((n, m) => n + m.bytes, 0) < 1_600_000);
});
test("UV tier identity follows the current article, not outdated source filenames", () => {
  const uv = EQUIPMENT_GUIDES.find((x) => x.id === "uv-light")!;
  assert.equal(uv.tiers[0].name, "UV flashlight");
  assert.equal(uv.tiers[1].name, "UV glowstick");
  assert.deepEqual(
    uv.tiers.map((t) => t.electronic),
    [true, false, true],
  );
  assert.ok(
    media.find((x) => x.id === "uv-light-1")!.original.includes("UV090_T2"),
  );
  assert.ok(
    media.find((x) => x.id === "uv-light-2")!.original.includes("UV090_T1"),
  );
});
test("filters account for selected tier and preserve eight starter tools", () => {
  assert.equal(filterEquipment("", "All", 2, "starter", "default").length, 8);
  assert.ok(
    filterEquipment("", "All", 2, "non-electronic", "default").some(
      (x) => x.id === "uv-light",
    ),
  );
  assert.equal(
    filterEquipment("", "All", 3, "non-electronic", "default").some(
      (x) => x.id === "uv-light",
    ),
    false,
  );
  assert.deepEqual(
    filterEquipment(" UV glowstick ", "Evidence", 2, "all", "default").map(
      (x) => x.id,
    ),
    ["uv-light"],
  );
  assert.deepEqual(
    filterEquipment("smudge", "All", 1, "all", "default").map((x) => x.id),
    ["incense"],
  );
  assert.equal(
    filterEquipment("not-a-real-tool", "All", 2, "all", "default").length,
    0,
  );
});
test("sorts use numeric purchase price and tier-specific progression", () => {
  const priced = filterEquipment("", "All", 2, "all", "price");
  assert.equal(priced.length, 21);
  for (let i = 1; i < priced.length; i++)
    assert.ok(priced[i].price >= priced[i - 1].price);
  for (const tier of [1, 2, 3]) {
    const sorted = filterEquipment("", "All", tier, "all", "unlock");
    for (let i = 1; i < sorted.length; i++)
      assert.ok(
        sorted[i].tiers[tier - 1].level >= sorted[i - 1].tiers[tier - 1].level,
      );
  }
});
test("reusable third-tier ignition and incense retain finite in-contract use specifications", () => {
  for (const id of ["incense", "igniter", "firelight"])
    assert.deepEqual(
      EQUIPMENT_GUIDES.find((x) => x.id === id)!.tiers.map((t) => t.consumable),
      [true, true, false],
    );
  const igniter = EQUIPMENT_GUIDES.find((x) => x.id === "igniter")!;
  assert.ok(
    igniter.tiers[2].stats.some(
      ([label, value]) => label === "Duration" && value === "10 min",
    ),
  );
  assert.ok(
    EQUIPMENT_GUIDES.find(
      (x) => x.id === "motion-sensor",
    )!.tiers[2].difference.includes("only the ghost"),
  );
});
