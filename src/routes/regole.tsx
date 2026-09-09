import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/game/Nav";

export const Route = createFileRoute("/regole")({
  head: () => ({
    meta: [
      { title: "Regole ufficiali — The Gun Game" },
      {
        name: "description",
        content:
          "Il regolamento completo di The Gun Game: caricatori, scommesse Vincere o Perdere, la carta The Gun e il calcolo dei punteggi.",
      },
      { property: "og:title", content: "Regole ufficiali — The Gun Game" },
      {
        property: "og:description",
        content: "Tutte le regole del gioco di carte a due giocatori The Gun Game.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Regole,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-foreground/10 bg-card p-5">
      <h2 className="mb-3 text-lg font-black uppercase tracking-wide text-primary">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Regole() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <h1 className="text-3xl font-black tracking-tight">Regolamento ufficiale</h1>
        <p className="text-sm text-muted-foreground">
          Gioco di carte per 2 giocatori · età consigliata 8+
        </p>

        <Section title="1. Obiettivo del gioco">
          <p>
            Accumulare più munizioni possibili superando in astuzia l'avversario. L'obiettivo è
            riempire il maggior numero di Caricatori (ciascun caricatore contiene 6 colpi). Ogni
            colpo ottenuto equivale a 1 punto/proiettile. Chi completa più caricatori entro la fine
            del mazzo di pesca vince la partita… a meno che non venga eliminato prima da The Gun!
          </p>
        </Section>

        <Section title="2. Componenti e preparazione">
          <p>Il mazzo è di 52 carte: 50 carte numerate da 1 a 6 e 2 carte speciali The Gun.</p>
          <p>
            Mano iniziale: ogni giocatore riceve 3 carte private (coperte agli occhi
            dell'avversario). Il resto forma il mazzo di pesca al centro del tavolo.
          </p>
          <p>
            Indicatori caricatore: ogni giocatore traccia i colpi accumulati (da 1 a 6). Raggiunti 6
            colpi il caricatore è completato e blindato (1 punto vittoria) e se ne inizia uno nuovo
            da zero.
          </p>
          <p>
            Salvaguardia: non è mai possibile scendere sotto lo 0 del caricatore corrente. I colpi
            del caricatore in corso possono essere persi, i caricatori già completati sono al sicuro.
          </p>
        </Section>

        <Section title="3. Svolgimento del turno (round di scommessa)">
          <p>
            A ogni round i due giocatori scelgono 1 carta dalla mano e la posizionano coperta sul
            tavolo. Prima di rivelarla dichiarano la propria intenzione: <b>Vincere</b> (giocare la
            carta più alta) o <b>Perdere</b> (giocare la carta più bassa). Poi si rivela
            simultaneamente.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Dichiari <b>VINCERE</b> e vinci: guadagni colpi pari al valore della tua carta.
            </li>
            <li>
              Dichiari <b>PERDERE</b> e perdi: guadagni 1 colpo per la giocata tattica.
            </li>
            <li>
              Dichiari <b>VINCERE</b> e perdi: il caricatore corrente torna a 0 colpi.
            </li>
            <li>
              Dichiari <b>PERDERE</b> e vinci: perdi colpi pari alla differenza tra la tua carta e
              quella dell'avversario.
            </li>
          </ul>
        </Section>

        <Section title="4. Pareggio delle carte numerate">
          <p>
            Se escono due carte dello stesso valore il round è annullato: nessuno guadagna né perde
            colpi. Le due carte tornano nel mazzo, che viene subito mescolato. L'ordine di pesca non
            cambia: pesca per primo chi aveva pescato per primo nell'ultimo round valido.
          </p>
        </Section>

        <Section title="5. Carta speciale: THE GUN">
          <p>
            Nel mazzo ci sono 2 carte The Gun. Chi ne ha una può giocarla al posto di una carta
            numerata: dichiara in segreto un numero da 1 a 6 (la camera che contiene il proiettile).
            L'avversario deve difendersi giocando una delle carte in mano.
          </p>
          <p>
            Se il numero coincide: <b>K.O. istantaneo</b>, l'avversario perde subito la partita. Se
            non coincide, schiva il proiettile e non subisce nulla. La carta The Gun viene scartata
            definitivamente e chi l'ha usata pesca subito una nuova carta.
          </p>
        </Section>

        <Section title="6. Fine del round, scarto e pesca">
          <p>
            Le carte giocate nei round con un vincitore e le carte The Gun usate vengono scartate;
            solo le carte del pareggio rientrano nel mazzo. Chi vince la mano pesca per primo, poi
            pesca l'altro, fino a riportare la mano a 3 carte.
          </p>
        </Section>

        <Section title="7. Fine della partita e vittoria">
          <p>
            La partita finisce per eliminazione istantanea (colpo di The Gun andato a segno) o per
            esaurimento del mazzo. In quest'ultimo caso vince chi ha completato più caricatori; a
            parità, chi ha più colpi nel caricatore in corso; se tutto è identico è parità assoluta.
          </p>
        </Section>
      </main>
    </div>
  );
}
