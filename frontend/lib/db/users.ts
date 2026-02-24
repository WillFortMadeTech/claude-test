import { PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../aws/dynamodb';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new user
 */
export async function createUser(email: string, name: string): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    userId: uuidv4(),
    email,
    name,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
    })
  );

  return user;
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId },
    })
  );

  return (result.Item as User) || null;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.USERS,
    })
  );

  return (result.Items as User[]) || [];
}

/**
 * Update a user
 */
export async function updateUser(userId: string, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<User | null> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  if (updates.email) {
    updateExpressions.push('#email = :email');
    expressionAttributeNames['#email'] = 'email';
    expressionAttributeValues[':email'] = updates.email;
  }

  if (updates.name) {
    updateExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = updates.name;
  }

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  if (updateExpressions.length === 1) {
    return getUserById(userId);
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return (result.Attributes as User) || null;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.USERS,
      Key: { userId },
    })
  );
}
