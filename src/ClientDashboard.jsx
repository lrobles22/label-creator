import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import { supabase } from './supabaseClient'; // Asegúrate de tener este archivo

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [error, setError] = useState(false);
  const [editStatus, setEditStatus] = useState({});
  const [tempStatus, setTempStatus] = useState({});
  const [modalLabels, setModalLabels] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const modalRef = useRef(null);
  const dragData = useRef({ isDragging: false, originX: 0, originY: 0, translateX: 0, translateY: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('orders').select('*');

      if (error || !Array.isArray(data)) {
        console.error("❌ Error al cargar datos desde Supabase:", error);
        setError(true);
        return;
      }

      const formatted = data.map((item, index) => ({
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
        labels: item.labels ? JSON.parse(item.labels) : []
      }));

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

  const handleUpdateStatus = (id) => {
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, trottaStatus: tempStatus[id] } : order
    );
    setOrders(updatedOrders);
    setEditStatus(prev => ({ ...prev, [id]: false }));
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

  const filteredOrders = orders.filter(order => {
    if (filter === "Todos") return true;
    if (filter === "Label not available") return !order.labels || order.labels.length === 0;
    if (filter === "Label available") return order.labels && order.labels.length > 0;
    if (filter === "Orden cancelada") return order.ghStatus === "Orden cancelado";
    return true;
  });

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Panel Cliente</h2>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <h1>Panel Cliente - Trotta Tire</h1>

          {error && (
            <div style={{ backgroundColor: "#ffe0e0", color: "#a00", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
              ⚠️ No se pudo cargar la información desde Supabase. Mostrando última copia válida.
            </div>
          )}

          <div className="filter-bar">
            <label>Filtrar por estado del Label:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Label not available">Label not available</option>
              <option value="Label available">Label available</option>
              <option value="Orden cancelada">Orden cancelada</option>
            </select>
          </div>

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
                <th>Notas</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const fechaHora = `${order.date || ""} ${order.time || ""}`;
                const labels = order.labels || [];
                const isEditable = !!editStatus[order.id];

                let labelClass = "";
                if (order.trottaStatus === "Label available") labelClass = "label-available";
                if (order.trottaStatus === "Cancelado - Llanta no disponible") labelClass = "label-cancelado";

                return (
                  <tr key={order.id ?? idx}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.address}</td>
                    <td>{order.orderDetails}</td>
                    <td>{fechaHora}</td>
                    <td>{order.ghStatus}</td>
                    <td>
                      <select
                        value={isEditable ? tempStatus[order.id] || "" : order.trottaStatus || ""}
                        onChange={(e) => handleTempStatusChange(order.id, e.target.value)}
                        disabled={!isEditable}
                      >
                        <option value="Cancelado - Llanta no disponible">Cancelado - Llanta no disponible</option>
                        <option value="Listo para recojida">Listo para recojida</option>
                      </select>
                    </td>
                    <td>
                      {isEditable ? (
                        <button onClick={() => handleUpdateStatus(order.id)}>Update</button>
                      ) : (
                        <button onClick={() => handleEnableEdit(order.id)}>Editar</button>
                      )}
                    </td>
                    <td>
                      <textarea value={order.note} readOnly rows={2} />
                    </td>
                    <td>
                      {labels.length === 0 ? (
                        "No disponible"
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
              <span>Orden #{modalOrder.orderNumber}</span>
              <button onClick={() => setModalLabels(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Cliente:</strong> {modalOrder.customerName}</p>
              <p><strong>Dirección:</strong> {modalOrder.address}</p>
              <p><strong>Producto:</strong> {modalOrder.orderDetails}</p>
              <p><strong>Fecha:</strong> {modalOrder.date}</p>
              <p><strong>Hora:</strong> {modalOrder.time}</p>
              <p><strong>Estado GH:</strong> {modalOrder.ghStatus}</p>
              <p><strong>Estado Shipping:</strong> {modalOrder.trottaStatus}</p>
              <p><strong>Notas:</strong> {modalOrder.note}</p>

              {modalLabels.map((label, idx) => {
                const blobUrl = base64ToBlobUrl(label.data);
                return (
                  <div key={idx}>
                    <button onClick={() => {
                      const win = window.open(blobUrl, "_blank");
                      if (win) win.print();
                    }}>
                      Imprimir Label {idx + 1}
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
