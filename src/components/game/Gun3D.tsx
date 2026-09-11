import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Materiali condivisi                                                 */
/* ------------------------------------------------------------------ */

const STEEL = { color: "#2b2e33", metalness: 0.95, roughness: 0.3 } as const;
const STEEL_DARK = { color: "#17191c", metalness: 0.9, roughness: 0.45 } as const;
const BRASS = { color: "#c9922f", metalness: 1, roughness: 0.22 } as const;
const LEAD = { color: "#b4643a", metalness: 0.85, roughness: 0.35 } as const;

/** posizione della camera i (1..6): 1 in alto, poi in senso orario */
function chamberPos(i: number, r = 1.15): [number, number] {
  const a = ((i - 1) * Math.PI) / 3;
  return [Math.sin(a) * r, -Math.cos(a) * r];
}

/* ------------------------------------------------------------------ */
/* Pezzi                                                               */
/* ------------------------------------------------------------------ */

/** Proiettile: bossolo (ottone) + punta (ramata) */
function Bullet({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.52, 24]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.175, 0.17, 0.05, 24]} />
        <meshStandardMaterial color="#8a6420" metalness={1} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[0.165, 0.32, 24]} />
        <meshStandardMaterial {...LEAD} />
      </mesh>
    </group>
  );
}

/** Pistola vista dall'alto, punta verso -Z */
function Pistol({ slide = 0 }: { slide?: number }) {
  return (
    <group>
      {/* carrello */}
      <group position={[0, 0.28, slide]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.34, 2.3]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0, 0.1, -0.4]}>
          <boxGeometry args={[0.2, 0.2, 1.4]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        {/* rigature carrello */}
        {[0.55, 0.7, 0.85].map((z) => (
          <mesh key={z} position={[0, 0.18, z]}>
            <boxGeometry args={[0.64, 0.04, 0.05]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ))}
      </group>
      {/* canna */}
      <mesh position={[0, 0.28, -1.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.55, 24]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
      {/* fusto */}
      <mesh position={[0, 0.08, 0.35]}>
        <boxGeometry args={[0.56, 0.22, 1.5]} />
        <meshStandardMaterial color="#232529" metalness={0.7} roughness={0.6} />
      </mesh>
      {/* impugnatura */}
      <mesh position={[0, -0.02, 1.15]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.5, 0.3, 1.05]} />
        <meshStandardMaterial color="#1b1c1f" metalness={0.4} roughness={0.85} />
      </mesh>
      {/* ponticello */}
      <mesh position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 10, 24, Math.PI]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
    </group>
  );
}

/** Caricatore metallico a 6 camere, visto dall'alto */
function MagazineBlock({
  loaded,
  hover,
  onPick,
  bulletY,
}: {
  loaded: number | null;
  hover?: number | null;
  onPick?: (n: number) => void;
  bulletY: number;
}) {
  return (
    <group>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.7, 48]} />
        <meshStandardMaterial color="#33373d" metalness={0.95} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <torusGeometry args={[1.68, 0.06, 12, 48]} />
        <meshStandardMaterial color="#0e0f11" metalness={0.9} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#0b0c0d" metalness={0.9} roughness={0.6} />
      </mesh>

      {[1, 2, 3, 4, 5, 6].map((n) => {
        const [x, z] = chamberPos(n);
        const active = loaded === n;
        return (
          <group key={n} position={[x, 0, z]}>
            {/* foro camera */}
            <mesh
              position={[0, 0.2, 0]}
              onClick={() => onPick?.(n)}
              onPointerOver={() => {
                if (onPick) document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >

              <cylinderGeometry args={[0.32, 0.32, 0.42, 28]} />
              <meshStandardMaterial
                color={active ? "#5a1414" : hover === n ? "#4a4f57" : "#101113"}
                metalness={0.9}
                roughness={0.5}
              />
            </mesh>
            {active && (
              <group position={[0, bulletY, 0]}>
                <Bullet />
              </group>
            )}
            <Text
              position={[0, 0.45, 0.52]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.26}
              color={active ? "#ff5252" : "#c9ccd2"}
              anchorX="center"
              anchorY="middle"
            >
              {String(n)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scena: caricamento del colpo                                        */
/* ------------------------------------------------------------------ */

function LoadScene({
  picked,
  confirmed,
  onPick,
  onReady,
}: {
  picked: number | null;
  confirmed: boolean;
  onPick: (n: number) => void;
  onReady: () => void;
}) {

  const magRef = useRef<THREE.Group>(null);
  const gunRef = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  const done = useRef(false);
  const [bulletY, setBulletY] = useState(2.6);
  const dropStart = useRef<number | null>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // discesa del proiettile nella camera
    if (picked !== null) {
      if (dropStart.current === null) dropStart.current = state.clock.elapsedTime;
      setBulletY((y) => y + (0.35 - y) * (1 - Math.exp(-4 * dt)));
    } else {
      dropStart.current = null;
      if (bulletY !== 2.6) setBulletY(2.6);
    }

    if (!confirmed) return;
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;

    // il caricatore scende verso la pistola e vi entra
    if (magRef.current) {
      const p = Math.min(1, t / 2.2);
      const e = 1 - Math.pow(1 - p, 3);
      magRef.current.position.z = -0.6 + e * 3.1;
      magRef.current.position.y = e * -0.9;
      magRef.current.scale.setScalar(1 - e * 0.45);
      const m = magRef.current.children[0] as THREE.Mesh | undefined;
      if (m) void m;
    }
    if (gunRef.current) {
      const p = Math.min(1, Math.max(0, (t - 1.6) / 1.4));
      const e = 1 - Math.pow(1 - p, 3);
      gunRef.current.position.y = -0.4 + e * 0.4;
      gunRef.current.position.z = 2.6 - e * 1.4;
      const s = 0.9 + e * 0.35;
      gunRef.current.scale.setScalar(s);
      gunRef.current.rotation.z = Math.sin(t * 1.5) * 0.01;
    }
    if (t > 3.4 && !done.current) {
      done.current = true;
      onReady();
    }
  });

  return (
    <>
      <group ref={magRef} position={[0, 0, -0.6]}>
        <MagazineBlock loaded={picked} bulletY={bulletY} />
      </group>
      <group ref={gunRef} position={[0, -0.4, 2.6]} scale={0.9} visible={confirmed}>
        <Pistol />
      </group>
    </>
  );
}

/** Overlay 3D: scegli la camera, inserisci il colpo, il caricatore entra nella pistola */
export function GunLoader3D({ onConfirm }: { onConfirm: (n: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const fired = useRef(false);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/92">
      <p className="pt-6 text-center text-lg font-black uppercase tracking-widest text-primary">
        {confirmed ? "Pistola pronta" : "Scegli la camera con il proiettile"}
      </p>
      <div className="relative h-[60vh] w-full max-w-3xl">
        <Canvas shadows camera={{ position: [0, 8.5, 0.6], fov: 42 }} dpr={[1, 2]}>
          <color attach="background" args={["#0a0a0b"]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[3, 9, 2]} angle={0.7} penumbra={0.6} intensity={90} castShadow />
          <pointLight position={[-4, 4, -3]} intensity={30} color="#ff4444" />
          <Environment>
            <Lightformer intensity={2} position={[0, 6, 0]} scale={[8, 8, 1]} rotation-x={Math.PI / 2} />
            <Lightformer intensity={1.2} color="#88aacc" position={[-5, 3, 0]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
          </Environment>
          <LoadScene
            picked={picked}
            confirmed={confirmed}
            onReady={() => {
              if (fired.current || picked === null) return;
              fired.current = true;
              onConfirm(picked);
            }}
          />
        </Canvas>
      </div>
      <div className="flex h-24 flex-col items-center gap-3">
        {!confirmed && (
          <>
            <p className="text-xs text-muted-foreground">
              La camera 1 è in alto, poi in senso orario fino alla 6.
            </p>
            <button
              disabled={picked === null}
              onClick={() => setConfirmed(true)}
              className="rounded-md bg-primary px-8 py-3 font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105 disabled:opacity-30"
            >
              {picked === null ? "Scegli una camera" : `Carica la camera ${picked}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scena: sparo                                                        */
/* ------------------------------------------------------------------ */

function FireScene({ hit, onDone }: { hit: boolean; onDone: () => void }) {
  const t0 = useRef<number | null>(null);
  const done = useRef(false);
  const gun = useRef<THREE.Group>(null);
  const slide = useRef<THREE.Group>(null);
  const bullet = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const spark = useRef<THREE.Group>(null);
  const cards = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);

  const puffs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: (Math.random() - 0.5) * 0.5,
        z: -0.3 - Math.random() * 0.6,
        s: 0.25 + Math.random() * 0.25,
        d: i * 0.06,
      })),
    [],
  );

  const FIRE_AT = 1.1;
  const TRAVEL = 1.3;

  useFrame((state) => {
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;

    // rinculo / carrello
    const sinceFire = t - FIRE_AT;
    if (slide.current) {
      const s = sinceFire > 0 && sinceFire < 0.5 ? Math.sin((sinceFire / 0.5) * Math.PI) * 0.45 : 0;
      slide.current.position.z = s;
    }
    if (gun.current) {
      const r = sinceFire > 0 && sinceFire < 0.6 ? Math.sin((sinceFire / 0.6) * Math.PI) * 0.22 : 0;
      gun.current.position.z = 3.4 + r;
      gun.current.rotation.x = -r * 0.12;
    }

    // lampo
    const fl = sinceFire > 0 && sinceFire < 0.22 ? 1 - sinceFire / 0.22 : 0;
    if (flash.current) {
      flash.current.visible = hit && fl > 0;
      flash.current.scale.setScalar(0.4 + fl * 1.5);
      (flash.current.material as THREE.MeshBasicMaterial).opacity = fl;
    }
    if (light.current) light.current.intensity = hit ? fl * 120 : 0;

    // fumo
    if (smoke.current) {
      smoke.current.visible = hit && sinceFire > 0;
      smoke.current.children.forEach((c, i) => {
        const p = Math.max(0, Math.min(1, (sinceFire - (puffs[i]?.d ?? 0)) / 1.6));
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        c.scale.setScalar((puffs[i]?.s ?? 0.3) * (0.4 + p * 3));
        c.position.z = (puffs[i]?.z ?? 0) - p * 1.2;
        c.position.y = 0.3 + p * 0.5;
        m.opacity = Math.max(0, 0.42 * (1 - p));
      });
    }

    // proiettile
    const bp = Math.max(0, Math.min(1, sinceFire / TRAVEL));
    if (bullet.current) {
      bullet.current.visible = hit && sinceFire > 0 && bp < 1;
      bullet.current.position.z = 2.4 - bp * 6.2;
      bullet.current.rotation.z += 0.25;
    }

    // impatto
    const impact = sinceFire - TRAVEL;
    if (spark.current) {
      const p = hit && impact > 0 && impact < 0.7 ? 1 - impact / 0.7 : 0;
      spark.current.visible = p > 0;
      spark.current.scale.setScalar(0.3 + (1 - p) * 2.4);
      spark.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = p;
      });
    }
    if (cards.current) {
      const p = hit && impact > 0 ? Math.min(1, impact / 0.8) : 0;
      cards.current.position.z = -3.6 - p * 0.9;
      cards.current.rotation.x = -p * 0.9;
      cards.current.position.y = p * 0.4;
    }

    if (!done.current && t > (hit ? 4.2 : 2.6)) {
      done.current = true;
      onDone();
    }
  });

  return (
    <>
      {/* tavolo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#141416" metalness={0.2} roughness={0.9} />
      </mesh>

      <group ref={gun} position={[0, 0, 3.4]}>
        <group ref={slide}>
          <Pistol />
        </group>
        <mesh ref={flash} position={[0, 0.28, -1.75]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial color="#ffb648" transparent opacity={0} />
        </mesh>
        <pointLight ref={light} position={[0, 0.6, -1.9]} color="#ffa53a" distance={12} intensity={0} />
        <group ref={smoke} position={[0, 0, -1.8]}>
          {puffs.map((p, i) => (
            <mesh key={i} position={[p.x, 0.3, p.z]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color="#9aa0a8" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>

      <group ref={bullet} position={[0, 0.28, 2.4]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <Bullet scale={0.9} />
      </group>

      <group ref={spark} position={[0, 0.3, -3.1]} visible={false}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.5, Math.sin(a) * 0.2, Math.sin(a) * 0.5]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshBasicMaterial color="#ffd27a" transparent opacity={0} />
            </mesh>
          );
        })}
      </group>

      {/* carte dell'avversario */}
      <group ref={cards} position={[0, 0, -3.6]}>
        {[-1.1, 0, 1.1].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.95, 1.35, 0.06]} />
            <meshStandardMaterial color="#7d1015" metalness={0.15} roughness={0.75} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** Overlay 3D dello sparo: colpo a segno oppure clic a vuoto */
export function GunFire3D({
  attackerIsMe,
  hit,
  chamber,
  onDone,
}: {
  attackerIsMe: boolean;
  hit: boolean;
  chamber: number;
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setLabel(hit ? "BANG!" : "CLIC… a vuoto"), 1200);
    return () => window.clearTimeout(t);
  }, [hit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
      <p className="pt-4 text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
        Camera {chamber} · {attackerIsMe ? "il tuo colpo" : "colpo dell'avversario"}
      </p>
      <div className="h-[65vh] w-full max-w-3xl">
        <Canvas shadows camera={{ position: [0, 9, 0.8], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={["#08080a"]} />
          <ambientLight intensity={0.45} />
          <spotLight position={[2, 10, 3]} angle={0.8} penumbra={0.7} intensity={110} castShadow />
          <pointLight position={[-5, 4, -4]} intensity={25} color="#ff3b3b" />
          <Environment>
            <Lightformer intensity={1.6} position={[0, 6, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
            <Lightformer intensity={1} color="#7fa8d8" position={[-6, 3, 0]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} />
          </Environment>
          <group rotation={[0, attackerIsMe ? 0 : Math.PI, 0]}>
            <FireScene hit={hit} onDone={onDone} />
          </group>
        </Canvas>
      </div>
      <p
        className={`h-12 text-3xl font-black tracking-[0.25em] ${
          hit ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
