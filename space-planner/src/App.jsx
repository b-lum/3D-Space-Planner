import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import DeadSpace from "./components/DeadSpace"
import Object3D from "./components/Object3D"
import Room from "./components/Room"
import Sidebar from "./components/Sidebar"
import "./App.css"

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [placingItem, setPlacingItem] = useState(null)

  const [objects, setObjects] = useState([
    { id: "desk", width: 2, depth: 1, height: 1, position: [-2, 0, 0], color: "skyblue", type: "furniture" },
  ])

  const [deadSpaces, setDeadSpaces] = useState([
    { id: "door1", position: [0, 0, 0], width: 1, depth: 0.2, height: 0.1, type: "deadspace" },

  ])

  const [newItemType, setNewItemType] = useState("furniture")
  const [newItemProps, setNewItemProps] = useState({ width: 1, depth: 1, height: 1, color: "orange", name: "" })

  const ROOM = { width: 10, depth: 8, height: 3 }

  const startPlacingItem = () => {
    const id = newItemProps.name?.trim() || `${newItemType}-${Date.now()}`
    const newItem = { id, type: newItemType, ...newItemProps, position: [0, 0, 0] }
    setPlacingItem(newItem)
    setNewItemProps({ width: 1, depth: 1, height: 1, color: "orange", name: "" })
  }

  // Collision & update functions (same as before)
  const aabbOverlap = (pos1, w1, d1, pos2, w2, d2) => { /* ... */ }
  const checkCollision = (id, newPos, rotation = 0) => { /* ... */ }
  const updatePosition = (id, newPosition, newRotation = 0) => { /* ... */ }
  const addPlacedItem = () => {
    if (!placingItem) return
    if (placingItem.type === "furniture") setObjects([...objects, placingItem])
    else setDeadSpaces([...deadSpaces, placingItem])
    setPlacingItem(null)
  }

  return (
    <div className="app-container">
      <Sidebar
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        objects={objects}
        setObjects={setObjects}
        deadSpaces={deadSpaces}
        setDeadSpaces={setDeadSpaces}
        newItemType={newItemType}
        setNewItemType={setNewItemType}
        newItemProps={newItemProps}
        setNewItemProps={setNewItemProps}
        startPlacingItem={startPlacingItem}
      />

      <div className="canvas-container">
        <Canvas camera={{ position: [8, 6, 8] }} onPointerMissed={() => setSelectedId(null)}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          <Room width={ROOM.width} depth={ROOM.depth} height={ROOM.height} />

          {placingItem && (
            <>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={(e) => {
                  e.stopPropagation()
                  setPlacingItem({ ...placingItem, position: [e.point.x, 0, e.point.z] })
                }}
                onClick={(e) => { e.stopPropagation(); addPlacedItem() }}
              >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
              </mesh>
              <mesh position={[placingItem.position[0], placingItem.height / 2, placingItem.position[2]]}>
                <boxGeometry args={[placingItem.width, placingItem.height, placingItem.depth]} />
                <meshStandardMaterial color={placingItem.type === "furniture" ? "orange" : "red"} opacity={0.5} transparent />
              </mesh>
            </>
          )}

          {deadSpaces.map((ds) => <DeadSpace key={ds.id} {...ds} color={selectedId === ds.id ? "hotpink" : "red"} />)}
          {objects.map((obj) => <Object3D key={obj.id} {...obj} room={ROOM} selectedId={selectedId} setSelectedId={setSelectedId} updatePosition={updatePosition} dragging={dragging} setDragging={setDragging} />)}

          <Grid args={[20, 20]} />
          <OrbitControls enabled={!dragging} />
        </Canvas>
      </div>
    </div>
  )
}

export default App
