import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);

  // form state
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);

  // edit state
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // fetch items
  useEffect(() => {
    axios
      .get<Item[]>("http://localhost:8000/list-items")
      .then(({ data }) => setItems(data))
      .catch(console.error);
  }, []);

  // reset form
  const resetForm = () => {
    setItemName("");
    setPrice(0);
    setQuantity(0);
    setEditingItemId(null);
  };

  // CREATE or UPDATE
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // UPDATE
    if (editingItemId !== null) {
      axios
        .put(`http://localhost:8000/update-item/${editingItemId}`, {
          name: itemName,
          price,
          quantity,
        })
        .then(({ data }) => {
          setItems((prev) =>
            prev.map((item) => (item.id === editingItemId ? data.item : item))
          );
          setShowModal(false);
          resetForm();
        })
        .catch(console.error);

      return;
    }

    // CREATE
    axios
      .post<Item>("http://localhost:8000/create-item", {
        name: itemName,
        price,
        quantity,
      })
      .then(({ data }) => {
        setItems((prev) => [...prev, data]);
        setShowModal(false);
        resetForm();
      })
      .catch(console.error);
  };

  // DELETE
  const handleDeleteItem = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    axios
      .delete(`http://localhost:8000/delete-item/${id}`)
      .then(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      })
      .catch(console.error);
  };

  // OPEN EDIT MODAL
  const handleEditClick = (item: Item) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setPrice(item.price);
    setQuantity(item.quantity);
    setShowModal(true);
  };

  return (
    <div className="container">
      <h1 className="title">🛒 Item List</h1>

      <button
        className="create-item-button"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        + Create Item
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItemId ? "Edit Item" : "Create Item"}</h2>

            <form className="modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit">
                  {editingItemId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEMS */}
      <div className="grid">
        {items.map((item) => (
          <div className="card" key={item.id}>
            <h2 className="item-name">{item.name}</h2>

            <div className="item-info">
              <span>💰 ${item.price}</span>
              <span>📦 Qty: {item.quantity}</span>
            </div>

            <div className="card-actions">
              <button
                className="edit-button"
                onClick={() => handleEditClick(item)}
              >
                ✏️ Edit
              </button>

              <button
                className="delete-button"
                onClick={() => handleDeleteItem(item.id)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
