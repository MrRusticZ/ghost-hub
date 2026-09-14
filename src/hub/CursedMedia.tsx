import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Play,
  Square,
  X,
  ZoomIn,
} from "lucide-react";
import records from "./cursed-media.json";
import { CURSED_VIDEO, type CursedGuide } from "./cursedData";

const files = import.meta.glob("./assets/cursed/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export const cursedMedia = Object.fromEntries(
  records.map((record) => [
    record.id,
    { ...record, url: files["./assets/cursed/" + record.file] },
  ]),
);

export function CursedImage({
  id,
  alt,
  className = "",
  eager = false,
}: {
  id: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const media = cursedMedia[id];
  useEffect(() => setFailed(false), [id]);
  return !media || failed ? (
    <span className={"cp-image-fallback " + className}>
      <ImageIcon size={24} />
      <span>
        {alt}
        <small>Image unavailable. The written guide remains available.</small>
      </span>
    </span>
  ) : (
    <img
      className={className}
      src={media.url}
      alt={alt}
      width={media.width}
      height={media.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function MediaCredit({ id }: { id: string }) {
  const media = cursedMedia[id];
  if (!media) return null;
  return (
    <a
      className="cp-credit"
      href={media.source}
      target="_blank"
      rel="noreferrer"
    >
      Wiki capture · {media.uploader}
      <ArrowUpRight size={12} />
    </a>
  );
}

export function PhotoViewer({
  photo,
  onClose,
}: {
  photo: { id: string; label: string } | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!photo) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.showModal();
    closeButton.current?.focus();
    return () => {
      node?.close();
      previous?.focus({ preventScroll: true });
    };
  }, [photo]);
  if (!photo) return null;
  const media = cursedMedia[photo.id];
  return (
    <dialog
      ref={dialog}
      className="cp-lightbox"
      aria-labelledby="cp-photo-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cp-lightbox-inner">
        <header>
          <h2 id="cp-photo-title">{photo.label}</h2>
          <button
            ref={closeButton}
            className="icon-button"
            aria-label="Close photograph"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <CursedImage id={photo.id} alt={photo.label} eager />
        <footer>
          <MediaCredit id={photo.id} />
          <span>
            Source upload: {media?.uploadedAt.slice(0, 10)} · Game imagery ©
            Kinetic Games
          </span>
        </footer>
      </div>
    </dialog>
  );
}

export function PhotoButton({
  id,
  label,
  onOpen,
}: {
  id: string;
  label: string;
  onOpen: (id: string, label: string) => void;
}) {
  return (
    <figure className="cp-photo">
      <button onClick={() => onOpen(id, label)} aria-label={"Enlarge " + label}>
        <CursedImage id={id} alt={label} />
        <span className="cp-photo-zoom">
          <ZoomIn size={16} />
          Enlarge
        </span>
      </button>
      <figcaption>
        <strong>{label}</strong>
        <MediaCredit id={id} />
      </figcaption>
    </figure>
  );
}

export function GameplayClip({ item }: { item: CursedGuide }) {
  const [playing, setPlaying] = useState(false);
  if (!item.clip) return null;
  const media = cursedMedia[item.clip];
  return (
    <figure className="cp-clip" data-cursed-clip={item.clip}>
      <div className="cp-clip-screen">
        {playing ? (
          <CursedImage
            id={item.clip}
            alt={item.name + " gameplay sequence"}
            eager
          />
        ) : (
          <CursedImage id={item.id} alt={item.name + " clip preview"} />
        )}
        {!playing && (
          <button
            className="cp-play-overlay"
            onClick={() => setPlaying(true)}
            aria-label={"Play " + item.name + " gameplay clip"}
          >
            <Play size={26} fill="currentColor" />
            <span>Play gameplay clip</span>
          </button>
        )}
        {playing && (
          <button
            className="cp-stop"
            onClick={() => setPlaying(false)}
            aria-label={"Stop " + item.name + " gameplay clip"}
          >
            <Square size={15} />
            Stop clip
          </button>
        )}
      </div>
      <figcaption>
        <strong>{item.name}</strong>
        <span>
          Silent loop · flashing imagery · source {media.uploadedAt.slice(0, 4)}
        </span>
        <MediaCredit id={item.clip} />
      </figcaption>
    </figure>
  );
}

export function VideoGuide({ item }: { item: CursedGuide }) {
  const [loaded, setLoaded] = useState(false);
  const url = `https://www.youtube.com/watch?v=${CURSED_VIDEO.id}&t=${item.chapter}s`;
  return (
    <div className="cp-video-guide">
      <div className="cp-video-screen">
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${CURSED_VIDEO.id}?start=${item.chapter}&autoplay=0&rel=0`}
            title={`${item.name} video guide by Insym (archive, v0.9)`}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            <CursedImage
              id={item.spawn.image}
              alt={item.name + " in a game location"}
            />
            <button className="cp-play-overlay" onClick={() => setLoaded(true)}>
              <Play size={28} fill="currentColor" />
              <span>Load {item.name} video chapter</span>
            </button>
          </>
        )}
      </div>
      <div className="cp-video-caption">
        <span className="cp-kicker">WATCH WITH CONTEXT</span>
        <h3>{item.name}, demonstrated</h3>
        <p>
          Insym’s full guide · recorded on <strong>v0.9</strong>. This archival
          chapter shows the item in action; costs, wishes and maps may differ
          from today’s game.
        </p>
        <a className="button" href={url} target="_blank" rel="noreferrer">
          Watch on YouTube
          <ArrowUpRight size={15} />
        </a>
        {loaded && (
          <button className="button" onClick={() => setLoaded(false)}>
            Close video
          </button>
        )}
        <small>
          YouTube connects only when you load the player. If playback is
          blocked, use the direct link.
        </small>
      </div>
    </div>
  );
}
