import React, { useState, useEffect } from "react";
import { firestore, storage } from "../utils/firebase";
import { Task } from "../types";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [showTasks, setShowTasks] = useState<boolean>(false); 
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set()); 
  const [isSortedAsc, setIsSortedAsc] = useState<boolean>(true); 
  const [selectedTag, setSelectedTag] = useState<string>(""); 
const [selectedCategory, setSelectedCategory] = useState<string>(""); 
const [selectedStartDate, setSelectedStartDate] = useState<string>(""); 
const [selectedEndDate, setSelectedEndDate] = useState<string>(""); 
const [viewMode, setViewMode] = useState<'board' | 'list'>('list');



const filteredTasks = tasks.filter((task) => {
  
  const categoryMatch =
    selectedCategory === "" || task.category === selectedCategory;

  
  const tagMatch =
    selectedTag === "" || task.tags.some((tag) => tag.includes(selectedTag));

 
  const startDateMatch =
    selectedStartDate === "" || new Date(task.dueDate) >= new Date(selectedStartDate);
  const endDateMatch =
    selectedEndDate === "" || new Date(task.dueDate) <= new Date(selectedEndDate);

  return categoryMatch && tagMatch && startDateMatch && endDateMatch;
});



  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData: Task[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !dueDate) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      let fileUrl: string | undefined = undefined;

      if (file) {
        const fileRef = ref(storage, `task_files/${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const task: Omit<Task, "id"> = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        tags,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      if (editingTaskId) {
       
        const taskRef = doc(firestore, "tasks", editingTaskId);
        await updateDoc(taskRef, task);
      } else {
        
        const docRef = await addDoc(collection(firestore, "tasks"), task);
        await updateDoc(docRef, { id: docRef.id });
      }

      
      setTitle("");
      setDescription("");
      setCategory("");
      setTags([]);
      setDueDate("");
      setFile(null);
      setEditingTaskId(null);

      
      await fetchTasks();
    } catch (error) {
      console.error("Error adding or updating task:", error);
      alert("There was an error creating or updating the task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setTags(task.tags);
    setDueDate(task.dueDate);
  };

  const handleDelete = async (taskId: string) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await deleteDoc(taskRef);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("There was an error deleting the task. Please try again.");
    }
  };

  const handleBatchDelete = async () => {
    try {
      const selectedTaskIds = Array.from(selectedTasks);
      for (const taskId of selectedTaskIds) {
        const taskRef = doc(firestore, "tasks", taskId);
        await deleteDoc(taskRef);
      }
      setTasks(tasks.filter((task) => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set()); 
    } catch (error) {
      console.error("Error deleting selected tasks:", error);
      alert("There was an error deleting the selected tasks. Please try again.");
    }
  };

  const handleBatchComplete = async () => {
    try {
      const selectedTaskIds = Array.from(selectedTasks); 
      for (const taskId of selectedTaskIds) {
        const taskRef = doc(firestore, "tasks", taskId);
        await updateDoc(taskRef, { completed: true });
      }
      setTasks(tasks.map(task => selectedTasks.has(task.id) ? { ...task, completed: true } : task));
      setSelectedTasks(new Set()); 
    } catch (error) {
      console.error("Error completing selected tasks:", error);
      alert("There was an error completing the selected tasks. Please try again.");
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prevSelectedTasks) => {
      const updatedSelection = new Set(prevSelectedTasks);
      if (updatedSelection.has(taskId)) {
        updatedSelection.delete(taskId);
      } else {
        updatedSelection.add(taskId);
      }
      return updatedSelection;
    });
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, removed);

    setTasks(reorderedTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <style>
        
        {`
        button, input, optgroup, select, textarea {
          margin: 0;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          width: 50%;
        }

        .task-form-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, 
            #ff0000 0%,  
            #ff8c00 25%, 
            #ffff00 50%, 
            #ff69b4 75%, 
            #32cd32 100%);
          font-family: 'Lucida Handwriting', cursive;
          color: red;
          padding: 1rem;
          box-sizing: border-box;
        }
          .Edit{
          width: 25% !important;
        }
        .task-form-container h2 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          text-align: center;
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          width: 100%;
          padding: 1rem;
          color: #fff;
          z-index: 10;
        }

        .task-form-container form {
          background: #ffffff;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          box-sizing: border-box;
        }

        .task-form-container label {
          font-weight: bold;
          margin-bottom: 0.5rem;
          display: block;
          color: #333333;
        }

        .task-form-container input,
        .task-form-container textarea,
        .task-form-container select,
        .task-form-container {
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.8rem;
          font-size: 1rem;
          border: 1px solid #dddddd;
          border-radius: 5px;
          font-family: 'Lucida Handwriting', cursive;
          box-sizing: border-box;
        }

        .task-form-container textarea {
          resize: none;
          height: 100px;
        }

        .task-form-container button {
          background-color: #6a11cb;
          color: #ffffff;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .task-form-container button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .task-form-container button:hover:not(:disabled) {
          background-color: #2575fc;
        }

        @media (max-width: 768px) {
          .task-form-container h2 {
            font-size: 2rem;
          }
          .task-form-container form {
            padding: 1.5rem;
          }
        }

        .tasks-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          justify-content: center;
        }

        .task-card {
          width: 45%;
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
        }
        
        .task-card h4 {
          margin: 0 0 1rem;
        }
        
        .task-card button {
          background-color: #ff0000;
          color: white;
          padding: 0.5rem;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        .task-card button:hover {
          background-color: #cc0000;
        }
      `}
      </style>

      <div className="task-form-container">
        <form onSubmit={handleSubmit}>
          <h3>
            <center>{editingTaskId ? "Edit Task" : "Create a New Task"}</center>
          </h3>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
            </select>
          </div>
          <div>
            <label htmlFor="tags">Tags (Separate by Comma's):</label>
            <input
              type="text"
              id="tags"
              value={tags.join(",")}
              onChange={(e) => setTags(e.target.value.split(","))}
            />
          </div>
          <div>
            <label htmlFor="dueDate">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="file">Attach a File (optional):</label>
            <input
              type="file"
              id="file"
              accept="application/pdf, .docx, .xlsx, image/*"
              onChange={handleFileChange}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <button
  type="submit"
  disabled={isLoading}
  className="btn btn-purple"
  style={{ backgroundColor: '#6a11cb', color: '#fff' }}
>
  {isLoading ? "Saving..." : editingTaskId ? "Update Task" : "Create Task"}
</button>

          </div>
        </form>
      </div>

      <div className="tasks-container">
        <button
          onClick={() => setShowTasks(!showTasks)}
          style={{
            backgroundColor: "#6a11cb",
            color: "#fff",
            padding: "0.5rem",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
            border: "none",
            width: "47%",
            
          }}
        >
          {showTasks ? "Hide Tasks" : "Show Tasks"}
        </button>
      
        <button
      onClick={() => {
        const sortedTasks = [...tasks].sort((a, b) => {
          if (isSortedAsc) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          } else {
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          }
        });
        setTasks(sortedTasks);
        setIsSortedAsc(!isSortedAsc);
      }}
      style={{
        backgroundColor: "#2575fc",
        color: "#fff",
        padding: "0.5rem",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1rem",
        border: "none",
        
      }}
    >
      Sort by Due Date {isSortedAsc ? "===> Ascending" : "===>Descending"}
    </button>
    <div>
  <label htmlFor="categoryFilter">Filter by Category:</label>
  <select
    id="categoryFilter"
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
  >
    <option value="">All Categories</option>
    <option value="Work">Work</option>
    <option value="Personal">Personal</option>
    <option value="Study">Study</option>
  </select>
</div>

<div>
  <label htmlFor="tagFilter">Filter by Tag:</label>
  <input
    type="text"
    id="tagFilter"
    value={selectedTag}
    onChange={(e) => setSelectedTag(e.target.value)}
  />
</div>

<div>
  <label htmlFor="startDateFilter">Start Date:</label>
  <input
    type="date"
    id="startDateFilter"
    value={selectedStartDate}
    onChange={(e) => setSelectedStartDate(e.target.value)}
  />
</div>

<div>
  <label htmlFor="endDateFilter">End Date:</label>
  <input
    type="date"
    id="endDateFilter"
    value={selectedEndDate}
    onChange={(e) => setSelectedEndDate(e.target.value)}
  />
</div>
<button
  onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
  style={{
    backgroundColor: "#6a11cb",
    color: "#fff",
    padding: "0.5rem",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    border: "none",
  }}
>
  {viewMode === 'board' ? 'Switch to List View' : 'Switch to Board View'}
</button>


        {showTasks && (
          <div style={{ width: "100%" }}>
            <button
              onClick={handleBatchDelete}
              style={{
                backgroundColor: "#ff0000",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
                border: "none",
                margin: "0.5rem 0",
              }}
            >
              Delete the Selected Tasks
            </button>

            <button
              onClick={handleBatchComplete}
              style={{
                backgroundColor: "#32cd32",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
                border: "none",
                marginBottom: "1rem",
              }}
            >
              Mark as Completed
            </button>
    
  
    {viewMode === 'list' ? (
      <div>
        {filteredTasks.map((task) => (
          <div key={task.id} style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <p><strong>Due Date:</strong> {task.dueDate}</p>
            <p><strong>Category:</strong> {task.category}</p>
            <p><strong>Tags:</strong> {task.tags.join(", ")}</p>
            <p>
              <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
            </p>
            
            <button onClick={() => handleEdit(task)} className="btn btn-warning" style={{ width: '25%' }}>Edit</button>
            <button onClick={() => handleDelete(task.id)} className="btn btn-danger" style={{ width: '25%' }}>Delete</button>
            <br></br><br></br>
            <input
  type="checkbox"
  checked={selectedTasks.has(task.id)}
  onChange={() => toggleTaskSelection(task.id)}
  style={{ width: '20% !important' }} 
/>
          </div>
        ))}
      </div>
    ) : (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        backgroundColor: task.completed ? "#d3ffd3" : "#f9f9f9",
                        padding: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        alignItems: "center",
                      }}
                    >
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <p><strong>Due Date:</strong> {task.dueDate}</p>
                      <p><strong>Category:</strong> {task.category}</p>
                      <p><strong>Tags:</strong> {task.tags.join(", ")}</p>
                      <p>
                        <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
                      </p>
                      <button onClick={() => handleEdit(task)} className="btn btn-warning" style={{ width: '25%' }}>Edit</button>
                      <button onClick={() => handleDelete(task.id)} className="btn btn-danger" style={{ width: '25%' }}>Delete</button>

                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default TaskForm;
