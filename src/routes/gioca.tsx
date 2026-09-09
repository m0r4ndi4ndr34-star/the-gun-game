import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Nav } from "@/components/game/Nav";
import { CardView } from "@/components/game/CardView";
import { MagazineBar, MagazineWheel } from "@/components/game/Magazine";
import { ChatPanel, type ChatMessage } from "@/components/game/ChatPanel";
import { EndOverlay, GunShotOverlay } from "@/components/game/EndOverlay";
import { cardBack } from "@/lib/cards";
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

type Phase = "choose" | "gunPick" | "defend" | "reveal" | "over";

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

function Gioca() {
  const { avversario } = Route.useSearch();
  const oppName = avversario ?? "Bot Sniper";

  const [me, setMe] = useState<PlayerState>({ name: "Tu", hand: [], magazines: 0, shots: 0 });
  const [bot, setBot] = useState<PlayerState>({ name: oppName, hand: [], magazines: 0, shots: 0 });
  const [deck, setDeck] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("choose");
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ mine?: Card; theirs?: Card; text: string } | null>(null);
  const [chamber, setChamber] = useState<number | null>(null);
  const [gunBy, setGunBy] = useState<"me" | "bot" | null>(null);
  const [shot, setShot] = useState<{ attackerIsMe: boolean } | null>(null);
  const [over, setOver] = useState<{ result: "win" | "lose" | "draw"; byGun: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const botMove = useRef<{ card: Card; bet: Bet; chamber?: number } | null>(null);
  const firstDrawer = useRef<"me" | "bot">("me");

  const sys = (text: string) =>
    setMessages((m) => [...m, { id: msgId(), from: "system", text }]);

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

  // prepara la mossa del bot a inizio round
  useEffect(() => {
    if (phase !== "choose" || bot.hand.length === 0) return;
    if (botMove.current) return;
    const mv = botChoose(bot.hand);
    botMove.current = mv;
    if (mv.card.kind === "gun") {
      setGunBy("bot");
      setChamber(mv.chamber ?? 1);
      setPhase("defend");
      sys(`${oppName} gioca THE GUN! Difenditi con una carta.`);
    }
  }, [phase, bot.hand, oppName]);

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

  const confirmPlay = (bet: Bet) => {
    const myCard = me.hand.find((c) => c.id === selected);
    const mv = botMove.current;
    if (!myCard || !mv || mv.card.kind === "gun") return;

    if (myCard.kind === "gun") {
      setGunBy("me");
      setPhase("gunPick");
      return;
    }

    const botCard = mv.card;
    const res = resolveRound(me, bot, myCard, botCard, bet, mv.bet);
    const myHand = me.hand.filter((c) => c.id !== myCard.id);
    const botHand = bot.hand.filter((c) => c.id !== botCard.id);
    let newDeck = deck;
    let winner: "me" | "bot" | null = null;
    if (myCard.value === botCard.value) {
      newDeck = shuffle([...deck, myCard, botCard]);
    } else {
      winner = res.winner === 0 ? "me" : "bot";
    }
    const r = refill(newDeck, myHand, botHand, winner);
    setMe({ ...res.a, hand: r.myHand });
    setBot({ ...res.b, hand: r.botHand });
    setDeck(r.deck);
    setReveal({ mine: myCard, theirs: botCard, text: res.text });
    sys(res.text);
    setSelected(null);
    botMove.current = null;
    setPhase("reveal");
  };

  const finishGunAttack = (attackerIsMe: boolean, hit: boolean, nextState: () => void) => {
    if (hit) {
      setShot({ attackerIsMe });
      setTimeout(() => {
        setShot(null);
        endGame(attackerIsMe ? "win" : "lose", true, me.magazines, bot.magazines);
      }, 1800);
    } else {
      nextState();
    }
  };

  // io gioco THE GUN: scelgo la camera
  const pickChamber = (n: number) => {
    const gunCard = me.hand.find((c) => c.id === selected);
    if (!gunCard) return;
    const defense = botDefend(bot.hand);
    const hit = defense.kind === "num" && defense.value === n;
    const myHand = me.hand.filter((c) => c.id !== gunCard.id);
    const botHand = bot.hand.filter((c) => c.id !== defense.id);
    const r = refill(deck, myHand, botHand, "me");
    setMe((p) => ({ ...p, hand: r.myHand }));
    setBot((p) => ({ ...p, hand: r.botHand }));
    setDeck(r.deck);
    setReveal({
      mine: gunCard,
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
    finishGunAttack(true, hit, () => setPhase("reveal"));
    if (hit) setPhase("reveal");
  };

  // il bot gioca THE GUN: scelgo la carta difensiva
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
    finishGunAttack(false, hit, () => setPhase("reveal"));
    if (hit) setPhase("reveal");
  };

  const nextRound = () => {
    setReveal(null);
    if (deck.length === 0 && (me.hand.length === 0 || bot.hand.length === 0)) {
      const out = finalOutcome(me, bot);
      endGame(out === "a" ? "win" : out === "b" ? "lose" : "draw", false, me.magazines, bot.magazines);
      return;
    }
    if (deck.length === 0) {
      const out = finalOutcome(me, bot);
      endGame(out === "a" ? "win" : out === "b" ? "lose" : "draw", false, me.magazines, bot.magazines);
      return;
    }
    setPhase("choose");
  };

  const sendMessage = (text: string) => {
    setMessages((m) => [...m, { id: msgId(), from: "me", text }]);
    setTimeout(
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
      <Nav />
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {/* Avversario */}
          <div className="flex items-start gap-4 rounded-lg border border-foreground/10 bg-card/60 p-3">
            <MagazineBar
              shots={bot.shots}
              magazines={bot.magazines}
              label={bot.name}
              compact
            />
            <div className="flex flex-1 justify-center gap-2">
              {bot.hand.map((c) => (
                <div key={c.id} className="w-16 sm:w-20">
                  <CardView card={c} faceDown />
                </div>
              ))}
            </div>
          </div>

          {/* Tavolo */}
          <div className="relative flex min-h-52 items-center justify-center gap-8 rounded-lg border border-foreground/10 bg-[radial-gradient(circle,rgba(220,38,38,0.12),transparent_70%)] p-4">
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
              <div className="flex items-center gap-6">
                <div className="w-20 text-center">
                  <CardView card={reveal.mine} />
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">Tu</p>
                </div>
                <div className="w-20 text-center">
                  <CardView card={reveal.theirs} />
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">{bot.name}</p>
                </div>
              </div>
            ) : (
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                {phase === "defend"
                  ? `${bot.name} ha giocato THE GUN: scegli una carta per difenderti.`
                  : "Scegli una carta e dichiara se vuoi Vincere o Perdere."}
              </p>
            )}
          </div>

          {reveal && phase === "reveal" && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center text-sm">
              <p>{reveal.text}</p>
              <button
                onClick={nextRound}
                className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-widest text-primary-foreground"
              >
                Continua
              </button>
            </div>
          )}

          {/* La mia zona */}
          <div className="flex items-end gap-4 rounded-lg border border-foreground/10 bg-card/60 p-3">
            <MagazineBar shots={me.shots} magazines={me.magazines} label={me.name} />
            <div className="flex flex-1 items-end justify-center gap-3 pt-6">
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

          {phase === "choose" && selCard && (
            <div className="flex justify-center gap-3">
              {selCard.kind === "gun" ? (
                <button
                  onClick={() => setPhase("gunPick")}
                  className="rounded-md bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground"
                >
                  Gioca THE GUN
                </button>
              ) : (
                <>
                  <button
                    onClick={() => confirmPlay("win")}
                    className="rounded-md bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground"
                  >
                    Dichiaro: Vincere
                  </button>
                  <button
                    onClick={() => confirmPlay("lose")}
                    className="rounded-md border-2 border-foreground/30 px-6 py-3 font-black uppercase tracking-widest text-foreground"
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

      {phase === "gunPick" && gunBy === "me" && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/85 px-4">
          <p className="text-center text-lg font-black uppercase tracking-widest text-primary">
            Scegli la camera con il proiettile
          </p>
          <MagazineWheel onPick={pickChamber} />
          <p className="text-xs text-muted-foreground">
            1 in alto, poi in senso orario fino al 6.
          </p>
        </div>
      )}

      {shot && <GunShotOverlay attackerIsMe={shot.attackerIsMe} />}
      {over && !shot && (
        <EndOverlay result={over.result} byGun={over.byGun} onRestart={startGame} />
      )}
    </div>
  );
}
