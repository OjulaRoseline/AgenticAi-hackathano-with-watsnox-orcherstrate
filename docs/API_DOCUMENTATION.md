# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### POST /api/auth/login

Login to get JWT token.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "hr_admin"
  }
}
```

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "password": "securepassword",
  "name": "Jane Smith",
  "role": "employee"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "2",
    "email": "newuser@company.com",
    "name": "Jane Smith",
    "role": "employee"
  }
}
```

---

## Onboarding Endpoints

### POST /api/onboarding/create

Create a new onboarding instance.

**Requires Auth:** Yes

**Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Chen",
  "email": "sarah.chen@company.com",
  "role": "Software Engineer",
  "department": "Engineering",
  "startDate": "2024-11-15",
  "managerId": "MGR-123",
  "location": "San Francisco"
}
```

**Response:**
```json
{
  "message": "Onboarding created successfully",
  "onboarding": {
    "id": "uuid-here",
    "employeeId": "EMP-2024-ABC123",
    "firstName": "Sarah",
    "lastName": "Chen",
    "email": "sarah.chen@company.com",
    "role": "Software Engineer",
    "department": "Engineering",
    "startDate": "2024-11-15",
    "status": "pending",
    "createdAt": "2024-11-06T12:00:00Z"
  },
  "workflowId": "wf_12345"
}
```

### GET /api/onboarding/:id

Get onboarding details by ID.

**Requires Auth:** Yes

**Response:**
```json
{
  "id": "uuid-here",
  "employeeId": "EMP-2024-ABC123",
  "firstName": "Sarah",
  "lastName": "Chen",
  "email": "sarah.chen@company.com",
  "role": "Software Engineer",
  "department": "Engineering",
  "status": "in_progress",
  "progress": 65,
  "startDate": "2024-11-15",
  "tasks": [
    {
      "id": 1,
      "name": "Complete IT security training",
      "status": "completed",
      "dueDate": "2024-11-15"
    }
  ]
}
```

### GET /api/onboarding

Get all onboardings with optional filters.

**Requires Auth:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed)
- `department` (optional): Filter by department
- `startDate` (optional): Filter by start date

**Example:**
```
GET /api/onboarding?status=in_progress&department=Engineering
```

**Response:**
```json
{
  "count": 2,
  "onboardings": [
    {
      "id": "1",
      "employeeId": "EMP-2024-001",
      "name": "John Doe",
      "role": "Software Engineer",
      "department": "Engineering",
      "status": "in_progress",
      "progress": 65,
      "startDate": "2024-11-15"
    }
  ]
}
```

### PATCH /api/onboarding/:id/status

Update onboarding status.

**Requires Auth:** Yes

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid statuses:** `pending`, `in_progress`, `completed`, `cancelled`

**Response:**
```json
{
  "message": "Status updated successfully",
  "id": "uuid-here",
  "status": "completed"
}
```

### GET /api/onboarding/:id/tasks

Get tasks for an onboarding instance.

**Requires Auth:** Yes

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "name": "Complete IT security training",
      "description": "Complete the mandatory security awareness training",
      "status": "completed",
      "dueDate": "2024-11-15",
      "category": "training",
      "completedAt": "2024-11-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Set up development environment",
      "description": "Install required software and tools",
      "status": "in_progress",
      "dueDate": "2024-11-15",
      "category": "technical"
    }
  ]
}
```

### PATCH /api/onboarding/:id/tasks/:taskId

Update task status.

**Requires Auth:** Yes

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Completed the training successfully"
}
```

**Response:**
```json
{
  "message": "Task updated successfully",
  "taskId": "1",
  "status": "completed"
}
```

### GET /api/onboarding/:id/progress

Get onboarding progress.

**Requires Auth:** Yes

**Response:**
```json
{
  "overall": 65,
  "categories": {
    "accounts": {
      "completed": 3,
      "total": 3,
      "percentage": 100
    },
    "equipment": {
      "completed": 2,
      "total": 3,
      "percentage": 66
    },
    "training": {
      "completed": 1,
      "total": 4,
      "percentage": 25
    }
  },
  "timeline": [
    {
      "date": "2024-11-15",
      "event": "Start date",
      "status": "upcoming"
    }
  ]
}
```

### POST /api/onboarding/:id/workflows/:workflowName

Trigger a specific workflow.

**Requires Auth:** Yes

**Example:**
```
POST /api/onboarding/uuid-here/workflows/equipment_request
```

**Response:**
```json
{
  "message": "Workflow equipment_request triggered successfully",
  "workflowId": "wf_67890",
  "status": "running"
}
```

---

## Chat Endpoints

### POST /api/chat/message

Send a message to the AI assistant.

**Requires Auth:** Yes

**Request Body:**
```json
{
  "employeeId": "EMP-2024-001",
  "message": "When is my first day?"
}
```

**Response:**
```json
{
  "message": "Your first day is November 15, 2024. We're excited to have you!",
  "intent": "question_about_schedule",
  "timestamp": "2024-11-06T15:30:00Z"
}
```

### GET /api/chat/history/:employeeId

Get chat history for an employee.

**Requires Auth:** Yes

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "count": 2,
  "history": [
    {
      "id": 1,
      "employeeId": "EMP-2024-001",
      "message": "When is my first day?",
      "response": "Your first day is November 15, 2024.",
      "intent": "question_about_schedule",
      "timestamp": "2024-11-10T14:30:00Z"
    }
  ]
}
```

### GET /api/chat/suggestions/:employeeId

Get suggested questions for an employee.

**Requires Auth:** Yes

**Response:**
```json
{
  "suggestions": [
    "What's on my schedule for today?",
    "Where can I find the employee handbook?",
    "Who is my assigned buddy?"
  ]
}
```

### POST /api/chat/feedback

Provide feedback on a chat response.

**Requires Auth:** Yes

**Request Body:**
```json
{
  "messageId": "1",
  "helpful": true
}
```

**Response:**
```json
{
  "message": "Thank you for your feedback!",
  "messageId": "1",
  "helpful": true
}
```

---

## Webhook Endpoints

### POST /api/webhooks/slack/events

Receive Slack events.

**Note:** This is called by Slack, not by clients directly.

### POST /api/webhooks/servicenow/:ticketId

Receive ServiceNow updates.

**Note:** This is called by ServiceNow, not by clients directly.

### POST /api/webhooks/google/account-created

Receive Google account creation confirmation.

**Note:** This is called by Google Workspace, not by clients directly.

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "required": ["firstName", "lastName", "email"]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Route GET /api/unknown not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create onboarding",
  "message": "Database connection failed"
}
```

---

## Rate Limiting

- **100 requests per minute** per IP address
- Exceeding this limit returns HTTP 429

---

## Postman Collection

A Postman collection with all endpoints is available in `/docs/postman_collection.json`.

Import it into Postman to quickly test the API.
