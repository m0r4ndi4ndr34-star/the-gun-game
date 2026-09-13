import { cardBack, cardFaces, gunCard } from "@/lib/cards";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/game";

export function CardView({
  card,
  faceDown,
  lifted,
  className,
  onClick,
  disabled,
}: {
  card?: Card | undefined;
  faceDown?: boolean | undefined;
  lifted?: boolean | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
  disabled?: boolean | undefined;
}) {
  const base =
    "relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 border-foreground/20 bg-black shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-[700ms] ease-[cubic-bezier(.22,.61,.36,1)] will-change-transform focus:outline-none";

  const content = () => {
    if (faceDown || !card) {
      return <img src={cardBack} alt="Retro della carta" className="h-full w-full object-cover" />;
    }
    if (card.kind === "gun") {
      return <img src={gunCard} alt="Carta The Gun" className="h-full w-full object-cover" />;
    }
    return (
      <img
        src={cardFaces[card.value]}
        alt={`Carta numero ${card.value}`}
        className="h-full w-full object-cover"
      />
    );
  };

  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        onClick && !disabled && "cursor-pointer hover:-translate-y-3 hover:border-primary",
        lifted && "-translate-y-8 scale-105 border-primary ring-2 ring-primary",
        disabled && "opacity-60",
        className,
      )}
    >
      {content()}
    </Cmp>
  );
}
