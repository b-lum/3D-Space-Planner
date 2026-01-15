function Room({ width = 10, depth = 8, height = 3 }) {
  const wallThickness = 0.1

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </>
  )
}

export default Room
