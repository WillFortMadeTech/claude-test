import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Configure DynamoDB client for LocalStack
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

// Create DocumentClient for easier interaction with DynamoDB
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names from environment variables
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'reminder-users',
  TODOS: process.env.DYNAMODB_TODOS_TABLE || 'reminder-todos',
  CATEGORIES: process.env.DYNAMODB_CATEGORIES_TABLE || 'reminder-categories',
};
