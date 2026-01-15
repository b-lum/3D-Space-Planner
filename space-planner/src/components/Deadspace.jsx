import React from "react"

function DeadSpace({ position, width, depth, height, color = "red", visible = true }) {
  return (
    <mesh position={[position[0], height / 2, position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={visible ? 0.3 : 0} // can hide if you want
      />
    </mesh>
  )
}

export default DeadSpace
