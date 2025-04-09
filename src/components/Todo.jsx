import React, { useState, useEffect } from "react";
import { instance as axios } from "../api";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [description, setDescription] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/users/profile");
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      setIsLoading(false);
    }
  };

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/tasks");
      setTodos(response.data);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to fetch todos");
      console.error("Error fetching todos:", error);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (isLogin) {
        response = await axios.post("/api/users/login", { username, password });
      } else {
        response = await axios.post("/api/users", { name, username, password });
      }

      const { token } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await fetchUserProfile();
      setIsLoading(false);
      setUsername("");
      setPassword("");
      setName("");
    } catch (error) {
      setError(error.response?.data?.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
    setTodos([]);
  };

  const handleAddTodo = async () => {
    if (todo.trim()) {
      try {
        setIsLoading(true);
        const newTodo = {
          title: todo,
          description,
        };

        const response = await axios.post("/api/tasks", newTodo);
        setTodos([...todos, response.data]);
        setTodo("");
        setDescription("");
        setIsLoading(false);
      } catch (error) {
        setError("Failed to add todo");
        console.error("Error adding todo:", error);
        setIsLoading(false);
      }
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/tasks/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
      setIsLoading(false);
    } catch (error) {
      setError("Failed to delete todo");
      console.error("Error deleting todo:", error);
      setIsLoading(false);
    }
  };

  const handleEditTodo = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.title);
    setDescription(todo.description || "");
  };

  const handleSaveEdit = async () => {
    if (editText.trim() && editingId) {
      try {
        setIsLoading(true);
        const updatedTodo = {
          title: editText,
          description,
        };

        const response = await axios.put(
          `/api/tasks/${editingId}`,
          updatedTodo
        );

        setTodos(
          todos.map((todo) => (todo._id === editingId ? response.data : todo))
        );

        setEditingId(null);
        setEditText("");
        setDescription("");
        setIsLoading(false);
      } catch (error) {
        setError("Failed to update todo");
        console.error("Error updating todo:", error);
        setIsLoading(false);
      }
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      setIsLoading(true);
      const todo = todos.find((t) => t._id === id);
      const response = await axios.put(`/api/tasks/${id}`, {
        ...todo,
        completed: !completed,
      });

      setTodos(todos.map((t) => (t._id === id ? response.data : t)));
      setIsLoading(false);
    } catch (error) {
      setError("Failed to update todo status");
      console.error("Error updating todo status:", error);
      setIsLoading(false);
    }
  };

  const sortTodosByDate = () => {
    const newDirection = sortDirection === "desc" ? "asc" : "desc";
    const sortedTodos = [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return newDirection === "desc" ? dateB - dateA : dateA - dateB;
    });
    setTodos(sortedTodos);
    setSortDirection(newDirection);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center h-screen bg-gray-100 pt-10">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Login" : "Register"}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  className="border border-gray-300 rounded w-full py-2 px-3"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                className="border border-gray-300 rounded w-full py-2 px-3"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                className="border border-gray-300 rounded w-full py-2 px-3"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
              </button>

              <button
                className="text-blue-500 hover:text-blue-800 text-sm"
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
              >
                {isLogin ? "Need an account?" : "Already have an account?"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full flex justify-between items-center mt-8 mb-4">
          <h1 className="text-2xl font-bold">My Todo List</h1>
          <div className="flex items-center">
            {user && (
              <span className="mr-3 text-sm">{user.name || user.username}</span>
            )}
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4 p-4 border border-gray-300 rounded-lg shadow-md w-full bg-white">
          {editingId ? (
            <>
              <input
                className="border border-gray-300 rounded p-2 w-full"
                type="text"
                placeholder="Edit title"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <textarea
                className="border border-gray-300 rounded p-2 w-full"
                placeholder="Edit description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="bg-blue-500 text-white p-2 rounded"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
                <button
                  className="bg-gray-300 text-gray-700 p-2 rounded"
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                    setDescription("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                className="border border-gray-300 rounded p-2"
                type="text"
                placeholder="Add a todo title"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
              />
              <textarea
                className="border border-gray-300 rounded p-2"
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="bg-blue-500 text-white p-2 rounded"
                  onClick={handleAddTodo}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Todo"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end w-full mb-4">
          <button
            className="bg-green-500 text-white p-2 rounded mr-2"
            onClick={sortTodosByDate}
          >
            Sort by Date {sortDirection === "desc" ? "↓" : "↑"}
          </button>
        </div>

        <ul className="list-none w-full border border-gray-200 rounded-lg shadow-lg p-2 bg-white">
          {todos.length === 0 ? (
            <li className="p-3 text-center text-gray-500">
              No todos yet. Add some tasks above!
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo._id}
                className={`flex flex-col p-3 border border-gray-200 rounded-md mb-2 ${
                  todo.completed ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-gray-700 font-medium ${
                      todo.completed ? "line-through" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm shadow-sm hover:bg-green-600"
                      onClick={() =>
                        handleToggleComplete(todo._id, todo.completed)
                      }
                    >
                      {todo.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm shadow-sm hover:bg-blue-600"
                      onClick={() => handleEditTodo(todo)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => handleDeleteTodo(todo._id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                {todo.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {todo.description}
                  </p>
                )}
                <div className="flex justify-end items-center mt-2 text-xs text-gray-500">
                  <span>
                    Created:{" "}
                    {new Date(todo.createdAt || todo.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Todo;
