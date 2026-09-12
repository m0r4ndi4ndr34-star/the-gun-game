// THE GUN GAME — motore di gioco (2 giocatori)

export type Bet = "win" | "lose";

export type Card =
  | { id: string; kind: "num"; value: number }
  | { id: string; kind: "gun" };

export type PlayerState = {
  name: string;
  hand: Card[];
  magazines: number; // caricatori completati
  shots: number; // colpi nel caricatore corrente (0-5)
};

export type Side = 0 | 1;

export type RoundResult = {
  text: string;
  koBy?: Side;
};

let seq = 0;
const nid = () => `c${++seq}`;

export function buildDeck(): Card[] {
  const counts = [5, 9, 11, 11, 9, 5]; // valori 1..6 => 50 carte
  const deck: Card[] = [];
  counts.forEach((n, i) => {
    for (let k = 0; k < n; k++) deck.push({ id: nid(), kind: "num", value: i + 1 });
  });
  deck.push({ id: nid(), kind: "gun" });
  deck.push({ id: nid(), kind: "gun" });
  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

export function addShots(p: PlayerState, n: number): PlayerState {
  let shots = p.shots + n;
  let magazines = p.magazines;
  while (shots >= 6) {
    shots -= 6;
    magazines += 1;
  }
  return { ...p, shots, magazines };
}

export function removeShots(p: PlayerState, n: number): PlayerState {
  // mai sotto lo 0 del caricatore corrente; i caricatori completi sono al sicuro
  return { ...p, shots: Math.max(0, p.shots - n) };
}

export function resolveRound(
  a: PlayerState,
  b: PlayerState,
  aCard: { value: number },
  bCard: { value: number },
  aBet: Bet,
  bBet: Bet,
): { a: PlayerState; b: PlayerState; winner: Side | null; text: string } {
  if (aCard.value === bCard.value) {
    return {
      a,
      b,
      winner: null,
      text: "Pareggio! Round annullato: le due carte sono rimosse definitivamente dalla partita.",
    };
  }
  const aWon = aCard.value > bCard.value;
  const diff = Math.abs(aCard.value - bCard.value);
  const lines: string[] = [];

  const apply = (p: PlayerState, bet: Bet, won: boolean, own: number): PlayerState => {
    if (bet === "win" && won) {
      lines.push(`${p.name}: dichiara VINCERE e vince → +${own} colpi.`);
      return addShots(p, own);
    }
    if (bet === "lose" && !won) {
      lines.push(`${p.name}: dichiara PERDERE e perde → +1 colpo.`);
      return addShots(p, 1);
    }
    if (bet === "win" && !won) {
      lines.push(`${p.name}: dichiara VINCERE ma perde → caricatore corrente azzerato.`);
      return { ...p, shots: 0 };
    }
    lines.push(`${p.name}: dichiara PERDERE ma vince → -${diff} colpi.`);
    return removeShots(p, diff);
  };

  const na = apply(a, aBet, aWon, aCard.value);
  const nb = apply(b, bBet, !aWon, bCard.value);
  return { a: na, b: nb, winner: aWon ? 0 : 1, text: lines.join(" ") };
}

export function finalOutcome(a: PlayerState, b: PlayerState): "a" | "b" | "draw" {
  if (a.magazines !== b.magazines) return a.magazines > b.magazines ? "a" : "b";
  if (a.shots !== b.shots) return a.shots > b.shots ? "a" : "b";
  return "draw";
}

// --- Bot ---------------------------------------------------------------

export function botChoose(hand: Card[], difficulty = 1): {
  card: Card;
  bet: Bet;
  chamber?: number;
} {
  const gun = hand.find((c) => c.kind === "gun");
  const nums = hand.filter((c): c is Extract<Card, { kind: "num" }> => c.kind === "num");
  if (gun && (nums.length === 0 || Math.random() < 0.22 * difficulty)) {
    return { card: gun, bet: "win", chamber: 1 + Math.floor(Math.random() * 6) };
  }
  const sorted = [...nums].sort((x, y) => y.value - x.value);
  const high = sorted[0]!;
  const low = sorted[sorted.length - 1]!;
  // gioca alto dichiarando vincere se è davvero alto, altrimenti basso dichiarando perdere
  if (high.value >= 5 && Math.random() < 0.8) return { card: high, bet: "win" };
  if (low.value <= 2 && Math.random() < 0.75) return { card: low, bet: "lose" };
  return Math.random() < 0.5
    ? { card: high, bet: "win" }
    : { card: low, bet: "lose" };
}

export function botDefend(hand: Card[]): Card {
  const nums = hand.filter((c) => c.kind === "num");
  const pool = nums.length ? nums : hand;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
