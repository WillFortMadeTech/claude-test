'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Todo, Category } from '@/lib/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// For demo purposes, using a hardcoded user ID (valid UUID v4 format)
const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    todo: Todo;
    category?: Category;
  };
}

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`/api/todos?userId=${DEMO_USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?userId=${DEMO_USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return todos
      .filter(todo => todo.dueDate)
      .map(todo => {
        const dueDate = new Date(todo.dueDate!);
        const category = categories.find(c => c.categoryId === todo.categoryId);

        return {
          id: todo.todoId,
          title: todo.title,
          start: dueDate,
          end: dueDate,
          resource: {
            todo,
            category,
          },
        };
      });
  }, [todos, categories]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const category = event.resource.category;
    const backgroundColor = category?.color || '#3b82f6';
    const isCompleted = event.resource.todo.completed;

    return {
      style: {
        backgroundColor,
        opacity: isCompleted ? 0.5 : 1,
        textDecoration: isCompleted ? 'line-through' : 'none',
        border: 'none',
        borderRadius: '4px',
        color: '#1f2937',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const todo = event.resource.todo;
    const message = `
Todo: ${todo.title}
${todo.description ? `Description: ${todo.description}\n` : ''}
Due: ${format(new Date(todo.dueDate!), 'PPP')}
Status: ${todo.completed ? 'Completed' : 'Active'}
${event.resource.category ? `Category: ${event.resource.category.name}` : ''}
    `.trim();

    alert(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calendar View</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing todos with due dates. Click on an event to view details.
            </p>
          </div>

          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              popup
              style={{ height: '100%' }}
            />
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Legend</h3>
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <div key={category.categoryId} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color || '#e5e7eb' }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-700">
              <strong>Stats:</strong> {events.length} todos with due dates |{' '}
              {events.filter(e => e.resource.todo.completed).length} completed |{' '}
              {events.filter(e => !e.resource.todo.completed).length} active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
