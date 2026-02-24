'use client';

import { Todo, Category } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onToggle: (todoId: string, completed: boolean) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoItem({ todo, categories, onToggle, onDelete }: TodoItemProps) {
  const category = categories.find((c) => c.categoryId === todo.categoryId);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.todoId, e.target.checked)}
          className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {todo.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                {category && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: category.color || '#e5e7eb',
                      color: '#1f2937',
                    }}
                  >
                    {category.name}
                  </span>
                )}

                {todo.dueDate && (
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(todo.todoId)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>

          {todo.imageUrl && (
            <div className="mt-3">
              <div className="relative w-full h-48 rounded overflow-hidden">
                <Image
                  src={todo.imageUrl}
                  alt={todo.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
