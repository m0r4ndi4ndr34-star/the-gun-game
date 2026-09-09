export type Profile = { name: string; avatar: string };

export type MatchRecord = {
  id: string;
  date: string;
  opponent: string;
  result: "win" | "lose" | "draw";
  byGun: boolean;
  magazines: number;
  oppMagazines: number;
};

export type Friend = { id: string; name: string; avatar: string };

const PROFILE_KEY = "tgg.profile";
const HISTORY_KEY = "tgg.history";
const FRIENDS_KEY = "tgg.friends";

const isBrowser = () => typeof window !== "undefined";

export const avatars = ["🎯", "💀", "🔫", "🃏", "🐺", "🦅", "🎖️", "🕶️"];

export function getProfile(): Profile {
  if (!isBrowser()) return { name: "Giocatore", avatar: "🎯" };
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch {
    /* ignore */
  }
  return { name: "Giocatore", avatar: "🎯" };
}

export function saveProfile(p: Profile) {
  if (isBrowser()) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getHistory(): MatchRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as MatchRecord[];
  } catch {
    return [];
  }
}

export function addMatch(m: Omit<MatchRecord, "id" | "date">) {
  if (!isBrowser()) return;
  const list = getHistory();
  list.unshift({ ...m, id: crypto.randomUUID(), date: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
}

export function getFriends(): Friend[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? "[]") as Friend[];
  } catch {
    return [];
  }
}

export function addFriend(name: string, avatar: string) {
  if (!isBrowser()) return;
  const list = getFriends();
  list.push({ id: crypto.randomUUID(), name, avatar });
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(list));
}

export function removeFriend(id: string) {
  if (!isBrowser()) return;
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(getFriends().filter((f) => f.id !== id)));
}
