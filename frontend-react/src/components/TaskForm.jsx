function TaskForm({ title, setTitle, description, setDescription, onSubmit }) {
  return (
    <div className="new-task">
      <input
        type="text"
        placeholder="Título de la tarea"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={onSubmit}>Agregar Tarea</button>
    </div>
  );
}

export default TaskForm;