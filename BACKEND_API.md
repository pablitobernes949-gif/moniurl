# Backend API Documentation

## Overview

O backend do Service Monitor implementa uma API RESTful completa para gerenciar monitoramento de serviços com armazenamento persistente e verificações automáticas periódicas.

## Features

- ✅ **Armazenamento Persistente**: Dados salvos em arquivos JSON (`.data/` directory)
- ✅ **Monitoramento Automático**: Worker que verifica serviços a cada 30 segundos
- ✅ **Event Streaming**: Server-Sent Events (SSE) para atualizações em tempo real
- ✅ **Histórico de Verificações**: Mantém últimas 1000 verificações por serviço
- ✅ **Suporte AWS**: Integração opcional com DynamoDB e SNS
- ✅ **Health Check**: Endpoint para verificar status do servidor

## API Endpoints

### Health Check

**GET /api/health**
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-01-02T10:00:00.000Z"
}
```

### Services

#### List All Services
**GET /api/services**
```bash
curl http://localhost:3000/api/services
```

Response:
```json
{
  "services": [
    {
      "id": "1704186000000",
      "name": "API Gateway",
      "url": "https://api.example.com",
      "status": "online",
      "lastCheck": 1704186000000,
      "responseTime": 145,
      "uptime": 99.5,
      "createdAt": 1704186000000,
      "history": [...]
    }
  ]
}
```

#### Get Service Details
**GET /api/services/:id**
```bash
curl http://localhost:3000/api/services/1704186000000
```

#### Create Service
**POST /api/services**
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://api.example.com"
  }'
```

Response:
```json
{
  "service": {
    "id": "1704186000000",
    "name": "My API",
    "url": "https://api.example.com",
    "status": "online",
    "responseTime": 234,
    "uptime": 100,
    "createdAt": 1704186000000,
    "history": [...]
  }
}
```

#### Update Service
**PUT /api/services/:id**
```bash
curl -X PUT http://localhost:3000/api/services/1704186000000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

#### Delete Service
**DELETE /api/services/:id**
```bash
curl -X DELETE http://localhost:3000/api/services/1704186000000
```

### Health Checks

#### Force Immediate Check
**POST /api/services/:id/check**
```bash
curl -X POST http://localhost:3000/api/services/1704186000000/check
```

Response:
```json
{
  "service": {
    "id": "1704186000000",
    "status": "online",
    "responseTime": 156,
    "lastCheck": 1704186012345,
    "history": [...]
  }
}
```

#### Get Service History
**GET /api/services/:id/history**
```bash
curl http://localhost:3000/api/services/1704186000000/history
```

Response:
```json
{
  "history": [
    {
      "timestamp": 1704186000000,
      "status": "online",
      "responseTime": 145
    },
    ...
  ]
}
```

#### Update Service History
**POST /api/services/:id/history**
```bash
curl -X POST http://localhost:3000/api/services/1704186000000/history \
  -H "Content-Type: application/json" \
  -d '{
    "check": {
      "timestamp": 1704186012345,
      "status": "online",
      "responseTime": 156
    }
  }'
```

### Event Streaming

#### Subscribe to Service Updates
**GET /api/services/:id/events** (Server-Sent Events)
```bash
curl http://localhost:3000/api/services/1704186000000/events
```

This endpoint provides real-time updates using SSE. The server sends:
- Initial history on connection
- New checks as they're performed
- Health check results

## Data Storage

### Directory Structure

```
.data/
├── services.json          # All services metadata
└── history/
    ├── 1704186000000.json # Service 1 history
    ├── 1704186000001.json # Service 2 history
    └── ...
```

### File Format

**services.json**:
```json
[
  {
    "id": "1704186000000",
    "name": "Service Name",
    "url": "https://example.com",
    "status": "online",
    "lastCheck": 1704186000000,
    "responseTime": 145,
    "uptime": 99.5,
    "createdAt": 1704186000000
  }
]
```

**history/[id].json**:
```json
[
  {
    "timestamp": 1704186000000,
    "status": "online",
    "responseTime": 145
  },
  ...
]
```

## Configuration

### Environment Variables

```env
# AWS Configuration (optional)
AWS_DYNAMODB_TABLE=services-table
AWS_REGION=us-east-1
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:service-alerts

# Monitoring Interval (default: 30000ms)
MONITORING_INTERVAL=30000
```

### Using AWS DynamoDB

If `AWS_DYNAMODB_TABLE` is set, the system will use DynamoDB for storage instead of local files:

1. Create DynamoDB table with partition key `id` (String)
2. Set environment variables
3. Ensure AWS credentials are configured (IAM roles or credentials)

## Monitoring Worker

The background worker automatically:
- Checks each service's health every 30 seconds
- Logs check results
- Updates service status and uptime
- Maintains history in storage
- Publishes events via SSE
- (Optional) Sends SNS notifications on status changes

### Starting the Worker

The worker automatically starts when the first request hits `/api/health`. You can also manually start it:

```typescript
import { startMonitoring } from "@/lib/worker"

// Start with default 30s interval
startMonitoring()

// Or custom interval
startMonitoring(60000) // 60 seconds
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Service created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Description of what went wrong"
}
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Server runs at http://localhost:3000
```

## Performance

- **Response Times**: ~100-200ms for API calls (depends on service checks)
- **Storage**: ~500 bytes per health check record
- **Memory**: Minimal (~10MB) for 100+ services
- **CPU**: Low utilization, mostly idle waiting for checks

## Security Considerations

- All requests are validated
- No authentication required (use reverse proxy for access control)
- Service URLs are validated before use
- Large check intervals prevent DOS
- Timeouts prevent hanging requests (10s per check)

## Troubleshooting

### Backend not initializing
- Check browser console for errors
- Verify `/api/health` returns success
- Check `.data/` directory exists and is writable

### Services not auto-checking
- Verify monitoring worker is running
- Check server logs for errors
- Ensure at least one service exists

### Data not persisting
- Check `.data/` directory permissions
- Ensure sufficient disk space
- Verify AWS credentials if using DynamoDB

### SSE not receiving updates
- Verify `/api/services/:id/events` endpoint is accessible
- Check browser support for EventSource (all modern browsers)
- Verify service exists before subscribing

## Development

### Adding New Endpoints

1. Create route file: `app/api/endpoint/route.ts`
2. Import storage functions from `lib/storage.ts`
3. Handle GET/POST/PUT/DELETE as needed
4. Return NextResponse with appropriate status code

Example:
```typescript
import { NextResponse } from "next/server"
import { getAllServices } from "@/lib/storage"

export async function GET() {
  const services = getAllServices()
  return NextResponse.json({ services })
}
```

### Extending Storage

The storage system is modular. To use different backends:

1. Create new storage implementation in `lib/storage-***.ts`
2. Implement functions matching `lib/storage.ts` interface
3. Update imports in API routes

## Testing

```bash
# Test health check
curl http://localhost:3000/api/health

# Create service
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://google.com"}'

# List services
curl http://localhost:3000/api/services

# Force check
curl -X POST http://localhost:3000/api/services/[ID]/check

# Stream events
curl http://localhost:3000/api/services/[ID]/events
```

## Support

For issues or questions, check the main README.md or create an issue on the repository.
