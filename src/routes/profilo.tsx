import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/game/Nav";
import { avatars, getProfile, saveProfile } from "@/lib/profile";

export const Route = createFileRoute("/profilo")({
  head: () => ({
    meta: [
      { title: "Il tuo profilo — The Gun Game" },
      {
        name: "description",
        content: "Scegli il tuo nome, la tua foto e il tuo avatar da tavolo per giocare a The Gun Game.",
      },
      { property: "og:title", content: "Il tuo profilo — The Gun Game" },
      { property: "og:description", content: "Nome, foto e avatar del giocatore di The Gun Game." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profilo,
});

const isPhoto = (a: string) => a.startsWith("data:");

function Profilo() {
  const [name, setName] = useState("Giocatore");
  const [avatar, setAvatar] = useState("🎯");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getProfile();
    setName(p.name);
    setAvatar(p.avatar);
  }, []);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        setAvatar(canvas.toDataURL("image/jpeg", 0.85));
        setSaved(false);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-md space-y-6 px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight">Profilo</h1>
        <div className="flex items-center gap-4 rounded-lg border border-foreground/10 bg-card p-5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-4xl">
            {isPhoto(avatar) ? (
              <img src={avatar} alt="La tua foto profilo" className="h-full w-full object-cover" />
            ) : (
              avatar
            )}
          </div>
          <div>
            <p className="text-xl font-black">{name || "Senza nome"}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pistolero</p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Nome
          </span>
          <input
            value={name}
            maxLength={16}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-md border border-foreground/20 bg-card px-3 py-2 outline-none focus:border-primary"
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Foto profilo
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-md border-2 border-foreground/20 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary"
          >
            Carica una foto
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Oppure un avatar
          </span>
          <div className="flex flex-wrap gap-2">
            {avatars.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAvatar(a);
                  setSaved(false);
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-2xl transition-transform hover:scale-105 ${
                  avatar === a ? "border-primary bg-primary/15" : "border-foreground/15"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            saveProfile({ name: name.trim() || "Giocatore", avatar });
            setSaved(true);
          }}
          className="w-full rounded-md bg-primary py-3 font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Salva profilo
        </button>
        {saved && <p className="text-center text-sm text-primary">Profilo salvato!</p>}
      </main>
    </div>
  );
}
