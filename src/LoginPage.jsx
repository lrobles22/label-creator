import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      alert("Correo o contraseña inválidos");
    } else {
      const user = data.user;
      const role = user?.user_metadata?.role;
      const company = user?.user_metadata?.company || "";

      if (!role) {
        alert("El usuario no tiene un rol asignado.");
        return;
      }

      if (role === "admin") {
        localStorage.setItem("usuario_admin", JSON.stringify({ email: user.email, role, company }));
      } else if (role === "client") {
        localStorage.setItem("usuario_cliente", JSON.stringify({ email: user.email, role, company }));
      }

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
        <h1>Welcome to Gun Hill Tire Vendors</h1>
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
      </div>
    </div>
  );
}

export default LoginPage;
