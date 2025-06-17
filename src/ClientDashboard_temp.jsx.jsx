// 1. App.jsx - controla si se muestra el panel del cliente o el de administrador
import React from "react";
import ReactDOM from "react-dom/client";
import { OrdersProvider } from "./OrdersProvider";
import AdminDashboard from "./AdminDashboard";
import ClientDashboard from "./ClientDashboard";

const App = () => {
  const isAdmin = window.location.href.includes("admin");
  return (
    <OrdersProvider>
      {isAdmin ? <AdminDashboard /> : <ClientDashboard />}
    </OrdersProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);


// 2. ClientDashboard.jsx
import React, { useContext, useState } from "react";
import { OrdersContext } from "./OrdersProvider";
import "./clientStyles.css";

const ClientDashboard = () => {
  const { orders, updateTrottaStatus, updateClientNote } = useContext(OrdersContext);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedClientNote, setEditedClientNote] = useState("");

  const handleEditStatus = (id, currentStatus) => {
    setEditingStatusId(id);
    setEditedStatus(currentStatus);
  };

  const handleSaveStatus = (id) => {
    updateTrottaStatus(id, editedStatus);
    setEditingStatusId(null);
  };

  const handleEditNote = (id, currentNote) => {
    setEditingNoteId(id);
    setEditedClientNote(currentNote);
  };

  const handleSaveNote = (id) => {
    updateClientNote(id, editedClientNote);
    setEditingNoteId(null);
  };

  return (
    <div className="client-dashboard">
      <h2>Panel del Cliente</h2>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Order Details</th>
            <th>GH Tire State</th>
            <th>Trotta State</th>
            <th>Admin Notes</th>
            <th>Customer Notes</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.customerName}</td>
              <td>{order.address}</td>
              <td>{order.orderDetails}</td>
              <td>{order.ghStatus}</td>

              <td>
                {editingStatusId === order.id ? (
                  <>
                    <input
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                    />
                    <button onClick={() => handleSaveStatus(order.id)}>Guardar</button>
                  </>
                ) : (
                  <div onDoubleClick={() => handleEditStatus(order.id, order.trottaStatus)}>
                    {order.trottaStatus}
                    <button onClick={() => handleEditStatus(order.id, order.trottaStatus)}>✏️</button>
                  </div>
                )}
              </td>

              <td>{order.note || "—"}</td>

              <td>
                {editingNoteId === order.id ? (
                  <>
                    <input
                      value={editedClientNote}
                      onChange={(e) => setEditedClientNote(e.target.value)}
                    />
                    <button onClick={() => handleSaveNote(order.id)}>Guardar</button>
                  </>
                ) : (
                  <div onDoubleClick={() => handleEditNote(order.id, order.clientNote)}>
                    {order.clientNote || "—"}
                    <button onClick={() => handleEditNote(order.id, order.clientNote)}>✏️</button>
                  </div>
                )}
              </td>

              <td>
                <a href="#" download>
                  📥 Descargar
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientDashboard;


// 3. OrdersProvider.jsx - agrega esta función si aún no está
export const updateClientNote = (id, newClientNote) => {
  setOrders((prevOrders) =>
    prevOrders.map((order) =>
      order.id === id ? { ...order, clientNote: newClientNote } : order
    )
  );
};


// 4. clientStyles.css (dentro de src/)
.client-dashboard {
  padding: 20px;
}

.client-dashboard table {
  width: 100%;
  border-collapse: collapse;
}

.client-dashboard th,
.client-dashboard td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}