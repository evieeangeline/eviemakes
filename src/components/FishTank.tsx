import { useRef, useState, Suspense, Component, type ReactNode, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import * as THREE from 'three'
import { fish, type FishData } from '../data/fish'

const TANK = { w: 12, h: 7, d: 9 }

// ─── Tank ─────────────────────────────────────────────────────────────────────

function TankWalls() {
  const edgeGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(TANK.w, TANK.h, TANK.d)),
    []
  )

  const glassMat = (opacity = 0.25) => ({
    color: '#7dd3fc' as const,
    transparent: true,
    opacity,
    roughness: 0,
    metalness: 0.05,
    depthWrite: false,
  })

  return (
    <group>
      {/* Back wall — most opaque, reflects light */}
      <mesh position={[0, 0, -TANK.d / 2]}>
        <planeGeometry args={[TANK.w, TANK.h]} />
        <meshStandardMaterial color="#0d4a72" transparent opacity={0.95} />
      </mesh>

      {/* Side walls */}
      <mesh position={[TANK.w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[TANK.d, TANK.h]} />
        <meshStandardMaterial {...glassMat(0.35)} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[-TANK.w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[TANK.d, TANK.h]} />
        <meshStandardMaterial {...glassMat(0.35)} side={THREE.FrontSide} />
      </mesh>

      {/* Front glass — thin, barely there */}
      <mesh position={[0, 0, TANK.d / 2]}>
        <planeGeometry args={[TANK.w, TANK.h]} />
        <meshStandardMaterial {...glassMat(0.15)} side={THREE.BackSide} />
      </mesh>

      {/* Water surface */}
      <WaterSurface />

      {/* Sand floor */}
      <mesh position={[0, -TANK.h / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TANK.w, TANK.d]} />
        <meshStandardMaterial color="#c8a84b" roughness={0.95} metalness={0} />
      </mesh>

      {/* Tank edges — bright teal outline so you can see the shape */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </lineSegments>
    </group>
  )
}

function WaterSurface() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = TANK.h / 2 + Math.sin(t * 1.2) * 0.04
    ;(ref.current.material as THREE.MeshStandardMaterial).opacity =
      0.55 + Math.sin(t * 2.3) * 0.08
  })
  return (
    <mesh ref={ref} position={[0, TANK.h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[TANK.w, TANK.d, 1, 1]} />
      <meshStandardMaterial
        color="#38bdf8"
        transparent
        opacity={0.55}
        roughness={0}
        metalness={0.2}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Caustic shimmer ──────────────────────────────────────────────────────────

function CausticLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.set(
      Math.sin(t * 0.7) * 4,
      TANK.h / 2 - 0.3,
      Math.cos(t * 0.5) * 3,
    )
    ref.current.intensity = 40 + Math.sin(t * 3.1) * 15
  })
  return <pointLight ref={ref} color="#ffffff" distance={20} decay={2} />
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

function Bubbles() {
  const COUNT = 60
  const ref = useRef<THREE.Points>(null)

  const [positions, speeds, wobble] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const spd = new Float32Array(COUNT)
    const wob = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * (TANK.w - 1)
      pos[i * 3 + 1] = (Math.random() - 0.5) * TANK.h
      pos[i * 3 + 2] = (Math.random() - 0.5) * (TANK.d - 1)
      spd[i] = 0.008 + Math.random() * 0.014
      wob[i] = Math.random() * Math.PI * 2
    }
    return [pos, spd, wob]
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] += Math.sin(t + wobble[i]) * 0.003
      pos[i * 3 + 1] += speeds[i]
      if (pos[i * 3 + 1] > TANK.h / 2) {
        pos[i * 3 + 1] = -TANK.h / 2
        pos[i * 3 + 0] = (Math.random() - 0.5) * (TANK.w - 1)
        pos[i * 3 + 2] = (Math.random() - 0.5) * (TANK.d - 1)
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#bfefff"
        size={0.12}
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Fish tooltip ─────────────────────────────────────────────────────────────

function FishTooltip({ data }: { data: FishData }) {
  return (
    <Html center distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{
        background: '#1A1A1A',
        border: '3px solid #00C9B1',
        borderRadius: '16px',
        padding: '14px 18px',
        width: '210px',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
        fontFamily: 'Unbounded, system-ui, sans-serif',
        color: '#fff',
        pointerEvents: 'none',
      }}>
        <div style={{ fontWeight: 900, fontSize: '13px', color: '#FFE141', marginBottom: '2px' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '10px', color: '#00C9B1', marginBottom: '10px', letterSpacing: '0.04em' }}>
          by {data.creator}
        </div>
        <div style={{
          fontSize: '12px',
          fontStyle: 'italic',
          lineHeight: 1.5,
          color: '#eee',
          borderTop: '2px solid #333',
          paddingTop: '8px',
        }}>
          "{data.quote}"
        </div>
      </div>
    </Html>
  )
}

// ─── Fish swimming ────────────────────────────────────────────────────────────

type SwimState = {
  pos: THREE.Vector3
  vel: THREE.Vector3
  target: THREE.Vector3
  retargetTimer: number
  time: number
}

function PLYFish({ data }: { data: FishData }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const geometry = useLoader(PLYLoader, `/models/fish/${data.id}.ply`)

  const swim = useRef<SwimState>({
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * (TANK.w - 2),
      (Math.random() - 0.5) * (TANK.h - 2),
      (Math.random() - 0.5) * (TANK.d - 2),
    ),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.04,
    ),
    target: new THREE.Vector3(),
    retargetTimer: 0,
    time: Math.random() * 100,
  })

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const s = swim.current
    s.time += delta
    s.retargetTimer -= delta

    if (s.retargetTimer <= 0) {
      s.target.set(
        (Math.random() - 0.5) * (TANK.w - 2),
        (Math.random() - 0.5) * (TANK.h - 2),
        (Math.random() - 0.5) * (TANK.d - 2),
      )
      s.retargetTimer = 2 + Math.random() * 3
    }

    const steer = s.target.clone().sub(s.pos).normalize().multiplyScalar(0.0008)
    s.vel.add(steer)

    const hw = TANK.w / 2 - 1, hh = TANK.h / 2 - 1, hd = TANK.d / 2 - 1
    if (s.pos.x > hw) s.vel.x -= 0.003
    if (s.pos.x < -hw) s.vel.x += 0.003
    if (s.pos.y > hh) s.vel.y -= 0.002
    if (s.pos.y < -hh) s.vel.y += 0.002
    if (s.pos.z > hd) s.vel.z -= 0.003
    if (s.pos.z < -hd) s.vel.z += 0.003

    const spd = s.vel.length()
    if (spd > 0.05) s.vel.normalize().multiplyScalar(0.05)
    if (spd < 0.01) s.vel.normalize().multiplyScalar(0.01)

    s.pos.add(s.vel)

    meshRef.current.position.copy(s.pos)
    meshRef.current.position.y += Math.sin(s.time * 2) * 0.05

    if (s.vel.lengthSq() > 0.0001) {
      meshRef.current.rotation.y = Math.atan2(s.vel.x, s.vel.z)
      meshRef.current.rotation.x = -s.vel.y * 8
    }
    meshRef.current.rotation.z = Math.sin(s.time * 7) * 0.09
  })

  const hasVertexColors = geometry.hasAttribute('color')

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={data.scale ?? 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        vertexColors={hasVertexColors}
        color={hasVertexColors ? '#ffffff' : (data.color ?? '#ff9966')}
        roughness={0.4}
        metalness={0.1}
      />
      {hovered && <FishTooltip data={data} />}
    </mesh>
  )
}

class FishErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function Fish({ data }: { data: FishData }) {
  return (
    <FishErrorBoundary>
      <Suspense fallback={null}>
        <PLYFish data={data} />
      </Suspense>
    </FishErrorBoundary>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <color attach="background" args={['#0a2540']} />
      <fog attach="fog" args={['#0a2540', 14, 38]} />

      {/* Sky above water = bright blue; ground = deep ocean blue */}
      <hemisphereLight args={['#4fc3f7', '#01579b', 2.5]} />
      {/* Strong directional sun from above — the main light source */}
      <directionalLight position={[2, 8, 4]} intensity={4} color="#e0f7ff" />
      {/* Fill from front so we can see into the tank */}
      <directionalLight position={[0, 0, 8]} intensity={1.5} color="#b3e5fc" />
      {/* Moving caustic point light */}
      <CausticLight />

      <TankWalls />
      <Bubbles />
      {fish.map(f => <Fish key={f.id} data={f} />)}

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={6}
        maxDistance={22}
      />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function FishTank() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
