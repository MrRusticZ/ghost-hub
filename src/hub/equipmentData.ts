import { EQUIPMENT } from "./content";
import specifications from "./equipment-specs.json";

export const EQUIPMENT_CHECKED = "15 September 2026";
export const EQUIPMENT_SOURCE = "https://phasmophobia.fandom.com/wiki/";
export const TIER_NAMES = ["I", "II", "III"] as const;
export const EQUIPMENT_CATEGORIES = [
  "All",
  "Evidence",
  "Protection",
  "Tracking",
  "Utility",
  "Media",
] as const;
type FieldNotes = {
  names: [string, string, string];
  differences: [string, string, string];
  notes: string[];
  pairs: string[];
  aliases?: string;
};
const fieldNotes: Record<string, FieldNotes> = {
  "emf-reader": {
    names: ["Analogue meter", "K2 meter", "Directional meter"],
    differences: [
      "Watch for the needle staying beyond 5; a brief swing is not enough.",
      "Five illuminated LEDs give a much clearer evidence reading.",
      "Tracks up to three sources with distance and direction.",
    ],
    notes: [
      "An eligible interaction can produce EMF 5. Check the device at the interaction, not the truck activity graph.",
      "Interference during a manifestation is not a substitute for a stable evidence reading.",
    ],
    pairs: ["writing-book", "spirit-box"],
    aliases: "electromagnetic k2",
  },
  "spirit-box": {
    names: ["Old radio", "Digital box", "Advanced radio"],
    differences: [
      "A short range and lower response rate mean careful positioning matters.",
      "The display helps distinguish a registered question from a ghost response.",
      "The widest range and highest response rate make coverage easier.",
    ],
    notes: [
      "Turn off the room lights and satisfy the ghost’s alone/everyone requirement. Ask near the ghost’s current position.",
      "A registered question with no reply does not establish negative evidence. Move and retry under valid conditions.",
    ],
    pairs: ["motion-sensor", "crucifix"],
    aliases: "radio talking speech voice",
  },
  "uv-light": {
    names: ["UV flashlight", "UV glowstick", "Wide UV flashlight"],
    differences: [
      "A narrow electronic beam charges prints in 5 seconds.",
      "A non-electronic area light. Shake it after it dims to restore brightness.",
      "A wider electronic beam charges prints in 1.5 seconds.",
    ],
    notes: [
      "The flashlight is Tier I and the glowstick is Tier II. Older guides and the original image filenames may use the pre-swap order.",
      "Disturbed salt is not UV evidence. Illuminate actual fingerprints or footprints before recording Ultraviolet.",
    ],
    pairs: ["salt", "photo-camera"],
    aliases: "ultraviolet fingerprints footprints glowstick",
  },
  thermometer: {
    names: ["Liquid thermometer", "Infrared thermometer", "Digital probe"],
    differences: [
      "Passive, non-electronic readings; allow the liquid time to settle.",
      "Hold Use for repeated readings about every 2.5 seconds.",
      "Repeated readings about every 1.5 seconds, with less variation.",
    ],
    notes: [
      "The device measures the room you occupy; pointing at an object does not measure that object.",
      "Breath indicates cold air, not Freezing Temperatures. Confirm a reading below 0°C / 32°F.",
    ],
    pairs: ["video-camera", "emf-reader"],
    aliases: "temperature freezing cold",
  },
  "dots-projector": {
    names: ["Laser pen", "Area projector", "Scanning projector"],
    differences: [
      "A narrow cone reaches farther than the small area projector, but covers less space.",
      "A stationary area field is useful for watching a compact room.",
      "A wide scanning field covers larger spaces; its sweep can be paused.",
    ],
    notes: [
      "Range alone is a poor comparison: Tier I is a cone, Tier II an area light, and Tier III a scanning cone.",
      "A Goryo’s D.O.T.S. is visible through a video camera and requires nobody in its room. Players crossing the field are not evidence.",
      "Only an active, held Tier I projector attracts the hunting ghost to its holder. The Electronic label alone does not describe every tier’s detection behaviour.",
    ],
    pairs: ["video-camera", "tripod"],
    aliases: "dots laser silhouette",
  },
  "writing-book": {
    names: ["Notepad", "Leather journal", "Occult book"],
    differences: [
      "A small interaction area and lower interaction rate.",
      "A larger interaction area and improved interaction rate.",
      "The largest area and highest listed interaction rate.",
    ],
    notes: [
      "Place the book open using the placement control. Simply throwing a closed book does not set up the test.",
      "Keep it near current activity. A long wait is not a reliable negative test, especially with reduced evidence.",
    ],
    pairs: ["emf-reader", "video-camera"],
    aliases: "ghost writing notebook journal",
  },
  "video-camera": {
    names: ["Handycam", "HD camcorder", "Cinema camera"],
    differences: [
      "Night vision and a truck feed, with the least resistance to interference.",
      "Improved picture quality and interference resistance.",
      "The clearest listed image and strongest resistance to interference.",
    ],
    notes: [
      "All three tiers can see Ghost Orbs with night vision. The Mimic’s extra orbs can appear even with no ordinary evidence.",
      "Hold Use to record valid media, or record from the truck’s computer. A live feed and a recorded journal clip are different things.",
    ],
    pairs: ["tripod", "dots-projector"],
    aliases: "orbs recording camcorder",
  },
  incense: {
    names: ["Black sage", "White sage", "Incense burner"],
    differences: [
      "Repels without adding a tier-specific movement penalty.",
      "Also slows the ghost to half speed while the repelling effect lasts.",
      "Also halts the ghost while the repelling effect lasts; the burner is not a consumable purchase.",
    ],
    notes: [
      "Bring an igniter. The ghost must enter the burning incense’s range for its effects to apply.",
      "Ordinary hunt prevention lasts 90 seconds, 60 for a Demon or 180 for a Spirit. Cursed hunts can bypass it.",
      "Typical hunt blindness is 5 seconds; Moroi and Gallu states have exceptions. Burning duration, blindness and hunt prevention are separate timers.",
    ],
    pairs: ["igniter", "crucifix"],
    aliases: "smudge sticks sage cleanse",
  },
  crucifix: {
    names: ["Wooden cross", "Metal cross", "Ornate crucifix"],
    differences: [
      "One charge within a 3 m base radius.",
      "Two charges and a larger base radius.",
      "Two charges; an unused one can spend both to block a cursed hunt in range.",
    ],
    notes: [
      "It checks the ghost’s position when a hunt is attempted. Put coverage where a hunt could start.",
      "A crucifix cannot end a hunt already in progress. Demon coverage is larger than the listed base radius.",
    ],
    pairs: ["incense", "firelight"],
    aliases: "cross hunt prevention",
  },
  salt: {
    names: ["Table salt", "Rock salt", "Black salt"],
    differences: [
      "Two piles from each container.",
      "Three piles and broader placement coverage.",
      "Three piles with an additional two-second hunt slowdown.",
    ],
    notes: [
      "Watch a confirmed crossing, then inspect any resulting footprints with UV. A disturbed pile alone is not evidence.",
      "Tier III can change speed observations. Untouched salt alone is not a Wraith confirmation.",
    ],
    pairs: ["uv-light", "motion-sensor"],
    aliases: "piles footsteps",
  },
  parabolic: {
    names: ["Basic microphone", "Digital microphone", "Directional microphone"],
    differences: [
      "Listen within the shorter 20 m range.",
      "Extends listening range and adds a display.",
      "Adds source direction and distance to the 30 m range.",
    ],
    notes: [
      "Scan in separate directions and compare sounds with teammate activity before moving all your tools.",
      "Ordinary whispers are shared by many ghosts. A special vocalisation must be recognised correctly before treating it as a clue.",
    ],
    pairs: ["sound-recorder", "sound-sensor"],
    aliases: "parabolic microphone dish listening",
  },
  "motion-sensor": {
    names: ["Line sensor", "Dual-beam sensor", "Scanning sensor"],
    differences: [
      "A simple crossing beam; players and some other moving objects can trigger it.",
      "Adds a conical mode, directional crossing feedback and a local beep.",
      "A floor-mounted sphere that only the ghost can trigger.",
    ],
    notes: [
      "Tier I and II can be triggered by players; Tier III filters for the ghost. This matters when you interpret a crossing.",
      "Place coverage at room boundaries or a route you intend to test. A trigger gives movement information, not a ghost type.",
    ],
    pairs: ["salt", "spirit-box"],
    aliases: "movement detector",
  },
  flashlight: {
    names: ["Basic flashlight", "Strong flashlight", "Wide-beam flashlight"],
    differences: [
      "A narrow, low-intensity beam.",
      "A brighter narrow beam.",
      "The brightest listed output with a wider beam.",
    ],
    notes: [
      "Learn the escape route before relying on any light. Flickering can occur during both hunts and events.",
      "Switch off carried active electronics before hiding; a brighter flashlight provides no hunt protection.",
    ],
    pairs: ["head-gear", "uv-light"],
    aliases: "torch light",
  },
  "photo-camera": {
    names: ["Instant camera", "Digital camera", "Advanced camera"],
    differences: [
      "Non-electronic, with a three-second interval between photos.",
      "A preview display, interference resistance and a two-second interval.",
      "The shortest interval and highest listed interference resistance.",
    ],
    notes: [
      "Frame a valid subject, then check the Media journal for the credited result and any duplicate indicator.",
      "Taking a photo does not record ghost-type evidence in the Evidence Book. Make those decisions separately.",
    ],
    pairs: ["uv-light", "sound-recorder"],
    aliases: "photograph polaroid pictures",
  },
  "head-gear": {
    names: ["Head camera", "Head lamp", "Night-vision goggles"],
    differences: [
      "Sends a camera view to the truck for a teammate to monitor.",
      "Hands-free personal illumination.",
      "Personal night vision with visual distortion; not an orb detector.",
    ],
    notes: [
      "These tiers change function, not just quality. Tier I provides remote video, Tier II a light, and Tier III personal night vision.",
      "Night-vision goggles cannot see Ghost Orbs and filter red lights, which can obscure EMF and Spirit Box indicators.",
      "Head gear has its own activation control. Remember to disable it when hiding.",
    ],
    pairs: ["video-camera", "flashlight"],
    aliases: "headlamp goggles night vision head mounted",
  },
  "sanity-medication": {
    names: ["Sanity drink", "Sanity pills", "Sanity injection"],
    differences: [
      "Restoration arrives over 20 seconds.",
      "The same difficulty-defined amount restores over 10 seconds.",
      "Adds ten seconds of sprinting without exhaustion.",
    ],
    notes: [
      "Difficulty sets the amount restored; upgrading changes delivery speed or the extra sprint effect.",
      "Default restoration: Amateur 40%, Intermediate 35%, Professional 30%, Nightmare 25%, Insanity 20%. Custom settings can change it.",
      "Medication cannot be consumed above 95% sanity. It does not grant immunity to hunts.",
    ],
    pairs: ["crucifix", "incense"],
    aliases: "pills meds injection adrenaline",
  },
  firelight: {
    names: ["Single candle", "Candle holder", "Lantern"],
    differences: [
      "Five-minute duration and 33% passive darkness-drain reduction.",
      "Ten-minute duration and 50% reduction.",
      "No burn-duration limit, waterproof construction and 66% reduction.",
    ],
    notes: [
      "The reduction applies to passive darkness drain within 2 m, not event damage or other sanity losses.",
      "A ghost can extinguish the flame. One blowout alone does not identify an Onryo.",
      "The live wiki reports lighting-state issues with some candle and igniter combinations; check the linked reference before running a controlled flame test.",
    ],
    pairs: ["igniter", "crucifix"],
    aliases: "candle lantern flame",
  },
  igniter: {
    names: ["Matches", "Pocket lighter", "Storm lighter"],
    differences: [
      "Ten matches with ten seconds of flame each.",
      "Five minutes of fuel; a used lighter must be replaced.",
      "Ten minutes of fuel, waterproof, and not consumed from your purchased stock.",
    ],
    notes: [
      "Have the igniter in your inventory, hold incense or a firelight, and use the ignition control.",
      "A reusable Tier III lighter still has a finite fuel duration during a contract.",
    ],
    pairs: ["incense", "firelight"],
    aliases: "lighter matches ignition",
  },
  "sound-sensor": {
    names: ["Basic sensor", "Extended sensor", "Directional sensor"],
    differences: [
      "Select a 5 m or 10 m monitoring area.",
      "Adds a 15 m area.",
      "Adds different coverage shapes to the same range choices.",
    ],
    notes: [
      "Place the sensor, then monitor its coverage from the truck. Player sounds also need to be accounted for.",
      "This is remote monitoring equipment; it does not save an audio clip to the journal. Use a Sound Recorder for that.",
    ],
    pairs: ["parabolic", "sound-recorder"],
    aliases: "sound monitor remote audio",
  },
  "sound-recorder": {
    names: ["Analogue recorder", "Digital recorder", "Directional recorder"],
    differences: [
      "A 3 m recording range and meter lights.",
      "A 5 m range and a more readable display.",
      "Direction and distance help you reach the source.",
    ],
    notes: [
      "Turn it on, hold Use, and move close enough to a valid sound. A completed recording stops automatically.",
      "The journal holds up to three recordings per contract. Current devices indicate duplicates with dimmed lights or faded waveforms.",
      "Recording a Spirit Box reply is a media action. The actual ghost reply is what establishes Spirit Box evidence.",
    ],
    pairs: ["spirit-box", "parabolic"],
    aliases: "audio microphone recordings sounds",
  },
  tripod: {
    names: ["Basic stand", "Motorised stand", "Stable motorised stand"],
    differences: [
      "A fixed support with the lowest stability.",
      "Remote rotation from the truck computer.",
      "Retains remote rotation with the best listed stability.",
    ],
    notes: [
      "Mount the video camera before carrying the tripod to move both together. Switching equipment drops the bulky tripod.",
      "Tier II and III rotate from the truck. Keep the stand clear of escape routes because it can obstruct movement.",
    ],
    pairs: ["video-camera", "dots-projector"],
    aliases: "camera stand mount",
  },
};

export const EQUIPMENT_GUIDES = EQUIPMENT.map((item) => {
  const spec = specifications.find((s) => s.id === item.id)!;
  const notes = fieldNotes[item.id];
  return {
    ...item,
    ...spec,
    ...notes,
    tiers: spec.tiers.map((tier, i) => ({
      ...tier,
      name: notes.names[i],
      difference: notes.differences[i],
    })),
    steps:
      item.id === "motion-sensor"
        ? [
            "Place the sensor across a route you intend to observe.",
            "For Tier I and II, account for players and other triggers.",
            "Compare the crossing with the observation you are testing.",
          ]
        : item.steps,
  };
});
export type EquipmentGuide = (typeof EQUIPMENT_GUIDES)[number];
export function filterEquipment(
  query: string,
  category: string,
  tier: number,
  filter: string,
  sort: string,
) {
  const words = query.trim().toLowerCase().split(/\s+/);
  const index = Math.min(2, Math.max(0, tier - 1));
  const result = EQUIPMENT_GUIDES.filter((item) => {
    const text = [
      item.name,
      item.summary,
      item.aliases ?? "",
      item.category,
      ...item.tiers.map((t) => t.name),
      ...item.notes,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (category === "All" || item.category === category) &&
      words.every((w) => text.includes(w)) &&
      (filter !== "starter" || item.starter) &&
      (filter !== "non-electronic" || !item.tiers[index].electronic)
    );
  });
  return result.sort((a, b) =>
    sort === "price"
      ? a.price - b.price || a.name.localeCompare(b.name)
      : sort === "unlock"
        ? a.tiers[index].level - b.tiers[index].level ||
          a.name.localeCompare(b.name)
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : 0,
  );
}
export const EQUIPMENT_FAQ = [
  [
    "What is included in the starter kit?",
    "One of each of the eight starter tools is supplied: EMF Reader, Spirit Box, UV Light, Thermometer, D.O.T.S. Projector, Ghost Writing Book, Video Camera and Flashlight. Extra copies use the purchase price shown here.",
  ],
  [
    "Do I have to bring everything back to the truck?",
    "If you survive, unconsumed equipment is returned automatically. You do not have to collect every placed item before leaving. Used consumables need replacing; dying can also lose the equipment you contributed.",
  ],
  [
    "Is the purchase price the upgrade fee?",
    "No. The listed price buys another unit. Unlock levels describe progression; one-time upgrade fees are separate and are listed in the game shop and linked wiki.",
  ],
  [
    "Is the highest tier always the right choice?",
    "Tiers can change the job a tool performs. Head Gear changes from camera to light to goggles; UV Tier II is non-electronic; advanced incense and salt affect ghost speed. Choose for the test you want to run.",
  ],
  [
    "Does “Electronic” mean the ghost will always detect it?",
    "No. Detection depends on the device, its tier, whether it is active or carried, and the ghost. Read the field notes for exceptions and turn off relevant carried electronics before hiding.",
  ],
] as const;
