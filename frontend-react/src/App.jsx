import { useState, useEffect } from 'react';
import './App.css';

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Cargar tareas cuando hay token
  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // ---------- AUTENTICACIÓN ----------
  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setAuthMessage("Registro exitoso. Ahora inicia sesión.");
      } else {
        const error = await response.json();
        setAuthMessage(error.detail || "Error al registrarse");
      }
    } catch (error) {
      setAuthMessage("Error de conexión con el servidor");
    }
  };

  const login = async () => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setAuthMessage("");
      } else {
        setAuthMessage("Email o contraseña incorrectos");
      }
    } catch (error) {
      setAuthMessage("Error de conexión con el servidor");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setEmail("");
    setPassword("");
  };

  // ---------- TAREAS ----------
  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else if (response.status === 401) {
        logout();
      }
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim()) {
      alert("El título es obligatorio");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: taskTitle, description: taskDescription })
      });

      if (response.ok) {
        setTaskTitle("");
        setTaskDescription("");
        loadTasks();
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const toggleTask = async (task) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}?completed=${!task.completed}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description
        })
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="container">
      <h1>TaskMaster</h1>

      {!token ? (
        // Pantalla de Login / Registro
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
          <button onClick={login}>Iniciar Sesión</button>
          <button onClick={register}>Registrarse</button>
          {authMessage && <p className="auth-message">{authMessage}</p>}
        </div>
      ) : (
        // Pantalla de Tareas
        <div>
          <h2>Mis Tareas</h2>
          <button onClick={logout}>Cerrar Sesión</button>

          <div className="new-task">
            <input
              type="text"
              placeholder="Título de la tarea"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <button onClick={createTask}>Agregar Tarea</button>
          </div>

          <ul className="tasks-list">
            {tasks.length === 0 && <p>No tienes tareas todavía.</p>}
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </div>
                <div className="task-actions">
                  <button onClick={() => toggleTask(task)}>
                    {task.completed ? "Desmarcar" : "Completar"}
                  </button>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;