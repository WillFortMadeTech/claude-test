import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../aws/dynamodb';
import { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new category
 */
export async function createCategory(userId: string, name: string, color?: string): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    categoryId: uuidv4(),
    userId,
    name,
    color,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: category,
    })
  );

  return category;
}

/**
 * Get a category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
    })
  );

  return (result.Item as Category) || null;
}

/**
 * Get all categories for a user
 */
export async function getCategoriesByUserId(userId: string): Promise<Category[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.CATEGORIES,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );

  return (result.Items as Category[]) || [];
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<Pick<Category, 'name' | 'color'>>
): Promise<Category | null> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  if (updates.name) {
    updateExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = updates.name;
  }

  if (updates.color !== undefined) {
    updateExpressions.push('#color = :color');
    expressionAttributeNames['#color'] = 'color';
    expressionAttributeValues[':color'] = updates.color;
  }

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  if (updateExpressions.length === 1) {
    return getCategoryById(categoryId);
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return (result.Attributes as Category) || null;
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
    })
  );
}
