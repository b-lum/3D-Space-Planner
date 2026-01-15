import React from "react"
import "../App.css"

function Sidebar({
  selectedId,
  setSelectedId,
  room,
  setRooms,
  newItemType,
  setNewItemType,
  newItemProps,
  setNewItemProps,
  startPlacingItem
}) {
  if (!room) return null // safety check

  const updateItem = (id, updates, type) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id !== room.id) return r
        if (type === "furniture") {
          return { ...r, objects: r.objects.map(o => (o.id === id ? { ...o, ...updates } : o)) }
        } else {
          return { ...r, deadSpaces: r.deadSpaces.map(o => (o.id === id ? { ...o, ...updates } : o)) }
        }
      })
    )
  }

  const deleteItem = (id, type) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id !== room.id) return r
        if (type === "furniture") {
          return { ...r, objects: r.objects.filter(o => o.id !== id) }
        } else {
          return { ...r, deadSpaces: r.deadSpaces.filter(o => o.id !== id) }
        }
      })
    )
    if (selectedId === id) setSelectedId(null)
  }

  const allItems = [...room.objects, ...room.deadSpaces]
  const selectedItem = allItems.find(i => i.id === selectedId)

  return (
    <div className="sidebar">
      {selectedItem ? (
        <>
          <h3>Edit Selected Item</h3>
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={selectedItem.width}
              onChange={e => updateItem(selectedItem.id, { width: parseFloat(e.target.value) }, selectedItem.type)}
            />
          </div>
          <div>
            <label>Depth:</label>
            <input
              type="number"
              value={selectedItem.depth}
              onChange={e => updateItem(selectedItem.id, { depth: parseFloat(e.target.value) }, selectedItem.type)}
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={selectedItem.height}
              onChange={e => updateItem(selectedItem.id, { height: parseFloat(e.target.value) }, selectedItem.type)}
            />
          </div>
          {selectedItem.type === "furniture" && (
            <div>
              <label>Color:</label>
              <input
                type="color"
                value={selectedItem.color}
                onChange={e => updateItem(selectedItem.id, { color: e.target.value }, "furniture")}
              />
            </div>
          )}
          <button onClick={() => setSelectedId(null)}>Done Editing</button>
        </>
      ) : (
        <>
          <h3>Add Object</h3>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={newItemProps.name || ""}
              onChange={e => setNewItemProps({ ...newItemProps, name: e.target.value })}
              placeholder="Enter object name"
            />
          </div>
          <div>
            <label>Type:</label>
            <select value={newItemType} onChange={e => setNewItemType(e.target.value)}>
              <option value="furniture">Furniture</option>
              <option value="deadspace">Dead Space</option>
            </select>
          </div>
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={newItemProps.width}
              onChange={e => setNewItemProps({ ...newItemProps, width: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label>Depth:</label>
            <input
              type="number"
              value={newItemProps.depth}
              onChange={e => setNewItemProps({ ...newItemProps, depth: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={newItemProps.height}
              onChange={e => setNewItemProps({ ...newItemProps, height: parseFloat(e.target.value) })}
            />
          </div>
          {newItemType === "furniture" && (
            <div>
              <label>Color:</label>
              <input
                type="color"
                value={newItemProps.color}
                onChange={e => setNewItemProps({ ...newItemProps, color: e.target.value })}
              />
            </div>
          )}
          <button onClick={startPlacingItem}>Place {newItemType} on floor</button>
        </>
      )}

      <h3>Objects in Room</h3>
      <ul>
        {room.objects.map(obj => (
          <li key={obj.id} className="furniture-item">
            <span
              onClick={() => setSelectedId(obj.id)}
              className={selectedId === obj.id ? "furniture-selected" : ""}
            >
              {obj.id} (Furniture)
            </span>
            <button className="delete-btn" onClick={() => deleteItem(obj.id, "furniture")}>
              ×
            </button>
          </li>
        ))}
        {room.deadSpaces.map(ds => (
          <li key={ds.id} className="deadspace-item">
            <span
              onClick={() => setSelectedId(ds.id)}
              className={selectedId === ds.id ? "deadspace-selected" : ""}
            >
              {ds.id} (Dead Space)
            </span>
            <button className="delete-btn" onClick={() => deleteItem(ds.id, "deadspace")}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar
