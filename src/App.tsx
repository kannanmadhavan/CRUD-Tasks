import React from "react";
import { Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Dashboard from "./pages/Dashboard";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-task" element={<TaskForm />} />
          <Route path="/tasks" element={<TaskList />} />
        </Routes>
      </div>
    </DndProvider>
  );
};

export default App;
