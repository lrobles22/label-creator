import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Correo o contraseña inválidos");
    } else {
      // ✅ Guardar datos en localStorage para futuras validaciones
      localStorage.setItem("usuario", JSON.stringify(data));

      const role = data.role;

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "client") {
        window.location.href = "/client";
      } else {
        alert("Rol no reconocido.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to WTW Gun Hill Tire House for Vendors</h1>
        <p className="slogan">Streamline your orders and tracking experience.</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button onClick={handleLogin} className="login-button">
          Login
        </button>

        {/* 🔓 Botón de prueba para entrar como cliente sin login */}
        <button
          style={{
            marginTop: "20px",
            background: "transparent",
            color: "#666",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline"
          }}
          onClick={() => {
            localStorage.setItem("usuario", JSON.stringify({ role: "client" }));
            window.location.href = "/client";
          }}
        >
          🚪 Entrar como Cliente (prueba)
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
