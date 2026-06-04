# Deployment Guide

Complete Docker Compose deployment configuration for the Graph Algorithms library.

## Quick Start

```bash
# Run interactive demo
docker-compose up demo

# Run all tests
docker-compose up test

# Start API server
docker-compose up -d api

# Development mode with hot reload
docker-compose up dev
```

## Services

### 1. Demo Service (`demo`)
Interactive terminal demo showcasing all algorithms with CLI spinner visualizations.

```bash
docker-compose up demo
```

**Features:**
- Complete algorithm demonstrations
- Color-coded output
- CLI spinner animations
- Kruskal vs Prim comparison
- BFS vs DFS comparison
- Cycle detection
- Topological sort

### 2. Test Runner (`test`)
Runs comprehensive test suite (95 tests).

```bash
docker-compose up test
```

**Test Coverage:**
- Graph operations (17 tests)
- Dijkstra & Prim (27 tests)
- Kruskal, BFS, DFS, Topological Sort (51 tests)

### 3. API Server (`api`)
RESTful HTTP API for remote algorithm execution.

```bash
docker-compose up -d api
curl http://localhost:3000/health
```

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/algorithms` | List available algorithms |
| POST | `/dijkstra` | Shortest path |
| POST | `/prim` | MST (vertex-centric) |
| POST | `/kruskal` | MST (edge-centric) |
| POST | `/bfs` | Breadth-first search |
| POST | `/dfs` | Depth-first search |
| POST | `/topological-sort` | DAG ordering |
| POST | `/connected-components` | Find components |
| POST | `/cycle-detection` | Detect cycles |
| POST | `/isomorphism` | Graph isomorphism |

**Example API Usage:**

```bash
# Dijkstra's shortest path
curl -X POST http://localhost:3000/dijkstra \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [
      ["A", "B", 1],
      ["B", "C", 2],
      ["A", "C", 4]
    ],
    "source": "A"
  }'

# BFS traversal
curl -X POST http://localhost:3000/bfs \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [["A", "B"], ["A", "C"], ["B", "D"]],
    "start": "A"
  }'

# Topological sort
curl -X POST http://localhost:3000/topological-sort \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [
      ["Intro CS", "Data Structures"],
      ["Data Structures", "Algorithms"],
      ["Algorithms", "Machine Learning"]
    ]
  }'
```

### 4. Development Service (`dev`)
Development environment with volume mounting and debugger port.

```bash
docker-compose up dev
```

**Features:**
- Live code reload (volumes mounted)
- Node.js debugger on port 9229
- Interactive shell access
- Full development dependencies

## Build Stages

The multi-stage Dockerfile provides:

- `base`: Production dependencies only
- `development`: All dependencies + test files
- `production`: Optimized runtime (non-root user)
- `demo`: Demo runner
- `test`: Test runner
- `api`: HTTP API server

## Production Deployment

### Using Docker Compose

```bash
# Start API in production mode
docker-compose up -d api

# Check logs
docker-compose logs -f api

# Scale API service
docker-compose up -d --scale api=3

# Stop services
docker-compose down
```

### Using Docker Directly

```bash
# Build production image
docker build -t graph-algorithms:latest --target production .

# Run API server
docker run -d \
  --name graph-api \
  -p 3000:3000 \
  --restart unless-stopped \
  graph-algorithms:latest

# Run tests
docker build -t graph-algorithms:test --target test .
docker run --rm graph-algorithms:test
```

### Health Checks

API server includes built-in health checks:

```bash
# Docker health check
docker inspect --format='{{.State.Health.Status}}' graph-algorithms-api

# Manual check
curl http://localhost:3000/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | API server port |

## Networking

All services use the `graph-algorithms-network` Docker network for inter-service communication.

```bash
# Inspect network
docker network inspect graph-algorithms-network

# Connect external service
docker network connect graph-algorithms-network my-service
```

## Volume Management

Development mode mounts local directories:

```yaml
volumes:
  - .:/app                    # Source code
  - /app/node_modules         # Preserve node_modules
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Rebuild images
docker-compose build --no-cache

# Reset everything
docker-compose down -v
docker-compose up --build
```

### API not responding

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/health

# Check logs
docker-compose logs -f api
```

### Tests failing

```bash
# Run tests with output
docker-compose run --rm test

# Interactive debugging
docker-compose run --rm dev sh
node test/test.js
```

## Security

- Production image runs as non-root `node` user
- Only production dependencies in runtime
- No source code in production images (only compiled)
- CORS enabled for API (configure for production)
- Health checks prevent routing to unhealthy containers

## Performance

- Multi-stage build minimizes image size
- npm ci with --only=production for faster installs
- Cache layers optimized for dependency changes
- Alpine Linux base (~50MB vs ~900MB standard Node)

## CI/CD Integration

```yaml
# Example GitHub Actions
name: Docker Build & Test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: docker-compose run --rm test

  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Build and push
        run: |
          docker build -t myregistry/graph-algorithms:${{ github.sha }} .
          docker push myregistry/graph-algorithms:${{ github.sha }}
```

## Monitoring

```bash
# Resource usage
docker stats graph-algorithms-api

# Container events
docker events --filter 'container=graph-algorithms-api'

# Logs with timestamps
docker-compose logs -f --timestamps api
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Prune everything
docker system prune -a --volumes
```
