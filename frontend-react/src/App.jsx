import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const API_URL = "https://taskmaster-api-wtpf.onrender.com";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // ---------- AUTENTICACIÓN ----------
  const register = async () => {
    if (!email || !password) {
      setAuthMessage({ text: "Por favor completa todos los campos", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setAuthMessage({ text: "Registro exitoso. Ahora puedes iniciar sesión.", type: "success" });
        setPassword("");
      } else {
        const error = await response.json();
        setAuthMessage({ text: error.detail || "Error al registrarse", type: "error" });
      }
    } catch (error) {
      setAuthMessage({ text: "Error de conexión con el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!email || !password) {
      setAuthMessage({ text: "Por favor completa todos los campos", type: "error" });
      return;
    }

    setLoading(true);
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
        setAuthMessage({ text: "", type: "" });
        setEmail("");
        setPassword("");
      } else {
        setAuthMessage({ text: "Email o contraseña incorrectos", type: "error" });
      }
    } catch (error) {
      setAuthMessage({ text: "Error de conexión con el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  };

  // ---------- TAREAS ----------
  const loadTasks = async () => {
    setTasksLoading(true);
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
    } finally {
      setTasksLoading(false);
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

      if (response.ok) loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id, title, description, completed) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}?completed=${completed}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      if (response.ok) loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>TaskMaster</h1>
      <p className="subtitle">Organiza tus tareas de forma simple y elegante</p>

      {!token ? (
        <Login
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onLogin={login}
          onRegister={register}
          authMessage={authMessage}
          loading={loading}
        />
      ) : (
        <div>
          <div className="header-actions">
            <h2>Mis Tareas</h2>
            <button className="logout-btn" onClick={logout}>
              Cerrar Sesión
            </button>
          </div>

          <TaskForm
            title={taskTitle}
            setTitle={setTaskTitle}
            description={taskDescription}
            setDescription={setTaskDescription}
            onSubmit={createTask}
          />

          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            filter={filter}
            setFilter={setFilter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        </div>
      )}
    </div>
  );
}

export default App;