import React, { useState, useEffect } from 'react';
import './styles.css';

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbz1TBCIkrZO0Kr0IUn9KaexLQTxHbU2kiUV4QoTkUKfCxxcZDjbVlMEPe3ZNvHhBlfa/exec';
const ACTUALIZAR_ORDEN_API = 'https://script.google.com/macros/s/AKfycbwiTVxHGom_JW7PJkEhbQ79QedtNreVxlmGirY72MSpqmq0DSu3fD4IV9PztzJ-TE3V/exec';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [editStatus, setEditStatus] = useState({});
  const [editNote, setEditNote] = useState({});

  useEffect(() => {
    fetch(GOOGLE_SHEET_API)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item, index) => ({
          id: parseInt(item.ID) || index + 1,
          orderNumber: item.OrderNumber,
          customerName: item.CustomerName,
          address: item.Address,
          orderDetails: item.OrderDetails,
          date: item.Date,
          time: item.Time,
          ghStatus: item.GHStatus,
          trottaStatus: item.TrottaStatus,
          note: item.Note,
          payment: item.Payment,
          unitPrice: parseFloat(item.UnitPrice) || 0,
          labelsCount: parseInt(item.LabelsCount) || 0,
          labels: []
        }));
        setOrders(formatted);
      })
      .catch(err => console.error('❌ Error al cargar datos desde Google Sheets:', err));
  }, []);

  const guardarEnSheet = (order) => {
    fetch(ACTUALIZAR_ORDEN_API, {
      method: "POST",
      body: JSON.stringify({
        OrderNumber: String(order.orderNumber).trim(),
        CustomerName: order.customerName,
        Address: order.address,
        OrderDetails: order.orderDetails,
        Date: order.date,
        Time: order.time,
        GHStatus: order.ghStatus,
        TrottaStatus: order.trottaStatus,
        Note: order.note,
        Payment: order.payment,
        UnitPrice: order.unitPrice,
        LabelsCount: order.labels?.length || 0
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.text())
      .then(txt => {
        console.log("✅ Respuesta Apps Script:", txt);
        alert(`✅ Cambios guardados para la orden ${order.orderNumber}`);
      })
      .catch(err => {
        console.error("❌ Error al guardar en Sheets:", err);
        alert(`❌ Error al guardar cambios para la orden ${order.orderNumber}`);
      });
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ghStatus: newStatus } : order
      )
    );
  };

  const handleSaveStatus = (id) => {
    setEditStatus(prev => ({ ...prev, [id]: false }));
    const order = orders.find(o => o.id === id);
    guardarEnSheet(order);
  };

  const handleNoteChange = (id, note) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, note } : order
      )
    );
  };

  const handleSaveNote = (id) => {
    setEditNote(prev => ({ ...prev, [id]: false }));
    const order = orders.find(o => o.id === id);
    guardarEnSheet(order);
  };

  const handleFileUpload = (id, event) => {
    const files = event.target.files;
    if (!files.length) return;

    const readers = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ name: file.name, data: e.target.result });
        };
        reader.readAsDataURL(file);
      }));
    }

    Promise.all(readers).then((newLabels) => {
      setOrders(prev =>
        prev.map(order => {
          if (order.id === id) {
            const combinedLabels = order.labels ? [...order.labels, ...newLabels] : newLabels;
            return { ...order, labels: combinedLabels };
          }
          return order;
        })
      );
    });
  };

  const handleSendLabels = (order) => {
    if (!order.labels || order.labels.length === 0) {
      alert(`No hay labels para enviar en la orden ${order.orderNumber}`);
      return;
    }
    const labelNames = order.labels.map(l => l.name).join(', ');
    alert(`Enviando labels para orden ${order.orderNumber}: ${labelNames}`);
  };

  const getTotalPrice = (details, unitPrice) => {
    const match = details.match(/^(\d+)x/);
    const qty = match ? parseInt(match[1]) : 1;
    return qty * unitPrice;
  };

  const filteredOrders = filter === 'Todos' ? orders : orders.filter(order => order.ghStatus === filter);

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>GH Tire Panel</h2>
        <ul>
          <li>Ordenes Trotta</li>
          <li>Scraper Trotta</li>
          <li>Actualización Inventario</li>
          <li>Reporte de Ventas</li>
          <li>Pagos Pendientes</li>
        </ul>
      </div>

      <div className="main-content">
        <h1>GH Tire House - Panel de Administración</h1>

        <div className="filter-bar">
          <label>Filtrar por estado:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Label no disponible">Label no disponible</option>
            <option value="Label disponible">Label disponible</option>
            <option value="Orden cancelado">Orden cancelado</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Orden #</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Orden</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado GH</th>
              <th>Acción</th>
              <th>Estado Trotta</th>
              <th>Notas</th>
              <th>Total</th>
              <th>Labels</th>
              <th><button onClick={() => alert('Procesando todos...')}>Procesar todos</button></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.address}</td>
                <td>{order.orderDetails}</td>
                <td>{order.date}</td>
                <td>{order.time}</td>
                <td>
                  <select
                    value={order.ghStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={!editStatus[order.id]}
                  >
                    <option value="Label no disponible">Label no disponible</option>
                    <option value="Label disponible">Label disponible</option>
                    <option value="Orden cancelado">Orden cancelado</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => editStatus[order.id] ? handleSaveStatus(order.id) : setEditStatus(prev => ({ ...prev, [order.id]: true }))}>
                    {editStatus[order.id] ? 'Guardar' : 'Editar'}
                  </button>
                </td>
                <td><strong>{order.trottaStatus || '—'}</strong></td>
                <td>
                  <textarea
                    value={order.note}
                    onChange={(e) => handleNoteChange(order.id, e.target.value)}
                    onDoubleClick={() => setEditNote(prev => ({ ...prev, [order.id]: true }))}
                    disabled={!editNote[order.id]}
                    rows={2}
                    style={{ width: '100%' }}
                  />
                  <button onClick={() => editNote[order.id] ? handleSaveNote(order.id) : setEditNote(prev => ({ ...prev, [order.id]: true }))}>
                    {editNote[order.id] ? 'Guardar' : 'Editar'}
                  </button>
                </td>
                <td>${getTotalPrice(order.orderDetails, order.unitPrice)}</td>
                <td>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(order.id, e)} multiple />
                  <div>
                    {order.labels && order.labels.length > 0 ? (
                      order.labels.map((label, index) => (
                        <div key={index}>
                          <a href={label.data} download={label.name} target="_blank" rel="noopener noreferrer">
                            📥 {label.name}
                          </a>
                        </div>
                      ))
                    ) : (
                      <span>No hay labels</span>
                    )}
                  </div>
                </td>
                <td>
                  <button onClick={() => handleSendLabels(order)}>Enviar Labels</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
