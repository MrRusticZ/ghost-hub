import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Cross,
  Ear,
  Flame,
  Flashlight,
  Footprints,
  Fingerprint,
  Grid2X2,
  Layers,
  Mic,
  Radar,
  Radio,
  ScanEye,
  ScanLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Thermometer,
  Triangle,
  TriangleAlert,
  Video,
  Volume2,
  Wrench,
  X,
  Zap,
  ZoomIn,
  Package,
  Pill,
} from "lucide-react";
import { Link, route } from "./context";
import { useChapterState } from "./chapterState";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CHECKED,
  EQUIPMENT_FAQ,
  EQUIPMENT_GUIDES,
  EQUIPMENT_SOURCE,
  TIER_NAMES,
  filterEquipment,
  type EquipmentGuide,
} from "./equipmentData";
import {
  EquipmentImage,
  EquipmentPhoto,
  EquipmentCredit,
} from "./EquipmentMedia";
import "./equipment.css";

const itemIcons: Record<string, typeof Activity> = {
  "emf-reader": Activity,
  "spirit-box": Radio,
  "uv-light": Fingerprint,
  thermometer: Thermometer,
  "dots-projector": ScanLine,
  "writing-book": BookOpen,
  "video-camera": Video,
  incense: Flame,
  crucifix: Cross,
  salt: Footprints,
  parabolic: Ear,
  "motion-sensor": Radar,
  flashlight: Flashlight,
  "photo-camera": Camera,
  "head-gear": ScanEye,
  "sanity-medication": Pill,
  firelight: Flame,
  igniter: Flame,
  "sound-sensor": Volume2,
  "sound-recorder": Mic,
  tripod: Triangle,
};
const categoryIcons: Record<string, typeof Activity> = {
  All: Layers,
  Evidence: Fingerprint,
  Protection: ShieldCheck,
  Tracking: Radar,
  Utility: Wrench,
  Media: Camera,
};
function TierSwitch({
  tier,
  onChange,
  label = "Show equipment tier",
}: {
  tier: number;
  onChange: (tier: number) => void;
  label?: string;
}) {
  return (
    <div className="eq-tier-switch" role="group" aria-label={label}>
      {TIER_NAMES.map((name, i) => (
        <button
          key={name}
          aria-pressed={tier === i + 1}
          onClick={() => onChange(i + 1)}
        >
          Tier {name}
        </button>
      ))}
    </div>
  );
}
function Traits({
  electronic,
  consumable,
}: {
  electronic: boolean;
  consumable: boolean;
}) {
  return (
    <div className="eq-traits">
      <span>
        {electronic ? <Zap size={13} /> : <ShieldCheck size={13} />}{" "}
        {electronic ? "Electronic" : "Non-electronic"}
      </span>
      {consumable && (
        <span>
          <Package size={13} />
          Consumable
        </span>
      )}
    </div>
  );
}
function Sources({ item }: { item?: EquipmentGuide }) {
  return (
    <details className="eq-sources">
      <summary>
        <ShieldCheck size={17} />
        Sources & image credits<span>Checked {EQUIPMENT_CHECKED}</span>
        <ChevronDown size={16} />
      </summary>
      <p>
        Specifications and tier identities were checked against the live
        community wiki. Purchase prices are per unit; upgrade fees are separate.
        These reference checks are not a claim of testing every mechanic in the
        game.
      </p>
      <div>
        {(item ? [item] : EQUIPMENT_GUIDES).map((gear) => (
          <a
            key={gear.id}
            href={`${EQUIPMENT_SOURCE}${gear.wiki}?oldid=${gear.revision}`}
            target="_blank"
            rel="noreferrer"
          >
            {gear.name}
            <small>Revision {gear.revision}</small>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <p>
        Equipment artwork © Kinetic Games. Images come from the community wiki,
        with individual uploader credits in the image viewer. Original filenames
        may predate tier changes; the current article determines the displayed
        tier. Images are identification references, not verified current-build
        captures.
      </p>
      <a
        className="eq-text-link"
        href={EQUIPMENT_SOURCE + "Equipment"}
        target="_blank"
        rel="noreferrer"
      >
        Shared equipment, purchase and recovery rules
        <ArrowUpRight size={14} />
      </a>
    </details>
  );
}
function EquipmentCard({ item, tier }: { item: EquipmentGuide; tier: number }) {
  const detail = item.tiers[tier - 1];
  const Icon = itemIcons[item.id];
  return (
    <Link
      to={`equipment/${item.id}?tier=${tier}`}
      className="eq-card"
      aria-label={`Open ${item.name} equipment guide`}
      data-equipment-item={item.id}
    >
      <div className="eq-card-visual">
        <span className="eq-tool-symbol">
          <Icon size={20} />
        </span>
        {item.starter && <span className="eq-starter">Starter kit</span>}
        <EquipmentImage
          id={detail.image}
          alt={`${item.name}, Tier ${TIER_NAMES[tier - 1]}`}
        />
        <span className="eq-image-tier" aria-hidden="true">{TIER_NAMES[tier - 1]}</span>
      </div>
      <div className="eq-card-body">
        <span className="eq-eyebrow">{item.category}</span>
        <h2>
          {item.name}
          <ArrowUpRight size={17} />
        </h2>
        <p>{item.summary}</p>
        <div className="eq-card-selected">
          <span>Tier {TIER_NAMES[tier - 1]}</span>
          <strong>{detail.name}</strong>
        </div>
        <div className="eq-card-meta">
          <span>
            <strong>${item.price}</strong> per unit
          </span>
          <span>
            {item.starter && tier === 1 ? "Included" : `Level ${detail.level}`}
          </span>
        </div>
        <Traits electronic={detail.electronic} consumable={detail.consumable} />
      </div>
    </Link>
  );
}
function QuickReference({
  items,
  tier,
}: {
  items: EquipmentGuide[];
  tier: number;
}) {
  return (
    <div
      className="eq-table-scroll"
      role="region"
      tabIndex={0}
      aria-label="Equipment quick reference"
    >
      <table className="eq-table">
        <caption>
          Tier {TIER_NAMES[tier - 1]} reference · purchase price excludes
          one-time upgrade fees
        </caption>
        <thead>
          <tr>
            <th scope="col">Equipment</th>
            <th scope="col">Tier {TIER_NAMES[tier - 1]} specification</th>
            <th scope="col">Purchase</th>
            <th scope="col">Unlock</th>
            <th scope="col">In contract</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const t = item.tiers[tier - 1];
            return (
              <tr key={item.id}>
                <th scope="row">
                  <Link to={`equipment/${item.id}?tier=${tier}`}>
                    <EquipmentImage id={t.image} alt="" />
                    <span>
                      {item.name}
                      <small>{item.category}</small>
                    </span>
                  </Link>
                </th>
                <td>
                  <strong>{t.name}</strong>
                  <small>
                    {t.stats
                      .slice(0, 2)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ") || t.difference}
                  </small>
                </td>
                <td>
                  ${item.price}
                  <small>Max {item.max}</small>
                </td>
                <td>
                  {item.starter && tier === 1 ? "Starter" : `Level ${t.level}`}
                </td>
                <td>
                  <Traits electronic={t.electronic} consumable={t.consumable} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function EquipmentIndex() {
  const [query, setQuery] = useChapterState("Equipment-query", ""),
    [savedCategory, setCategory] = useChapterState("Equipment-category", "All"),
    [savedTier, setTier] = useChapterState("Equipment-tier", 2),
    [filter, setFilter] = useChapterState("Equipment-filter", "all"),
    [view, setView] = useChapterState("Equipment-view", "gallery"),
    [sort, setSort] = useChapterState("Equipment-sort", "default");
  const category = EQUIPMENT_CATEGORIES.includes(
    savedCategory as (typeof EQUIPMENT_CATEGORIES)[number],
  )
    ? savedCategory
    : "All";
  const tier = [1, 2, 3].includes(savedTier) ? savedTier : 2;
  const items = filterEquipment(query, category, tier, filter, sort);
  const clear = () => {
    setQuery("");
    setCategory("All");
    setFilter("all");
  };
  return (
    <div className="eq-page">
      <header className="eq-header">
        <div>
          <span className="eq-eyebrow">
            <Wrench size={15} />
            FIELD EQUIPMENT
          </span>
          <h1>
            Equipment library<span>.</span>
          </h1>
          <p>Find your tool. Compare its tiers. Understand the result.</p>
        </div>
        <div className="eq-header-counts">
          <span>
            <strong>21</strong>tools
          </span>
          <span>
            <strong>63</strong>tier images
          </span>
        </div>
      </header>
      <div className="eq-controls">
        <div className="eq-search input-icon">
          <Search size={18} />
          <input
            aria-label="Search equipment"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, evidence or an old name…"
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear equipment search"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <TierSwitch tier={tier} onChange={setTier} />
        <div
          className="eq-view-switch"
          role="group"
          aria-label="Equipment view"
        >
          <button
            aria-label="Equipment gallery"
            aria-pressed={view !== "table"}
            onClick={() => setView("gallery")}
          >
            <Grid2X2 size={18} />
          </button>
          <button
            aria-label="Equipment quick reference"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <Table2 size={18} />
          </button>
        </div>
      </div>
      <div
        className="eq-category-tabs"
        role="group"
        aria-label="Equipment categories"
      >
        {EQUIPMENT_CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              <Icon size={17} />
              {cat === "All" ? "All" : cat}
              <span>
                {cat === "All"
                  ? 21
                  : EQUIPMENT_GUIDES.filter((g) => g.category === cat).length}
              </span>
            </button>
          );
        })}
      </div>
      <div className="eq-refinements">
        <div className="eq-filter-buttons">
          <button
            aria-pressed={filter === "starter"}
            onClick={() => setFilter(filter === "starter" ? "all" : "starter")}
          >
            <Package size={14} />
            Starter kit
          </button>
          <button
            aria-pressed={filter === "non-electronic"}
            onClick={() =>
              setFilter(filter === "non-electronic" ? "all" : "non-electronic")
            }
          >
            <ShieldCheck size={14} />
            Non-electronic · Tier {TIER_NAMES[tier - 1]}
          </button>
        </div>
        <label className="eq-sort">
          <SlidersHorizontal size={14} />
          <select
            aria-label="Sort equipment"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Recommended order</option>
            <option value="name">Name A–Z</option>
            <option value="price">Lowest purchase price</option>
            <option value="unlock">Lowest unlock level</option>
          </select>
        </label>
      </div>
      <div className="eq-results">
        <span role="status" aria-live="polite">
          {items.length} of 21 tools · showing Tier {TIER_NAMES[tier - 1]}
        </span>
        {(query || category !== "All" || filter !== "all") && (
          <button onClick={clear}>
            Clear filters
            <X size={13} />
          </button>
        )}
        <span>Open a tool to compare all three tiers</span>
      </div>
      {!items.length ? (
        <div className="eq-empty">
          <Search size={30} />
          <h2>No equipment found</h2>
          <p>Try a shorter search or remove a filter.</p>
          <button className="button" onClick={clear}>
            Reset equipment filters
          </button>
        </div>
      ) : view === "table" ? (
        <QuickReference items={items} tier={tier} />
      ) : (
        <div className="eq-grid">
          {items.map((item) => (
            <EquipmentCard key={item.id} item={item} tier={tier} />
          ))}
        </div>
      )}
      <section className="eq-kit-notes">
        <div>
          <span className="eq-eyebrow">BEFORE THE CONTRACT</span>
          <h2>A better kit starts with knowing its limits.</h2>
          <p>
            Evidence, media rewards and protection serve different jobs. Plan
            the test and check the result before you update your investigation.
          </p>
          <Link className="button" to="evidence">
            Open the Evidence Book
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <figure>
          <EquipmentImage
            id="equipment-wall"
            alt="Equipment stored on the truck wall in Phasmophobia"
          />
          <figcaption>
            Reference equipment wall
            <EquipmentCredit id="equipment-wall" />
          </figcaption>
        </figure>
      </section>
      <section className="eq-faq" aria-labelledby="eq-faq-title">
        <h2 id="eq-faq-title">Equipment questions, answered.</h2>
        {EQUIPMENT_FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <ChevronDown size={17} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <Sources />
    </div>
  );
}

function EquipmentDetail({ item }: { item: EquipmentGuide }) {
  const requested = Number(
    new URLSearchParams(location.hash.split("?")[1]).get("tier"),
  );
  const [selected, setSelected] = useState(
    [1, 2, 3].includes(requested) ? requested : 2,
  );
  const [photo, setPhoto] = useState<{ id: string; label: string } | null>(
    null,
  );
  const tier = item.tiers[selected - 1];
  const Icon = itemIcons[item.id];
  const openImage = (index: number) =>
    setPhoto({
      id: item.tiers[index].image,
      label: `${item.name} · Tier ${TIER_NAMES[index]} · ${item.tiers[index].name}`,
    });
  return (
    <div className="eq-page eq-detail">
      <Link to="equipment" className="back-link">
        <ArrowLeft size={16} />
        Equipment library
      </Link>
      <div className="eq-detail-topline">
        <span className="eq-eyebrow">
          <Icon size={18} />
          {item.category} equipment
        </span>
        <label>
          Switch tool
          <select
            aria-label="Switch equipment guide"
            value={item.id}
            onChange={(e) =>
              route(`equipment/${e.target.value}?tier=${selected}`)
            }
          >
            {EQUIPMENT_GUIDES.map((g) => (
              <option value={g.id} key={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <header className="eq-detail-header">
        <div className="eq-product">
          <button
            onClick={() => openImage(selected - 1)}
            aria-label={`Enlarge ${item.name} Tier ${TIER_NAMES[selected - 1]}`}
          >
            <EquipmentImage
              id={tier.image}
              alt={`${item.name}, Tier ${TIER_NAMES[selected - 1]}`}
              eager
            />
            <span>
              <ZoomIn size={16} />
              Inspect image
            </span>
          </button>
          <TierSwitch
            tier={selected}
            onChange={setSelected}
            label="Preview equipment tier"
          />
        </div>
        <div className="eq-detail-description">
          <h1>{item.name}</h1>
          <p>{item.summary}</p>
          <div className="eq-detail-costs">
            <span>
              <small>Purchase / unit</small>
              <strong>${item.price}</strong>
            </span>
            <span>
              <small>Contract limit</small>
              <strong>{item.max}</strong>
            </span>
            <span>
              <small>Supply</small>
              <strong>{item.starter ? "Starter tool" : "Optional tool"}</strong>
            </span>
          </div>
          <div className="eq-selected-summary">
            <span className="eq-eyebrow">
              Tier {TIER_NAMES[selected - 1]} ·{" "}
              {item.starter && selected === 1
                ? "Included in starter kit"
                : `Unlock level ${tier.level}`}
            </span>
            <h2>{tier.name}</h2>
            <p>{tier.difference}</p>
            <Traits electronic={tier.electronic} consumable={tier.consumable} />
          </div>
        </div>
      </header>
      <nav className="eq-section-nav" aria-label="Equipment guide sections">
        {[
          ["eq-tiers", "Compare tiers"],
          ["eq-protocol", "How to use"],
          ["eq-notes", "Field notes"],
          ["eq-pairings", "Use together"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              const section = document.getElementById(id);
              section?.scrollIntoView({ block: "start", behavior: "instant" });
              section?.focus({ preventScroll: true });
            }}
          >
            {label}
            <ChevronDown size={13} />
          </button>
        ))}
      </nav>
      <section className="eq-tier-section" id="eq-tiers" tabIndex={-1}>
        <div className="eq-section-title">
          <div>
            <span className="eq-eyebrow">01 / KNOW THE DIFFERENCE</span>
            <h2>Three tiers. Compare the trade-offs.</h2>
          </div>
          <p>
            Purchase prices stay separate from one-time upgrade fees. Level
            requirements are shown below.
          </p>
        </div>
        <div className="eq-tier-cards">
          {item.tiers.map((t, i) => (
            <article
              key={t.image}
              className={
                "eq-tier-card " + (i === selected - 1 ? "eq-tier-selected" : "")
              }
              data-equipment-tier={i + 1}
            >
              <header>
                <span>Tier {TIER_NAMES[i]}</span>
                <span>
                  {item.starter && i === 0 ? "Starter" : `Level ${t.level}`}
                </span>
              </header>
              <button
                className="eq-tier-photo"
                aria-label={`Inspect ${item.name} Tier ${TIER_NAMES[i]} image`}
                onClick={() => openImage(i)}
              >
                <EquipmentImage
                  id={t.image}
                  alt={`${item.name} Tier ${TIER_NAMES[i]}`}
                />
                <ZoomIn size={17} />
              </button>
              <div className="eq-tier-card-body">
                <h3>{t.name}</h3>
                <p>{t.difference}</p>
                <dl>
                  {t.stats.map(([key, value], j) => (
                    <div key={key + j}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <Traits electronic={t.electronic} consumable={t.consumable} />
              </div>
            </article>
          ))}
        </div>
        {item.id === "incense" && (
          <p className="eq-spec-note">
            The 5-second blindness specification is typical. Moroi and Gallu
            states differ; see the field notes below.
          </p>
        )}
      </section>
      <div className="eq-protocol-grid">
        <section id="eq-protocol" tabIndex={-1}>
          <span className="eq-eyebrow">02 / IN THE FIELD</span>
          <h2>Use it with a clear test.</h2>
          <ol className="eq-steps">
            {item.steps.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <aside className="eq-caution">
            <TriangleAlert size={20} />
            <div>
              <strong>Avoid the false conclusion</strong>
              <p>{item.caution}</p>
            </div>
          </aside>
        </section>
        <section id="eq-notes" tabIndex={-1}>
          <span className="eq-eyebrow">03 / WHAT MATTERS</span>
          <h2>Field notes</h2>
          <ul className="eq-field-notes">
            {item.notes.map((note) => (
              <li key={note}>
                <Check size={17} />
                <p>{note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section id="eq-pairings" className="eq-pairings" tabIndex={-1}>
        <span className="eq-eyebrow">04 / USE TOGETHER</span>
        <h2>Build a useful combination.</h2>
        <div>
          {item.pairs.map((id) => {
            const pair = EQUIPMENT_GUIDES.find((x) => x.id === id)!;
            return (
              <Link key={id} to={`equipment/${id}?tier=${selected}`}>
                <EquipmentImage id={pair.tiers[selected - 1].image} alt="" />
                <span>
                  <strong>{pair.name}</strong>
                  <small>{pair.summary}</small>
                </span>
                <ArrowRight size={18} />
              </Link>
            );
          })}
        </div>
      </section>
      <div className="eq-guide-actions">
        <Link className="button primary" to="evidence">
          Use the Evidence Book
          <ArrowUpRight size={16} />
        </Link>
        <Link className="button" to="guides/hunt-or-event">
          Review hunt survival
          <ArrowUpRight size={16} />
        </Link>
        {item.id === "crucifix" || item.id === "incense" ? (
          <Link className="button" to="cursed">
            Cursed-hunt rules
            <ArrowUpRight size={16} />
          </Link>
        ) : null}
      </div>
      <Sources item={item} />
      <footer className="eq-footer">
        <Link to="equipment">
          <ArrowLeft size={16} />
          All equipment
        </Link>
        <span>Reference checked {EQUIPMENT_CHECKED}</span>
      </footer>
      <EquipmentPhoto photo={photo} onClose={() => setPhoto(null)} />
    </div>
  );
}
export function Equipment({ id }: { id?: string }) {
  if (!id) return <EquipmentIndex />;
  const item = EQUIPMENT_GUIDES.find((x) => x.id === id);
  return item ? (
    <EquipmentDetail key={item.id} item={item} />
  ) : (
    <div className="eq-page eq-empty">
      <h1>Equipment not found</h1>
      <p>Choose a tool from the equipment library.</p>
      <Link className="button" to="equipment">
        Return to equipment
      </Link>
    </div>
  );
}
