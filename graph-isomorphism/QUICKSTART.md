# Quick Start Guide

Get started with the Graph Algorithms library in 60 seconds.

## Option 1: Docker Compose (Recommended)

```bash
# Start API server
docker-compose up -d api

# Test it
curl http://localhost:3000/health

# Run a shortest path algorithm
curl -X POST http://localhost:3000/dijkstra \
  -H "Content-Type: application/json" \
  -d '{"edges":[["NYC","Boston",215],["NYC","Philly",95]],"source":"NYC"}'
```

## Option 2: Local Node.js

```bash
# Install dependencies
npm install

# Run interactive demo
node examples/complete-algorithms-demo.js

# Run tests
make test-local

# Start API server
node server.js
```

## Option 3: Using Makefile

```bash
# Show all commands
make help

# Run demo
make demo-local

# Run tests
make test-local

# Start API
make api-local

# Test API endpoints
make api-test-dijkstra
make api-test-bfs
```

## Quick Algorithm Examples

### Dijkstra's Shortest Path

```javascript
import { WeightedGraph, dijkstra, getPath } from './src/index.js';

const graph = new WeightedGraph(false);
graph.addEdge('A', 'B', 1);
graph.addEdge('B', 'C', 2);

const result = dijkstra(graph, 'A');
console.log(result.distances.get('C')); // 3
```

### BFS Traversal

```javascript
import { Graph, bfs } from './src/index.js';

const graph = new Graph(false);
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');

const result = bfs(graph, 'A');
console.log(result.order); // ['A', 'B', 'C']
```

### Topological Sort

```javascript
import { Graph, topologicalSort } from './src/index.js';

const graph = new Graph(true);
graph.addEdge('Intro CS', 'Data Structures');
graph.addEdge('Data Structures', 'Algorithms');

const result = topologicalSort(graph);
console.log(result.sorted); // Course order
```

## Web Interfaces

The API server includes two web interfaces:

- **Standard Dashboard** (`/`): Clean, functional interface for testing algorithms
- **HUD Interface** (`/hud`): Enhanced Observer™ aesthetics with atmospheric effects

```bash
# Access interfaces
open http://localhost:3000           # Standard interface
open http://localhost:3000/hud       # HUD interface
```

## Docker Cheat Sheet

```bash
# Build all images
docker-compose build

# Run demo
docker-compose up demo

# Run tests
docker-compose run --rm test

# Start API (background)
docker-compose up -d api

# View logs
docker-compose logs -f api

# Stop all
docker-compose down

# Clean everything
docker-compose down -v --rmi local
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/algorithms` | GET | List algorithms |
| `/dijkstra` | POST | Shortest path |
| `/prim` | POST | MST (Prim) |
| `/kruskal` | POST | MST (Kruskal) |
| `/bfs` | POST | BFS traversal |
| `/dfs` | POST | DFS traversal |
| `/topological-sort` | POST | Topological sort |
| `/connected-components` | POST | Find components |
| `/cycle-detection` | POST | Detect cycles |
| `/isomorphism` | POST | Graph isomorphism |

## API Example Requests

### Shortest Path

```bash
curl -X POST http://localhost:3000/dijkstra \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [["A","B",5], ["B","C",3], ["A","C",10]],
    "source": "A"
  }'
```

### BFS Traversal

```bash
curl -X POST http://localhost:3000/bfs \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [["A","B"], ["B","C"], ["A","D"]],
    "start": "A"
  }'
```

### MST (Kruskal)

```bash
curl -X POST http://localhost:3000/kruskal \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [["A","B",4], ["B","C",1], ["A","C",2]]
  }'
```

### Topological Sort

```bash
curl -X POST http://localhost:3000/topological-sort \
  -H "Content-Type: application/json" \
  -d '{
    "edges": [
      ["Intro CS", "Algorithms"],
      ["Algorithms", "Machine Learning"]
    ]
  }'
```

## Development Workflow

```bash
# 1. Make changes to src/
vim src/traversal.js

# 2. Run tests
make test-local

# 3. Test locally
node examples/complete-algorithms-demo.js

# 4. Start API for testing
make api-local &

# 5. Test endpoints
make api-test-dijkstra
make api-test-bfs

# 6. Build Docker image
docker-compose build

# 7. Test in container
docker-compose run --rm test
```

## Production Deployment

```bash
# Build production image
docker build -t graph-algorithms:latest --target production .

# Tag for registry
docker tag graph-algorithms:latest myregistry.com/graph-algorithms:v1.0.0

# Push to registry
docker push myregistry.com/graph-algorithms:v1.0.0

# Deploy
docker run -d \
  --name graph-api \
  -p 3000:3000 \
  --restart unless-stopped \
  myregistry.com/graph-algorithms:v1.0.0
```

## Troubleshooting

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Docker build fails:**
```bash
docker-compose build --no-cache
```

**Tests fail:**
```bash
docker-compose run --rm test
# or locally:
node test/test.js
```

**API not responding:**
```bash
docker-compose logs api
curl http://localhost:3000/health
```

## Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
- Read [README.md](README.md) for complete API documentation
- Explore [examples/](examples/) for more usage examples
- Check [test/](test/) for algorithm test cases

## Resources

- **Documentation**: `README.md`, `DEPLOYMENT.md`
- **Examples**: `examples/complete-algorithms-demo.js`
- **Tests**: `test/advanced-algorithms-test.js` (51 tests)
- **API**: `server.js` (9 algorithm endpoints)
- **Docker**: `Dockerfile`, `docker-compose.yml`
- **Convenience**: `Makefile` (25+ commands)
