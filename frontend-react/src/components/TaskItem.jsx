import { useState } from 'react';

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");

  const handleSave = () => {
    onUpdate(task.id, editTitle, editDescription, task.completed);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <li className={task.completed ? "completed" : ""}>
      <div className="task-content">
        {isEditing ? (
          <>
            <input
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <input
              className="edit-input"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </>
        ) : (
          <>
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}
            <small style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
              Creada: {formatDate(task.created_at)}
            </small>
          </>
        )}
      </div>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button className="complete-btn" onClick={handleSave}>
              Guardar
            </button>
            <button className="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button className="complete-btn" onClick={() => onToggle(task)}>
              {task.completed ? "Desmarcar" : "Completar"}
            </button>
            <button onClick={() => setIsEditing(true)}>
              Editar
            </button>
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TaskItem;