import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"

import Room from "./components/Room"
import Object3D from "./components/Object3D"
import DeadSpace from "./components/DeadSpace"
import Sidebar from "./components/Sidebar"

import "./App.css"

/* ---------- ROOM FACTORY ---------- */
function createRoom({ id, name, width, depth, height }) {
  return {
    id,
    name,
    dimensions: { width, depth, height },
    objects: [],
    deadSpaces: [],
  }
}

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [placingItem, setPlacingItem] = useState(null)

  const [newItemType, setNewItemType] = useState("furniture")
  const [newItemProps, setNewItemProps] = useState({
    width: 1,
    depth: 1,
    height: 1,
    color: "orange",
    name: "",
  })

  /* ---------- ROOMS ---------- */
  const [rooms, setRooms] = useState([
    createRoom({
      id: "room-1",
      name: "Main Room",
      width: 10,
      depth: 8,
      height: 3,
    }),
  ])

  const [activeRoomId, setActiveRoomId] = useState("room-1")
  const activeRoom = rooms.find(r => r.id === activeRoomId)
  if (!activeRoom) return null

  function getRandomColor() {
    // returns a random hex color string like "#a3f4d1"
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function checkCollision(pos1, size1, pos2, size2) {
    const [x1, z1] = pos1
    const [w1, d1] = size1
    const [x2, z2] = pos2
    const [w2, d2] = size2

    return (
      Math.abs(x1 - x2) < (w1 + w2) / 2 &&
      Math.abs(z1 - z2) < (d1 + d2) / 2
    )
  }
  /* ---------- PLACEMENT ---------- */
  const startPlacingItem = () => {
    const id = newItemProps.name.trim() || `${newItemType}-${Date.now()}`


    const color = newItemType === "furniture" 
      ? newItemProps.color || getRandomColor()  // <-- random if no color
      : undefined

    setPlacingItem({
      id,
      type: newItemType,
      ...newItemProps,
      color,
      position: [0, 0, 0],
      rotation: 0, // default rotation
    })
    setNewItemProps({
      width: 1,
      depth: 1,
      height: 1,
      color: "orange",
      name: "",
    })
  }

  const addPlacedItem = () => {
    if (!placingItem) return

    setRooms(prev =>
      prev.map(room => {
        if (room.id !== activeRoomId) return room

        if (placingItem.type === "furniture") {
          return { ...room, objects: [...room.objects, placingItem] }
        }
        return { ...room, deadSpaces: [...room.deadSpaces, placingItem] }
      })
    )
    setPlacingItem(null)
  }

  /* ---------- POSITION UPDATES ---------- */
  const updatePosition = (id, newPosition, newRotation = 0) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== activeRoomId) return room

        const objects = room.objects.map(o =>
          o.id === id ? { ...o, position: newPosition, rotation: newRotation } : o
        )
        const deadSpaces = room.deadSpaces.map(ds =>
          ds.id === id ? { ...ds, position: newPosition, rotation: newRotation } : ds
        )

        return { ...room, objects, deadSpaces }
      })
    )
  }

  return (
    <div className="app-container">
      <Sidebar
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        room={activeRoom}
        setRooms={setRooms}
        activeRoomId={activeRoomId}
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

          <Room dimensions={activeRoom.dimensions} />

          {/* Placement Preview */}
          {placingItem && (
            <>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={e =>
                  setPlacingItem({ ...placingItem, position: [e.point.x, 0, e.point.z] })
                }
                onClick={e => {
                  e.stopPropagation()
                  addPlacedItem()
                }}
              >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
              </mesh>

              <mesh
                position={[
                  placingItem.position[0],
                  placingItem.height / 2,
                  placingItem.position[2],
                ]}
                rotation={[0, placingItem.rotation, 0]}
              >
                <boxGeometry
                  args={[placingItem.width, placingItem.height, placingItem.depth]}
                />
                <meshStandardMaterial
                  color={placingItem.type === "furniture" ? "orange" : "red"}
                  opacity={0.5}
                  transparent
                />
              </mesh>
            </>
          )}

          {/* Dead Spaces */}
          {activeRoom.deadSpaces.map(ds => (
            <Object3D
              key={ds.id}
              {...ds}
              room={activeRoom.dimensions}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              dragging={dragging}
              setDragging={setDragging}
              updatePosition={updatePosition} // draggable
              highlight={selectedId === ds.id}
              overrideColor="red"
            />
          ))}

          {/* Furniture */}
          {activeRoom.objects.map(obj => (
            <Object3D
              key={obj.id}
              {...obj}
              room={activeRoom.dimensions}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              dragging={dragging}
              setDragging={setDragging}
              updatePosition={updatePosition}
              highlight={selectedId === obj.id}
            />
          ))}

          <Grid args={[20, 20]} />
          <OrbitControls enabled={!dragging} />
        </Canvas>
      </div>
    </div>
  )
}

export default App
