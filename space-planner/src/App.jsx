import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import DeadSpace from "./components/DeadSpace"
import Object3D from "./components/Object3D"
import Room from "./components/Room"
import "./App.css"

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [placingItem, setPlacingItem] = useState(null)

  const [objects, setObjects] = useState([
    { id: "desk", width: 2, depth: 1, height: 1, position: [-2, 0, 0], color: "skyblue", type: "furniture" },
    { id: "dresser", width: 1.5, depth: 0.8, height: 1.2, position: [2, 0, 1], color: "lightgreen", type: "furniture" },
  ])

  const [deadSpaces, setDeadSpaces] = useState([
    { id: "door1", position: [-4, 0, 0], width: 1, depth: 0.2, height: 0.1, type: "deadspace" },
    { id: "window1", position: [2, 0, -3], width: 3, depth: 0.2, height: 0.1, type: "deadspace" },
    { id: "drawerClearance", position: [0, 0, 2], width: 2, depth: 0.5, height: 0.1, type: "deadspace" },
  ])

  const [newItemType, setNewItemType] = useState("furniture")
  const [newItemProps, setNewItemProps] = useState({ width: 1, depth: 1, height: 1, color: "orange", name: "" })

  const ROOM = { width: 10, depth: 8, height: 3 }

  // Start placing new object
  const startPlacingItem = () => {
    const id = newItemProps.name?.trim() || `${newItemType}-${Date.now()}`
    const newItem = {
      id,
      type: newItemType,
      ...newItemProps,
      position: [0, 0, 0],
    }
    setPlacingItem(newItem)
    setNewItemProps({ width: 1, depth: 1, height: 1, color: "orange", name: "" })
  }

  // Add object to room
  const addPlacedItem = () => {
    if (!placingItem) return
    if (placingItem.type === "furniture") setObjects([...objects, placingItem])
    else setDeadSpaces([...deadSpaces, placingItem])
    setPlacingItem(null)
  }

  // Simple AABB collision check
  const aabbOverlap = (pos1, w1, d1, pos2, w2, d2) => {
    const minX1 = pos1[0] - w1 / 2
    const maxX1 = pos1[0] + w1 / 2
    const minZ1 = pos1[2] - d1 / 2
    const maxZ1 = pos1[2] + d1 / 2
    const minX2 = pos2[0] - w2 / 2
    const maxX2 = pos2[0] + w2 / 2
    const minZ2 = pos2[2] - d2 / 2
    const maxZ2 = pos2[2] + d2 / 2
    return minX1 < maxX2 && maxX1 > minX2 && minZ1 < maxZ2 && maxZ1 > minZ2
  }

  const checkCollision = (id, newPos, rotation = 0) => {
    const getSize = (obj) => [
      Math.abs(Math.cos(rotation) * obj.width + Math.sin(rotation) * obj.depth),
      Math.abs(Math.sin(rotation) * obj.width + Math.cos(rotation) * obj.depth),
    ]
    const movingObj = [...objects, ...deadSpaces].find((obj) => obj.id === id)
    if (!movingObj) return false
    const [sizeX, sizeZ] = getSize(movingObj)
    for (let obj of [...objects, ...deadSpaces]) {
      if (obj.id === id) continue
      const [objSizeX, objSizeZ] = getSize(obj)
      if (aabbOverlap(newPos, sizeX, sizeZ, obj.position, objSizeX, objSizeZ)) return true
    }
    return false
  }

  const updatePosition = (id, newPosition, newRotation = 0) => {
    if (checkCollision(id, newPosition, newRotation)) return
    setObjects((objs) =>
      objs.map((obj) =>
        obj.id === id ? { ...obj, position: newPosition, rotation: newRotation } : obj
      )
    )
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        {selectedId ? (
          <>
            {/* Edit Selected Item */}
            <h3>Edit Selected Item</h3>
            {(() => {
              const item = [...objects, ...deadSpaces].find((obj) => obj.id === selectedId)
              if (!item) return null

              return (
                <>
                  <div>
                    <label>Width:</label>
                    <input
                      type="number"
                      value={item.width}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value)
                        if (item.type === "furniture") {
                          setObjects((objs) => objs.map((o) => o.id === selectedId ? { ...o, width: newWidth } : o))
                        } else {
                          setDeadSpaces((ds) => ds.map((o) => o.id === selectedId ? { ...o, width: newWidth } : o))
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label>Depth:</label>
                    <input
                      type="number"
                      value={item.depth}
                      onChange={(e) => {
                        const newDepth = parseFloat(e.target.value)
                        if (item.type === "furniture") {
                          setObjects((objs) => objs.map((o) => o.id === selectedId ? { ...o, depth: newDepth } : o))
                        } else {
                          setDeadSpaces((ds) => ds.map((o) => o.id === selectedId ? { ...o, depth: newDepth } : o))
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label>Height:</label>
                    <input
                      type="number"
                      value={item.height}
                      onChange={(e) => {
                        const newHeight = parseFloat(e.target.value)
                        if (item.type === "furniture") {
                          setObjects((objs) => objs.map((o) => o.id === selectedId ? { ...o, height: newHeight } : o))
                        } else {
                          setDeadSpaces((ds) => ds.map((o) => o.id === selectedId ? { ...o, height: newHeight } : o))
                        }
                      }}
                    />
                  </div>
                  {item.type === "furniture" && (
                    <div>
                      <label>Color:</label>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => {
                          const newColor = e.target.value
                          setObjects((objs) => objs.map((o) => o.id === selectedId ? { ...o, color: newColor } : o))
                        }}
                      />
                    </div>
                  )}
                  <button onClick={() => setSelectedId(null)}>Done Editing</button>
                </>
              )
            })()}
          </>
        ) : (
          <>
            {/* Add New Object */}
            <h3>Add Object</h3>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={newItemProps.name || ""}
                onChange={(e) => setNewItemProps({ ...newItemProps, name: e.target.value })}
                placeholder="Enter object name"
              />
            </div>
            <label>Type:</label>
            <select value={newItemType} onChange={(e) => setNewItemType(e.target.value)}>
              <option value="furniture">Furniture</option>
              <option value="deadspace">Dead Space</option>
            </select>
            <div>
              <label>Width:</label>
              <input
                type="number"
                value={newItemProps.width}
                onChange={(e) => setNewItemProps({ ...newItemProps, width: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label>Depth:</label>
              <input
                type="number"
                value={newItemProps.depth}
                onChange={(e) => setNewItemProps({ ...newItemProps, depth: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label>Height:</label>
              <input
                type="number"
                value={newItemProps.height}
                onChange={(e) => setNewItemProps({ ...newItemProps, height: parseFloat(e.target.value) })}
              />
            </div>
            {newItemType === "furniture" && (
              <div>
                <label>Color:</label>
                <input
                  type="color"
                  value={newItemProps.color}
                  onChange={(e) => setNewItemProps({ ...newItemProps, color: e.target.value })}
                />
              </div>
            )}
            <button onClick={startPlacingItem}>Place {newItemType} on floor</button>
          </>
        )}

        {/* Object List */}
        <h3>Objects in Room</h3>
        <ul>
          {objects.map((obj) => (
            <li
              key={obj.id}
              onClick={() => setSelectedId(obj.id)}
              className={selectedId === obj.id ? "furniture-selected" : ""}
            >
              {obj.id} (Furniture)
            </li>
          ))}
          {deadSpaces.map((ds) => (
            <li
              key={ds.id}
              onClick={() => setSelectedId(ds.id)}
              className={selectedId === ds.id ? "deadspace-selected" : ""}
            >
              {ds.id} (Dead Space)
            </li>
          ))}
        </ul>
      </div>

      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas camera={{ position: [8, 6, 8] }} onPointerMissed={() => setSelectedId(null)}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          <Room width={ROOM.width} depth={ROOM.depth} height={ROOM.height} />

          {/* Placement Preview */}
          {placingItem && (
            <>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={(e) => {
                  e.stopPropagation()
                  setPlacingItem({ ...placingItem, position: [e.point.x, 0, e.point.z] })
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  addPlacedItem()
                }}
              >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
              </mesh>
              <mesh position={[placingItem.position[0], placingItem.height / 2, placingItem.position[2]]}>
                <boxGeometry args={[placingItem.width, placingItem.height, placingItem.depth]} />
                <meshStandardMaterial
                  color={placingItem.type === "furniture" ? "orange" : "red"}
                  opacity={0.5}
                  transparent
                />
              </mesh>
            </>
          )}

          {/* DeadSpaces */}
          {deadSpaces.map((ds) => (
            <DeadSpace key={ds.id} {...ds} color={selectedId === ds.id ? "hotpink" : "red"} />
          ))}

          {/* Furniture */}
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
