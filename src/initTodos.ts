import type { Todo } from "./types";

export const initTodos: Todo[] = [
  {
    id: "1",
    name: "解析2の宿題",
    isDone: false,
    priority: 2,
    deadline: new Date(2026, 10, 20),
  },
  {
    id: "2",
    name: "TypeScriptの勉強",
    isDone: true,
    priority: 3,
    deadline: new Date(2026, 10, 18),
  },
  {
    id: "3",
    name: "基礎物理学の予習",
    isDone: false,
    priority: 1,
    deadline: new Date(2026, 10, 17),
  },
];