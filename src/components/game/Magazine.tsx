import { tesseraImg } from "@/lib/cards";
import { cn } from "@/lib/utils";

/** Caricatore verticale con 6 alloggiamenti: mostra i colpi del caricatore in corso. */
export function MagazineBar({
  shots,
  magazines,
  label,
  compact,
}: {
  shots: number;
  magazines: number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div
        className={cn(
          "flex flex-col-reverse gap-1 rounded-md border-2 border-foreground/30 bg-black/60 p-1.5",
          compact ? "w-9" : "w-11",
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-sm border transition-all duration-300",
              compact ? "h-4" : "h-5",
              i < shots
                ? "border-amber-300/70 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600"
                : "border-foreground/15 bg-foreground/5",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-foreground">{shots}/6</span>
      <div className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-1.5 py-1">
        <img src={tesseraImg} alt="Tessera caricatore completato" className="h-6 w-6 object-contain" />
        <span className="text-sm font-black text-primary">×{magazines}</span>
      </div>
    </div>
  );
}

/** Caricatore circolare: 1 in alto, poi in senso orario fino al 6. */
export function MagazineWheel({
  onPick,
  picked,
  highlight,
  disabled,
}: {
  onPick?: (n: number) => void;
  picked?: number;
  highlight?: number;
  disabled?: boolean;
}) {
  const r = 96;
  return (
    <div className="relative h-64 w-64 rounded-full border-4 border-foreground/30 bg-black/80 shadow-[0_0_60px_rgba(220,38,38,0.35)]">
      <div className="absolute inset-6 rounded-full border border-foreground/10" />
      {Array.from({ length: 6 }).map((_, i) => {
        const n = i + 1;
        const angle = (-90 + i * 60) * (Math.PI / 180);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const active = picked === n || highlight === n;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onPick?.(n)}
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            className={cn(
              "absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-black transition-all",
              active
                ? "scale-110 border-primary bg-primary text-primary-foreground"
                : "border-foreground/30 bg-foreground/5 text-foreground",
              !disabled && "hover:border-primary hover:bg-primary/20",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
