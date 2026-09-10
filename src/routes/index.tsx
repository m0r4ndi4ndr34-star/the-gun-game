import { createFileRoute, Link } from "@tanstack/react-router";
import { logoImg, tesseraImg } from "@/lib/cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Gun Game — gioco di carte per due" },
      {
        name: "description",
        content:
          "The Gun Game: gioco di carte per 2 giocatori dagli 8 anni in su. Scommetti, riempi i caricatori e usa la carta The Gun per il K.O.",
      },
      { property: "og:title", content: "The Gun Game — gioco di carte per due" },
      {
        property: "og:description",
        content: "Sfida il bot o un amico a The Gun Game: caricatori, scommesse e K.O.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const voci = [
  { to: "/gioca", label: "Gioca", desc: "Inizia una nuova partita" },
  { to: "/amici", label: "Amici", desc: "Sfida chi conosci o il bot" },
  { to: "/partite", label: "Partite", desc: "Storico dei risultati" },
  { to: "/regole", label: "Regole", desc: "Il regolamento completo" },
  { to: "/profilo", label: "Profilo", desc: "Nome e foto" },
] as const;

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(220,38,38,0.18),transparent_60%)]" />
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 px-5 py-10 md:flex-row md:justify-between md:py-16">
        <nav className="w-full max-w-sm space-y-3 md:order-1">
          <h1 className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-muted-foreground">
            Menu principale
          </h1>
          {voci.map((v, i) => (
            <Link
              key={v.to}
              to={v.to}
              style={{ animationDelay: `${i * 70}ms` }}
              className="group flex animate-[menuIn_.5s_ease-out_both] items-center justify-between rounded-xl border-2 border-foreground/15 bg-card/80 px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-primary hover:bg-primary/10 hover:shadow-[0_10px_35px_rgba(220,38,38,0.35)] focus-visible:scale-[1.04] focus-visible:border-primary"
            >
              <span>
                <span className="block text-xl font-black uppercase tracking-[0.15em] text-foreground group-hover:text-primary">
                  {v.label}
                </span>
                <span className="block text-[11px] text-muted-foreground">{v.desc}</span>
              </span>
              <span className="text-2xl text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                ▶
              </span>
            </Link>
          ))}
          <p className="pt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            2 giocatori · 8+
          </p>
        </nav>

        <div className="flex flex-col items-center gap-4 md:order-2">
          <img
            src={logoImg}
            alt="Logo The Gun Game"
            className="w-56 animate-[menuIn_.6s_ease-out_both] object-contain sm:w-72 md:w-80"
          />
          <div className="flex items-center gap-3">
            <img src={tesseraImg} alt="Tessera caricatore" className="h-12 w-12 object-contain" />
            <p className="max-w-[14rem] text-xs text-muted-foreground">
              Ogni caricatore vale 6 colpi. Completane più dell'avversario… o eliminalo con The Gun.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
