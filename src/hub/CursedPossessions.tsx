import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Grid2X2,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  Skull,
  Table2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useChapterState } from "./chapterState";
import { Link } from "./context";
import { MAPS } from "./content";
import {
  CURSED_CHECKED,
  CURSED_PATCH,
  CURSED_FAQ,
  CURSED_GUIDES,
  CURSED_WIKI,
  OUIJA_QUESTIONS,
  PAW_WISHES,
  TAROT_CARDS,
  atLeastOne,
  matchesCursed,
  mirrorCost,
  type CursedGuide,
} from "./cursedData";
import {
  CursedImage,
  GameplayClip,
  MediaCredit,
  PhotoButton,
  PhotoViewer,
  VideoGuide,
  cursedMedia,
} from "./CursedMedia";
import "./cursed.css";

const purposeLabels = {
  All: "All objects",
  Locate: "Find the ghost",
  Activity: "Get activity",
  Manifest: "See the ghost",
  Recovery: "Recover / revive",
};
function Jump({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        const section = document.getElementById(to);
        section?.scrollIntoView({ behavior: "instant", block: "start" });
        section?.focus({ preventScroll: true });
      }}
    >
      {children}
      <ChevronDown size={13} />
    </button>
  );
}
function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="cp-section-heading">
      <span className="cp-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
function SearchField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (q: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="input-icon cp-search">
      <Search size={18} />
      <input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          aria-label={"Clear " + label.toLowerCase()}
          className="icon-button"
          onClick={() => onChange("")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="cp-empty" role="status">
      <Search size={30} />
      <h3>No matching entries</h3>
      <p>Try a shorter search or clear the filters.</p>
      <button className="button" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}

function HuntRules({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={"cp-hunt-rules " + (compact ? "cp-hunt-compact" : "")}
      aria-label="Cursed hunt rules"
    >
      <div className="cp-hunt-title">
        <TriangleAlert size={21} />
        <div>
          <strong>Before you use anything</strong>
          <p>Tell the team. Check sanity. Have a way out.</p>
        </div>
      </div>
      <div>
        <strong>1 second</strong>
        <span>usual cursed grace period</span>
      </div>
      <div>
        <strong>+20 seconds</strong>
        <span>cursed hunt & later hunts</span>
      </div>
      <div>
        <strong>Tier III only</strong>
        <span>unused crucifix · both charges</span>
      </div>
      {!compact && (
        <p className="cp-hunt-footnote">
          Cursed hunts ignore sanity thresholds and normal hunt-prevention
          timers. The circle has special timing; read its dossier. Incense can
          still repel the hunting ghost.{" "}
          <a
            href={CURSED_WIKI + "Hunt#Cursed_hunts"}
            target="_blank"
            rel="noreferrer"
          >
            Hunt reference ↗
          </a>
        </p>
      )}
    </section>
  );
}

function ItemCard({ item }: { item: CursedGuide }) {
  return (
    <article className="cp-item-card" data-cursed-item={item.id}>
      <Link
        to={"cursed/" + item.id}
        className={"cp-item-photo cp-photo-" + item.id}
        aria-label={"Open " + item.name + " dossier"}
      >
        <CursedImage
          id={item.id}
          alt={item.name + " in Phasmophobia"}
          eager={Number(item.number) <= 3}
        />
        <span className="cp-object-number">OBJECT {item.number}</span>
        <span className="cp-photo-label">
          <Camera size={13} />
          IN-GAME IMAGE
        </span>
        <span className="cp-open-arrow">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="cp-item-body">
        <span className="cp-kicker">{item.label}</span>
        <h2>
          <Link to={"cursed/" + item.id}>{item.name}</Link>
        </h2>
        <p>{item.summary}</p>
        <dl className="cp-card-facts">
          <div>
            <dt>Cost</dt>
            <dd>{item.cost}</dd>
          </div>
          <div>
            <dt>Uses</dt>
            <dd>{item.uses}</dd>
          </div>
        </dl>
        <div className="cp-danger-line">
          <TriangleAlert size={15} />
          {item.danger}
        </div>
        <Link to={"cursed/" + item.id} className="cp-dossier-link">
          Open field dossier
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function Comparison({ items }: { items: CursedGuide[] }) {
  return (
    <div
      className="cp-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Cursed possession comparison"
    >
      <table className="cp-table">
        <caption>
          At a glance · open an object for its full conditions and exceptions
        </caption>
        <thead>
          <tr>
            <th scope="col">Possession</th>
            <th scope="col">Best use</th>
            <th scope="col">Cost / capacity</th>
            <th scope="col">Main danger</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row">
                <Link className="cp-table-object" to={"cursed/" + item.id}>
                  <CursedImage id={item.id} alt="" />
                  <span>
                    {item.name}
                    <ArrowUpRight size={13} />
                  </span>
                </Link>
              </th>
              <td>{item.label}</td>
              <td>
                <strong>{item.cost}</strong>
                <small>{item.uses}</small>
              </td>
              <td>
                <span className="cp-danger-line">
                  <TriangleAlert size={14} />
                  {item.danger}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapFinder() {
  const [map, setMap] = useState("tanglewood");
  return (
    <section className="cp-map-finder">
      <div>
        <span className="cp-kicker">
          <MapPin size={15} />
          FIND THE SPAWN
        </span>
        <h2>Know where to look.</h2>
        <p>
          Each object has a fixed spot on a map. Open the atlas’s reference
          sheet and its cursed-item legend.
        </p>
      </div>
      <div className="cp-map-controls">
        <label htmlFor="cp-map">Contract location</label>
        <select
          id="cp-map"
          value={map}
          onChange={(e) => setMap(e.target.value)}
        >
          {MAPS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <Link
          className="button primary"
          to={"maps?map=" + encodeURIComponent(map)}
        >
          Open map atlas
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <small>
        Check the date on the map sheet. Restricted contracts may show a
        full-site reference; the atlas flags these explicitly.
      </small>
    </section>
  );
}

function Sources({ item }: { item?: CursedGuide }) {
  const guides = item ? [item] : CURSED_GUIDES;
  return (
    <details className="cp-sources">
      <summary>
        <ShieldCheck size={18} />
        Sources, dates & media credits<span>Checked {CURSED_CHECKED}</span>
      </summary>
      <p>
        Written mechanics were checked against live community wiki revisions.
        These are reference findings, not a claim of testing the game build.
        Historical imagery is for recognition; source upload dates are not
        capture-build verification.
      </p>
      <div className="cp-source-links">
        {guides.map((g) => (
          <a
            key={g.id}
            href={`${CURSED_WIKI}${g.wiki}?oldid=${g.revision}`}
            target="_blank"
            rel="noreferrer"
          >
            {g.name}
            <span>
              Revision {g.revision} · {g.revisionDate}
            </span>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <p>
        <a
          href={CURSED_WIKI + "Cursed_Possession"}
          target="_blank"
          rel="noreferrer"
        >
          Shared possession rules
        </a>{" "}
        ·{" "}
        <a href={CURSED_WIKI + "Hunt"} target="_blank" rel="noreferrer">
          Hunts
        </a>{" "}
        ·{" "}
        <a href={CURSED_WIKI + "Crucifix"} target="_blank" rel="noreferrer">
          Crucifixes
        </a>{" "}
        · <Link to="bugs">Known bugs</Link>
      </p>
      <p>
        <a href={CURSED_PATCH} target="_blank" rel="noreferrer">
          Official v0.19.0.1 patch · 10 September 2026
        </a>
        : fixes address incorrect evidence elimination by the knowledge wish,
        Ouija interactions after opening the journal during an answer, and the
        Monkey Paw spawn in Prison Restricted.
      </p>
      <p>
        Game visuals © Kinetic Games. Wiki uploaders are credited with each
        enlarged photograph and clip. Media is included for identification and
        commentary in this unofficial wiki; no open licence or ownership of game
        artwork is claimed. The embedded video remains on Insym’s YouTube
        channel.
      </p>
    </details>
  );
}

function CursedIndex() {
  const [query, setQuery] = useChapterState("CursedPossessions-q", "");
  const [purpose, setPurpose] = useChapterState(
    "CursedPossessions-purpose",
    "All",
  );
  const [savedView, setView] = useChapterState(
    "CursedPossessions-view",
    "gallery",
  );
  const view = ["gallery", "comparison", "media"].includes(savedView)
    ? savedView
    : "gallery";
  const activePurpose = Object.keys(purposeLabels).includes(purpose)
    ? purpose
    : "All";
  const items = CURSED_GUIDES.filter((item) =>
    matchesCursed(item, query, activePurpose),
  );
  const reset = () => {
    setQuery("");
    setPurpose("All");
  };
  return (
    <div className="cp-page">
      <header className="cp-index-header">
        <div>
          <span className="cp-kicker">
            FIELD KNOWLEDGE / THE OCCULT COLLECTION
          </span>
          <h1>
            Cursed possessions<span>.</span>
          </h1>
          <p>
            Recognise the object. Understand the bargain.
            <br />
            Know exactly what happens next.
          </p>
          <div className="cp-header-meta">
            <span>
              <BookOpen size={14} />7 complete dossiers
            </span>
            <span>
              <Camera size={14} />
              In-game photos & clips
            </span>
            <span>
              <ShieldCheck size={14} />
              {CURSED_CHECKED}
            </span>
          </div>
        </div>
        <div className="cp-header-art" aria-hidden="true">
          <CursedImage id="tower" alt="" eager />
          <CursedImage id="death" alt="" eager />
          <CursedImage id="priestess" alt="" eager />
          <span>THE PRICE OF AN ANSWER</span>
        </div>
      </header>
      <HuntRules compact />
      <section
        id="cp-collection"
        className="cp-collection"
        aria-label="Cursed possession library"
      >
        <div className="cp-library-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search cursed possessions"
            placeholder="Find an object, cost or purpose…"
          />
          <div className="cp-view-switch" aria-label="Library view">
            {[
              ["gallery", "Gallery", Grid2X2],
              ["comparison", "Quick reference", Table2],
              ["media", "Watch & learn", Play],
            ].map(([key, label, Icon]) => {
              const ViewIcon = Icon as typeof Grid2X2;
              return (
                <button
                  key={String(key)}
                  aria-pressed={view === key}
                  onClick={() => setView(String(key))}
                >
                  <ViewIcon size={16} />
                  {String(label)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="cp-filter-row">
          <div className="chip-row">
            {Object.entries(purposeLabels).map(([key, label]) => (
              <button
                key={key}
                className={"chip " + (activePurpose === key ? "selected" : "")}
                aria-pressed={activePurpose === key}
                onClick={() => setPurpose(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <span role="status" aria-live="polite">
            {items.length} of 7 objects
          </span>
        </div>
        {!items.length ? (
          <NoResults onReset={reset} />
        ) : view === "comparison" ? (
          <Comparison items={items} />
        ) : view === "media" ? (
          <>
            <div className="cp-media-intro">
              <h2>See the sequence before you try it.</h2>
              <p>
                Clips are silent, dated gameplay captures. Motion starts only
                when you press play. Written mechanics take priority over old
                footage.
              </p>
            </div>
            <div className="cp-clips-grid">
              {items
                .filter((x) => x.clip)
                .map((item) => (
                  <GameplayClip key={item.id} item={item} />
                ))}
            </div>
            <h3 className="cp-video-list-heading">
              Long-form video chapters · Insym · archive v0.9
            </h3>
            <div className="cp-video-links">
              {items.map((item) => (
                <Link key={item.id} to={"cursed/" + item.id + "?section=media"}>
                  <Play size={17} />
                  <span>
                    {item.name}
                    <small>Video, photos & written context</small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="cp-items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
      <div className="cp-shortcuts">
        <Link to="cursed/tarot-cards">
          <span>10 card outcomes</span>Tarot card index
          <ArrowUpRight size={16} />
        </Link>
        <Link to="cursed/monkey-paw">
          <span>Every wish & consequence</span>Monkey Paw wishes
          <ArrowUpRight size={16} />
        </Link>
        <Link to="cursed/ouija-board">
          <span>Questions & sanity costs</span>Ouija phrasebook
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <MapFinder />
      <section className="cp-faq">
        <SectionHeading
          number="FIELD NOTES"
          title="The questions that keep a team alive."
        />
        {CURSED_FAQ.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <ChevronDown size={17} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <Sources />
    </div>
  );
}

function MirrorPlanner() {
  const [sanity, setSanity] = useState(80),
    [seconds, setSeconds] = useState(2);
  const cost = mirrorCost(seconds),
    left = Math.max(0, sanity - cost),
    breaks = sanity < 20 || left === 0;
  return (
    <section className="cp-planner" aria-labelledby="cp-mirror-title">
      <div>
        <span className="cp-kicker">PLAN ONE LOOK</span>
        <h3 id="cp-mirror-title">How much sanity will it cost?</h3>
        <p>
          Estimates mirror drain only. Darkness and other effects can reduce
          sanity further.
        </p>
      </div>
      <div className="cp-range-inputs">
        <label htmlFor="cp-sanity">
          Starting sanity <strong>{sanity}%</strong>
          <input
            id="cp-sanity"
            type="range"
            min="0"
            max="100"
            step="1"
            value={sanity}
            onChange={(e) => setSanity(Number(e.target.value))}
          />
        </label>
        <label htmlFor="cp-seconds">
          Active viewing time <strong>{seconds}s</strong>
          <input
            id="cp-seconds"
            type="range"
            min="0.5"
            max="12"
            step="0.5"
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
          />
        </label>
      </div>
      <output
        className={breaks ? "cp-estimate danger" : "cp-estimate"}
        aria-live="polite"
      >
        <strong>
          {breaks ? "Mirror breaks" : left.toFixed(1) + "% remaining"}
        </strong>
        <span>
          {cost.toFixed(1)}% mirror cost ·{" "}
          {breaks ? "cursed-hunt trigger" : "leave a safety margin"}
        </span>
      </output>
    </section>
  );
}

function TarotReference() {
  const [filter, setFilter] = useState("All"),
    [draws, setDraws] = useState(10);
  const cards = TAROT_CARDS.filter(
    (c) => filter === "All" || c.category === filter,
  );
  return (
    <section id="cp-special" tabIndex={-1} className="cp-special">
      <SectionHeading
        number="03"
        title="The complete tarot index"
        description="Normal draw probabilities. During hunts, every card resolves as The Fool."
      />
      <div className="chip-row cp-special-filters">
        {["All", "Danger", "Sanity", "Activity", "Recovery", "No effect"].map(
          (x) => (
            <button
              key={x}
              className={"chip " + (filter === x ? "selected" : "")}
              aria-pressed={filter === x}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="cp-tarot-grid">
        {cards.map((card) => (
          <article
            className={
              "cp-tarot-card " +
              (card.category === "Danger" ? "cp-tarot-danger" : "")
            }
            key={card.id}
            data-tarot-card={card.id}
          >
            <div className="cp-tarot-art">
              <CursedImage id={card.id} alt={card.name + " card face"} />
              <span>
                {card.chance}%<small>per draw</small>
              </span>
            </div>
            <div>
              <span className="cp-kicker">{card.category}</span>
              <h3>{card.name}</h3>
              <p>{card.effect}</p>
              <small>Burn: {card.burn}</small>
              <MediaCredit id={card.id} />
            </div>
          </article>
        ))}
      </div>
      <div className="cp-odds">
        <div>
          <h3>One draw is not the whole deck.</h3>
          <label htmlFor="cp-draws">
            Planned draws{" "}
            <select
              id="cp-draws"
              aria-label="Planned draws"
              value={draws}
              onChange={(e) => setDraws(Number(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <p>
            Independent draws outside hunts, with Friendly Ghost off. These are
            theoretical chances, not a prediction of your deck.
          </p>
        </div>
        <output aria-live="polite">
          <span>
            <strong>{atLeastOne(1, draws).toFixed(1)}%</strong>at least one
            Hanged Man
          </span>
          <span>
            <strong>{atLeastOne(10, draws).toFixed(1)}%</strong>at least one
            Death
          </span>
          <span>
            <strong>{atLeastOne(2, draws).toFixed(1)}%</strong>at least one High
            Priestess
          </span>
        </output>
      </div>
    </section>
  );
}

function OuijaReference() {
  const [q, setQ] = useState(""),
    [cost, setCost] = useState("All");
  const rows = OUIJA_QUESTIONS.filter(
    (r) =>
      (cost === "All" || r.cost === Number(cost)) &&
      (r.phrase + " " + r.category + " " + r.answer)
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <section id="cp-special" tabIndex={-1} className="cp-special">
      <SectionHeading
        number="03"
        title="Ouija question phrasebook"
        description="One practical phrase per question type, plus sanity variants. Use the in-game text option where available."
      />
      <div className="cp-reference-toolbar">
        <SearchField
          value={q}
          onChange={setQ}
          label="Search Ouija questions"
          placeholder="Search bone, age, sanity…"
        />
        <label>
          Sanity cost
          <select
            aria-label="Sanity cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          >
            <option>All</option>
            {[5, 20, 50, 0].map((n) => (
              <option value={n} key={n}>
                {n}%{n === 0 ? " · deliberate hunt" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!rows.length ? (
        <NoResults
          onReset={() => {
            setQ("");
            setCost("All");
          }}
        />
      ) : (
        <div
          className="cp-table-scroll"
          role="region"
          tabIndex={0}
          aria-label="Ouija Board questions"
        >
          <table className="cp-table cp-questions">
            <caption>
              {rows.length} phrases · costs apply to the player asking
            </caption>
            <thead>
              <tr>
                <th scope="col">Say this</th>
                <th scope="col">Cost</th>
                <th scope="col">What the answer means</th>
                <th scope="col">Text UI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.phrase}>
                  <th scope="row">
                    <small>{row.category}</small>“{row.phrase}”
                  </th>
                  <td className={row.cost === 0 ? "cp-danger-text" : ""}>
                    {row.cost === 0 ? (
                      <>
                        <Skull size={17} />
                        Hunt
                      </>
                    ) : (
                      row.cost + "%"
                    )}
                  </td>
                  <td>{row.answer}</td>
                  <td>{row.text ? "Available" : "Voice only"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="cp-sanity-bands">
        <h3>“What is my sanity?” — after paying 5%</h3>
        <div>
          {[
            ["Healthy", "Above 80%"],
            ["Good", "60–80%"],
            ["Average", "40–60%"],
            ["Bad", "20–40%"],
            ["Awful", "Below 20%"],
          ].map(([label, value]) => (
            <span key={label}>
              <strong>{label}</strong>
              {value}
            </span>
          ))}
        </div>
        <p>
          These are approximate response bands; boundary labels are not precise
          enough to guarantee an affordable next question.
        </p>
      </div>
    </section>
  );
}

function PawReference() {
  const [q, setQ] = useState(""),
    [category, setCategory] = useState("All");
  const wishes = PAW_WISHES.filter(
    (w) =>
      (category === "All" || w.category === category) &&
      (w.phrase + " " + w.benefit + " " + w.price + " " + w.risk)
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <section id="cp-special" tabIndex={-1} className="cp-special">
      <SectionHeading
        number="03"
        title="Every wish. Every consequence."
        description="Ten wish groups, including the five weather choices. A wish is shared across the contract and cannot be repeated by another player."
      />
      <div className="cp-reference-toolbar">
        <SearchField
          value={q}
          onChange={setQ}
          label="Search Monkey Paw wishes"
          placeholder="Search revive, sanity, weather…"
        />
        <div className="chip-row">
          {["All", "Ghost", "Player", "Other"].map((x) => (
            <button
              key={x}
              className={"chip " + (category === x ? "selected" : "")}
              aria-pressed={category === x}
              onClick={() => setCategory(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      {!wishes.length ? (
        <NoResults
          onReset={() => {
            setQ("");
            setCategory("All");
          }}
        />
      ) : (
        <div className="cp-wishes">
          {wishes.map((wish) => (
            <article className="cp-wish" key={wish.id} data-paw-wish={wish.id}>
              <header>
                <span className="cp-kicker">{wish.category} wish</span>
                <span className="cp-risk-tag">{wish.risk}</span>
                <h3>“{wish.phrase}”</h3>
              </header>
              <div className="cp-wish-trade">
                <div>
                  <span>
                    <Check size={15} />
                    What you get
                  </span>
                  <p>{wish.benefit}</p>
                </div>
                <div>
                  <span>
                    <TriangleAlert size={15} />
                    What it costs
                  </span>
                  <p>{wish.price}</p>
                </div>
              </div>
              <footer>Optional wish tag: {wish.tag}, Sunny Meadows</footer>
            </article>
          ))}
        </div>
      )}
      <details className="cp-version-note">
        <summary>
          Recent reference changes & known issues
          <ChevronDown size={16} />
        </summary>
        <p>
          The live reference now lists 5 / 4 / 3 wishes at reward multipliers
          0–1× / over 1–2× / over 2×. Older guides use different boundaries. The
          trap wish is described as starting a standard hunt, with a reported
          protection bug. It should still be treated as a dangerous, deliberate
          hunt.
        </p>
        <p>
          The official v0.19.0.1 patch fixed the knowledge wish incorrectly
          removing valid evidence. The wiki separately flags life-wish failures
          during hunts. <Link to="bugs">Check Ghost Hub’s known-bug notes</Link>{" "}
          before relying on a wish for your investigation.
        </p>
      </details>
    </section>
  );
}

function ItemDossier({ item }: { item: CursedGuide }) {
  const [photo, setPhoto] = useState<{ id: string; label: string } | null>(
    null,
  );
  const special =
    item.id === "tarot-cards"
      ? "Card index"
      : item.id === "ouija-board"
        ? "Question costs"
        : item.id === "monkey-paw"
          ? "Wish reference"
          : null;
  useEffect(() => {
    if (
      new URLSearchParams(location.hash.split("?")[1]).get("section") !==
      "media"
    )
      return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById("cp-media")
        ?.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [item.id]);
  const openPhoto = (id: string, label: string) => setPhoto({ id, label });
  return (
    <div className="cp-page cp-dossier">
      <Link to="cursed" className="back-link">
        <ArrowLeft size={16} />
        All cursed possessions
      </Link>
      <nav
        className="cp-object-switcher"
        aria-label="Choose a cursed possession"
      >
        {CURSED_GUIDES.map((g) => (
          <Link
            key={g.id}
            to={"cursed/" + g.id}
            aria-current={g.id === item.id ? "page" : undefined}
          >
            <CursedImage id={g.id} alt="" />
            <span>{g.name}</span>
          </Link>
        ))}
      </nav>
      <header className="cp-dossier-header">
        <button
          className="cp-dossier-portrait"
          onClick={() => openPhoto(item.id, item.name)}
          aria-label={"Enlarge " + item.name + " photograph"}
        >
          <CursedImage
            id={item.id}
            alt={item.name + " in-game photograph"}
            eager
          />
          <span>
            <Camera size={15} />
            Inspect photograph
          </span>
        </button>
        <div>
          <span className="cp-kicker">
            CURSED POSSESSION / OBJECT {item.number}
          </span>
          <h1>{item.name}</h1>
          <p className="cp-dossier-intro">{item.summary}</p>
          <dl className="cp-dossier-stats">
            <div>
              <dt>Sanity / cost</dt>
              <dd>{item.cost}</dd>
            </div>
            <div>
              <dt>Capacity</dt>
              <dd>{item.uses}</dd>
            </div>
          </dl>
          <div className="cp-dossier-warning">
            <TriangleAlert size={20} />
            <strong>{item.danger}</strong>
          </div>
          <MediaCredit id={item.id} />
        </div>
      </header>
      <nav
        className="cp-section-nav"
        aria-label={item.name + " dossier sections"}
      >
        <Jump to="cp-use">How to use</Jump>
        <Jump to="cp-costs">Costs & dangers</Jump>
        {special && <Jump to="cp-special">{special}</Jump>}
        <Jump to="cp-media">Photos & video</Jump>
        <Jump to="cp-field-notes">Field notes</Jump>
      </nav>
      <div className="cp-protocol-grid">
        <section id="cp-use" tabIndex={-1}>
          <SectionHeading number="01" title="Use it with a plan." />
          <p>{item.mechanic}</p>
          <ol className="cp-steps">
            {item.steps.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section id="cp-costs" tabIndex={-1} className="cp-cost-panel">
          <SectionHeading number="02" title="The price & the breaking point" />
          <dl className="cp-fact-list">
            {item.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="cp-warning-notes">
            {item.warnings.map((w) => (
              <p key={w}>
                <TriangleAlert size={16} />
                {w}
              </p>
            ))}
          </div>
        </section>
      </div>
      {item.id === "haunted-mirror" && <MirrorPlanner />}
      {item.id === "tarot-cards" && <TarotReference />}
      {item.id === "ouija-board" && <OuijaReference />}
      {item.id === "monkey-paw" && <PawReference />}
      {item.id === "music-box" && (
        <details className="cp-version-note">
          <summary>
            Why do some guides show different numbers?
            <ChevronDown size={16} />
          </summary>
          <p>
            The current Music Box article reports 3 m and about 2.6% sanity per
            second; the broader Sanity page still lists 2.5 m and 2.5%. These
            community sources disagree. Treat the values as approximate and use
            a generous sanity margin. The Yokai article also lists a reduced
            appearance range, which is absent from the current item article;
            avoid using that distance alone as a ghost test.
          </p>
          <a
            href={CURSED_WIKI + "Sanity#Equipment_sanity_gain/loss"}
            target="_blank"
            rel="noreferrer"
          >
            Compare the sanity reference ↗
          </a>
        </details>
      )}
      <section id="cp-media" tabIndex={-1} className="cp-media-section">
        <SectionHeading
          number={special ? "04" : "03"}
          title="Recognise it. Watch it work."
          description="Actual game imagery, credited to its source. Upload dates identify these captures as historical references."
        />
        <div className="cp-photo-grid">
          <PhotoButton
            id={item.id}
            label={item.name + " · object reference"}
            onOpen={openPhoto}
          />
          <PhotoButton
            id={item.spawn.image}
            label={item.spawn.label + " · location example"}
            onOpen={openPhoto}
          />
          {item.extraImage && (
            <PhotoButton
              id={item.extraImage}
              label={"Broken " + item.name}
              onOpen={openPhoto}
            />
          )}
        </div>
        <div className="cp-photo-location">
          <MapPin size={17} />
          <span>
            This is one location example. Check the atlas’s dated reference
            sheet for your contract.
          </span>
          <Link to={"maps?map=" + item.spawn.map}>
            Open {item.spawn.label}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        {item.clip && (
          <div className="cp-single-clip">
            <GameplayClip item={item} />
            <div>
              <span className="cp-kicker">GAMEPLAY CAPTURE</span>
              <h3>Watch the activation sequence.</h3>
              <p>
                Use the clip to recognise the effect and the item’s animation.
                It loops silently until stopped.
              </p>
              <p>
                Contains flashing imagery. Source upload:{" "}
                {cursedMedia[item.clip].uploadedAt.slice(0, 10)}. The game build
                of this capture is not verified.
              </p>
            </div>
          </div>
        )}
        <VideoGuide key={item.id} item={item} />
      </section>
      <section id="cp-field-notes" tabIndex={-1} className="cp-field-notes">
        <SectionHeading
          number={special ? "05" : "04"}
          title="What to take into the contract"
        />
        <div className="cp-field-tip">
          <BookOpen size={25} />
          <p>{item.tip}</p>
        </div>
        <HuntRules />
        <div className="cp-field-actions">
          <Link className="button" to="journal">
            Record the activation
            <ArrowUpRight size={15} />
          </Link>
          <Link className="button" to="equipment/incense">
            Review incense
            <ArrowUpRight size={15} />
          </Link>
          <Link className="button" to="guides/hunt-or-event">
            Hunt survival guide
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <Sources item={item} />
      <footer className="cp-dossier-footer">
        <Link to="cursed">
          <ArrowLeft size={16} />
          Back to the collection
        </Link>
        <Link
          to={
            "cursed/" +
            CURSED_GUIDES[Number(item.number) % CURSED_GUIDES.length].id
          }
        >
          Next: {CURSED_GUIDES[Number(item.number) % CURSED_GUIDES.length].name}
          <ArrowRight size={16} />
        </Link>
      </footer>
      <PhotoViewer photo={photo} onClose={() => setPhoto(null)} />
    </div>
  );
}

export function CursedPossessions({ id }: { id?: string }) {
  if (!id) return <CursedIndex />;
  const item = CURSED_GUIDES.find((g) => g.id === id);
  if (!item)
    return (
      <div className="cp-page cp-empty">
        <h1>Object not found</h1>
        <p>Choose one of the seven documented cursed possessions.</p>
        <Link className="button" to="cursed">
          Return to cursed possessions
        </Link>
      </div>
    );
  return <ItemDossier key={item.id} item={item} />;
}
