# Reminder Application

A full-stack reminder application built with Next.js, DynamoDB, and S3, deployed using Docker Compose with LocalStack for local AWS service emulation.

## Features

- **Todo Management**: Create, update, complete, and delete reminders
- **Image Attachments**: Upload images to todos using S3 storage
- **Categories**: Organize todos with customizable categories and colors
- **Calendar View**: Visualize todos by due date in an interactive calendar
- **Filters**: Filter todos by completion status and category
- **Local Development**: Fully containerized with LocalStack for AWS services

## Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: DynamoDB (via LocalStack)
- **Storage**: S3 (via LocalStack)
- **Infrastructure**: Docker Compose
- **Additional Libraries**:
  - AWS SDK v3
  - React Big Calendar
  - Zod for validation
  - date-fns for date formatting

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   cd claudeTest
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start LocalStack with DynamoDB and S3
   - Initialize database tables and S3 bucket
   - Start the Next.js application

3. **Access the application**
   - Frontend: http://localhost:3000
   - LocalStack: http://localhost:4566

### Local Development (Without Docker)

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start LocalStack separately**
   ```bash
   docker-compose up localstack
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
claudeTest/
├── docker-compose.yml           # Docker Compose configuration
├── localstack/
│   └── init-aws.sh             # LocalStack initialization script
├── frontend/
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── users/
│   │   │   ├── categories/
│   │   │   └── todos/
│   │   ├── calendar/           # Calendar page
│   │   ├── categories/         # Categories page
│   │   └── page.tsx            # Main todos page
│   ├── components/             # React components
│   ├── lib/
│   │   ├── aws/               # AWS SDK clients
│   │   ├── db/                # Database operations
│   │   └── types.ts           # TypeScript types
│   ├── .env.example           # Environment variables template
│   └── Dockerfile             # Frontend container
└── README.md
```

## Database Schema

### DynamoDB Tables

1. **reminder-users**
   - Partition Key: `userId` (String)
   - Attributes: email, name, createdAt, updatedAt

2. **reminder-todos**
   - Partition Key: `todoId` (String)
   - GSI: UserIdIndex (userId, createdAt)
   - Attributes: title, description, completed, categoryId, dueDate, imageKey, createdAt, updatedAt

3. **reminder-categories**
   - Partition Key: `categoryId` (String)
   - GSI: UserIdIndex (userId, name)
   - Attributes: name, color, createdAt, updatedAt

### S3 Buckets

- **reminder-images**: Stores todo images with keys: `{userId}/{todoId}/{timestamp}-{filename}`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### Categories
- `GET /api/categories?userId={userId}` - Get user's categories
- `POST /api/categories` - Create a category
- `GET /api/categories/{id}` - Get a category
- `PATCH /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Todos
- `GET /api/todos?userId={userId}` - Get user's todos
- `POST /api/todos` - Create a todo
- `GET /api/todos/{id}` - Get a todo
- `PATCH /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo
- `POST /api/todos/{id}/image` - Get presigned upload URL
- `GET /api/todos/{id}/image` - Get image URL

## Environment Variables

See `.env.example` in the frontend directory for all required environment variables:

- AWS credentials (for LocalStack)
- DynamoDB and S3 endpoints
- Table and bucket names
- Application settings

## Verifying Installation

1. **Check LocalStack health**
   ```bash
   curl http://localhost:4566/_localstack/health
   ```

2. **List DynamoDB tables**
   ```bash
   aws --endpoint-url=http://localhost:4566 dynamodb list-tables
   ```

3. **List S3 buckets**
   ```bash
   aws --endpoint-url=http://localhost:4566 s3 ls
   ```

## Usage

### Creating a Todo

1. Navigate to http://localhost:3000
2. Fill in the todo form:
   - Enter a title (required)
   - Add an optional description
   - Select a category (create one first in Categories page)
   - Set a due date
   - Upload an image
3. Click "Add Todo"

### Managing Categories

1. Navigate to http://localhost:3000/categories
2. Create categories with custom names and colors
3. Edit or delete existing categories

### Calendar View

1. Navigate to http://localhost:3000/calendar
2. View todos by due date
3. Click on events to see todo details
4. Use calendar navigation to browse different months

## Demo User

The application uses a demo user with ID `demo-user-123` for development purposes. In a production environment, you would integrate proper authentication.

## Troubleshooting

### LocalStack not starting
- Ensure Docker is running
- Check Docker logs: `docker-compose logs localstack`
- Verify port 4566 is not in use

### Frontend can't connect to LocalStack
- Check that services are healthy: `docker-compose ps`
- Verify environment variables in `.env`
- Ensure LocalStack is fully initialized before starting frontend

### Images not displaying
- Check S3 bucket CORS configuration
- Verify S3_PUBLIC_ENDPOINT in `.env`
- Check browser console for CORS errors

## Production Deployment

For production deployment:

1. Replace LocalStack with real AWS services (DynamoDB, S3)
2. Update environment variables with production AWS credentials
3. Implement proper authentication (e.g., NextAuth.js)
4. Add user registration and login flows
5. Update the hardcoded DEMO_USER_ID with real user sessions
6. Enable HTTPS and proper CORS configuration
7. Add environment-specific secrets via CI/CD

## Future Enhancements

- User authentication and authorization
- Recurring reminders
- Google Calendar integration
- Push notifications for due dates
- Real-time sync with WebSockets
- Mobile app with React Native
- Search and advanced filtering
- Todo sharing and collaboration

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
# claude-test
