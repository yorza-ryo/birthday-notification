# Birthday Message API

## Description

The Birthday Message API is a service designed to send birthday messages to users on their special day. This is a simple service built with ExpressJS, TypeScript, Prisma ORM, PostgreSQL, Bull, Redis, and Cron Jobs to send birthday messages to users at 9 AM local time on their birthday.

## Features

- **Create/Update/Delete Users**: Create, update, and delete user data.
- **Send Birthday Messages**: Send a birthday message to users at 9 AM local time on their birthday.
- **Email Service Integration**: Integrates with Email Service API to send the messages.
- **Error Recovery**: The system retries sending messages if the service was down for a period (e.g., 1 day).
- **Scalable**: Designed to handle potentially thousands of users and birthdays per day.

## Technologies

- **ExpressJs**: A progressive Node.js framework for building efficient, reliable, and scalable applications.
- **Prisma**: A next-generation ORM for Node.js that simplifies database interaction.
- **PostgreSQL**: A powerful, open-source relational database system.
- **Docker**: For containerizing the backend and PostgreSQL service.

## Setup

### Prerequisites

- Node.js (LTS version recommended)
- Docker (for backend and database containerization)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yorza-ryo/birthday-notification.git
   cd birthday-notification
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Configure the environment variables by copying the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

4. Build the Docker containers:

   ```bash
   docker compose --env-file ./.env up -d --build
   or
   yarn build
   ```

5. Run database migrations:
   ```bash
   docker compose --env-file ./.env exec api bash
   npx prisma migrate deploy
   ```

### Environment Variables

- `PORT`: PostgreSQL username (default: `3200`)
- `POSTGRES_USER`: PostgreSQL username (default: `postgres`)
- `POSTGRES_PASSWORD`: PostgreSQL password (default: `postgres`)
- `POSTGRES_DB`: PostgreSQL database name (default: `test`)
- `POSTGRES_PORT`: PostgreSQL database port (default: `5432`)
- `DATABASE_URL`: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`
- `REDIS_HOST`: test-redis
- `REDIS_PORT`: 6379
- `QUEUE_NAME`: scheduled-tasks
- `URL_EMAIL` : https://email-service.digitalenvision.com.au/send

## API Endpoints

### POST /users

Create a new user with their birthday.

**Request body:**

```json
{
  "firstName": "Risman",
  "lastName": "Yorza",
  "location": "Asia/Jakarta",
  "birthDate": "1995-07-09",
  "anniversaryDate": "2022-09-19"
}
```

### GET /users

Get a list of all users.

### PATCH /users/:id

Update a user with by their user id.

**Request body:**

```json
{
  "firstName": "Risman",
  "lastName": "Yorza",
  "location": "Asia/Jakarta",
  "birthDate": "1995-07-09",
  "anniversaryDate": "2022-09-19"
}
```

### DELETE /users/:id

Delete a user with by their user id.

## Testing

To run tests, execute:

```bash
yarn test
```

## 🙏
