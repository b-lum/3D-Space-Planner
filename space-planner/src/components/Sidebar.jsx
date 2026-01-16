import React from "react"
import "../App.css"

function Sidebar({
  selectedId,
  setSelectedId,
  objects,
  setObjects,
  deadSpaces,
  setDeadSpaces,
  newItemType,
  setNewItemType,
  newItemProps,
  setNewItemProps,
  startPlacingItem,
  roomDimensions,
  setRoomDimensions,
  }) {

    const handleDimensionChange = (e) => {
    const { name, value } = e.target
    setRoomDimensions(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }
  
  return (
    <div className="sidebar">

      <h3>Room Dimensions</h3>
<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
  <div>
    <label>Width:</label>
    <input
      type="number"
      name="width"
      value={roomDimensions.width}
      onChange={handleDimensionChange}
      style={{ width: "60px" }}
    />
  </div>
  <div>
    <label>Depth:</label>
    <input
      type="number"
      name="depth"
      value={roomDimensions.depth}
      onChange={handleDimensionChange}
      style={{ width: "60px" }}
    />
  </div>
  <div>
    <label>Height:</label>
    <input
      type="number"
      name="height"
      value={roomDimensions.height}
      onChange={handleDimensionChange}
      style={{ width: "60px" }}
    />
  </div>
</div>

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
                        setObjects((objs) =>
                          objs.map((o) => (o.id === selectedId ? { ...o, width: newWidth } : o))
                        )
                      } else {
                        setDeadSpaces((ds) =>
                          ds.map((o) => (o.id === selectedId ? { ...o, width: newWidth } : o))
                        )
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
                        setObjects((objs) =>
                          objs.map((o) => (o.id === selectedId ? { ...o, depth: newDepth } : o))
                        )
                      } else {
                        setDeadSpaces((ds) =>
                          ds.map((o) => (o.id === selectedId ? { ...o, depth: newDepth } : o))
                        )
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
                        setObjects((objs) =>
                          objs.map((o) => (o.id === selectedId ? { ...o, height: newHeight } : o))
                        )
                      } else {
                        setDeadSpaces((ds) =>
                          ds.map((o) => (o.id === selectedId ? { ...o, height: newHeight } : o))
                        )
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
                        setObjects((objs) =>
                          objs.map((o) => (o.id === selectedId ? { ...o, color: newColor } : o))
                        )
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
          <li key={obj.id} className="furniture-item">
            <span
              onClick={() => setSelectedId(obj.id)}
              className={selectedId === obj.id ? "furniture-selected" : ""}
            >
              {obj.id} (Furniture)
            </span>
            <button className="delete-btn" onClick={() => setObjects(objects.filter((o) => o.id !== obj.id))}>
              ×
            </button>
          </li>
        ))}
        {deadSpaces.map((ds) => (
          <li key={ds.id} className="deadspace-item">
            <span
              onClick={() => setSelectedId(ds.id)}
              className={selectedId === ds.id ? "deadspace-selected" : ""}
            >
              {ds.id} (Dead Space)
            </span>
            <button className="delete-btn" onClick={() => setDeadSpaces(deadSpaces.filter((d) => d.id !== ds.id))}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar
