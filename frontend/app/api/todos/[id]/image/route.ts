import { NextRequest, NextResponse } from 'next/server';
import { getTodoById, updateTodo } from '@/lib/db/todos';
import { generateUploadUrl, getPublicUrl } from '@/lib/aws/s3';
import { z } from 'zod';

const uploadImageSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  userId: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: todoId } = await params;
    const body = await request.json();
    const { fileName, contentType, userId } = uploadImageSchema.parse(body);

    // Check if todo exists
    const todo = await getTodoById(todoId);
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Generate image key: userId/todoId/timestamp-filename
    const timestamp = Date.now();
    const imageKey = `${userId}/${todoId}/${timestamp}-${fileName}`;

    // Generate presigned upload URL
    const uploadUrl = await generateUploadUrl(imageKey, contentType);

    // Update todo with image key
    await updateTodo(todoId, { imageKey });

    // Return presigned URL and public URL
    return NextResponse.json({
      uploadUrl,
      imageKey,
      imageUrl: getPublicUrl(imageKey),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: todoId } = await params;
    const todo = await getTodoById(todoId);

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    if (!todo.imageKey) {
      return NextResponse.json(
        { error: 'No image associated with this todo' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      imageUrl: getPublicUrl(todo.imageKey),
    });
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image URL' },
      { status: 500 }
    );
  }
}
