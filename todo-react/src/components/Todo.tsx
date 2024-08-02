import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "../css/Todo.css";
import { useTokenReset } from "../utils/loginHandleToToken";

interface Todo {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isCompleted: boolean;
  updatedAt: string;
}

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [modalAction, setModalAction] = useState<"update" | "delete" | null>(
    null
  );

  const api = useTokenReset();

  useEffect(() => {
    fetchTodos();
    fetchCompletedTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get("/api/todo/getNotCompleted");
      setTodos(response.data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      const response = await api.get("/api/todo/getAllCompleted");
      setCompletedTodos(response.data.todos);
    } catch (error) {
      console.error("Error fetching completed todos:", error);
    }
  };

  const handleCreateTodo = async () => {
    try {
      await api.post("/api/todo/create", { text: newTodo });
      setNewTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await api.delete(`/api/todo/delete/${id}`);
      fetchTodos();
      fetchCompletedTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleUpdateTodoText = async (id: string, text: string) => {
    try {
      await api.put(`/api/todo/update/${id}`, { text });
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo text:", error);
    }
  };

  const handleCompleteTodo = async (id: string) => {
    try {
      await api.put(`/api/todo/update/${id}`, { isCompleted: true });
      fetchTodos();
      fetchCompletedTodos();
    } catch (error) {
      console.error("Error marking todo as completed:", error);
    }
  };

  const openModal = (todo: Todo, action: "update" | "delete") => {
    setCurrentTodo(todo);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTodo(null);
    setModalAction(null);
  };

  const handleModalAction = () => {
    if (modalAction === "update" && currentTodo) {
      handleUpdateTodoText(currentTodo.id, currentTodo.text);
    } else if (modalAction === "delete" && currentTodo) {
      handleDeleteTodo(currentTodo.id);
    }
    closeModal();
  };

  return (
    <div className="todo-container">
      <h2>Todo List</h2>
      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New Todo"
        />
        <button onClick={handleCreateTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.text}</span>
              <button onClick={() => handleCompleteTodo(todo.id)}>
                Complete
              </button>
              <button onClick={() => openModal(todo, "update")}>Update</button>
              <button onClick={() => openModal(todo, "delete")}>Delete</button>
            </li>
          ))
        ) : (
          <p>No todos found</p>
        )}
      </ul>

      <h2>Completed Todos</h2>
      <ul className="completed-todo-list">
        {completedTodos.length > 0 ? (
          completedTodos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.text}</span>
              <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No completed todos found</p>
        )}
      </ul>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Todo Modal"
        className="modal"
        overlayClassName="overlay"
      >
        {modalAction === "update" ? (
          <div>
            <h2>Update Todo</h2>
            <input
              type="text"
              value={currentTodo?.text || ""}
              onChange={(e) =>
                setCurrentTodo((prev) =>
                  prev ? { ...prev, text: e.target.value } : null
                )
              }
            />
            <button onClick={handleModalAction}>Update</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        ) : (
          <div>
            <h2>Delete Todo</h2>
            <p>Are you sure you want to delete this todo?</p>
            <button onClick={handleModalAction}>Delete</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Todo;
