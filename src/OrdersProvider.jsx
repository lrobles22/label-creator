// OrdersProvider.jsx
import React, { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

const initialOrders = [
  {
    id: 1,
    orderNumber: 'GH1001',
    customerName: 'Luis Robles',
    address: '123 Main St, NY',
    orderDetails: '2x 265/70R17 Ridge Grappler',
    date: '2025-06-14',
    time: '9:00 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Listo para recoger',
    note: '',
    payment: 'Pending',
    unitPrice: 50,
    labels: []
  },
  {
    id: 2,
    orderNumber: 'GH1002',
    customerName: 'Ana González',
    address: '456 Elm St, NJ',
    orderDetails: '1x 275/65R18 Michelin Defender',
    date: '2025-06-14',
    time: '9:30 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Llanta no disponible',
    note: '',
    payment: 'Paid',
    unitPrice: 60,
    labels: []
  },
  {
    id: 3,
    orderNumber: 'GH1003',
    customerName: 'Carlos Martínez',
    address: '789 Oak St, NY',
    orderDetails: '4x 245/70R17 Toyo Open Country',
    date: '2025-06-14',
    time: '10:00 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Listo para recoger',
    note: '',
    payment: 'Pending',
    unitPrice: 55,
    labels: []
  },
  {
    id: 4,
    orderNumber: 'GH1004',
    customerName: 'Sofia Lopez',
    address: '321 Pine Ave, NJ',
    orderDetails: '1x 285/45R22 Pirelli Scorpion',
    date: '2025-06-14',
    time: '10:30 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Llanta no disponible',
    note: '',
    payment: 'Paid',
    unitPrice: 85,
    labels: []
  },
  {
    id: 5,
    orderNumber: 'GH1005',
    customerName: 'Juan Pérez',
    address: '789 Maple Dr, NY',
    orderDetails: '2x 255/60R18 Hankook Dynapro',
    date: '2025-06-14',
    time: '11:00 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Listo para recoger',
    note: '',
    payment: 'Pending',
    unitPrice: 70,
    labels: []
  },
  {
    id: 6,
    orderNumber: 'GH1006',
    customerName: 'Laura Torres',
    address: '159 Oak Blvd, NJ',
    orderDetails: '1x 265/50R20 Continental CrossContact',
    date: '2025-06-14',
    time: '11:30 AM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Llanta no disponible',
    note: '',
    payment: 'Paid',
    unitPrice: 90,
    labels: []
  },
  {
    id: 7,
    orderNumber: 'GH1007',
    customerName: 'Miguel Rivera',
    address: '753 Birch St, NY',
    orderDetails: '3x 225/65R17 Bridgestone Dueler',
    date: '2025-06-14',
    time: '12:00 PM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Listo para recoger',
    note: '',
    payment: 'Pending',
    unitPrice: 65,
    labels: []
  },
  {
    id: 8,
    orderNumber: 'GH1008',
    customerName: 'Valeria Gómez',
    address: '951 Cedar Ln, NJ',
    orderDetails: '1x 235/55R19 Goodyear Assurance',
    date: '2025-06-14',
    time: '12:30 PM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Llanta no disponible',
    note: '',
    payment: 'Paid',
    unitPrice: 78,
    labels: []
  },
  {
    id: 9,
    orderNumber: 'GH1009',
    customerName: 'Andrés Fuentes',
    address: '357 Spruce Ct, NY',
    orderDetails: '2x 275/40R20 Michelin Pilot Sport',
    date: '2025-06-14',
    time: '1:00 PM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Listo para recoger',
    note: '',
    payment: 'Pending',
    unitPrice: 92,
    labels: []
  },
  {
    id: 10,
    orderNumber: 'GH1010',
    customerName: 'Natalia Ruiz',
    address: '654 Redwood Way, NJ',
    orderDetails: '4x 215/60R16 Firestone Firehawk',
    date: '2025-06-14',
    time: '1:30 PM',
    ghStatus: 'Label no disponible',
    trottaStatus: 'Llanta no disponible',
    note: '',
    payment: 'Paid',
    unitPrice: 52,
    labels: []
  }
];

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const updateTrottaStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, trottaStatus: newStatus } : order
      )
    );
  };

  const updateTrottaNotes = (id, newNote) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, note: newNote } : order
      )
    );
  };

  const updateGHStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ghStatus: newStatus } : order
      )
    );
  };

  const updatePayment = (id, newPayment) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, payment: newPayment } : order
      )
    );
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      updateTrottaStatus,
      updateTrottaNotes,
      updateGHStatus,
      updatePayment
    }}>
      {children}
    </OrdersContext.Provider>
  );
};
