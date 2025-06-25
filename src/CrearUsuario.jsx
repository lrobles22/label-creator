
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function CrearUsuario() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [mensaje, setMensaje] = useState('');

  const handleCrear = async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role }
    });

    if (error) {
      setMensaje('❌ Error al crear usuario: ' + error.message);
    } else {
      setMensaje('✅ Usuario creado exitosamente');
      setEmail('');
      setPassword('');
      setRole('client');
    }
  };

  return (
    <div className="crear-usuario-box">
      <h3>Crear Usuario</h3>
      <label>Email:</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

      <label>Contraseña:</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

      <label>Rol:</label>
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="client">Client</option>
        <option value="superadmin">Superadmin</option>
      </select>

      <button onClick={handleCrear}>Crear Usuario</button>
      <p>{mensaje}</p>
    </div>
  );
}

export default CrearUsuario;
