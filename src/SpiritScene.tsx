import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Group, Mesh } from "three";
import { Color, MathUtils } from "three";
import type { ChatgeistState, SpiritAxes } from "./types";

function SpiritBody({ axes, side = 0, reducedMotion = false }: { axes: SpiritAxes; side?: number; reducedMotion?: boolean }) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const color = useMemo(() => {
    const cold = new Color("#72f7ff");
    const warm = new Color("#ff7d73");
    return cold.lerp(warm, axes.warmth).offsetHSL(0, 0.16, 0.04).getStyle();
  }, [axes.warmth]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !core.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0);
      core.current.scale.setScalar(1);
      return;
    }
    group.current.rotation.y += delta * (0.18 + axes.energy * 0.55) * (side || 1);
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * axes.chaos * 0.18;
    const scale = 1 + Math.sin(clock.elapsedTime * (1.2 + axes.energy * 2.2)) * (0.025 + axes.energy * 0.045);
    core.current.scale.setScalar(MathUtils.lerp(core.current.scale.x, scale, 0.12));
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.2 + axes.energy} rotationIntensity={reducedMotion ? 0 : 0.18 + axes.chaos * 0.45} floatIntensity={reducedMotion ? 0 : 0.35}>
      <group ref={group} position={[1.25 + side * 1.7, 0.08, 0]}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.82, 5]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.16 + axes.energy * 0.34}
            roughness={0.32}
            metalness={0.26}
            distort={0.09 + axes.chaos * 0.3}
            speed={reducedMotion ? 0 : 0.9 + axes.energy * 1.8}
            transparent
            opacity={0.86}
          />
        </mesh>
        <mesh scale={1.18}>
          <icosahedronGeometry args={[0.82, 2]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.16 + axes.consensus * 0.2} />
        </mesh>
        <mesh position={[-0.25, 0.1, 0.73]} scale={0.065}>
          <sphereGeometry />
          <meshBasicMaterial color="#f2c96d" />
        </mesh>
        <mesh position={[0.25, 0.1, 0.73]} scale={0.065}>
          <sphereGeometry />
          <meshBasicMaterial color="#f2c96d" />
        </mesh>
      </group>
    </Float>
  );
}

export function SpiritScene({ state }: { state: ChatgeistState }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const supportsWebGL = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  }, []);
  const split = state.split.active && state.phase !== "dormant";
  if (!supportsWebGL) {
    return (
      <div className={`spirit-fallback ${split ? "is-split" : ""}`} aria-label="Chatgeist procedural spirit, reduced graphics mode">
        <div className="fallback-stars" />
        <div className="fallback-orbit orbit-one" />
        <div className="fallback-orbit orbit-two" />
        <div className="fallback-spirit spirit-left" style={{ "--energy": state.axes.energy, "--chaos": state.axes.chaos, "--warmth": state.axes.warmth } as CSSProperties}><i /><i /></div>
        {split && <div className="fallback-spirit spirit-right" style={{ "--energy": state.axes.energy, "--chaos": state.axes.chaos, "--warmth": 1 - state.axes.warmth } as CSSProperties}><i /><i /></div>}
        <span className="graphics-fallback-label">Reduced graphics · live state preserved</span>
      </div>
    );
  }
  return (
    <Canvas camera={{ position: [0, 0, 7.4], fov: 44 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <color attach="background" args={["#050815"]} />
      <fog attach="fog" args={["#050815", 6, 12]} />
      <ambientLight intensity={0.24} />
      <pointLight position={[1, 2, 4]} color="#72f7ff" intensity={3.4} />
      <pointLight position={[-4, -2, 2]} color="#a78bfa" intensity={2.6} />
      <Stars radius={45} depth={30} count={850} factor={2.2} saturation={0.2} fade={!reducedMotion} speed={reducedMotion ? 0 : 0.28} />
      <Sparkles count={70 + Math.round(state.axes.energy * 120)} scale={[8, 4, 3]} size={1.15} speed={reducedMotion ? 0 : 0.12 + state.axes.energy * 0.45} color="#72f7ff" opacity={0.36} />
      {split ? <><SpiritBody axes={state.axes} side={-0.8} reducedMotion={reducedMotion} /><SpiritBody axes={{ ...state.axes, warmth: 1 - state.axes.warmth }} side={0.8} reducedMotion={reducedMotion} /></> : <SpiritBody axes={state.axes} reducedMotion={reducedMotion} />}
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.58} luminanceSmoothing={0.48} intensity={0.78} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
