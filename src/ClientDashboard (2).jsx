import React, { useContext, useState } from "react";
import { OrdersContext } from "./OrdersProvider";
import "./styles.css"; // Mantén el mismo estilo que admin

const ClientDashboard = () => {
  const { orders, updateTrottaStatus, updateTrottaNotes } = useContext(OrdersContext);

  const [editedStatus, setEditedStatus] = useState({});
  const [editedNotes, setEditedNotes] = useState({});

  const handleStatusChange = (id, value) => {
    setEditedStatus((prev) => ({ ...prev, [id]: value }));
  };

  const handleNotesChange = (id, value) => {
    setEditedNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateStatus = (id) => {
    if (editedStatus[id] !== undefined) {
      updateTrottaStatus(id, editedStatus[id]);
    }
  };

  const handleUpdateNotes = (id) => {
    if (editedNotes[id] !== undefined) {
      updateTrottaNotes(id, editedNotes[id]);
    }
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Panel Cliente</h2>
        {/* Sidebar vacío por ahora */}
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <h1>Panel Cliente - Trotta Tire</h1>
          <table>
            <thead>
              <tr>
                <th>Orden #</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Orden</th>
                <th>Fecha y Hora</th>
                <th>Estado Gun Hill</th>
                <th>Estado Shipping</th>
                <th>Acción</th>
                <th>Notas Trotta</th>
                <th>Guardar Nota</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const fechaHora = `${order.date} ${order.time}`;
                const shippingStatus = editedStatus[order.id] ?? order.trottaStatus;
                const notes = editedNotes[order.id] ?? order.note;
                const labelUrl = order.labelUrl; // Asume que tienes esta propiedad con URL al PDF

                return (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.address}</td>
                    <td>{order.orderDetails}</td>
                    <td>{fechaHora}</td>
                    <td>{order.ghStatus}</td> {/* Solo lectura */}
                    <td>
                      <select
                        value={shippingStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Cancelado - Llanta no disponible">Cancelado - Llanta no disponible</option>
                        <option value="Listo para recojida">Listo para recojida</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleUpdateStatus(order.id)}>Actualizar</button>
                    </td>
                    <td>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => handleNotesChange(order.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleUpdateNotes(order.id)}>Guardar</button>
                    </td>
                    <td>
                      {labelUrl ? (
                        <a href={labelUrl} download target="_blank" rel="noopener noreferrer">
                          📥 Descargar
                        </a>
                      ) : (
                        "No disponible"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
