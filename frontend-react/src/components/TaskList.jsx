import TaskItem from './TaskItem';
import Spinner from './Spinner';

function TaskList({ tasks, loading, filter, setFilter, onToggle, onDelete, onUpdate }) {
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div>
      <div className="filters">
        <button 
          className={filter === "all" ? "active" : ""} 
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
        <button 
          className={filter === "pending" ? "active" : ""} 
          onClick={() => setFilter("pending")}
        >
          Pendientes
        </button>
        <button 
          className={filter === "completed" ? "active" : ""} 
          onClick={() => setFilter("completed")}
        >
          Completadas
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <ul className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No hay tareas en esta categoría.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default TaskList;