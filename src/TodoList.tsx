import { useState } from "react";
import type { Todo } from "./types";
import { twMerge } from "tailwind-merge";

type Props = {
  todos?: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, updatedName: string) => void;
  onDelete: (id: string) => void;
};

const TodoList = ({ todos = [], onToggle, onEdit, onDelete }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const safeTodos = Array.isArray(todos) ? todos : [];

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.name);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      onEdit(id, editText);
    }
    setEditingId(null);
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: "高",
          className: "bg-red-100 text-red-700 border-red-200",
        };
      case 2:
        return {
          label: "中",
          className: "bg-amber-100 text-amber-700 border-amber-200",
        };
      default:
        return {
          label: "低",
          className: "bg-sky-100 text-sky-700 border-sky-200",
        };
    }
  };

  const getDeadlineInfo = (
    deadline: Date | null | undefined,
    isDone: boolean
  ) => {
    if (!deadline) return null;

    const target = new Date(deadline);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const formatted = target.toLocaleDateString("ja-JP");

    if (isDone) {
      return { text: `期限: ${formatted}`, className: "text-slate-400" };
    }
    if (target.getTime() < today.getTime()) {
      return {
        text: `⚠️ 期限切れ (${formatted})`,
        className: "font-bold text-red-600",
      };
    }
    if (target.getTime() === today.getTime()) {
      return {
        text: `🔥 今日まで (${formatted})`,
        className: "font-bold text-amber-600",
      };
    }
    return { text: `期限: ${formatted}`, className: "text-slate-500" };
  };

  if (safeTodos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
        表示するタスクがありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2.5">
      {safeTodos.map((todo) => {
        const badge = getPriorityBadge(todo.priority);
        const deadlineInfo = getDeadlineInfo(todo.deadline, todo.isDone);
        const isEditing = editingId === todo.id;

        return (
          <div
            key={todo.id}
            className={twMerge(
              "group flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-xs transition-all",
              todo.isDone
                ? "border-slate-200 bg-slate-50/70"
                : "border-slate-200 hover:border-indigo-300"
            )}
          >
            <div className="flex flex-1 items-center gap-x-3 pr-2">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => onToggle(todo.id)}
                className="h-4 w-4 cursor-pointer rounded accent-indigo-500"
              />

              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-full rounded border border-indigo-400 px-2 py-1 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(todo.id)}
                      className="cursor-pointer rounded bg-indigo-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-600"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <p
                    onDoubleClick={() => startEdit(todo)}
                    title="ダブルクリックで編集"
                    className={twMerge(
                      "cursor-pointer font-medium transition-colors",
                      todo.isDone
                        ? "text-slate-400 line-through"
                        : "text-slate-800"
                    )}
                  >
                    {todo.name}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span
                    className={twMerge(
                      "rounded border px-1.5 py-0.5 text-[11px] font-semibold",
                      todo.isDone
                        ? "border-slate-200 bg-slate-100 text-slate-400"
                        : badge.className
                    )}
                  >
                    優先度: {badge.label}
                  </span>

                  {deadlineInfo && (
                    <span className={deadlineInfo.className}>
                      {deadlineInfo.text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-x-1">
                <button
                  type="button"
                  onClick={() => startEdit(todo)}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(todo.id)}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;