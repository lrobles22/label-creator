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
      console.error('❌ Error loading data from Supabase:', error);
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

    const interval = setInterval(fetchOrders, 2000); // Actualización continua

    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'trottaStatus=neq.null'
        },
        payload => {
          console.log('🔁 trottaStatus changed:', payload.new.trottaStatus);
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'ghStatus=neq.null'
        },
        payload => {
          console.log('🔁 ghStatus changed:', payload.new.ghStatus);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔽 Aquí continúa todo tu código sin cambios
  const guardarEnSupabase = async (order) => {
    const {
      id,
      ghStatus,
      trottaStatus,
      note,
      payment,
      unitPrice,
      labels
    } = order;

    const payload = {
      ghStatus,
      trottaStatus,
      note,
      payment,
      unitPrice,
      labelsCount: labels?.length || 0,
      labels: JSON.stringify(labels)
    };

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error(`❌ ERROR updating order ID ${id}:`, error);
    } else {
      console.log(`✅ Order ID ${id} updated successfully`);
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

  const handleDeleteLabel = (orderId, labelIndex) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this label?");
    if (!confirmDelete) return;

    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const updatedLabels = [...order.labels];
          updatedLabels.splice(labelIndex, 1);
          const updatedOrder = { ...order, labels: updatedLabels };
          guardarEnSupabase(updatedOrder);
          return updatedOrder;
        }
        return order;
      })
    );
  };

  const handleSendLabels = (order) => {
    if (!order.labels || order.labels.length === 0) {
      alert(`No labels available for order ${order.orderNumber}`);
      return;
    }
    const labelNames = order.labels.map(l => l.name).join(', ');
    alert(`Sending labels for order ${order.orderNumber}: ${labelNames}`);
  };

  const getTotalPrice = (details, unitPrice) => {
    const match = details.match(/\d+/);
    const qty = match ? parseInt(match[0]) : 1;
    return qty * unitPrice;
  };

  const getTrottaStatusColor = (status) => {
    switch (status) {
      case 'Orden cancelado':
      case 'Llanta no disponible':
        return 'red';
      case 'Listo para recoger':
        return 'blue';
      case 'Recogido':
        return 'green';
      default:
        return 'black';
    }
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
        <h1>GH Tire House - Admin Panel</h1>

        <div className="filter-bar">
          <label>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Todos">All</option>
            <option value="Label no disponible">Label not available</option>
            <option value="Label disponible">Label available</option>
            <option value="Orden cancelado">Order canceled</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Order</th>
              <th>Date</th>
              <th>Time</th>
              <th>GH Status</th>
              <th>Action</th>
              <th>Trotta Status</th>
              <th>Notes</th>
              <th>Total</th>
              <th>Labels</th>
              <th><button onClick={() => alert('Processing all...')}>Process All</button></th>
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
                    <option value="Label no disponible">Label not available</option>
                    <option value="Label disponible">Label available</option>
                    <option value="Orden cancelado">Order canceled</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => editStatus[order.id] ? handleSaveStatus(order.id) : setEditStatus(prev => ({ ...prev, [order.id]: true }))}>
                    {editStatus[order.id] ? 'Save' : 'Edit'}
                  </button>
                </td>
                <td style={{ color: getTrottaStatusColor(order.trottaStatus) }}><strong>{order.trottaStatus || '—'}</strong></td>
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
                    {editNote[order.id] ? 'Save' : 'Edit'}
                  </button>
                </td>
                <td>${getTotalPrice(order.orderDetails, order.unitPrice)}</td>
                <td>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(order.id, e)} multiple />
                  <div>
                    {order.labels && order.labels.length > 0 ? (
                      order.labels.map((label, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <a href={label.data} download={label.name} target="_blank" rel="noopener noreferrer">
                            📄 {label.name}
                          </a>
                          <button
                            style={{
                              background: 'transparent',
                              color: 'red',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}
                            onClick={() => handleDeleteLabel(order.id, index)}
                            title="Delete label"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span>No labels</span>
                    )}
                  </div>
                </td>
                <td>
                  <button onClick={() => handleSendLabels(order)}>Send Labels</button>
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
