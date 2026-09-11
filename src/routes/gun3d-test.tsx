import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GunFire3D, GunLoader3D } from "@/components/game/Gun3D";

export const Route = createFileRoute("/gun3d-test")({ component: T });

function T() {
  const [n, setN] = useState<number | null>(null);
  return n === null ? <GunLoader3D onConfirm={setN} /> : <GunFire3D attackerIsMe hit chamber={n} onDone={() => {}} />;
}
