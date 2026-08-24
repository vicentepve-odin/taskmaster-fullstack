function Login({ email, setEmail, password, setPassword, onLogin, onRegister, authMessage, loading }) {
  return (
    <div>
      <h2>Iniciar Sesión</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={onLogin} disabled={loading}>
        {loading ? "Cargando..." : "Iniciar Sesión"}
      </button>

      <button className="secondary" onClick={onRegister} disabled={loading}>
        Registrarse
      </button>

      {authMessage.text && (
        <p className={`auth-message ${authMessage.type}`}>
          {authMessage.text}
        </p>
      )}
    </div>
  );
}

export default Login;