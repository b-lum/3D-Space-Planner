import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import DeadSpace from "./components/DeadSpace"
import Object3D from "./components/Object3D"
import Room from "./components/Room"

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [dragging, setDragging] = useState(false)

  
  const ROOM = {
    width: 10,
    depth: 8,
    height: 3,
  }

  const deadSpaces = [
    { id: "door1", position: [-4, 0, 0], width: 1, depth: 0.2, height: 0.1 },
    { id: "window1", position: [2, 0, -3], width: 3, depth: 0.2, height: 0.1 },
    { id: "drawerClearance", position: [0, 0, 2], width: 2, depth: 0.5, height: 0.1 },
  ]

  const [objects, setObjects] = useState([
    {
      id: "desk",
      width: 2,
      depth: 1,
      height: 1,
      position: [-2, 0, 0],
      color: "skyblue",
    },
    {
      id: "dresser",
      width: 1.5,
      depth: 0.8,
      height: 1.2,
      position: [2, 0, 1],
      color: "lightgreen",
    },
  ])

  const checkCollision = (movingObjId, newPos, rotation = 0) => {
    const movingObj = objects.find(obj => obj.id === movingObjId)
    if (!movingObj) return false

    const getSize = (objWidth, objDepth, rot) => [
      Math.abs(Math.cos(rot) * objWidth + Math.sin(rot) * objDepth),
      Math.abs(Math.sin(rot) * objWidth + Math.cos(rot) * objDepth)
    ]

    const [sizeX, sizeZ] = getSize(movingObj.width, movingObj.depth, rotation)

    // Check against other objects
    for (let obj of objects) {
      if (obj.id === movingObjId) continue
      const [objSizeX, objSizeZ] = getSize(obj.width, obj.depth, obj.rotation || 0)

      if (aabbOverlap(newPos, sizeX, sizeZ, obj.position, objSizeX, objSizeZ)) return true
    }

    // Check against dead spaces
    for (let ds of deadSpaces) {
      if (aabbOverlap(newPos, sizeX, sizeZ, ds.position, ds.width, ds.depth)) return true
    }

    return false
  }


  const aabbOverlap = (pos1, w1, d1, pos2, w2, d2) => {
    const minX1 = pos1[0] - w1 / 2
    const maxX1 = pos1[0] + w1 / 2
    const minZ1 = pos1[2] - d1 / 2
    const maxZ1 = pos1[2] + d1 / 2

    const minX2 = pos2[0] - w2 / 2
    const maxX2 = pos2[0] + w2 / 2
    const minZ2 = pos2[2] - d2 / 2
    const maxZ2 = pos2[2] + d2 / 2

    const overlapX = minX1 < maxX2 && maxX1 > minX2
    const overlapZ = minZ1 < maxZ2 && maxZ1 > minZ2

    return overlapX && overlapZ
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
    <Canvas
      camera={{ position: [8, 6, 8] }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />

      <Room width={10} depth={8} height={3} />

      {/* Render dead spaces */}
      {deadSpaces.map(ds => (
        <DeadSpace
          key={ds.id}
          position={ds.position}
          width={ds.width}
          depth={ds.depth}
          height={ds.height}
        />
      ))}

      {/* Render furniture objects */}
      {objects.map(obj => (
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
  )
}

export default App
