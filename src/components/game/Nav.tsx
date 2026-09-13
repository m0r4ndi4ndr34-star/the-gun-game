import { Link } from "@tanstack/react-router";
import { logoImg } from "@/lib/cards";

export function Nav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="The Gun Game" className="h-9 w-9 object-contain" />
          <span className="text-sm font-black tracking-widest text-foreground">THE GUN GAME</span>
        </Link>
        <Link
          to="/"
          className="rounded-md border-2 border-foreground/25 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:border-primary hover:text-primary"
        >
          ← Menù principale
        </Link>
      </div>
      <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Link to="/gioca" className="hover:text-primary">
          Gioca
        </Link>
        <Link to="/amici" className="hover:text-primary">
          Amici
        </Link>
        <Link to="/partite" className="hover:text-primary">
          Partite
        </Link>
        <Link to="/regole" className="hover:text-primary">
          Regole
        </Link>
        <Link to="/profilo" className="hover:text-primary">
          Profilo
        </Link>
      </nav>
    </header>
  );
}
