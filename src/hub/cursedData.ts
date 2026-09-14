export const CURSED_CHECKED = "14 September 2026";
export const CURSED_WIKI = "https://phasmophobia.fandom.com/wiki/";
export const CURSED_PATCH =
  "https://store.steampowered.com/news/externalpost/steam_community_announcements/1843481262691864";
export const CURSED_VIDEO = {
  id: "O17MdnntqoE",
  creator: "Insym",
  version: "v0.9",
  title: "All cursed possessions explained",
};
export type CursedPurpose = "Locate" | "Activity" | "Manifest" | "Recovery";
export type CursedGuide = {
  id: string;
  name: string;
  wiki: string;
  number: string;
  purpose: CursedPurpose[];
  label: string;
  summary: string;
  cost: string;
  uses: string;
  danger: string;
  mechanic: string;
  steps: string[];
  facts: [string, string][];
  warnings: string[];
  tip: string;
  revision: number;
  revisionDate: string;
  chapter: number;
  clip?: string;
  spawn: { image: string; map: string; label: string };
  extraImage?: string;
};

export const CURSED_GUIDES: CursedGuide[] = [
  {
    id: "haunted-mirror",
    name: "Haunted Mirror",
    wiki: "Haunted_Mirror",
    number: "01",
    purpose: ["Locate"],
    label: "Find the favourite room",
    summary:
      "Recognise the room in the reflection. Every look spends sanity—even a quick glance.",
    cost: "20% minimum / use",
    uses: "Until broken",
    danger: "Breaks at 0% sanity",
    mechanic:
      "The reflection is a live, rotating view of the favourite room. Match its furniture, windows and equipment to the building around you.",
    steps: [
      "Check your own sanity and prepare a retreat route.",
      "Hold the mirror and use it briefly. Identify a distinctive feature.",
      "Lower it before discussing the view, then investigate the room normally.",
    ],
    facts: [
      ["Drain", "7.5% / second; 20% minimum each activation"],
      [
        "Cost calculation",
        "The larger value applies; the costs are not added.",
      ],
      [
        "Breaking point",
        "Using it below 20%, or reaching 0% while viewing, breaks it.",
      ],
      [
        "After breaking",
        "A cursed hunt is triggered; the mirror cannot be reused.",
      ],
    ],
    warnings: [
      "Repeated short glances each pay the minimum cost.",
      "The reflection identifies a room, not a ghost type. A roaming ghost may be elsewhere.",
    ],
    tip: "Place an item in a suspected room. If it appears in the reflection, you have a much stronger visual match.",
    revision: 21290,
    revisionDate: "29 Jun 2025",
    chapter: 73,
    clip: "mirror-active",
    extraImage: "mirror-broken",
    spawn: {
      image: "spawn-mirror",
      map: "grafton",
      label: "Grafton Farmhouse",
    },
  },
  {
    id: "ouija-board",
    name: "Ouija Board",
    wiki: "Ouija_Board",
    number: "02",
    purpose: ["Locate", "Activity"],
    label: "Ask the right question",
    summary:
      "Trade sanity for an answer about the ghost, the bone or yourself. Always finish with goodbye.",
    cost: "5–50% / question",
    uses: "Until broken",
    danger: "Say goodbye before leaving",
    mechanic:
      "Activate the board until the planchette appears, then use a supported voice question or the in-game text interface. A location answer gives the ghost’s current room.",
    steps: [
      "Activate the board inside the investigation area. Keep an EMF reader nearby.",
      "Ask one affordable question. Wait for its answer before asking another.",
      "Say or select “Goodbye” and confirm the planchette disappears.",
    ],
    facts: [
      [
        "Recognition range",
        "Voice questions work within 5 m of the active board.",
      ],
      [
        "Breaking conditions",
        "An unaffordable question, or nobody within 5 m while it remains active.",
      ],
      ["EMF", "Answers generate EMF 2; eligible ghosts can generate EMF 5."],
      [
        "Hide and seek",
        "Starts a five-to-zero countdown to a cursed hunt; at 0% sanity the break is immediate.",
      ],
    ],
    warnings: [
      "Even “What is your favourite room?” returns the current room.",
      "A board response is not Spirit Box evidence. All ghost types can answer.",
    ],
    tip: "A cheap age question can produce an EMF reading. An age that increases later is a useful Thaye clue; one age reading alone is not.",
    revision: 23282,
    revisionDate: "29 Apr 2026",
    chapter: 1845,
    extraImage: "board-broken",
    spawn: {
      image: "spawn-board",
      map: "edgefield",
      label: "42 Edgefield Road",
    },
  },
  {
    id: "music-box",
    name: "Music Box",
    wiki: "Music_Box",
    number: "03",
    purpose: ["Locate", "Manifest"],
    label: "Follow the voice",
    summary:
      "The ghost sings along, then approaches if it is close. Place the box down before changing equipment.",
    cost: "≈2.6% / second nearby",
    uses: "One song",
    danger: "Throwing it triggers a hunt",
    mechanic:
      "Activate the box to hear the ghost sing when it is within 20 m. At close range, the ghost becomes visible and approaches the box.",
    steps: [
      "Prepare your route and keep teammates clear. Opening the lid alone does not start the song.",
      "Use Primary Use to play. Listen for the ghost’s voice.",
      "Use the placement control to set it down. Retreat before switching to a camera or incense.",
    ],
    facts: [
      ["Appearance range", "Normally within 5 m of the ghost."],
      [
        "Sanity drain",
        "The item article reports ≈2.6%/s within 3 m, around 77% for the full song.",
      ],
      [
        "Hunt triggers",
        "Throwing the playing box; the user reaching 0%; approach lasting over 5 seconds; the ghost’s head reaching the box.",
      ],
      ["Close contact", "Normally 1 m from the head; the Yokai uses 0.5 m."],
    ],
    warnings: [
      "Switching equipment while holding the playing box throws it. Place it first.",
      "A normal hunt can still start while the song plays. The box does not protect the team.",
    ],
    tip: "Have another player handle media. You can listen for the location without deliberately walking into the ghost.",
    revision: 22940,
    revisionDate: "14 Mar 2026",
    chapter: 836,
    clip: "music-active",
    spawn: {
      image: "spawn-box",
      map: "tanglewood",
      label: "6 Tanglewood Drive",
    },
  },
  {
    id: "summoning-circle",
    name: "Summoning Circle",
    wiki: "Summoning_Circle",
    number: "04",
    purpose: ["Manifest"],
    label: "Plan the appearance",
    summary:
      "Five candles bring the ghost to you. Its brief appearance ends with a hunt from the circle.",
    cost: "16% / candle",
    uses: "One summoning",
    danger: "Hunt follows the appearance",
    mechanic:
      "Light all five red candles with a lit igniter or firelight. The ghost normally appears at the circle for five seconds before a cursed hunt begins.",
    steps: [
      "Set up the camera, protection and escape route before lighting anything.",
      "Keep non-participants away from the candles. Each lighting drains nearby players.",
      "Light the last candle with sufficient sanity; record the appearance and move away promptly.",
    ],
    facts: [
      [
        "Total cost",
        "80% for five lightings; relighting a candle costs another 16%. Players within 3 m of a candle pay its cost.",
      ],
      ["Exit doors", "Lock when the final candle is lit."],
      [
        "Normal sequence",
        "5-second ghost event, then a cursed hunt without an extra grace second.",
      ],
      [
        "Below 16% on the final candle",
        "The photo window is skipped; the hunt starts after a 1-second grace period.",
      ],
    ],
    warnings: [
      "Activating during a hunt teleports the hunting ghost to the circle. It can kill immediately.",
      "Do not count a circle-triggered hunt as evidence of a natural sanity threshold.",
    ],
    tip: "A fully unused Tier III crucifix in range can block the cursed hunt. Prepare it at the circle, where the hunt will start.",
    revision: 24663,
    revisionDate: "14 Sep 2026",
    chapter: 1270,
    clip: "circle-active",
    spawn: { image: "spawn-circle", map: "willow", label: "13 Willow Street" },
  },
  {
    id: "voodoo-doll",
    name: "Voodoo Doll",
    wiki: "Voodoo_Doll",
    number: "05",
    purpose: ["Locate", "Activity"],
    label: "Provoke an interaction",
    summary:
      "One random pin, one forced interaction. You do not get to choose whether the heart is next.",
    cost: "5% / pin · heart 10%",
    uses: "10 pins",
    danger: "Heart pin triggers a hunt",
    mechanic:
      "Each use pushes a random remaining pin. Ordinary pins force an interaction; the heart pin starts a cursed hunt.",
    steps: [
      "Prepare an escape and tell the team before touching a pin.",
      "Use one pin while teammates watch doors and listen for activity.",
      "Check the actual interaction with EMF or UV equipment.",
    ],
    facts: [
      ["Ordinary pin", "Costs 5% sanity."],
      ["Heart pin", "Costs 10% sanity and initiates a cursed hunt."],
      [
        "At 0% sanity",
        "All remaining pins are pushed in, causing a cursed hunt.",
      ],
      [
        "Evidence opportunities",
        "Interactions can provide EMF 5 or UV when the ghost and difficulty allow it.",
      ],
    ],
    warnings: [
      "It cannot force Ghost Writing, D.O.T.S. or fire extinguishing in the current reference.",
      "Multiple throws caused by the doll at 0% are not a natural Poltergeist explosion.",
    ],
    tip: "As safe pins disappear, the heart is a larger share of the remaining pins. A string of ordinary pins does not make the next press safer.",
    revision: 23852,
    revisionDate: "19 Jun 2026",
    chapter: 419,
    spawn: { image: "spawn-doll", map: "prison", label: "Prison" },
  },
  {
    id: "tarot-cards",
    name: "Tarot Cards",
    wiki: "Tarot_Cards",
    number: "06",
    purpose: ["Activity", "Manifest", "Recovery"],
    label: "Know every outcome",
    summary:
      "Ten draws, ten possible card types. Revival, sanity, a hunt—or instant death—can be one card away.",
    cost: "Depends on the draw",
    uses: "10 random cards",
    danger: "1% instant-death card",
    mechanic:
      "Draw inside the investigation area and wait for the final card reveal. A Fool initially looks like another card, then cancels that apparent effect.",
    steps: [
      "Photograph the deck before using it up.",
      "Have the team ready for a hunt before the first draw.",
      "Wait until the card resolves. Stop drawing during hunts: every draw becomes a Fool.",
    ],
    facts: [
      [
        "Deck composition",
        "Ten independent draws, not one copy of every card. Repeats are possible.",
      ],
      ["The Fool", "17% normally; 100% while a hunt is active."],
      [
        "Death versus Hanged Man",
        "Death starts a cursed hunt. The Hanged Man kills the drawer outright.",
      ],
      [
        "High Priestess",
        "Revives a dead player, or reserves one revival if everyone is alive. Reservations do not stack.",
      ],
    ],
    warnings: [
      "The Hermit limits roaming; it does not prevent hunts or ghost events.",
      "The wiki reports +20 seconds to future hunts after exhausting a deck even without Death; it labels this a likely bug.",
    ],
    tip: "A ten-card deck has about a 9.6% chance of at least one Hanged Man under normal draw rules. A 1% per-card chance is not a 1% per-deck chance.",
    revision: 24650,
    revisionDate: "13 Sep 2026",
    chapter: 3339,
    clip: "tarot-active",
    spawn: {
      image: "spawn-cards",
      map: "maple",
      label: "Maple Lodge Campsite",
    },
  },
  {
    id: "monkey-paw",
    name: "Monkey Paw",
    wiki: "Monkey_Paw",
    number: "07",
    purpose: ["Locate", "Activity", "Manifest", "Recovery"],
    label: "Read the fine print",
    summary:
      "Choose a wish deliberately. The most helpful effects can leave permanent consequences for the contract.",
    cost: "One finger / wish",
    uses: "3–5 wishes",
    danger: "Some penalties last all contract",
    mechanic:
      "Hold the paw inside the investigation area and use a supported spoken wish or the in-game text interface. A bent finger records a granted wish.",
    steps: [
      "Read the exact benefit and consequence in the wish reference below.",
      "Choose the text interface if speech recognition confuses “safe” with “sane”.",
      "Warn the team and make the wish. Each wish can be used only once per contract across the whole team.",
    ],
    facts: [
      ["Reward multiplier 0–1×", "5 wishes"],
      ["Reward multiplier >1–2×", "4 wishes"],
      ["Reward multiplier >2×", "3 wishes"],
      [
        "Wish tags",
        "Tags are optional discoveries. You do not need to find them to make a wish.",
      ],
    ],
    warnings: [
      "In voice mode, ordinary conversation while holding the paw can accidentally become a wish.",
      "Knowledge and safety have lasting sensory or detection consequences. Read the drawback before selecting either.",
    ],
    tip: "Count the available fingers. A higher reward multiplier gives fewer wishes; the budget is shared, not per player.",
    revision: 24659,
    revisionDate: "13 Sep 2026",
    chapter: 4002,
    spawn: { image: "spawn-paw", map: "sunny", label: "Sunny Meadows" },
  },
];

export const TAROT_CARDS = [
  {
    id: "tower",
    name: "The Tower",
    chance: 20,
    burn: "Blue",
    category: "Activity",
    effect: "Double ghost activity for 20 seconds.",
  },
  {
    id: "wheel",
    name: "The Wheel of Fortune",
    chance: 20,
    burn: "Green / red",
    category: "Sanity",
    effect: "Gain 25% sanity (green) or lose 25% (red), with equal odds.",
  },
  {
    id: "fool",
    name: "The Fool",
    chance: 17,
    burn: "Light purple",
    category: "No effect",
    effect:
      "Disguises itself as another card, then resolves with no effect. All draws during hunts become this card.",
  },
  {
    id: "devil",
    name: "The Devil",
    chance: 10,
    burn: "Pink",
    category: "Activity",
    effect: "Triggers a ghost event towards the player nearest the ghost.",
  },
  {
    id: "death",
    name: "Death",
    chance: 10,
    burn: "Purple",
    category: "Danger",
    effect: "Initiates a cursed hunt.",
  },
  {
    id: "hermit",
    name: "The Hermit",
    chance: 10,
    burn: "Cyan",
    category: "Activity",
    effect:
      "Sends the ghost towards its favourite room and disables roaming for 90 seconds. Hunts and events remain possible.",
  },
  {
    id: "sun",
    name: "The Sun",
    chance: 5,
    burn: "Yellow",
    category: "Sanity",
    effect: "Sets the drawer’s sanity to 100%.",
  },
  {
    id: "moon",
    name: "The Moon",
    chance: 5,
    burn: "White",
    category: "Sanity",
    effect: "Sets the drawer’s sanity to 0%.",
  },
  {
    id: "priestess",
    name: "The High Priestess",
    chance: 2,
    burn: "Light yellow",
    category: "Recovery",
    effect:
      "Revives the first dead player in lobby order; if nobody is dead, reserves the next revival. Does not stack.",
  },
  {
    id: "hanged",
    name: "The Hanged Man",
    chance: 1,
    burn: "No burn",
    category: "Danger",
    effect:
      "Instantly kills the drawer. The real card is unavailable with Friendly Ghost enabled.",
  },
] as const;

export const OUIJA_QUESTIONS = [
  {
    category: "Location",
    phrase: "Where are you?",
    cost: 50,
    answer: "The ghost’s current room, even if you ask for its favourite room.",
    text: true,
  },
  {
    category: "Bone",
    phrase: "Where is the bone?",
    cost: 20,
    answer:
      "The room containing the bone. The wiki flags occasional non-responses.",
    text: true,
  },
  {
    category: "Proximity",
    phrase: "Are you here?",
    cost: 20,
    answer: "Yes or no: is the ghost in your room?",
    text: false,
  },
  {
    category: "Room count",
    phrase: "How many people are here?",
    cost: 20,
    answer:
      "A count with an uncertain calculation; do not use it to diagnose The Twins.",
    text: false,
  },
  {
    category: "Spirit Box conditions",
    phrase: "Do you respond to everyone?",
    cost: 20,
    answer: "Whether the Spirit Box requires an alone player.",
    text: true,
  },
  {
    category: "Age",
    phrase: "How old are you?",
    cost: 5,
    answer: "An assigned age. A Thaye’s answer can increase as it ages.",
    text: true,
  },
  {
    category: "Time dead",
    phrase: "How long have you been dead?",
    cost: 5,
    answer: "An assigned length of time; not evidence of ghost type.",
    text: false,
  },
  {
    category: "Sanity",
    phrase: "What is my sanity?",
    cost: 5,
    answer:
      "A band for your sanity after the question’s cost, not the team average.",
    text: true,
  },
  {
    category: "Sanity",
    phrase: "Am I insane?",
    cost: 5,
    answer: "No above 90%; maybe from 20–90%; yes below 20%.",
    text: true,
  },
  {
    category: "Sanity",
    phrase: "How crazy am I?",
    cost: 5,
    answer: "Not very above 50%; very from 25–50%; insane below 25%.",
    text: false,
  },
  {
    category: "Cause of death",
    phrase: "How did you die?",
    cost: 5,
    answer: "A flavour answer such as accident or drowning.",
    text: true,
  },
  {
    category: "Feeling",
    phrase: "How do you feel?",
    cost: 5,
    answer: "A flavour answer, not a reliable aggression measurement.",
    text: false,
  },
  {
    category: "Purpose",
    phrase: "Why are you here?",
    cost: 5,
    answer: "A flavour answer, not a ghost-type clue.",
    text: false,
  },
  {
    category: "Joke",
    phrase: "Knock knock",
    cost: 5,
    answer: "“Who’s there” (Marco / Polo also works).",
    text: false,
  },
  {
    category: "Deliberate hunt",
    phrase: "Hide and seek",
    cost: 0,
    answer:
      "Destroys the board and initiates a cursed hunt after the countdown.",
    text: true,
  },
] as const;

export const PAW_WISHES = [
  {
    id: "see",
    category: "Ghost",
    phrase: "I wish to see the ghost",
    benefit: "Reveals the ghost at its current position for 5 seconds.",
    price:
      "Exits lock. A cursed hunt follows; your vision is obscured until that hunt ends.",
    tag: "Manager Office",
    risk: "Cursed hunt",
  },
  {
    id: "activity",
    category: "Ghost",
    phrase: "I wish for activity",
    benefit: "Doubles activity for 2 minutes.",
    price: "Permanently breaks the fuse box and locks exits for 2 minutes.",
    tag: "Chapel",
    risk: "Lasting penalty",
  },
  {
    id: "trap",
    category: "Ghost",
    phrase: "I wish to trap the ghost",
    benefit:
      "Returns it to its favourite room; suppresses roaming, abilities and hunting for about a minute.",
    price:
      "Locks that room and your room, then starts a hunt. The wiki flags abnormal protection behaviour; have an escape ready.",
    tag: "Female Dorm Room",
    risk: "Hunt follows",
  },
  {
    id: "sanity",
    category: "Player",
    phrase: "I wish to be sane",
    benefit: "Sets everyone’s sanity to 50%.",
    price:
      "Passive drain increases by 50% for the contract and a new favourite room is chosen.",
    tag: "Kitchen",
    risk: "Lasting penalty",
  },
  {
    id: "safe",
    category: "Player",
    phrase: "I wish to be safe",
    benefit: "Opens the nearest blocked hiding spot.",
    price:
      "Breaks local lights. The ghost can hear you and detect your active electronics at any range for the rest of the contract.",
    tag: "Matron Office 1",
    risk: "Lasting penalty",
  },
  {
    id: "leave",
    category: "Player",
    phrase: "I wish to leave",
    benefit: "Unlocks exit doors, including during a hunt.",
    price:
      "Your movement and vision are impaired, recovering over 5 seconds. The hunt itself does not end.",
    tag: "Hospital Wing",
    risk: "Temporary impairment",
  },
  {
    id: "life",
    category: "Other",
    phrase: "I wish for life",
    benefit: "Revives the first dead teammate in lobby order.",
    price:
      "50% chance that you die. Requires a dead teammate; the wiki reports failures when used during hunts.",
    tag: "Classroom",
    risk: "50% death risk",
  },
  {
    id: "knowledge",
    category: "Other",
    phrase: "I wish for knowledge",
    benefit:
      "Crosses out one incorrect evidence type and its ghosts in your in-game journal.",
    price:
      "The ghost teleports nearby and cursed-hunts. Hearing and vision are impaired until death or contract end.",
    tag: "Restricted Area",
    risk: "Cursed hunt",
  },
  {
    id: "weather",
    category: "Other",
    phrase: "I wish for [weather]",
    benefit:
      "Choose clear sky, fog, rain, snow or sunrise. Rain can be light or heavy.",
    price:
      "Costs 25% of your sanity, with a brief blinding effect for everyone. Requires at least 25%.",
    tag: "Morgue",
    risk: "25% sanity",
  },
  {
    id: "anything",
    category: "Other",
    phrase: "I wish for anything",
    benefit: "Grants a random unused wish.",
    price:
      "You also receive that wish’s consequence. It is not a free extra wish.",
    tag: "Waiting Room",
    risk: "Unpredictable",
  },
] as const;

export const CURSED_FAQ = [
  [
    "Is there always a cursed possession?",
    "Amateur, Intermediate, Professional and Nightmare normally select one of the seven items at random. Insanity has none by default. Custom and challenge rules can change the quantity and selection.",
  ],
  [
    "Can I just photograph it and leave it alone?",
    "Yes. Use is optional. Photograph the tarot deck before its last card disappears; other possessions can generally be photographed even after use. Camera tier and the media system determine rewards.",
  ],
  [
    "Does using one identify the ghost?",
    "Usually it supplies a location, interaction or controlled event. Interpret the actual evidence and behaviour. A forced hunt is not a natural hunt-threshold observation.",
  ],
  [
    "Will incense or a crucifix save us?",
    "Incense can repel a hunting ghost, but its normal hunt-prevention timer does not stop a cursed hunt. Tier I and II crucifixes cannot block cursed hunts. An unused Tier III crucifix can block one in range, spending both charges.",
  ],
  [
    "Are later hunts all cursed too?",
    "No. The extra 20 seconds persists, but later naturally started hunts retain their ordinary initiation rules and grace period. Separate the duration extension from the cursed trigger.",
  ],
  [
    "Why do the clips look different from my game?",
    "These are dated community captures and an archival v0.9 guide. They illustrate recognition and sequences. Read the current written notes for changed costs, wishes, layouts and evidence behaviour.",
  ],
] as const;

export function mirrorCost(seconds: number): number {
  return Math.max(
    20,
    Math.max(0, Number.isFinite(seconds) ? seconds : 0) * 7.5,
  );
}
export function atLeastOne(chance: number, draws: number): number {
  return (
    (1 -
      Math.pow(
        1 - Math.min(100, Math.max(0, chance)) / 100,
        Math.max(0, Math.floor(draws)),
      )) *
    100
  );
}
export function matchesCursed(
  item: CursedGuide,
  query: string,
  purpose: string,
): boolean {
  const haystack = [
    item.name,
    item.summary,
    item.label,
    item.cost,
    item.danger,
    item.mechanic,
    ...item.purpose,
    ...item.warnings,
    ...item.facts.flat(),
  ]
    .join(" ")
    .toLowerCase();
  return (
    (purpose === "All" || item.purpose.includes(purpose as CursedPurpose)) &&
    query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .every((word) => haystack.includes(word))
  );
}
