import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../aws/dynamodb';
import { Todo } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { deleteObject, getPublicUrl } from '../aws/s3';

/**
 * Create a new todo
 */
export async function createTodo(
  userId: string,
  title: string,
  description?: string,
  categoryId?: string,
  dueDate?: string
): Promise<Todo> {
  const now = new Date().toISOString();
  const todo: Todo = {
    todoId: uuidv4(),
    userId,
    title,
    description,
    completed: false,
    categoryId,
    dueDate,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.TODOS,
      Item: todo,
    })
  );

  return todo;
}

/**
 * Get a todo by ID
 */
export async function getTodoById(todoId: string): Promise<Todo | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.TODOS,
      Key: { todoId },
    })
  );

  const todo = result.Item as Todo;
  if (todo && todo.imageKey) {
    todo.imageUrl = getPublicUrl(todo.imageKey);
  }

  return todo || null;
}

/**
 * Get all todos for a user
 */
export async function getTodosByUserId(userId: string): Promise<Todo[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.TODOS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by createdAt descending
    })
  );

  const todos = (result.Items as Todo[]) || [];

  // Add image URLs
  return todos.map(todo => {
    if (todo.imageKey) {
      todo.imageUrl = getPublicUrl(todo.imageKey);
    }
    return todo;
  });
}

/**
 * Update a todo
 */
export async function updateTodo(
  todoId: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'categoryId' | 'dueDate' | 'imageKey'>>
): Promise<Todo | null> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  if (updates.title) {
    updateExpressions.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = updates.title;
  }

  if (updates.description !== undefined) {
    updateExpressions.push('#description = :description');
    expressionAttributeNames['#description'] = 'description';
    expressionAttributeValues[':description'] = updates.description;
  }

  if (updates.completed !== undefined) {
    updateExpressions.push('#completed = :completed');
    expressionAttributeNames['#completed'] = 'completed';
    expressionAttributeValues[':completed'] = updates.completed;
  }

  if (updates.categoryId !== undefined) {
    updateExpressions.push('#categoryId = :categoryId');
    expressionAttributeNames['#categoryId'] = 'categoryId';
    expressionAttributeValues[':categoryId'] = updates.categoryId;
  }

  if (updates.dueDate !== undefined) {
    updateExpressions.push('#dueDate = :dueDate');
    expressionAttributeNames['#dueDate'] = 'dueDate';
    expressionAttributeValues[':dueDate'] = updates.dueDate;
  }

  if (updates.imageKey !== undefined) {
    updateExpressions.push('#imageKey = :imageKey');
    expressionAttributeNames['#imageKey'] = 'imageKey';
    expressionAttributeValues[':imageKey'] = updates.imageKey;
  }

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  if (updateExpressions.length === 1) {
    return getTodoById(todoId);
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.TODOS,
      Key: { todoId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  const todo = result.Attributes as Todo;
  if (todo && todo.imageKey) {
    todo.imageUrl = getPublicUrl(todo.imageKey);
  }

  return todo || null;
}

/**
 * Delete a todo
 */
export async function deleteTodo(todoId: string): Promise<void> {
  // Get the todo first to check for images
  const todo = await getTodoById(todoId);

  // Delete the todo from DynamoDB
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.TODOS,
      Key: { todoId },
    })
  );

  // Delete the associated image from S3 if it exists
  if (todo?.imageKey) {
    try {
      await deleteObject(todo.imageKey);
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      // Continue even if image deletion fails
    }
  }
}
