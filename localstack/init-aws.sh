#!/bin/bash

echo "Initializing LocalStack AWS resources..."

# Wait for LocalStack to be fully ready
sleep 5

# Create DynamoDB Tables
echo "Creating DynamoDB tables..."

# Users Table
awslocal dynamodb create-table \
    --table-name reminder-users \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Todos Table with GSI on userId
awslocal dynamodb create-table \
    --table-name reminder-todos \
    --attribute-definitions \
        AttributeName=todoId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
    --key-schema \
        AttributeName=todoId,KeyType=HASH \
    --global-secondary-indexes \
        '[
            {
                "IndexName": "UserIdIndex",
                "KeySchema": [
                    {"AttributeName": "userId", "KeyType": "HASH"},
                    {"AttributeName": "createdAt", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            }
        ]' \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Categories Table with GSI on userId
awslocal dynamodb create-table \
    --table-name reminder-categories \
    --attribute-definitions \
        AttributeName=categoryId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
        AttributeName=name,AttributeType=S \
    --key-schema \
        AttributeName=categoryId,KeyType=HASH \
    --global-secondary-indexes \
        '[
            {
                "IndexName": "UserIdIndex",
                "KeySchema": [
                    {"AttributeName": "userId", "KeyType": "HASH"},
                    {"AttributeName": "name", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            }
        ]' \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo "DynamoDB tables created successfully"

# Create S3 Bucket
echo "Creating S3 bucket..."

awslocal s3 mb s3://reminder-images --region us-east-1

# Set S3 CORS Configuration
awslocal s3api put-bucket-cors \
    --bucket reminder-images \
    --cors-configuration '{
        "CORSRules": [
            {
                "AllowedOrigins": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
                "AllowedHeaders": ["*"],
                "ExposeHeaders": ["ETag"],
                "MaxAgeSeconds": 3000
            }
        ]
    }'

# Set S3 Public Access
awslocal s3api put-bucket-acl \
    --bucket reminder-images \
    --acl public-read

echo "S3 bucket created with CORS configuration"

echo "LocalStack initialization complete!"

# List created resources for verification
echo "Created DynamoDB tables:"
awslocal dynamodb list-tables --region us-east-1

echo "Created S3 buckets:"
awslocal s3 ls
