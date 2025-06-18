import React from "react";
import ReactDOM from "react-dom/client";
import AdminDashboard from "./AdminDashboard";
import ClientDashboard from "./ClientDashboard"; // Asegúrate de tener este archivo
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const currentPath = window.location.pathname;

if (currentPath.includes("/client")) {
  root.render(<ClientDashboard />);
} else {
  root.render(<AdminDashboard />);
}
