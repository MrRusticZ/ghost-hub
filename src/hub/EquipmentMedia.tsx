import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, X, ArrowUpRight } from "lucide-react";
import records from "./equipment-media.json";
const files = import.meta.glob("./assets/equipment/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
export const equipmentMedia = Object.fromEntries(
  records.map((record) => [
    record.id,
    { ...record, src: files["./assets/equipment/" + record.file] },
  ]),
);
export function EquipmentImage({
  id,
  alt,
  eager = false,
}: {
  id: string;
  alt: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState("");
  const item = equipmentMedia[id];
  return !item || failed === id ? (
    <span className="eq-image-fallback">
      <ImageIcon size={28} />
      <span>
        {alt || "Equipment image"}
        <small>Image unavailable</small>
      </span>
    </span>
  ) : (
    <img
      src={item.src}
      alt={alt}
      width={item.width}
      height={item.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(id)}
    />
  );
}
export function EquipmentCredit({ id }: { id: string }) {
  const media = equipmentMedia[id];
  return (
    <a
      className="eq-credit"
      href={media.source}
      target="_blank"
      rel="noreferrer"
    >
      Wiki image · {media.uploader}
      <ArrowUpRight size={12} />
    </a>
  );
}
export function EquipmentPhoto({
  photo,
  onClose,
}: {
  photo: { id: string; label: string } | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!photo) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    close.current?.focus();
    return () => {
      element?.close();
      previous?.focus({ preventScroll: true });
    };
  }, [photo]);
  if (!photo) return null;
  const media = equipmentMedia[photo.id];
  return (
    <dialog
      ref={dialog}
      className="eq-lightbox"
      aria-labelledby="eq-photo-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2 id="eq-photo-title">{photo.label}</h2>
        <button
          ref={close}
          className="icon-button"
          aria-label="Close equipment image"
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      <EquipmentImage id={photo.id} alt={photo.label} eager />
      <footer>
        <EquipmentCredit id={photo.id} />
        <span>
          Source upload {media.uploadedAt.slice(0, 10)} · Game imagery ©
          Kinetic Games
        </span>
      </footer>
    </dialog>
  );
}
