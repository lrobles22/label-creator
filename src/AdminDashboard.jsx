import React, { useState, useEffect } from 'react';
import './styles.css';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [editStatus, setEditStatus] = useState({});
  const [editNote, setEditNote] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('❌ Error al cargar datos desde Supabase:', error);
    } else {
      const enrichedData = data.map(order => ({
        ...order,
        labels: order.labels ? JSON.parse(order.labels) : []
      }));
      setOrders(enrichedData);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔔 SUSCRIPCIÓN REALTIME
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        payload => {
          console.log('📥 Cambio recibido en tiempo real:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const guardarEnSupabase = async (order) => {
    const payload = {
      ghStatus: order.ghStatus,
      trottaStatus: order.trottaStatus,
      note: order.note,
      payment: order.payment,
      unitPrice: order.unitPrice,
      labelsCount: order.labels?.length || 0
    };

    console.log(`📤 Intentando actualizar orden ID ${order.id}...`);
    console.log('📦 Payload a enviar a Supabase:', payload);

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', order.id);

    if (error) {
      console.error(`❌ ERROR al guardar orden ID ${order.id}:`, error);
    } else {
      console.log(`✅ Orden ID ${order.id} actualizada correctamente`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ghStatus: newStatus } : order
      )
    );

    const order = orders.find(o => o.id === id);
    if (order) {
      order.ghStatus = newStatus;
      await guardarEnSupabase(order);
    }
  };

  const handleNoteChange = async (id, note) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, note } : order
      )
    );

    const order = orders.find(o => o.id === id);
    if (order) {
      order.note = note;
      await guardarEnSupabase(order);
    }
  };

  const handleSaveStatus = (id) => {
    setEditStatus(prev => ({ ...prev, [id]: false }));
    setIsEditing(false);
  };

  const handleSaveNote = (id) => {
    setEditNote(prev => ({ ...prev, [id]: false }));
    setIsEditing(false);
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
            const updatedOrder = { ...order, labels: combinedLabels };
            guardarEnSupabase(updatedOrder);
            return updatedOrder;
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
    const match = details.match(/\d+/);
    const qty = match ? parseInt(match[0]) : 1;
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
                    disabled={!editNote[order.id]}
                    rows={2}
                    style={{ width: '100%' }}
                  />
                  <button
                    onClick={() => {
                      if (editNote[order.id]) {
                        handleSaveNote(order.id);
                      } else {
                        setEditNote(prev => ({ ...prev, [order.id]: true }));
                      }
                    }}
                  >
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
                            📅 {label.name}
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
