import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CardView } from "@/components/game/CardView";
import { MagazineBar } from "@/components/game/Magazine";
import { ChatPanel, type ChatMessage } from "@/components/game/ChatPanel";
import { EndOverlay } from "@/components/game/EndOverlay";
import { GunFire3D, GunLoader3D } from "@/components/game/Gun3D";
import { cardBack, logoImg } from "@/lib/cards";
import {
  botChoose,
  botDefend,
  buildDeck,
  finalOutcome,
  resolveRound,
  shuffle,
  type Bet,
  type Card,
  type PlayerState,
} from "@/lib/game";
import { addMatch, getProfile } from "@/lib/profile";

export const Route = createFileRoute("/gioca")({
  validateSearch: (search: Record<string, unknown>): { avversario?: string } =>
    typeof search["avversario"] === "string" && search["avversario"]
      ? { avversario: search["avversario"] }
      : {},
  head: () => ({
    meta: [
      { title: "Partita a due — The Gun Game" },
      {
        name: "description",
        content:
          "Gioca a The Gun Game contro il bot o un amico: scommetti, riempi i caricatori e usa la carta The Gun per il K.O.",
      },
      { property: "og:title", content: "Partita a due — The Gun Game" },
      {
        property: "og:description",
        content: "Il tavolo di The Gun Game con caricatore, chat e carta The Gun.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gioca,
});

type Phase = "choose" | "anim" | "gunPick" | "defend" | "reveal" | "over";

type Reveal = {
  mine?: Card | undefined;
  theirs?: Card | undefined;
  myBet?: Bet | undefined;
  theirBet?: Bet | undefined;
  myDelta?: number | undefined;
  theirDelta?: number | undefined;
  text: string;
};

const botLines = [
  "Sei sicuro di quella carta?",
  "Ho un brutto presentimento per te…",
  "Il mio caricatore si sta riempiendo.",
  "Attento a The Gun 😏",
  "Bella giocata!",
  "Questa la ricorderai.",
];

let mid = 0;
const msgId = () => `m${++mid}`;

const total = (p: PlayerState) => p.magazines * 6 + p.shots;

function BetTag({ bet, delta }: { bet?: Bet | undefined; delta?: number | undefined }) {
  if (!bet) return null;
  const win = bet === "win";
  return (
    <div className="mt-2 animate-[popTag_.35s_ease-out_both] space-y-1">
      <p
        className={`text-[10px] font-black uppercase leading-tight tracking-wider ${
          win ? "text-emerald-400" : "text-primary"
        }`}
      >
        ha dichiarato
        <br />
        di {win ? "vincere" : "perdere"}
      </p>
      {delta !== undefined && (
        <p
          className={`text-lg font-black ${
            delta > 0 ? "text-emerald-400" : delta < 0 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "0"}
        </p>
      )}
    </div>
  );
}

function Gioca() {
  const navigate = useNavigate();
  const { avversario } = Route.useSearch();
  const oppName = avversario ?? "Bot Sniper";

  const [me, setMe] = useState<PlayerState>({ name: "Tu", hand: [], magazines: 0, shots: 0 });
  const [bot, setBot] = useState<PlayerState>({ name: oppName, hand: [], magazines: 0, shots: 0 });
  const [deck, setDeck] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("choose");
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [chamber, setChamber] = useState<number | null>(null);
  const [gunBy, setGunBy] = useState<"me" | "bot" | null>(null);
  const [shot, setShot] = useState<{ attackerIsMe: boolean; hit: boolean; chamber: number } | null>(
    null,
  );
  const [over, setOver] = useState<{ result: "win" | "lose" | "draw"; byGun: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askExit, setAskExit] = useState(false);
  const botMove = useRef<{ card: Card; bet: Bet; chamber?: number } | null>(null);
  const firstDrawer = useRef<"me" | "bot">("me");

  const sys = (text: string) => setMessages((m) => [...m, { id: msgId(), from: "system", text }]);

  const startGame = useCallback(() => {
    const d = buildDeck();
    const profile = getProfile();
    const myHand = d.splice(0, 3);
    const botHand = d.splice(0, 3);
    setDeck(d);
    setMe({ name: profile.name, hand: myHand, magazines: 0, shots: 0 });
    setBot({ name: oppName, hand: botHand, magazines: 0, shots: 0 });
    setSelected(null);
    setReveal(null);
    setChamber(null);
    setGunBy(null);
    setShot(null);
    setOver(null);
    setMessages([]);
    botMove.current = null;
    setPhase("choose");
  }, [oppName]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const endGame = (result: "win" | "lose" | "draw", byGun: boolean, mag: number, oppMag: number) => {
    setOver({ result, byGun });
    setPhase("over");
    addMatch({ opponent: oppName, result, byGun, magazines: mag, oppMagazines: oppMag });
  };

  const refill = (
    d: Card[],
    myHand: Card[],
    botHand: Card[],
    winner: "me" | "bot" | null,
  ): { deck: Card[]; myHand: Card[]; botHand: Card[] } => {
    const deckCopy = [...d];
    const first = winner ?? firstDrawer.current;
    if (winner) firstDrawer.current = winner;
    const order: ("me" | "bot")[] = first === "me" ? ["me", "bot"] : ["bot", "me"];
    const hands = { me: [...myHand], bot: [...botHand] };
    for (const who of order) {
      while (hands[who].length < 3 && deckCopy.length > 0) {
        hands[who].push(deckCopy.shift()!);
      }
    }
    return { deck: deckCopy, myHand: hands.me, botHand: hands.bot };
  };

  const resolveWithBot = (myCard: Extract<Card, { kind: "num" }>, bet: Bet) => {
    const mv = botMove.current!;
    const botCard = mv.card as Extract<Card, { kind: "num" }>;
    const res = resolveRound(me, bot, myCard, botCard, bet, mv.bet);
    const myHand = me.hand.filter((c) => c.id !== myCard.id);
    const botHand = bot.hand.filter((c) => c.id !== botCard.id);
    let newDeck = deck;
    let winner: "me" | "bot" | null = null;
    if (myCard.value === botCard.value) {
      // carte uguali: rimosse definitivamente dalla partita
      newDeck = shuffle(deck);
    } else {
      winner = res.winner === 0 ? "me" : "bot";
    }
    const r = refill(newDeck, myHand, botHand, winner);
    setMe({ ...res.a, hand: r.myHand });
    setBot({ ...res.b, hand: r.botHand });
    setDeck(r.deck);
    setReveal({
      mine: myCard,
      theirs: botCard,
      myBet: bet,
      theirBet: mv.bet,
      myDelta: total(res.a) - total(me),
      theirDelta: total(res.b) - total(bot),
      text: res.text,
    });
    sys(res.text);
    setSelected(null);
    botMove.current = null;
    setPhase("reveal");
  };

  const confirmPlay = (bet: Bet) => {
    const myCard = me.hand.find((c) => c.id === selected);
    if (!myCard || myCard.kind === "gun") return;
    if (!botMove.current) botMove.current = botChoose(bot.hand);
    const mv = botMove.current;

    setReveal({ mine: myCard, myBet: bet, text: `${oppName} sta pensando…` });
    setPhase("anim");

    window.setTimeout(() => {
      if (mv.card.kind === "gun") {
        // l'avversario risponde con THE GUN: la mia carta torna in mano
        setGunBy("bot");
        setChamber(mv.chamber ?? 1);
        setReveal({ theirs: mv.card, text: `${oppName} gioca THE GUN! Difenditi con una carta.` });
        sys(`${oppName} gioca THE GUN! Difenditi con una carta.`);
        setSelected(null);
        setPhase("defend");
        return;
      }
      resolveWithBot(myCard, bet);
    }, 1000);
  };

  // avanzamento automatico dopo la rivelazione
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = window.setTimeout(() => nextRound(), 2800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reveal]);

  const finishGunAttack = (attackerIsMe: boolean, hit: boolean, chamberNum: number) => {
    setShot({ attackerIsMe, hit, chamber: chamberNum });
  };

  const endShotScene = () => {
    const s = shot;
    setShot(null);
    if (s?.hit) endGame(s.attackerIsMe ? "win" : "lose", true, me.magazines, bot.magazines);
  };

  const pickChamber = (n: number) => {
    const gunCardInHand = me.hand.find((c) => c.id === selected);
    if (!gunCardInHand) return;
    const defense = botDefend(bot.hand);
    const hit = defense.kind === "num" && defense.value === n;
    const myHand = me.hand.filter((c) => c.id !== gunCardInHand.id);
    const botHand = bot.hand.filter((c) => c.id !== defense.id);
    const r = refill(deck, myHand, botHand, "me");
    setMe((p) => ({ ...p, hand: r.myHand }));
    setBot((p) => ({ ...p, hand: r.botHand }));
    setDeck(r.deck);
    setReveal({
      mine: gunCardInHand,
      theirs: defense,
      text: hit
        ? `Camera ${n}: colpo a segno! ${oppName} è eliminato.`
        : `Camera ${n}: ${oppName} schiva il proiettile. Nessun danno.`,
    });
    sys(hit ? "K.O.! The Gun ha colpito." : `${oppName} ha schivato il proiettile.`);
    setSelected(null);
    setGunBy(null);
    setChamber(null);
    botMove.current = null;
    setPhase("reveal");
    finishGunAttack(true, hit, n);
  };

  const defendWith = (card: Card) => {
    const mv = botMove.current;
    const secret = mv?.chamber ?? chamber ?? 1;
    const hit = card.kind === "num" && card.value === secret;
    const myHand = me.hand.filter((c) => c.id !== card.id);
    const botHand = bot.hand.filter((c) => c.id !== mv?.card.id);
    const r = refill(deck, myHand, botHand, "bot");
    setMe((p) => ({ ...p, hand: r.myHand }));
    setBot((p) => ({ ...p, hand: r.botHand }));
    setDeck(r.deck);
    setReveal({
      mine: card,
      theirs: mv?.card,
      text: hit
        ? `La camera segreta era ${secret}: sei stato colpito!`
        : `La camera segreta era ${secret}: hai schivato il proiettile.`,
    });
    sys(hit ? "Sei stato colpito da The Gun." : "Hai schivato il proiettile!");
    setSelected(null);
    setGunBy(null);
    setChamber(null);
    botMove.current = null;
    setPhase("reveal");
    finishGunAttack(false, hit, secret);
  };

  const nextRound = () => {
    if (over || shot) return;
    setReveal(null);
    if (deck.length === 0) {
      const out = finalOutcome(me, bot);
      endGame(out === "a" ? "win" : out === "b" ? "lose" : "draw", false, me.magazines, bot.magazines);
      return;
    }
    setPhase("choose");
  };

  const abandon = () => {
    addMatch({
      opponent: oppName,
      result: "lose",
      byGun: false,
      magazines: me.magazines,
      oppMagazines: bot.magazines,
    });
    navigate({ to: "/" });
  };

  const sendMessage = (text: string) => {
    setMessages((m) => [...m, { id: msgId(), from: "me", text }]);
    window.setTimeout(
      () =>
        setMessages((m) => [
          ...m,
          { id: msgId(), from: "them", text: botLines[Math.floor(Math.random() * botLines.length)]! },
        ]),
      900,
    );
  };

  const selCard = me.hand.find((c) => c.id === selected);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="The Gun Game" className="h-8 w-8 object-contain" />
          <span className="text-xs font-black tracking-widest text-foreground">PARTITA IN CORSO</span>
        </div>
        <button
          onClick={() => setAskExit(true)}
          className="rounded-md border-2 border-foreground/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 hover:border-primary hover:text-primary"
        >
          Abbandona
        </button>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {/* Avversario */}
          <div className="flex items-start gap-4 rounded-lg border border-foreground/10 bg-card/60 p-3">
            <MagazineBar shots={bot.shots} magazines={bot.magazines} label={bot.name} compact />
            <div className="flex flex-1 justify-center gap-2">
              {bot.hand.map((c) => (
                <div key={c.id} className="w-16 transition-all duration-300 sm:w-20">
                  <CardView card={c} faceDown />
                </div>
              ))}
            </div>
          </div>

          {/* Tavolo */}
          <div className="relative flex min-h-56 items-center justify-center gap-8 rounded-lg border border-foreground/10 bg-[radial-gradient(circle,rgba(220,38,38,0.12),transparent_70%)] p-4">
            <div className="text-center">
              <div className="w-20">
                <img
                  src={cardBack}
                  alt="Mazzo di pesca"
                  className="aspect-[3/4] w-full rounded-lg border-2 border-foreground/20 object-cover"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{deck.length} carte</p>
            </div>

            {reveal ? (
              <div className="flex items-start gap-8">
                <div className="w-20 animate-[playFromBottom_.45s_ease-out_both] text-center">
                  {reveal.mine ? <CardView card={reveal.mine} /> : null}
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">Tu</p>
                  <BetTag bet={reveal.myBet} delta={reveal.myDelta} />
                </div>
                <div className="w-20 animate-[playFromTop_.45s_ease-out_both] text-center">
                  {reveal.theirs ? <CardView card={reveal.theirs} /> : <CardView faceDown />}
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">{bot.name}</p>
                  <BetTag bet={reveal.theirBet} delta={reveal.theirDelta} />
                </div>
              </div>
            ) : (
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Scegli una carta e dichiara se vuoi Vincere o Perdere.
              </p>
            )}
          </div>

          {reveal?.text && (
            <p className="animate-[popTag_.3s_ease-out_both] rounded-lg border border-primary/30 bg-primary/10 p-3 text-center text-sm">
              {reveal.text}
            </p>
          )}

          {/* La mia zona */}
          <div className="flex items-end gap-4 rounded-lg border border-foreground/10 bg-card/60 p-3">
            <MagazineBar shots={me.shots} magazines={me.magazines} label={me.name} />
            <div className="flex flex-1 items-end justify-center gap-3 pt-8">
              {me.hand.map((c) => (
                <div key={c.id} className="w-20 sm:w-24">
                  <CardView
                    card={c}
                    lifted={selected === c.id}
                    onClick={() => {
                      if (phase === "choose") setSelected(c.id);
                      else if (phase === "defend") defendWith(c);
                    }}
                    disabled={phase !== "choose" && phase !== "defend"}
                  />
                </div>
              ))}
            </div>
          </div>

          {phase === "defend" && (
            <p className="text-center text-sm font-bold uppercase tracking-widest text-primary">
              Scegli una carta per difenderti da THE GUN
            </p>
          )}

          {phase === "choose" && selCard && (
            <div className="flex animate-[popTag_.3s_ease-out_both] justify-center gap-3">
              {selCard.kind === "gun" ? (
                <button
                  onClick={() => setPhase("gunPick")}
                  className="rounded-md bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105"
                >
                  Gioca THE GUN
                </button>
              ) : (
                <>
                  <button
                    onClick={() => confirmPlay("win")}
                    className="rounded-md bg-emerald-600 px-6 py-3 font-black uppercase tracking-widest text-white transition-transform hover:scale-105"
                  >
                    Dichiaro: Vincere
                  </button>
                  <button
                    onClick={() => confirmPlay("lose")}
                    className="rounded-md bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105"
                  >
                    Dichiaro: Perdere
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="h-80 lg:h-[42rem]">
          <ChatPanel messages={messages} onSend={sendMessage} opponent={bot.name} />
        </div>
      </main>

      {phase === "gunPick" && !gunBy && <GunLoader3D onConfirm={pickChamber} />}

      {askExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-6">
          <div className="w-full max-w-sm animate-[popTag_.25s_ease-out_both] rounded-xl border-2 border-primary/40 bg-card p-6 text-center">
            <p className="text-lg font-black uppercase tracking-widest">
              Vuoi davvero uscire dalla partita?
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              La partita verrà registrata come persa.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={abandon}
                className="rounded-md bg-primary px-6 py-2.5 font-black uppercase tracking-widest text-primary-foreground"
              >
                Sì
              </button>
              <button
                onClick={() => setAskExit(false)}
                className="rounded-md border-2 border-foreground/25 px-6 py-2.5 font-black uppercase tracking-widest"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {shot && (
        <GunFire3D
          attackerIsMe={shot.attackerIsMe}
          hit={shot.hit}
          chamber={shot.chamber}
          onDone={endShotScene}
        />
      )}
      {over && !shot && <EndOverlay result={over.result} byGun={over.byGun} onRestart={startGame} />}
    </div>
  );
}
