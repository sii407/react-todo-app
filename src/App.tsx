import React, { useState, useEffect } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";

const localStorageKey = "TodoApp";

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
};

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
  }));
};

type FilterType = "all" | "active" | "completed";
type SortType = "created" | "priority" | "deadline";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  const [newName, setNewName] = useState("");
  const [newPriority, setNewPriority] = useState<number>(2);
  const [newDeadline, setNewDeadline] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("created");

  const safeTodos = Array.isArray(todos) ? todos : [];
  const uncompletedCount = safeTodos.filter((todo) => !todo.isDone).length;

  const addNewTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newTodo: Todo = {
      id: uuid(),
      name: newName.trim(),
      isDone: false,
      priority: newPriority,
      deadline: newDeadline ? new Date(newDeadline) : new Date(),
    };

    setTodos((current) => [newTodo, ...(Array.isArray(current) ? current : [])]);
    setNewName("");
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const editTodoName = (id: string, updatedName: string) => {
    if (!updatedName.trim()) return;
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, name: updatedName.trim() } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((current) => current.filter((todo) => !todo.isDone));
  };

  const resetToDefault = () => {
    if (window.confirm("初期データにリセットしますか？")) {
      localStorage.removeItem(localStorageKey);
      setTodos(Array.isArray(initTodos) ? initTodos : []);
    }
  };

  const displayedTodos = safeTodos
    .filter((todo) => {
      if (filter === "active") return !todo.isDone;
      if (filter === "completed") return todo.isDone;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return a.priority - b.priority;
      }
      if (sortBy === "deadline") {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      return 0;
    });

  return (
    <div className="mx-4 my-10 max-w-2xl md:mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">TodoApp</h1>
        <button
          type="button"
          onClick={resetToDefault}
          className="cursor-pointer text-xs text-slate-400 underline hover:text-slate-600"
        >
          初期データに戻す
        </button>
      </div>

      <div className="mb-6">
        <WelcomeMessage uncompletedCount={uncompletedCount} />
      </div>

      <form
        onSubmit={addNewTodo}
        aria-labelledby="newTodoHeading"
        className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 id="newTodoHeading" className="text-sm font-bold text-slate-700">
          ＋ 新しいタスクを追加
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="todoName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="タスク名を入力（例: レポート提出）"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />

          <select
            aria-label="優先度"
            value={newPriority}
            onChange={(e) => setNewPriority(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value={1}>優先度: 高 (1)</option>
            <option value={2}>優先度: 中 (2)</option>
            <option value={3}>優先度: 低 (3)</option>
          </select>

          <input
            aria-label="期限"
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!newName.trim()}
            className={twMerge(
              "cursor-pointer rounded-md px-5 py-2 text-sm font-bold text-white transition-colors",
              "bg-indigo-500 hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:bg-slate-300"
            )}
          >
            追加
          </button>
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex rounded-md bg-slate-100 p-1">
          {(
            [
              { key: "all", label: `すべて (${safeTodos.length})` },
              { key: "active", label: `未完了 (${uncompletedCount})` },
              {
                key: "completed",
                label: `完了済 (${safeTodos.length - uncompletedCount})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={twMerge(
                "cursor-pointer rounded px-3 py-1 text-xs font-medium transition-colors",
                filter === tab.key
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="並び替え"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="created">追加順</option>
            <option value="priority">優先度が高い順</option>
            <option value="deadline">期限が近い順</option>
          </select>

          {safeTodos.length - uncompletedCount > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              完了済を削除
            </button>
          )}
        </div>
      </div>

      <TodoList
        todos={displayedTodos}
        onToggle={toggleTodo}
        onEdit={editTodoName}
        onDelete={deleteTodo}
      />
    </div>
  );
};

export default App;