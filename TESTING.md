# Testing Checklist

## Pre-Testing Setup

1. Ensure Docker and Docker Compose are installed
2. No services running on ports 3000 or 4566

## Starting the Application

```bash
docker-compose up --build
```

Wait for:
- LocalStack to be healthy (check logs for "Ready.")
- DynamoDB tables and S3 bucket to be created
- Next.js to start on http://localhost:3000

## Test Scenarios

### 1. Verify Infrastructure

- [ ] LocalStack is running
  ```bash
  curl http://localhost:4566/_localstack/health
  ```

- [ ] DynamoDB tables exist
  ```bash
  aws --endpoint-url=http://localhost:4566 dynamodb list-tables
  ```
  Expected: reminder-users, reminder-todos, reminder-categories

- [ ] S3 bucket exists
  ```bash
  aws --endpoint-url=http://localhost:4566 s3 ls
  ```
  Expected: reminder-images

### 2. Categories Management

- [ ] Navigate to http://localhost:3000/categories
- [ ] Create a category named "Shopping" with color Blue
- [ ] Create a category named "Work" with color Green
- [ ] Edit "Shopping" to change color to Red
- [ ] Verify categories list shows both categories
- [ ] Delete "Work" category
- [ ] Verify "Work" is removed from the list

### 3. Todo Management (Main Page)

- [ ] Navigate to http://localhost:3000
- [ ] Create a todo:
  - Title: "Buy groceries"
  - Description: "Milk, bread, eggs"
  - Category: Shopping
  - Due Date: Tomorrow's date
  - No image
- [ ] Verify todo appears in the list
- [ ] Toggle completion checkbox
- [ ] Verify todo shows as completed (line-through)
- [ ] Toggle it back to active

### 4. Todo with Image Upload

- [ ] Create a new todo:
  - Title: "Vacation photo"
  - Category: Shopping
  - Image: Upload a small image file
- [ ] Verify todo is created
- [ ] Verify image is displayed in the todo item
- [ ] Check browser DevTools Network tab for S3 image URL

### 5. Filtering

- [ ] Create 3 todos: 2 active, 1 completed
- [ ] Filter by "Active" - should show 2 todos
- [ ] Filter by "Completed" - should show 1 todo
- [ ] Filter by "All" - should show all 3
- [ ] Filter by category "Shopping" - should show only Shopping todos

### 6. Calendar View

- [ ] Navigate to http://localhost:3000/calendar
- [ ] Verify todos with due dates appear on calendar
- [ ] Click on a calendar event
- [ ] Verify todo details are shown in alert
- [ ] Check that completed todos appear with reduced opacity
- [ ] Navigate to different months
- [ ] Verify calendar legend shows categories

### 7. Delete Operations

- [ ] Delete a todo without an image
- [ ] Verify it's removed from the list
- [ ] Delete a todo with an image
- [ ] Verify it's removed from the list
- [ ] Verify image is deleted from S3 (check browser DevTools)

### 8. Stats and UI

- [ ] Verify stats bar shows correct counts (Total, Active, Completed)
- [ ] Verify navigation works between Todos, Calendar, and Categories pages
- [ ] Check responsive design on mobile viewport
- [ ] Verify loading states appear when fetching data

## Expected Behaviors

### Success Criteria
- All CRUD operations work for todos and categories
- Images upload successfully to S3 and display correctly
- Calendar shows todos on correct dates
- Filters work as expected
- Stats are accurate
- Navigation is smooth

### Common Issues to Check
- CORS errors in browser console (should be none)
- 500 errors from API routes (should be none)
- Image upload failures (check S3 permissions)
- DynamoDB operation errors (check table initialization)

## Clean Up

```bash
docker-compose down -v
```

This removes all containers and volumes, resetting the application state.

## Notes

- First load might take a few seconds for LocalStack to initialize
- Demo user ID is hardcoded as "demo-user-123"
- Images are stored in S3 with keys: `{userId}/{todoId}/{timestamp}-{filename}`
