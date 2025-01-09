import React from "react";
import { useTasks } from "../hooks/useTasks";
import { useNavigate } from "react-router-dom";

const TaskList: React.FC = () => {
  const { data: tasks, isLoading, isError } = useTasks();
  const navigate = useNavigate();

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p>Error loading tasks</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center" }}>Your Tasks</h2>
      <button
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6a11cb",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
        onClick={() => navigate("/")}
      >
        Back to Create Task
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tasks?.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "1rem",
              background: "#f9f9f9",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem" }}>{task.title}</h3>
            <p style={{ margin: "0 0 0.5rem" }}>{task.description}</p>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Category:</strong> {task.category}
            </p>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>Due Date:</strong> {task.dueDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
