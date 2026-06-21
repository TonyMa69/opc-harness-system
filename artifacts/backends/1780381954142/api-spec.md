# Backend API Specification

## Endpoints

### GET /api/health
Returns system health status

### POST /api/resources
Creates a new resource

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "metadata": {}
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "timestamp"
}
```

## Database Schema

**Table: resources**
- id (UUID, primary key)
- name (VARCHAR)
- description (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)