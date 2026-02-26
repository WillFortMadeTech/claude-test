import { NextRequest, NextResponse } from 'next/server';
import { createTodo, getTodosByUserId } from '@/lib/db/todos';
import { z } from 'zod';

const createTodoSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const todos = await getTodosByUserId(userId);
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body));

    // Convert empty strings to undefined for optional fields
    const sanitizedBody = {
      ...body,
      description: body.description || undefined,
      categoryId: body.categoryId || undefined,
      dueDate: body.dueDate || undefined,
    };
    console.log('Sanitized body:', JSON.stringify(sanitizedBody));

    const { userId, title, description, categoryId, dueDate } = createTodoSchema.parse(sanitizedBody);

    const todo = await createTodo(userId, title, description, categoryId, dueDate);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Caught error:', error);
    console.error('Error type:', typeof error);
    console.error('Is ZodError?', error instanceof z.ZodError);

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors));
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
