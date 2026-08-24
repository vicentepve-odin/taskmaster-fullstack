const API_URL = "http://127.0.0.1:8000";

// Elementos del DOM
const authSection = document.getElementById("auth-section");
const tasksSection = document.getElementById("tasks-section");
const authMessage = document.getElementById("auth-message");
const tasksList = document.getElementById("tasks-list");

// ---------- AUTENTICACIÓN ----------

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            authMessage.style.color = "green";
            authMessage.textContent = "Registro exitoso. Ahora inicia sesión.";
        } else {
            const error = await response.json();
            authMessage.style.color = "#e11d48";
            authMessage.textContent = error.detail || "Error al registrarse";
        }
    } catch (error) {
        authMessage.textContent = "Error de conexión con el servidor";
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
            showTasksSection();
            loadTasks();
        } else {
            authMessage.style.color = "#e11d48";
            authMessage.textContent = "Email o contraseña incorrectos";
        }
    } catch (error) {
        authMessage.textContent = "Error de conexión con el servidor";
    }
}

function logout() {
    localStorage.removeItem("token");
    authSection.style.display = "block";
    tasksSection.style.display = "none";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    authMessage.textContent = "";
}

function showTasksSection() {
    authSection.style.display = "none";
    tasksSection.style.display = "block";
}

// ---------- TAREAS ----------

async function loadTasks() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const tasks = await response.json();
            renderTasks(tasks);
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = "";

    if (tasks.length === 0) {
        tasksList.innerHTML = "<p>No tienes tareas todavía.</p>";
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div>
                <strong>${task.title}</strong>
                <p>${task.description || ""}</p>
            </div>
            <div class="task-actions">
                <button onclick="toggleTask(${task.id}, ${!task.completed})">
                    ${task.completed ? "Desmarcar" : "Completar"}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
            </div>
        `;
        tasksList.appendChild(li);
    });
}

async function createTask() {
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-description").value;
    const token = localStorage.getItem("token");

    if (!title.trim()) {
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
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            document.getElementById("task-title").value = "";
            document.getElementById("task-description").value = "";
            loadTasks();
        }
    } catch (error) {
        console.error("Error al crear tarea:", error);
    }
}

async function toggleTask(taskId, completed) {
    const token = localStorage.getItem("token");

    // Primero obtenemos la tarea actual para mantener título y descripción
    const tasksResponse = await fetch(`${API_URL}/tasks/`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const tasks = await tasksResponse.json();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}?completed=${completed}`, {
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
}

async function deleteTask(taskId) {
    const token = localStorage.getItem("token");

    if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
    }
}

// Al cargar la página, verificamos si ya hay token
window.onload = () => {
    const token = localStorage.getItem("token");
    if (token) {
        showTasksSection();
        loadTasks();
    }
};