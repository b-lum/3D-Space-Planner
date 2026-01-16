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
  const [roomDimensions, setRoomDimensions] = useState({ width: 10, depth: 8, height: 3 })

  const [objects, setObjects] = useState([
  ])

  const [deadSpaces, setDeadSpaces] = useState([])

  const [newItemType, setNewItemType] = useState("furniture")
  const [newItemProps, setNewItemProps] = useState({ width: 1, depth: 1, height: 1, color: "orange", name: "" })

  const ROOM = roomDimensions

  const startPlacingItem = () => {
    const id = newItemProps.name?.trim() || `${newItemType}-${Date.now()}`
    const newItem = { id, type: newItemType, ...newItemProps, position: [0, 0, 0] }
    setPlacingItem(newItem)
    setNewItemProps({ width: 1, depth: 1, height: 1, color: "orange", name: "" })
  }

  // AABB overlap check on XZ plane
  const aabbOverlap = (pos1, w1, d1, pos2, w2, d2) => {
    return (
      Math.abs(pos1[0] - pos2[0]) < (w1 + w2) / 2 &&
      Math.abs(pos1[2] - pos2[2]) < (d1 + d2) / 2
    )
  }

  // Check if a new position would collide with other objects or dead spaces
  const checkCollision = (id, newPos, objWidth, objDepth) => {
    for (let obj of objects) {
      if (obj.id === id) continue
      if (aabbOverlap(newPos, objWidth, objDepth, obj.position, obj.width, obj.depth)) {
        return true
      }
    }

    for (let ds of deadSpaces) {
      if (ds.id === id) continue
      if (aabbOverlap(newPos, objWidth, objDepth, ds.position, ds.width, ds.depth)) {
        return true
      }
    }

    return false
  }

  const updatePosition = (id, newPosition, newRotation = 0) => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === id ? { ...obj, position: newPosition, rotation: newRotation } : obj
      )
    )
  }

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
        roomDimensions={roomDimensions}
        setRoomDimensions={setRoomDimensions}
      />

      <div className="canvas-container">
        <Canvas camera={{ position: [8, 6, 8] }} onPointerMissed={() => setSelectedId(null)}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />

          <Room width={ROOM.width} depth={ROOM.depth} height={ROOM.height} />

          {placingItem && (
            <>
              {/* Invisible floor for moving the object */}
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={(e) => {
                  e.stopPropagation()

                  let newX = e.point.x
                  let newZ = e.point.z

                  const halfWidth = placingItem.width / 2
                  const halfDepth = placingItem.depth / 2

                  // Room boundaries centered at (0,0)
                  const minX = -ROOM.width / 2 + halfWidth
                  const maxX = ROOM.width / 2 - halfWidth
                  const minZ = -ROOM.depth / 2 + halfDepth
                  const maxZ = ROOM.depth / 2 - halfDepth

                  newX = Math.max(minX, Math.min(maxX, newX))
                  newZ = Math.max(minZ, Math.min(maxZ, newZ))

                  // Only update if no collision
                  if (!checkCollision(placingItem.id, [newX, 0, newZ], placingItem.width, placingItem.depth)) {
                    setPlacingItem({ ...placingItem, position: [newX, 0, newZ] })
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()

                  const [x, , z] = placingItem.position
                  const halfWidth = placingItem.width / 2
                  const halfDepth = placingItem.depth / 2

                  const inBoundsX = x - halfWidth >= -ROOM.width / 2 && x + halfWidth <= ROOM.width / 2
                  const inBoundsZ = z - halfDepth >= -ROOM.depth / 2 && z + halfDepth <= ROOM.depth / 2
                  const collides = checkCollision(placingItem.id, placingItem.position, placingItem.width, placingItem.depth)

                  if (inBoundsX && inBoundsZ && !collides) {
                    addPlacedItem()
                  } else {
                    alert("Cannot place object here — it collides or is out of bounds!")
                  }
                }}
              >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
              </mesh>

              {/* Preview box */}
              <mesh
                position={[
                  placingItem.position[0],
                  placingItem.height / 2,
                  placingItem.position[2],
                ]}
              >
                <boxGeometry args={[placingItem.width, placingItem.height, placingItem.depth]} />
                <meshStandardMaterial
                  color={placingItem.type === "furniture" ? "orange" : "red"}
                  opacity={0.5}
                  transparent
                />
              </mesh>
            </>
          )}

          {deadSpaces.map((ds) => (
            <DeadSpace key={ds.id} {...ds} color={selectedId === ds.id ? "hotpink" : "red"} />
          ))}

          {objects.map((obj) => (
            <Object3D
              key={obj.id}
              {...obj}
              room={ROOM}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              updatePosition={updatePosition}
              dragging={dragging}
              setDragging={setDragging}
              checkCollision={checkCollision}
            />
          ))}

          <Grid
            args={[20, 20]}
            position={[0, 0.01, 0]}
            cellColor="black"
            sectionColor="gray"
            sectionThickness={1}
          />
          <OrbitControls enabled={!dragging} />
        </Canvas>
      </div>
    </div>
  )
}

export default App
