import { useRef, useState, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

function Object3D({
  id,
  width,
  depth,
  height,
  position,
  color,
  room,
  selectedId,
  setSelectedId,
  updatePosition,
  dragging,
  setDragging,
  rotation: initialRotation = 0, // in radians
  highlight = false, // selected/highlighted
  overrideColor, // <-- added here
}) {
  const isSelected = id === selectedId
  const meshRef = useRef()
  const { camera, raycaster, mouse } = useThree()
  const [dragOffset, setDragOffset] = useState([0, 0])
  const [rotation, setRotation] = useState(initialRotation)

  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  // Dragging logic
  const onPointerDown = (e) => {
    e.stopPropagation()
    if (!dragging) {
      setSelectedId(id)
      setDragging(true)
      e.target.setPointerCapture(e.pointerId)

      raycaster.setFromCamera(mouse, camera)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(floorPlane, intersection)
      setDragOffset([position[0] - intersection.x, position[2] - intersection.z])
    }
  }

  const onPointerMove = (e) => {
    if (!dragging || !isSelected) return
    raycaster.setFromCamera(mouse, camera)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(floorPlane, intersection)
    const [clampedX, clampedZ] = clampToRoom(
      intersection.x + dragOffset[0],
      intersection.z + dragOffset[1]
    )
    updatePosition(id, [clampedX, 0, clampedZ], rotation)
  }

  const onPointerUp = (e) => {
    setDragging(false)
    e.target.releasePointerCapture(e.pointerId)
  }

  // Rotation with "R" key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSelected) return
      if (e.key.toLowerCase() === "r") {
        const newRotation = rotation + Math.PI / 2
        setRotation(newRotation)
        updatePosition(id, position, newRotation)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSelected, rotation, id, position, updatePosition])

  const clampToRoom = (x, z) => {
  const sizeX = Math.abs(Math.cos(rotation) * width + Math.sin(rotation) * depth)
  const sizeZ = Math.abs(Math.sin(rotation) * width + Math.cos(rotation) * depth)

  const minX = -room.width / 2 + sizeX / 2
  const maxX = room.width / 2 - sizeX / 2
  const minZ = -room.depth / 2 + sizeZ / 2
  const maxZ = room.depth / 2 - sizeZ / 2

  let clampedX = Math.min(Math.max(x, minX), maxX)
  let clampedZ = Math.min(Math.max(z, minZ), maxZ)

  // Check collisions with all objects in the room
  const allObjects = [...room.objects, ...room.deadSpaces].filter(o => o.id !== id)

  for (const obj of allObjects) {
    const objSizeX = obj.width
    const objSizeZ = obj.depth
    if (checkCollision([clampedX, clampedZ], [sizeX, sizeZ], [obj.position[0], obj.position[2]], [objSizeX, objSizeZ])) {
      // Simple push back: move along x or z to avoid collision
      if (clampedX < obj.position[0]) clampedX = obj.position[0] - (sizeX + objSizeX) / 2
      else clampedX = obj.position[0] + (sizeX + objSizeX) / 2

      if (clampedZ < obj.position[2]) clampedZ = obj.position[2] - (sizeZ + objSizeZ) / 2
      else clampedZ = obj.position[2] + (sizeZ + objSizeZ) / 2
    }
  }

  return [clampedX, clampedZ]
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


  return (
    <mesh
      ref={meshRef}
      position={[position[0], height / 2, position[2]]}
      rotation={[0, rotation, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={overrideColor || (highlight || isSelected ? "yellow" : color)}
      />
    </mesh>
  )
}

export default Object3D
