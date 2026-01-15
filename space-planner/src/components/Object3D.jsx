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

  // Rotation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSelected) return
      if (e.key.toLowerCase() === "r") {
        // Rotate 90 degrees clockwise
        const newRotation = rotation + Math.PI / 2
        setRotation(newRotation)
        updatePosition(id, position, newRotation) // pass new rotation
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

    return [
      Math.min(Math.max(x, minX), maxX),
      Math.min(Math.max(z, minZ), maxZ),
    ]
  }

  return (
    <mesh
      ref={meshRef}
      position={[position[0], height / 2, position[2]]}
      rotation={[0, rotation, 0]} // apply rotation around Y
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={isSelected ? "hotpink" : color} />
    </mesh>
  )
}

export default Object3D
