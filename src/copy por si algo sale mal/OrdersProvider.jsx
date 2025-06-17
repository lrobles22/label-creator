import React, { createContext, useState } from "react";

export const OrdersContext = createContext();

const initialOrders = [
  {
    id: 1,
    orderNumber: "GH1001",
    customerName: "Luis Robles",
    address: "123 Main St, NY",
    orderDetails: "2x 265/70R17 Ridge Grappler",
    ghStatus: "Label not available",
    trottaStatus: "Earring",
    adminNote: "High priority",
    clientNote: "Please deliver before noon",
    label: "Not available",
  },
  {
    id: 2,
    orderNumber: "GH1002",
    customerName: "Ana González",
    address: "456 Elm St, NJ",
    orderDetails: "1x 275/65R18 Michelin Defender",
    ghStatus: "Label not available",
    trottaStatus: "Ready to pick up",
    adminNote: "Confirmed by phone",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 3,
    orderNumber: "GH1003",
    customerName: "Carlos Martínez",
    address: "789 Oak St, NY",
    orderDetails: "4x 245/70R17 Toyo Open Country",
    ghStatus: "Order Cancelled",
    trottaStatus: "Cancel - Not Available",
    adminNote: "Customer canceled",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 4,
    orderNumber: "GH1004",
    customerName: "María Pérez",
    address: "321 Pine St, NY",
    orderDetails: "2x 255/60R18 Goodyear Eagle",
    ghStatus: "Label Available",
    trottaStatus: "Earring",
    adminNote: "",
    clientNote: "Installation scheduled at 3 PM",
    label: "Not available",
  },
  {
    id: 5,
    orderNumber: "GH1005",
    customerName: "José López",
    address: "654 Maple St, NJ",
    orderDetails: "1x 285/75R16 BFGoodrich KO2",
    ghStatus: "Label Available",
    trottaStatus: "Earring",
    adminNote: "",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 6,
    orderNumber: "GH1006",
    customerName: "Laura Torres",
    address: "789 Cedar St, NY",
    orderDetails: "3x 265/70R16 Yokohama Geolandar",
    ghStatus: "Label not available",
    trottaStatus: "Earring",
    adminNote: "",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 7,
    orderNumber: "GH1007",
    customerName: "Pedro Sánchez",
    address: "147 Birch St, NJ",
    orderDetails: "4x 245/65R17 Bridgestone Dueler",
    ghStatus: "Order Cancelled",
    trottaStatus: "Cancel - Not Available",
    adminNote: "System failure",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 8,
    orderNumber: "GH1008",
    customerName: "Sofia Rivera",
    address: "369 Walnut St, NY",
    orderDetails: "1x 225/55R18 Pirelli Scorpion",
    ghStatus: "Label not available",
    trottaStatus: "Earring",
    adminNote: "",
    clientNote: "",
    label: "Not available",
  },
  {
    id: 9,
    orderNumber: "GH1009",
    customerName: "Andrés Ramírez",
    address: "258 Cherry St, NJ",
    orderDetails: "2x 275/40ZR20 Continental Extreme",
    ghStatus: "Label Available",
    trottaStatus: "Ready to pick up",
    adminNote: "",
    clientNote: "Please call upon arrival",
    label: "Not available",
  },
  {
    id: 10,
    orderNumber: "GH1010",
    customerName: "Elena Martínez",
    address: "159 Willow St, NY",
    orderDetails: "4x 225/60R17 Firestone Destination",
    ghStatus: "Label not available",
    trottaStatus: "Earring",
    adminNote: "",
    clientNote: "",
    label: "Not available",
  },
];

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrders);

  const updateOrder = (id, updatedFields) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, ...updatedFields } : order
      )
    );
  };

  const updateClientNote = (id, newNote) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, clientNote: newNote } : order
      )
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, updateOrder, updateClientNote }}>
      {children}
    </OrdersContext.Provider>
  );
};
