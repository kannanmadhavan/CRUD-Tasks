// src/types.ts
export interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    dueDate: string;
    completed: boolean;
    createdAt: string;
  }
  