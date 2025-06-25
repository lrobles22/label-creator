import React, { useState, useEffect } from 'react';
import './styles.css';
import { supabase } from './supabaseClient';

function AdminDashboard() {
useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario"));
    if (!storedUser || storedUser.role !== "admin") {
      window.location.href = "/";
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [editStatus, setEditStatus] = useState({});
  const [editNote, setEditNote] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempCompany, setTempCompany] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCompany, setNewUserCompany] = useState('Trotta Tires');
  const [newUserRole, setNewUserRole] = useState('client');

  
  const handleDelete = async (orderId) => {
    try {
      console.log("🧨 Intentando eliminar orden:", orderId);
      const confirmed = window.confirm("Are you sure you want to delete this order?");
      if (!confirmed) return;

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        alert("Failed to delete order: " + error.message);
      } else {
        console.log("✅ Orden eliminada con éxito:", orderId);
        alert("Order deleted successfully.");
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      alert("Unexpected error.");
    }
  };

const ordenarPorFecha = (lista) => {
    return [...lista].sort((a, b) => {
      const fechaA = new Date(`${a.date || '1970-01-01'} ${a.time || '00:00'}`);
      const fechaB = new Date(`${b.date || '1970-01-01'} ${b.time || '00:00'}`);
      return fechaB - fechaA;
    });
  };

  const agregarUsuario = async (email, password, role, company) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { role, company },
        email_confirm: true,
      });
      if (error) {
        console.error('❌ Error creando usuario:', error.message);
        alert(`Error: ${error.message}`);
      } else {
        alert(`✅ Usuario ${email} creado correctamente`);
      }
    } catch (e) {
      console.error('❌ Excepción creando usuario:', e.message);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('❌ Error loading data from Supabase:', error);
    } else {
      const enrichedData = data.map(order => ({
        ...order,
        labels: order.labels ? JSON.parse(order.labels) : [],
        ghStatus: order.ghStatus || 'Label not available',
        company: order.company || (order.orderDetails?.includes("Warehouse: ttires-1") ? "Trotta Tires" : "")
      }));

      setOrders(ordenarPorFecha(enrichedData));
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    const channel = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const guardarEnSupabase = async (order) => {
    const { id, ghStatus, trottaStatus, note, payment, unitPrice, labels, company } = order;
    const payload = {
      ghStatus,
      trottaStatus,
      note,
      payment,
      unitPrice,
      company,
      labelsCount: labels?.length || 0,
      labels: JSON.stringify(labels)
    };
    const { error } = await supabase.from('orders').update(payload).eq('id', id);
    if (error) console.error(`❌ ERROR updating order ID ${id}:`, error);
  };

  const handleStatusChange = async (id, newStatus) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, ghStatus: newStatus } : order));
    const order = orders.find(o => o.id === id);
    if (order) await guardarEnSupabase({ ...order, ghStatus: newStatus });
  };

  const handleNoteChange = async (id, note) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, note } : order));
    const order = orders.find(o => o.id === id);
    if (order) await guardarEnSupabase({ ...order, note });
  };

  const handleSaveStatus = async (id) => {
    setEditStatus(prev => ({ ...prev, [id]: false }));
    setIsEditing(false);
    const order = orders.find(o => o.id === id);
    if (order) {
      const updated = { ...order, company: tempCompany[id] };
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      await guardarEnSupabase(updated);
    }
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
        reader.onload = (e) => resolve({ name: file.name, data: e.target.result });
        reader.readAsDataURL(file);
      }));
    }

    Promise.all(readers).then((newLabels) => {
      setOrders(prev => ordenarPorFecha(prev.map(order => {
        if (order.id === id) {
          const combinedLabels = order.labels ? [...order.labels, ...newLabels] : newLabels;
          const updatedOrder = { ...order, labels: combinedLabels };
          guardarEnSupabase(updatedOrder);
          return updatedOrder;
        }
        return order;
      })));
    });
  };

  const handleDeleteLabel = (orderId, labelIndex) => {
    if (!window.confirm("Are you sure you want to delete this label?")) return;
    setOrders(prev => ordenarPorFecha(prev.map(order => {
      if (order.id === orderId) {
        const updatedLabels = [...order.labels];
        updatedLabels.splice(labelIndex, 1);
        const updatedOrder = { ...order, labels: updatedLabels };
        guardarEnSupabase(updatedOrder);
        return updatedOrder;
      }
      return order;
    })));
  };

  const handleSendLabels = (order) => {
    if (!order.labels || order.labels.length === 0) {
      alert(`No labels available for order $
        <span
          onClick={(e) => {
            e.preventDefault();
            handleDelete(order.id);
          }}
          style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px' }}
          title="Delete order"
        >
          ❌
        </span>
        {order.orderNumber}
        `);
      return;
    }
    const labelNames = order.labels.map(l => l.name).join(', ');
    alert(`Sending labels for order $
        <span
          onClick={(e) => {
            e.preventDefault();
            handleDelete(order.id);
          }}
          style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px' }}
          title="Delete order"
        >
          ❌
        </span>
        {order.orderNumber}
        : ${labelNames}`);
  };

  const getTotalPrice = (details, unitPrice) => {
    const match = details.match(/\\d+/);
    const qty = match ? parseInt(match[0]) : 1;
    return qty * unitPrice;
  };

  const getTrottaStatusClass = (status) => {
    if (!status) return 'badge-gray';
    const normalized = status.trim().toLowerCase();
    if (normalized === 'listo para recojida') return 'badge-blue';
    if (normalized === 'recojido') return 'badge-green';
    if (normalized === 'cancelado - llanta no disponible' || normalized === 'orden cancelado') return 'badge-red';
    return 'badge-gray';
  };

  const getGhStatusClass = (status) => {
    if (!status) return 'status-gray';
    const normalized = status.trim().toLowerCase();
    if (normalized === 'label not available' || normalized === 'label no disponible') return 'status-blue';
    if (normalized === 'label available' || normalized === 'label disponible') return 'status-green';
    if (normalized === 'order canceled' || normalized === 'orden cancelado') return 'status-red';
    return 'status-gray';
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
          <li onClick={() => setShowModal(true)} style={{ cursor: 'pointer', color: '#007bff' }}>
            ➕ Crear Usuario
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h1>GH Tire House - Admin Panel</h1>

        <div className="filter-bar">
          <label>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Label no disponible">Label not available</option>
            <option value="Label disponible">Label available</option>
            <option value="Envio pendiente">Envio pendiente</option>
            <option value="Label pendiente">Label pendiente</option>
            <option value="Listo para recojida">Listo para recojida</option>
            <option value="Cancelado - Llanta no disponible">Cancelado - Llanta no disponible</option>
            <option value="Recojido">Recojido</option>
            <option value="Orden cancelado">Orden Cancelado Por Gun Hill</option>
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
              <th>Company</th>
              <th>Trotta Status</th>
              <th>Notes</th>
              <th>Total</th>
              <th>Labels</th>
              <th>Send</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>
        <span
          onClick={(e) => {
            e.preventDefault();
            handleDelete(order.id);
          }}
          style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px' }}
          title="Delete order"
        >
          ❌
        </span>
        {order.orderNumber}
        </td>
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
                    className={getGhStatusClass(order.ghStatus)}
                  >
                    <option value="Label no disponible">Label not available</option>
                    <option value="Label disponible">Label available</option>
                    <option value="Orden cancelado">Order canceled</option>
                  </select>
                </td>
                <td>
                  <button onClick={() =>
                    editStatus[order.id]
                      ? handleSaveStatus(order.id)
                      : setEditStatus(prev => {
                    setTempCompany(t => ({ ...t, [order.id]: order.company || "" }));
                    return { ...prev, [order.id]: true };
                  })
                  }>
                    {editStatus[order.id] ? 'Save' : 'Edit'}
                  </button>
                </td>
                <td>
                  {editStatus[order.id] ? (
                    <select
                      value={tempCompany[order.id] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTempCompany(prev => ({ ...prev, [order.id]: value }));
                      }}
                    >
                      <option value="">Unassigned</option>
                      <option value="Trotta Tires">Trotta Tires</option>
                      <option value="IPW">IPW</option>
                      <option value="Velocity Wheels">Velocity Wheels</option>
                      <option value="Webster Tires">Webster Tires</option>
                      <option value="Gun Hill Tire house">Gun Hill Tire house</option>
                    </select>
                  ) : (
                    <span>{order.company || "—"}</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${getTrottaStatusClass(order.trottaStatus)}`}>
                    {order.trottaStatus || '—'}
                  </span>
                </td>
                <td>
                  <textarea
                    value={order.note}
                    onChange={(e) => handleNoteChange(order.id, e.target.value)}
                    disabled={!editNote[order.id]}
                    rows={2}
                    style={{ width: '100%' }}
                  />
                  <button onClick={() => editNote[order.id] ? handleSaveNote(order.id) : setEditNote(prev => ({ ...prev, [order.id]: true }))}>
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
                            style={{ background: 'transparent', color: 'red', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                            onClick={() => handleDeleteLabel(order.id, index)}
                            title="Delete label"
                          >×</button>
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear nuevo usuario</h3>
            <label>Email:</label>
            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            <label>Contraseña:</label>
            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
            <label>Compañía:</label>
            <input type="text" value={newUserCompany} onChange={(e) => setNewUserCompany(e.target.value)} />
            <label>Rol:</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <label>
                <input type="radio" name="role" value="admin" checked={newUserRole === 'admin'} onChange={() => setNewUserRole('admin')} /> Admin
              </label>
              <label>
                <input type="radio" name="role" value="client" checked={newUserRole === 'client'} onChange={() => setNewUserRole('client')} /> Cliente
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button onClick={async () => {
                await agregarUsuario(newUserEmail, newUserPassword, newUserRole, newUserCompany);
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserCompany('Trotta Tires');
                setNewUserRole('client');
                setShowModal(false);
              }}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;




