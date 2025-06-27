// ClientDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import { supabase } from './supabaseClient';

const ClientDashboard = () => {
  console.log("✅ ClientDashboard montado");

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState(false);
  const [editStatus, setEditStatus] = useState({});
  const [tempStatus, setTempStatus] = useState({});
  const [modalLabels, setModalLabels] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const modalRef = useRef(null);
  const dragData = useRef({ isDragging: false, originX: 0, originY: 0, translateX: 0, translateY: 0 });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuario_cliente"));
    if (!storedUser || storedUser.role !== "client") {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error || !Array.isArray(data)) {
        console.error("❌ Error al cargar datos desde Supabase:", error);
        setError(true);
        return;
      }

      let formatted = data.map((item, index) => {
        let parsedLabels = [];
        try {
          parsedLabels = item.labels ? JSON.parse(item.labels) : [];
        } catch (e) {
          console.warn(`⚠️ Error parseando labels en ID ${item.id ?? index + 1}:`, e);
        }

        return {
          id: item.id ?? index + 1,
          orderNumber: item.orderNumber,
          customerName: item.customerName,
          address: item.address,
          orderDetails: item.orderDetails,
          date: item.date,
          time: item.time,
          ghStatus: item.ghStatus,
          trottaStatus: item.trottaStatus,
          note: item.note,
          payment: item.payment,
          unitPrice: item.unitPrice ?? 0,
          labelsCount: parseInt(item.labelsCount) || 0,
          labels: parsedLabels,
          company: item.company || ""
        };
      });

      formatted.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
      const storedUser = JSON.parse(localStorage.getItem("usuario_cliente"));
      if (storedUser?.role === "client" && storedUser?.company) {
        formatted = formatted.filter((order) => order.company === storedUser.company);
      }
      setOrders(formatted);
      setError(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);
  const base64ToBlobUrl = (base64Data, contentType = "application/pdf") => {
    try {
      const byteCharacters = atob(base64Data.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      return URL.createObjectURL(new Blob([byteArray], { type: contentType }));
    } catch {
      return base64Data;
    }
  };

  const handleEnableEdit = (id) => {
    setEditStatus(prev => ({ ...prev, [id]: true }));
    const currentStatus = orders.find(o => o.id === id)?.trottaStatus || "";
    setTempStatus(prev => ({ ...prev, [id]: currentStatus }));
  };

  const handleTempStatusChange = (id, value) => {
    setTempStatus(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateStatus = async (id) => {
    const newStatus = tempStatus[id];
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, trottaStatus: newStatus } : order
    );

    const ordered = updatedOrders.sort((a, b) => {
      const dateA = new Date(`${a.date || '1970-01-01'} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date || '1970-01-01'} ${b.time || '00:00'}`);
      return dateB - dateA;
    });

    setOrders(ordered);
    setEditStatus(prev => ({ ...prev, [id]: false }));

    const { error } = await supabase
      .from('orders')
      .update({ trottaStatus: newStatus })
      .eq('id', id);

    if (error) {
      console.error("❌ Error al actualizar en Supabase:", error);
    }
  };

  const renderGhStatusBadge = (status) => {
    if (!status || status.trim() === '') {
      return <span className="badge badge-black">🕓 Pending</span>;
    }
    const lower = status.toLowerCase();
    if (lower.includes("cancelado")) return <span className="badge badge-red">❌ Order Cancelled by Gun Hill</span>;
    if (lower.includes("label disponible")) return <span className="badge badge-green glow">✅ Label Available</span>;
    if (lower.includes("no disponible")) return <span className="badge badge-blue">📦 Label Not Available</span>;
    return <span className="badge badge-black">🕓 {status}</span>;
  };

  const openModal = (order, labels) => {
    setModalOrder(order);
    setModalLabels(labels);
    if (modalRef.current) {
      modalRef.current.style.transform = "translate(0px, 0px)";
      dragData.current.translateX = 0;
      dragData.current.translateY = 0;
    }
  };

  const onDragStart = (e) => {
    dragData.current.isDragging = true;
    dragData.current.originX = e.clientX;
    dragData.current.originY = e.clientY;
  };

  const onDragEnd = () => {
    dragData.current.isDragging = false;
  };

  const onDrag = (e) => {
    if (!dragData.current.isDragging) return;
    const deltaX = e.clientX - dragData.current.originX;
    const deltaY = e.clientY - dragData.current.originY;
    const newTranslateX = dragData.current.translateX + deltaX;
    const newTranslateY = dragData.current.translateY + deltaY;
    if (modalRef.current) {
      modalRef.current.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
    }
    dragData.current.originX = e.clientX;
    dragData.current.originY = e.clientY;
    dragData.current.translateX = newTranslateX;
    dragData.current.translateY = newTranslateY;
  };
  const handleLogout = () => {
    localStorage.removeItem("usuario_cliente");
    window.location.href = "/";
  };

  console.log("🧪 Órdenes cargadas (sin filtro):", orders);

  const filteredOrders = orders.filter(order => {
    if (filter === "All") return true;

    // GH exactos
    if (filter === "Label Available")
      return order.ghStatus && order.ghStatus.trim().toLowerCase() === "label disponible";
    if (filter === "Label Not Available")
      return order.ghStatus && order.ghStatus.trim().toLowerCase() === "label no disponible";
    if (filter === "Order Cancelled by Gun Hill")
      return order.ghStatus && order.ghStatus.trim().toLowerCase() === "orden cancelado";

    // Trotta exactos
    if (filter === "Shipping Pending")
      return order.trottaStatus && order.trottaStatus.trim().toLowerCase() === "pending";
    if (filter === "Label Pending")
      return !order.ghStatus || order.ghStatus.trim() === "" || 
             ["pending", "label no disponible"].includes(order.ghStatus.trim().toLowerCase());

    if (filter === "Ready for Pickup")
      return order.trottaStatus && order.trottaStatus.trim().toLowerCase() === "ready for pickup";
    if (filter === "Cancelled - Tire Not Available")
      return order.trottaStatus && order.trottaStatus.trim().toLowerCase() === "cancelled - tire not available";
    if (filter === "Picked Up")
      return order.trottaStatus && order.trottaStatus.trim().toLowerCase() === "picked up";

    // Lógica combinada estricta para label not available
    if (filter === "Label Not Available") {
      return (!order.labels || order.labels.length === 0) &&
             order.ghStatus && order.ghStatus.trim().toLowerCase() === "label no disponible";
    }

    // Lógica estricta para label available
    if (filter === "Label Available") {
      const status = order.trottaStatus?.trim().toLowerCase();
      if (status === "ready for pickup" || status === "picked up") return false;
      return order.labels && order.labels.length > 0 &&
             order.ghStatus && order.ghStatus.trim().toLowerCase() === "label disponible";
    }

    return true;
  });
  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>📁 My Account</h2>
        <ul>
          <li onClick={() => setFilter("All")}>📦 All</li>
          <li onClick={() => setFilter("Label Available")}>✅ Label Available</li>
          <li onClick={() => setFilter("Label Not Available")}>📦 Label Not Available</li>
          <li onClick={() => setFilter("Shipping Pending")}>🚚 Shipping Pending</li>
          <li onClick={() => setFilter("Ready for Pickup")}>📋 Ready for Pickup</li>
          <li onClick={() => setFilter("Picked Up")}>📤 Picked Up</li>
          <li onClick={() => setFilter("Cancelled - Tire Not Available")}>❌ Cancelled - Tire Not Available</li>
          <li onClick={() => setFilter("Order Cancelled by Gun Hill")}>❌ Order Cancelled by Gun Hill</li>
        </ul>
        <hr />
        <div className="coming-soon">
          <p style={{ color: "#888" }}>⚙️ Configuración (coming soon)</p>
          <p style={{ color: "#888" }}>📊 Reporte (coming soon)</p>
          <p style={{ color: "#888" }}>💳 Bill pendiente (coming soon)</p>
        </div>
        <hr />
        <button onClick={handleLogout} className="logout-button">🔓 Logout</button>
      </div>

      <div className="main-content">
        <div className="content-wrapper" style={{ maxWidth: "95%", margin: "0 auto" }}>
          <h1>Panel Customer - Trotta Tire</h1>
<div className="filter-bar">
  <label>Filter by Status del Label:</label>
  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
    <option value="All">All</option>
    <option value="Label Available">Label Available</option>
    <option value="Label Not Available">Label Not Available</option>
    <option value="Shipping Pending">Shipping Pending</option>
    <option value="Ready for Pickup">Ready for Pickup</option>
    <option value="Picked Up">Picked Up</option>
    <option value="Cancelled - Tire Not Available">Cancelled - Tire Not Available</option>
    <option value="Order Cancelled by Gun Hill">Order Cancelled by Gun Hill</option>
  </select>
</div>


          {error && (
            <div style={{ backgroundColor: "#ffe0e0", color: "#a00", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
              ⚠️ Could not load data from Supabase. Showing last valid copy.
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Order</th>
                <th>Quantity</th>
                <th>Date y Hora</th>
                <th>Estado Gun Hill</th>
                <th>Shipping Status</th>
                <th>Action</th>
                <th>Notes</th>
                <th>Quantity</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const fechaHora = `${order.date || ""} ${order.time || ""}`;
                const labels = order.labels || [];
                const isEditable = !!editStatus[order.id];
                const qtyMatch = order.orderDetails?.match(/×\s?(\d+)/) || order.orderDetails?.match(/x\s?(\d+)/i);
                const quantity = qtyMatch ? qtyMatch[1] : "";

                let labelClass = "";
                if (order.trottaStatus === "Label Available") labelClass = "label-available";
                if (order.trottaStatus === "Cancelled - Tire Not Available") labelClass = "label-cancelado";

                return (
                  <tr key={order.id ?? idx}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.address}</td>
                    <td>{order.orderDetails.replace(/\$[\d,]+(\.\d{2})?/g, '')}</td>
                    <td>{quantity}</td>
                    <td>{fechaHora}</td>
                    <td>{renderGhStatusBadge(order.ghStatus)}</td>
                    <td>
                      <select
                        value={isEditable ? tempStatus[order.id] || "" : order.trottaStatus || ""}
                        onChange={(e) => handleTempStatusChange(order.id, e.target.value)}
                        disabled={!isEditable}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Cancelled - Tire Not Available">Cancelled - Tire Not Available</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Picked Up">Picked Up</option>
                        
                        
                        
                      </select>
                    </td>
                    <td>
                      {isEditable ? (
                        <button onClick={() => handleUpdateStatus(order.id)}>Update</button>
                      ) : (
                        <button onClick={() => handleEnableEdit(order.id)}>Edit</button>
                      )}
                    </td>
                    <td>
                      <textarea value={order.note} readOnly rows={2} />
                    </td>
                    <td>
                      {labels.length === 0 ? (
                        "Not Available"
                      ) : (
                        <button className={labelClass} onClick={() => openModal(order, labels)}>
                          📥 {labels.length} Label{labels.length > 1 ? "s" : ""}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalLabels && modalOrder && (
        <div className="modal-overlay" onClick={() => setModalLabels(null)}>
          <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" onMouseDown={onDragStart} onMouseUp={onDragEnd} onMouseMove={onDrag}>
              <span>Order #{modalOrder.orderNumber}</span>
              <button onClick={() => setModalLabels(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Customer:</strong> {modalOrder.customerName}</p>
              <p><strong>Address:</strong> {modalOrder.address}</p>
              <p><strong>Product:</strong> {modalOrder.orderDetails}</p>
              <p><strong>Date:</strong> {modalOrder.date}</p>
              <p><strong>Time:</strong> {modalOrder.time}</p>
              <p><strong>Gun Hill Status:</strong> {modalOrder.ghStatus}</p>
              <p><strong>Shipping Status:</strong> {modalOrder.trottaStatus}</p>
              <p><strong>Notes:</strong> {modalOrder.note}</p>

              {modalLabels.map((label, idx) => {
                const blobUrl = base64ToBlobUrl(label.data);
                return (
                  <div key={idx}>
                    <button onClick={() => {
                      const win = window.open(blobUrl, "_blank");
                      if (win) win.print();
                    }}>
                      Print Label {idx + 1}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

