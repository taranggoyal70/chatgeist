import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type CSSProperties } from "react";
import type { Group, Mesh } from "three";
import { Color, MathUtils } from "three";
import type { ChatgeistState, SpiritAxes } from "./types";

function SpiritBody({ axes, side = 0 }: { axes: SpiritAxes; side?: number }) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const color = useMemo(() => {
    const cold = new Color("#72f7ff");
    const warm = new Color("#ff7d73");
    return cold.lerp(warm, axes.warmth).getStyle();
  }, [axes.warmth]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !core.current) return;
    group.current.rotation.y += delta * (0.18 + axes.energy * 0.55) * (side || 1);
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * axes.chaos * 0.18;
    const scale = 1 + Math.sin(clock.elapsedTime * (1.2 + axes.energy * 2.2)) * (0.025 + axes.energy * 0.045);
    core.current.scale.setScalar(MathUtils.lerp(core.current.scale.x, scale, 0.12));
  });

  return (
    <Float speed={1.2 + axes.energy} rotationIntensity={0.18 + axes.chaos * 0.45} floatIntensity={0.35}>
      <group ref={group} position={[side * 1.55, 0, 0]}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.05, 5]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.45 + axes.energy * 0.75}
            roughness={0.18}
            metalness={0.42}
            distort={0.13 + axes.chaos * 0.45}
            speed={1.1 + axes.energy * 2.6}
            transparent
            opacity={0.78}
          />
        </mesh>
        <mesh scale={1.22}>
          <icosahedronGeometry args={[1.05, 2]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.18 + axes.consensus * 0.25} />
        </mesh>
        <mesh position={[-0.32, 0.12, 0.93]} scale={0.08}>
          <sphereGeometry />
          <meshBasicMaterial color="#f2c96d" />
        </mesh>
        <mesh position={[0.32, 0.12, 0.93]} scale={0.08}>
          <sphereGeometry />
          <meshBasicMaterial color="#f2c96d" />
        </mesh>
      </group>
    </Float>
  );
}

export function SpiritScene({ state }: { state: ChatgeistState }) {
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
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <color attach="background" args={["#050815"]} />
      <fog attach="fog" args={["#050815", 6, 12]} />
      <ambientLight intensity={0.34} />
      <pointLight position={[0, 2, 4]} color="#72f7ff" intensity={8} />
      <pointLight position={[-4, -2, 2]} color="#a78bfa" intensity={6} />
      <Stars radius={45} depth={30} count={950} factor={2.5} saturation={0.2} fade speed={0.35} />
      <Sparkles count={90 + Math.round(state.axes.energy * 170)} scale={[7, 4, 3]} size={1.5} speed={0.15 + state.axes.energy * 0.7} color="#72f7ff" opacity={0.48} />
      {split ? <><SpiritBody axes={state.axes} side={-0.8} /><SpiritBody axes={{ ...state.axes, warmth: 1 - state.axes.warmth }} side={0.8} /></> : <SpiritBody axes={state.axes} />}
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.22} luminanceSmoothing={0.65} intensity={1.45} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
