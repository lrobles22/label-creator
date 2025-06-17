import React, { useEffect, useState, useRef } from "react";
import "./styles.css";

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [editStatus, setEditStatus] = useState({}); // control por orden
  const [tempStatus, setTempStatus] = useState({}); // estado temporal para edición
  const [modalLabels, setModalLabels] = useState(null); // labels a mostrar en modal
  const [modalOrder, setModalOrder] = useState(null); // orden para mostrar info
  const modalRef = useRef(null);
  const dragData = useRef({ isDragging: false, originX: 0, originY: 0, translateX: 0, translateY: 0 });

  const base64ToBlobUrl = (base64Data, contentType = "application/pdf") => {
    try {
      const byteCharacters = atob(base64Data.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      return URL.createObjectURL(blob);
    } catch {
      return base64Data;
    }
  };

  const loadOrders = () => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableEdit = (id) => {
    setEditStatus((prev) => ({ ...prev, [id]: true }));
    const currentStatus = orders.find((o) => o.id === id)?.trottaStatus || "";
    setTempStatus((prev) => ({ ...prev, [id]: currentStatus }));
  };

  const handleTempStatusChange = (id, value) => {
    setTempStatus((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateStatus = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, trottaStatus: tempStatus[id] } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setEditStatus((prev) => ({ ...prev, [id]: false }));
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

  // Drag handlers for modal
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

  const filteredOrders = orders.filter((order) => {
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
              {filteredOrders.map((order) => {
                const fechaHora = `${order.date} ${order.time}`;
                const isEditable = !!editStatus[order.id];
                const labels = order.labels || [];

                // Determinar clase para el botón de label según el estado trottaStatus
                let labelClass = "";
                if (order.trottaStatus === "Label available") {
                  labelClass = "label-available";
                } else if (order.trottaStatus === "Cancelado - Llanta no disponible") {
                  labelClass = "label-cancelado";
                }

                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{order.orderNumber}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{order.customerName}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{order.address}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{order.orderDetails}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{fechaHora}</td>
                    <td style={{ fontWeight: "bold", fontSize: "1rem" }}>{order.ghStatus}</td>
                    <td>
                      <select
                        value={isEditable ? tempStatus[order.id] || "" : order.trottaStatus || ""}
                        onChange={(e) => handleTempStatusChange(order.id, e.target.value)}
                        disabled={!isEditable}
                        style={{
                          backgroundColor: isEditable ? "#fff" : "#eee",
                          cursor: isEditable ? "pointer" : "not-allowed",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textAlign: "center",
                        }}
                      >
                        <option value="Cancelado - Llanta no disponible">
                          Cancelado - Llanta no disponible
                        </option>
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
                      <textarea
                        value={order.note}
                        readOnly
                        rows={2}
                        style={{
                          width: "100%",
                          backgroundColor: "#f0f0f0",
                          border: "1px solid #ccc",
                          padding: "8px",
                          resize: "none",
                          cursor: "default",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textAlign: "center",
                          color: "#000",
                        }}
                      />
                    </td>
                    <td>
                      {labels.length === 0 ? (
                        <span style={{ fontWeight: "bold", fontSize: "1rem" }}>No disponible</span>
                      ) : (
                        <button
                          className={labelClass}
                          onClick={() => openModal(order, labels)}
                          title={`Ver ${labels.length} label${labels.length > 1 ? "s" : ""}`}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            textDecoration: labelClass === "label-cancelado" ? "none" : "underline",
                          }}
                        >
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

      {/* Modal para mostrar botones para imprimir e info de la orden */}
      {modalLabels && modalOrder && (
        <div
          className="modal-overlay"
          onClick={() => setModalLabels(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              backgroundColor: "white",
              padding: 0,
              borderRadius: 10,
              width: "70vw",
              maxWidth: "1000px",
              height: "auto",
              maxHeight: "80vh",
              boxShadow: "0 0 25px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "25px",
              overflow: "hidden",
            }}
          >
            {/* Barra de título para mover */}
            <div
              style={{
                cursor: "move",
                backgroundColor: "#007bff",
                color: "white",
                padding: "12px 20px",
                fontWeight: "700",
                fontSize: "1.25rem",
                userSelect: "none",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
              onMouseDown={onDragStart}
              onMouseUp={onDragEnd}
              onMouseMove={onDrag}
            >
              <span>Información de la Orden #{modalOrder.orderNumber}</span>
              <button
                onClick={() => setModalLabels(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "26px",
                  fontWeight: "700",
                  cursor: "pointer",
                  lineHeight: 1,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Contenido con info de orden y botones de impresión */}
            <div
              style={{
                padding: "0 40px 20px 40px",
                width: "100%",
                maxWidth: "960px",
                fontWeight: "700",
                fontSize: "1.15rem",
                lineHeight: 1.5,
                color: "#000000",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div>
                <p><strong>Cliente:</strong> {modalOrder.customerName}</p>
                <p><strong>Dirección:</strong> {modalOrder.address}</p>
                <p><strong>Producto:</strong> {modalOrder.orderDetails}</p>
              </div>
              <div>
                <p><strong>Fecha y Hora:</strong> {modalOrder.date} {modalOrder.time}</p>
                <p><strong>Estado Gun Hill:</strong> {modalOrder.ghStatus}</p>
                <p><strong>Estado Shipping:</strong> {modalOrder.trottaStatus}</p>
                <p><strong>Notas:</strong> {modalOrder.note}</p>
              </div>
            </div>

            {modalLabels.map((label, idx) => {
              const blobUrl = base64ToBlobUrl(label.data);
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: "15px",
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      const newWindow = window.open(blobUrl, "_blank", "width=800,height=600");
                      if (newWindow) {
                        newWindow.focus();
                        newWindow.onload = () => newWindow.print();
                      } else {
                        alert("Permite ventanas emergentes para imprimir.");
                      }
                    }}
                    style={{
                      padding: "14px 28px",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      borderRadius: "7px",
                      border: "1px solid #007bff",
                      backgroundColor: "#007bff",
                      color: "white",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
                  >
                    Imprimir Label {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .label-available {
          font-weight: bold;
          font-size: 1.1rem;
          color: green;
          animation: pulse 2s infinite;
          cursor: pointer;
          background: none;
          border: none;
          text-decoration: underline;
          padding: 0;
        }
        .label-cancelado {
          font-weight: bold;
          font-size: 1.1rem;
          color: red;
          cursor: default;
          background: none;
          border: none;
          text-decoration: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
