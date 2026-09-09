import { createFileRoute, Link } from "@tanstack/react-router";
import { logoImg, tesseraImg } from "@/lib/cards";
import { Nav } from "@/components/game/Nav";

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

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <img src={logoImg} alt="Logo The Gun Game" className="mx-auto w-64 sm:w-80" />
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Gioco di carte per 2 giocatori · 8+
        </p>

        <Link
          to="/gioca"
          className="mt-8 inline-block rounded-lg bg-primary px-14 py-5 text-2xl font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_40px_rgba(220,38,38,0.45)] transition-transform hover:scale-105"
        >
          Gioca
        </Link>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link
            to="/partite"
            className="rounded-lg border border-foreground/15 bg-card p-5 text-left transition-colors hover:border-primary"
          >
            <p className="font-black uppercase tracking-widest">Partite</p>
            <p className="mt-1 text-xs text-muted-foreground">Le sfide che hai già giocato.</p>
          </Link>
          <Link
            to="/amici"
            className="rounded-lg border border-foreground/15 bg-card p-5 text-left transition-colors hover:border-primary"
          >
            <p className="font-black uppercase tracking-widest">Amici</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nessuno disponibile? Gioca contro il bot.
            </p>
          </Link>
          <Link
            to="/regole"
            className="rounded-lg border border-foreground/15 bg-card p-5 text-left transition-colors hover:border-primary"
          >
            <p className="font-black uppercase tracking-widest">Regole</p>
            <p className="mt-1 text-xs text-muted-foreground">Il regolamento completo.</p>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-left">
          <img src={tesseraImg} alt="Tessera caricatore" className="h-14 w-14 object-contain" />
          <p className="max-w-xs text-xs text-muted-foreground">
            Ogni caricatore vale 6 colpi. Completane più dell'avversario… o eliminalo con The Gun.
          </p>
        </div>
      </main>
    </div>
  );
}
