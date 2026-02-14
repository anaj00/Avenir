import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { defaultDesignParams, type DesignParams } from "@shared/schema";

const FINISH_MATERIALS: Record<
  DesignParams["finish"],
  { color: string; roughness: number; metalness: number; accent: string }
> = {
  yellow_gold: { color: "#D4AF37", roughness: 0.2, metalness: 0.95, accent: "#F5DA7A" },
  white_gold: { color: "#E5E3DE", roughness: 0.16, metalness: 0.94, accent: "#F7F6F3" },
  rose_gold: { color: "#C78D7B", roughness: 0.22, metalness: 0.9, accent: "#E3B6AA" },
  silver: { color: "#C2CCD6", roughness: 0.18, metalness: 0.92, accent: "#E3E9EE" },
  platinum: { color: "#B9BEC8", roughness: 0.15, metalness: 0.96, accent: "#DBE0E9" },
};

function GemShape({
  shape,
  size,
  accent,
}: {
  shape: DesignParams["gemShape"];
  size: number;
  accent: string;
}) {
  if (shape === "princess") {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={accent} roughness={0.03} metalness={0.05} />
      </mesh>
    );
  }

  if (shape === "oval") {
    return (
      <mesh castShadow receiveShadow scale={[1.3, 1, 0.8]}>
        <sphereGeometry args={[size * 0.72, 24, 24]} />
        <meshStandardMaterial color={accent} roughness={0.03} metalness={0.05} />
      </mesh>
    );
  }

  if (shape === "marquise") {
    return (
      <mesh castShadow receiveShadow scale={[1.4, 0.8, 0.8]}>
        <octahedronGeometry args={[size * 0.72, 0]} />
        <meshStandardMaterial color={accent} roughness={0.03} metalness={0.05} />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[size * 0.7, 26, 26]} />
      <meshStandardMaterial color={accent} roughness={0.03} metalness={0.05} />
    </mesh>
  );
}

function ParametricRing({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  const finish = FINISH_MATERIALS[params.finish];

  const tubularSegments = useMemo(() => {
    if (params.profile === "court") return 220;
    if (params.profile === "comfort") return 180;
    return 140;
  }, [params.profile]);

  const depthScale = useMemo(
    () => Math.max(0.6, params.bandWidth / 0.18),
    [params.bandWidth],
  );

  const gemAngles = useMemo(() => {
    if (params.gemCount <= 0) return [] as number[];
    if (params.gemCount === 1) return [Math.PI / 2];

    const spread = Math.min(Math.PI * 0.75, params.gemCount * 0.18);
    const start = Math.PI / 2 - spread / 2;
    const step = spread / (params.gemCount - 1);
    return Array.from({ length: params.gemCount }, (_, index) => start + index * step);
  }, [params.gemCount]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.8) * (0.02 + params.twist * 0.02);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow scale={[1, 1, depthScale]}>
        <torusGeometry args={[params.bandRadius, params.bandThickness, 36, tubularSegments]} />
        <meshStandardMaterial
          color={finish.color}
          roughness={finish.roughness}
          metalness={finish.metalness}
          envMapIntensity={1.4}
        />
      </mesh>

      {params.engraving === "line" && (
        <mesh scale={[1, 1, depthScale * 1.02]}>
          <torusGeometry args={[params.bandRadius * 1.003, Math.max(0.007, params.bandThickness * 0.16), 20, 220]} />
          <meshStandardMaterial color={finish.accent} roughness={0.22} metalness={0.88} />
        </mesh>
      )}

      {params.engraving === "twist" && (
        <mesh rotation={[0, 0, Math.PI / 8 + params.twist * (Math.PI / 5)]} scale={[1, 1, depthScale * 0.9]}>
          <torusGeometry args={[params.bandRadius * 1.01, Math.max(0.01, params.bandThickness * 0.35), 24, 190]} />
          <meshStandardMaterial color={finish.accent} roughness={0.24} metalness={0.86} />
        </mesh>
      )}

      {(params.engraving === "dots" || params.engraving === "chevron") && (
        <group>
          {Array.from({ length: 28 }, (_, index) => {
            const angle = (index / 28) * Math.PI * 2;
            const radius = params.bandRadius + params.bandThickness * 0.42;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = 0;

            if (params.engraving === "dots") {
              return (
                <mesh key={`dot-${index}`} position={[x, y, z]} castShadow receiveShadow>
                  <sphereGeometry args={[Math.max(0.012, params.bandThickness * 0.17), 10, 10]} />
                  <meshStandardMaterial color={finish.accent} roughness={0.2} metalness={0.9} />
                </mesh>
              );
            }

            if (index % 2 !== 0) return null;

            return (
              <mesh key={`chevron-${index}`} position={[x, y, z]} rotation={[0, 0, angle + Math.PI / 4]} castShadow receiveShadow>
                <boxGeometry args={[Math.max(0.02, params.bandThickness * 0.2), Math.max(0.007, params.bandThickness * 0.08), Math.max(0.07, params.bandWidth * 0.55)]} />
                <meshStandardMaterial color={finish.accent} roughness={0.22} metalness={0.85} />
              </mesh>
            );
          })}
        </group>
      )}

      {gemAngles.map((angle, index) => {
        const surfaceRadius = params.bandRadius + params.bandThickness * 0.92;
        const x = Math.cos(angle) * surfaceRadius;
        const y = Math.sin(angle) * surfaceRadius;
        const z = 0;
        const seatHeight = Math.max(0.045, params.gemSize * 0.58);
        const lift = params.gemHeight * 0.25;
        const gemCenterY = seatHeight + params.gemSize * 0.55 + lift;
        const seatTopRadius = Math.max(0.014, params.gemSize * 0.22);
        const seatBottomRadius = Math.max(0.012, params.gemSize * 0.18);

        return (
          <group key={`gem-${index}`} position={[x, y, z]} rotation={[0, 0, angle - Math.PI / 2]}>
            <mesh position={[0, seatHeight / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[seatTopRadius, seatBottomRadius, seatHeight, 12]} />
              <meshStandardMaterial color={finish.color} roughness={finish.roughness} metalness={finish.metalness} />
            </mesh>

            <group position={[0, gemCenterY, 0]}>
              <GemShape shape={params.gemShape} size={params.gemSize} accent={finish.accent} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

export function ThreeViewer({
  modelUrl,
  params,
}: {
  modelUrl?: string | null;
  params?: DesignParams | null;
}) {
  const activeParams = params ?? defaultDesignParams;

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative">
      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/50 backdrop-blur rounded-full border border-white/10 text-xs text-muted-foreground pointer-events-none">
        {modelUrl ? "Interactive 3D Preview (Model)" : "Interactive 3D Preview (Parametric)"}
      </div>
      
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera={false}>
            <ParametricRing params={activeParams} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={4} makeDefault />
      </Canvas>
    </div>
  );
}
