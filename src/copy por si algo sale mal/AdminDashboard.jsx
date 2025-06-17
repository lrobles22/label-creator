import React, { useState } from 'react';
import './styles.css';

const initialOrders = [
  { id: 1, orderNumber: 'GH1001', customerName: 'Luis Robles', address: '123 Main St, NY', orderDetails: '2x 265/70R17 Ridge Grappler', date: '2025-06-14', time: '9:00 AM', ghStatus: 'Label no disponible', trottaStatus: 'Listo para recoger', note: '', payment: 'Pending', unitPrice: 50 },
  { id: 2, orderNumber: 'GH1002', customerName: 'Ana González', address: '456 Elm St, NJ', orderDetails: '1x 275/65R18 Michelin Defender', date: '2025-06-14', time: '9:30 AM', ghStatus: 'Label no disponible', trottaStatus: 'Llanta no disponible', note: '', payment: 'Paid', unitPrice: 60 },
  { id: 3, orderNumber: 'GH1003', customerName: 'Carlos Martínez', address: '789 Oak St, NY', orderDetails: '4x 245/70R17 Toyo Open Country', date: '2025-06-14', time: '10:00 AM', ghStatus: 'Label disponible', trottaStatus: 'Listo para recoger', note: '', payment: 'Pending', unitPrice: 55 },
  { id: 4, orderNumber: 'GH1004', customerName: 'María Pérez', address: '321 Pine St, NJ', orderDetails: '2x 255/75R17 BFGoodrich KO2', date: '2025-06-14', time: '10:30 AM', ghStatus: 'Orden cancelado', trottaStatus: 'Llanta no disponible', note: '', payment: 'Pending', unitPrice: 70 },
  { id: 5, orderNumber: 'GH1005', customerName: 'Juan López', address: '654 Maple St, NY', orderDetails: '1x 235/85R16 Firestone Transforce', date: '2025-06-14', time: '11:00 AM', ghStatus: 'Label disponible', trottaStatus: 'Listo para recoger', note: '', payment: 'Pending', unitPrice: 48 },
  { id: 6, orderNumber: 'GH1006', customerName: 'Elena Torres', address: '987 Cedar Ave, NY', orderDetails: '3x 265/75R16 Goodyear Wrangler', date: '2025-06-14', time: '11:30 AM', ghStatus: 'Label no disponible', trottaStatus: 'Listo para recoger', note: '', payment: 'Paid', unitPrice: 62 },
  { id: 7, orderNumber: 'GH1007', customerName: 'Pedro Gómez', address: '789 Birch Blvd, NJ', orderDetails: '2x 225/70R16 Kumho Road Venture', date: '2025-06-14', time: '12:00 PM', ghStatus: 'Label disponible', trottaStatus: 'Llanta no disponible', note: '', payment: 'Pending', unitPrice: 47 },
  { id: 8, orderNumber: 'GH1008', customerName: 'Rosa Díaz', address: '456 Spruce St, NY', orderDetails: '1x 215/75R15 Falken Wildpeak', date: '2025-06-14', time: '12:30 PM', ghStatus: 'Orden cancelado', trottaStatus: 'Listo para recoger', note: '', payment: 'Pending', unitPrice: 52 },
  { id: 9, orderNumber: 'GH1009', customerName: 'Santiago Ruiz', address: '123 Walnut St, NJ', orderDetails: '4x 285/70R17 Yokohama Geolandar', date: '2025-06-14', time: '1:00 PM', ghStatus: 'Label disponible', trottaStatus: 'Llanta no disponible', note: '', payment: 'Paid', unitPrice: 69 },
  { id: 10, orderNumber: 'GH1010', customerName: 'Lucía Herrera', address: '321 Hickory Ln, NY', orderDetails: '2x 245/75R16 Continental TerrainContact', date: '2025-06-14', time: '1:30 PM', ghStatus: 'Label no disponible', trottaStatus: 'Listo para recoger', note: '', payment: 'Pending', unitPrice: 57 }
];

function AdminDashboard() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState('Todos');
  const [editStatus, setEditStatus] = useState({});
  const [editNote, setEditNote] = useState(() => {
    const initial = {};
    initialOrders.forEach(order => {
      initial[order.id] = false;
    });
    return initial;
  });
  const [activePage, setActivePage] = useState('Ordenes Trotta');

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, ghStatus: newStatus } : order
    ));
  };

  const handlePaymentChange = (id, newPayment) => {
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, payment: newPayment } : order
    ));
  };

  const handleToggleEdit = (id) => {
    setEditStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleNoteEdit = (id) => {
    setEditNote(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNoteChange = (id, note) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, note } : order
      )
    );
  };

  const handleFileUpload = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Archivo adjuntado para orden ${id}: ${file.name}`);
    }
  };

  const getTotalPrice = (details, unitPrice) => {
    const match = details.match(/^(\d+)x/);
    const qty = match ? parseInt(match[1]) : 1;
    return qty * unitPrice;
  };

  const filteredOrders = filter === 'Todos'
    ? orders
    : orders.filter(order => order.ghStatus === filter);

  const pendingPayments = orders.filter(order => order.payment === 'Pending');
  const totalPendingAmount = pendingPayments.reduce((acc, order) => acc + getTotalPrice(order.orderDetails, order.unitPrice), 0);

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

        {activePage === 'Scraper Trotta' ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>
            🔧 Esta página está bajo construcción
          </div>
        ) : activePage === 'Pagos Pendientes' ? (
          <div>
            <h2>Órdenes con pago pendiente</h2>
            <p><strong>Total pendiente: </strong>${totalPendingAmount}</p>
            <table>
              <thead>
                <tr>
                  <th>Orden #</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Detalles</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado GH</th>
                  <th>Estado Trotta</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map(order => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.address}</td>
                    <td>{order.orderDetails}</td>
                    <td>{order.date}</td>
                    <td>{order.time}</td>
                    <td>{order.ghStatus}</td>
                    <td>{order.trottaStatus}</td>
                    <td>${getTotalPrice(order.orderDetails, order.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
                  <th>Estado Trotta</th>
                  <th>Label</th>
                  <th>Notas</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>
                    <button className="secondary-btn" onClick={() => alert('Procesando todos...')}>
                      Procesar todos
                    </button>
                  </th>
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
                      <button onClick={() => handleToggleEdit(order.id)}>
                        {editStatus[order.id] ? 'Guardar' : 'Editar'}
                      </button>
                    </td>
                    <td>{order.trottaStatus}</td>
                    <td>
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(order.id, e)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <textarea
                          rows={editNote[order.id] ? 5 : 2}
                          cols="15"
                          placeholder="Nota..."
                          value={order.note}
                          onChange={(e) => handleNoteChange(order.id, e.target.value)}
                          onDoubleClick={() =>
                            setEditNote(prev => ({ ...prev, [order.id]: !prev[order.id] }))
                          }
                          style={{
                            resize: 'none',
                            transition: 'all 0.2s ease-in-out',
                            height: editNote[order.id] ? '100px' : '40px',
                            overflow: 'auto',
                            width: '100%',
                            padding: '4px',
                            fontSize: '14px',
                          }}
                        />
                        <button
                          className="mini-btn"
                          style={{ marginTop: '4px' }}
                          onClick={() => handleToggleNoteEdit(order.id)}
                        >
                          {editNote[order.id] ? 'Guardar' : 'Editar'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <select
                        value={order.payment}
                        onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td>${getTotalPrice(order.orderDetails, order.unitPrice)}</td>
                    <td>
                      <button
                        className="download-btn"
                        onClick={() => alert(`Procesando orden ${order.orderNumber}`)}
                      >
                        Ejecutar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
