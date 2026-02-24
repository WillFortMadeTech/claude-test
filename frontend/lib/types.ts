// User entity
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Category entity
export interface Category {
  categoryId: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Todo entity
export interface Todo {
  todoId: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  dueDate?: string;
  imageKey?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: string;
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  categoryId?: string;
  dueDate?: string;
}

export interface ImageUploadResponse {
  uploadUrl: string;
  imageKey: string;
  imageUrl: string;
}
