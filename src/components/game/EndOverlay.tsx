import { Link } from "@tanstack/react-router";

export function GunShotOverlay({ attackerIsMe }: { attackerIsMe: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-black/80">
      <div className="absolute inset-0 animate-[flash_1.2s_ease-out]" style={{ background: "radial-gradient(circle, rgba(255,80,0,0.5), transparent 60%)" }} />
      <div
        className="text-[9rem] leading-none drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]"
        style={{
          transform: attackerIsMe ? "scaleX(1)" : "scaleX(-1)",
          animation: "recoil 0.5s ease-out 2",
        }}
      >
        🔫
      </div>
      <div className="absolute animate-[tracer_0.7s_ease-in_forwards] text-5xl" style={{ transform: attackerIsMe ? "none" : "scaleX(-1)" }}>
        ➤
      </div>
      <p className="absolute bottom-24 text-4xl font-black tracking-[0.3em] text-primary">BANG!</p>
    </div>
  );
}

export function EndOverlay({
  result,
  byGun,
  onRestart,
}: {
  result: "win" | "lose" | "draw";
  byGun: boolean;
  onRestart: () => void;
}) {
  const title = result === "win" ? "HAI VINTO" : result === "lose" ? "HAI PERSO" : "PAREGGIO";
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/90 px-6 text-center">
      <h2
        className={`animate-scale-in text-6xl font-black tracking-tight ${
          result === "win" ? "text-primary" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {byGun && (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {result === "win" ? "K.O. con The Gun" : "Colpito da The Gun"}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="rounded-md bg-primary px-5 py-2.5 font-bold text-primary-foreground"
        >
          Gioca ancora
        </button>
        <Link
          to="/"
          className="rounded-md border border-foreground/30 px-5 py-2.5 font-bold text-foreground"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
