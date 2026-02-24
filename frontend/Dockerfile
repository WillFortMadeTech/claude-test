# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Check if .env exists, if not copy .env.example
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
