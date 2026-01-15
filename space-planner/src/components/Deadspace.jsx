import React from "react"

function DeadSpace({
  position,
  width,
  depth,
  height,
  color = "red",
  highlight = false,
  visible = true,
}) {
  return (
    <mesh position={[position[0], height / 2, position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={highlight ? "yellow" : color}
        transparent
        opacity={visible ? 0.3 : 0}
      />
    </mesh>
  )
}

export default DeadSpace
