import React, { useState, useEffect } from 'react';
import { saveOrdersToLocalStorage, getOrdersFromLocalStorage } from './sharedStorage';
import './styles.css';

const initialOrders = [
  { id: 1, orderNumber: 'GH1001', customerName: 'Luis Robles', address: '123 Main St, NY', orderDetails: '2x 265/70R17 Ridge Grappler', date: '2025-06-14', time: '9:00 AM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 50, labels: [] },
  { id: 2, orderNumber: 'GH1002', customerName: 'Ana González', address: '456 Elm St, NJ', orderDetails: '1x 275/65R18 Michelin Defender', date: '2025-06-14', time: '9:30 AM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 60, labels: [] },
  { id: 3, orderNumber: 'GH1003', customerName: 'Carlos Martínez', address: '789 Oak St, NY', orderDetails: '4x 245/70R17 Toyo Open Country', date: '2025-06-14', time: '10:00 AM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 75, labels: [] },
  { id: 4, orderNumber: 'GH1004', customerName: 'María López', address: '321 Pine St, NJ', orderDetails: '2x 255/55R20 Pirelli Scorpion', date: '2025-06-14', time: '10:30 AM', ghStatus: 'Label disponible', trottaStatus: '', note: '', unitPrice: 70, labels: [] },
  { id: 5, orderNumber: 'GH1005', customerName: 'José Rivera', address: '654 Cedar St, NY', orderDetails: '1x 265/75R16 BFGoodrich KO2', date: '2025-06-14', time: '11:00 AM', ghStatus: 'Orden cancelado', trottaStatus: '', note: '', unitPrice: 85, labels: [] },
  { id: 6, orderNumber: 'GH1006', customerName: 'Laura Gómez', address: '987 Maple St, NJ', orderDetails: '3x 285/70R17 Goodyear Wrangler', date: '2025-06-14', time: '11:30 AM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 90, labels: [] },
  { id: 7, orderNumber: 'GH1007', customerName: 'Daniel Torres', address: '111 Birch St, NY', orderDetails: '2x 275/60R20 Falken Wildpeak', date: '2025-06-14', time: '12:00 PM', ghStatus: 'Label disponible', trottaStatus: '', note: '', unitPrice: 78, labels: [] },
  { id: 8, orderNumber: 'GH1008', customerName: 'Patricia Núñez', address: '222 Walnut St, NJ', orderDetails: '4x 265/70R17 Firestone Destination', date: '2025-06-14', time: '12:30 PM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 67, labels: [] },
  { id: 9, orderNumber: 'GH1009', customerName: 'Miguel Herrera', address: '333 Spruce St, NY', orderDetails: '1x 285/75R16 Cooper Discoverer', date: '2025-06-14', time: '1:00 PM', ghStatus: 'Label disponible', trottaStatus: '', note: '', unitPrice: 82, labels: [] },
  { id: 10, orderNumber: 'GH1010', customerName: 'Sofía Méndez', address: '444 Chestnut St, NJ', orderDetails: '2x 275/55R20 Nitto Terra Grappler', date: '2025-06-14', time: '1:30 PM', ghStatus: 'Label no disponible', trottaStatus: '', note: '', unitPrice: 88, labels: [] }
];

function AdminDashboard() {
  const [orders, setOrders] = useState(() => {
    const saved = getOrdersFromLocalStorage();
    return saved.length > 0 ? saved : initialOrders;
  });

  const [filter, setFilter] = useState('Todos');
  const [editStatus, setEditStatus] = useState({});
  const [editNote, setEditNote] = useState({});
  const [activePage, setActivePage] = useState('Ordenes Trotta');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const saved = getOrdersFromLocalStorage();
      setOrders(saved.length > 0 ? saved : initialOrders);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    saveOrdersToLocalStorage(orders);
  }, [orders]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, ghStatus: newStatus } : order));
  };

  const handleSaveStatus = (id) => setEditStatus(prev => ({ ...prev, [id]: false }));
  const handleNoteChange = (id, note) => setOrders(prev => prev.map(order => order.id === id ? { ...order, note } : order));
  const handleSaveNote = (id) => setEditNote(prev => ({ ...prev, [id]: false }));

  const getTotalPrice = (details, unitPrice) => {
    const match = details.match(/^\d+x/);
    const qty = match ? parseInt(match[0]) : 1;
    return qty * unitPrice;
  };

  // Manejo de carga de archivos PDF (labels) - múltiples archivos
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

  // Función simulada para "enviar" labels (reemplaza con tu lógica)
  const handleSendLabels = (order) => {
    if (!order.labels || order.labels.length === 0) {
      alert(`No hay labels para enviar en la orden ${order.orderNumber}`);
      return;
    }
    const labelNames = order.labels.map(l => l.name).join(', ');
    alert(`Enviando labels para orden ${order.orderNumber}: ${labelNames}`);
    // Aquí puedes agregar la lógica real para enviar los labels (ej: API, email, etc)
  };

  const filteredOrders = filter === 'Todos' ? orders : orders.filter(order => order.ghStatus === filter);

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>GH Tire Panel</h2>
        <ul>
          <li onClick={() => setActivePage('Ordenes Trotta')}>Ordenes Trotta</li>
          <li onClick={() => setActivePage('Scraper Trotta')}>Scraper Trotta</li>
          <li onClick={() => setActivePage('Actualización Inventario')}>Actualización Inventario</li>
          <li onClick={() => setActivePage('Reporte de Ventas')}>Reporte de Ventas</li>
          <li onClick={() => setActivePage('Pagos Pendientes')}>Pagos Pendientes</li>
        </ul>
      </div>

      <div className="main-content">
        <h1>GH Tire House - Panel de Administración</h1>

        {activePage === 'Ordenes Trotta' && (
          <>
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
                  <th>Estado Trotta (Cliente)</th>
                  <th>Notas</th>
                  <th>Total</th>
                  <th>Labels</th>
                  <th><button onClick={() => alert('Procesando todos...')}>Procesar todos</button></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const trottaColor =
                    order.trottaStatus === 'Cancelado - Llanta no disponible' ? 'red' :
                    order.trottaStatus === 'Listo para recojida' ? 'green' : 'inherit';

                  return (
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
                      <td style={{ color: trottaColor, fontWeight: 'bold' }}>{order.trottaStatus || '—'}</td>
                      <td>
                        <textarea
                          value={order.note}
                          onChange={(e) => handleNoteChange(order.id, e.target.value)}
                          onDoubleClick={() => setEditNote(prev => ({ ...prev, [order.id]: true }))}
                          disabled={!editNote[order.id]}
                          rows={2}
                          style={{ width: '100%', resize: 'none' }}
                        />
                        <button onClick={() => editNote[order.id] ? handleSaveNote(order.id) : setEditNote(prev => ({ ...prev, [order.id]: true }))}>
                          {editNote[order.id] ? 'Guardar' : 'Editar'}
                        </button>
                      </td>
                      <td>${getTotalPrice(order.orderDetails, order.unitPrice)}</td>
                      <td>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(order.id, e)}
                          multiple
                        />
                        <div>
                          {order.labels && order.labels.length > 0 ? (
                            order.labels.map((label, index) => (
                              <div key={index}>
                                <a
                                  href={label.data}
                                  download={label.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
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
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
