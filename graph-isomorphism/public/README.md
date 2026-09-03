# Graph Algorithms Web Dashboard

Interactive web interface for testing and visualizing graph algorithms.

Available in two styles:
- **Standard Dashboard** (`/`): Clean, functional interface
- **HUD Interface** (`/hud`): Enhanced Observer™ aesthetics with atmospheric effects (scanlines, vignette, grid overlay)

## Quick Start

```bash
# Start the server
docker-compose up -d api

# Or locally
node server.js

# Open in browser
open http://localhost:3000           # Standard interface
open http://localhost:3000/hud       # HUD interface
```

## Features

### 🎮 API Playground
- Test all 9 algorithms interactively
- Pre-loaded examples for each algorithm
- JSON request/response editor
- Real-time execution with loading states
- Syntax-highlighted output

### 📊 Algorithm Catalog
- Browse all available algorithms
- View time complexity (Big-O notation)
- Categorized by type (MST, traversal, DAG, etc.)
- Click to auto-populate playground

### 🎨 Graph Visualizer
- Draw graphs with mouse clicks
- Click to add vertices (A, B, C...)
- Shift+click to connect vertices
- Pre-built samples (triangle, square, DAG)
- Export to JSON edge list

### 📖 Documentation
- Complete API endpoint reference
- Docker Compose commands
- HTTP methods and descriptions

## Usage Guide

### Drawing Graphs

1. Click on canvas to add vertices
2. Shift+click two vertices to create edge
3. Click "Export Graph" to get JSON
4. Copy JSON to API Playground
5. Execute algorithm

### Testing Algorithms

1. Select algorithm from dropdown
2. Click example button (Example 1, 2, or 3)
3. Edit JSON if needed
4. Click "Execute Algorithm"
5. View formatted results

### Pre-loaded Examples

**Dijkstra's Shortest Path:**
- City routing (NYC, Boston, Philly)
- Simple weighted graph
- Complex path finding

**Prim's & Kruskal's MST:**
- Network design scenarios
- Minimum cost spanning trees
- Graph optimization

**BFS & DFS:**
- Tree traversal patterns
- Level-order vs depth-first
- Graph exploration

**Topological Sort:**
- Course prerequisites
- Task scheduling
- Dependency ordering

**Connected Components:**
- Disconnected graph examples
- Component detection
- Graph partitioning

**Cycle Detection:**
- Cyclic graphs
- Acyclic (DAG) examples
- Back edge identification

**Graph Isomorphism:**
- Triangle matching
- Square graphs
- Structural equivalence

## API Endpoints

All endpoints accessed via `POST http://localhost:3000/<algorithm>`:

| Algorithm | Endpoint | Example |
|-----------|----------|---------|
| Dijkstra | `/dijkstra` | `{"edges":[["A","B",1]],"source":"A"}` |
| Prim | `/prim` | `{"edges":[["A","B",4]],"start":"A"}` |
| Kruskal | `/kruskal` | `{"edges":[["A","B",4]]}` |
| BFS | `/bfs` | `{"edges":[["A","B"]],"start":"A"}` |
| DFS | `/dfs` | `{"edges":[["A","B"]],"start":"A"}` |
| Topo Sort | `/topological-sort` | `{"edges":[["A","B"]]}` |
| Components | `/connected-components` | `{"edges":[["A","B"]]}` |
| Cycles | `/cycle-detection` | `{"edges":[["A","B"]]}` |
| Isomorphism | `/isomorphism` | `{"edges1":[...],"edges2":[...]}` |

## Request Format

### Weighted Graphs (Dijkstra, Prim, Kruskal)
```json
{
  "edges": [
    ["from", "to", weight],
    ["A", "B", 5],
    ["B", "C", 3]
  ],
  "source": "A"  // or "start" for Prim
}
```

### Unweighted Graphs (BFS, DFS)
```json
{
  "edges": [
    ["from", "to"],
    ["A", "B"],
    ["B", "C"]
  ],
  "start": "A",
  "directed": false  // optional
}
```

### Directed Graphs (Topological Sort)
```json
{
  "edges": [
    ["prerequisite", "course"],
    ["Intro CS", "Algorithms"],
    ["Algorithms", "ML"]
  ]
}
```

### Isomorphism
```json
{
  "edges1": [["A","B"], ["B","C"], ["C","A"]],
  "edges2": [["1","2"], ["2","3"], ["3","1"]],
  "directed": false
}
```

## Response Format

All responses include:
- `algorithm`: Name of executed algorithm
- `steps`: Number of iterations
- Algorithm-specific results

### Dijkstra Response
```json
{
  "algorithm": "dijkstra",
  "source": "A",
  "distances": {"A": 0, "B": 1, "C": 3},
  "paths": {"A": null, "B": "A", "C": "B"},
  "steps": 3
}
```

### BFS Response
```json
{
  "algorithm": "bfs",
  "order": ["A", "B", "C", "D"],
  "distances": {"A": 0, "B": 1, "C": 1, "D": 2},
  "steps": 4
}
```

### Topological Sort Response
```json
{
  "algorithm": "topological-sort",
  "success": true,
  "sorted": ["Intro CS", "Algorithms", "ML"],
  "steps": 3
}
```

## Keyboard Shortcuts

- Click canvas: Add vertex
- Shift+Click two vertices: Add edge
- Tab: Switch between tabs
- Enter in JSON editor: Focus execute button

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- Canvas API support
- Fetch API support
- CSS Grid & Flexbox
- CSS Custom Properties

## Customization

### Theme Colors

Edit CSS variables in `index.html`:

```css
:root {
  --bg-primary: #0f172a;
  --accent: #3b82f6;
  --success: #10b981;
  /* ... */
}
```

### API Endpoint

Change base URL in JavaScript:

```javascript
const API_BASE = 'http://your-api:3000';
```

### Add Custom Examples

Edit the `EXAMPLES` object in JavaScript:

```javascript
const EXAMPLES = {
  dijkstra: [
    { edges: [['Custom','Example',1]], source: 'Custom' },
    // ... more examples
  ]
};
```

## Development

```bash
# Serve locally
python3 -m http.server 8000

# Or with Node
npx serve public/

# Open browser
open http://localhost:8000
```

## Deployment

### With Docker
```bash
docker-compose up -d api
# Access at http://localhost:3000
```

### Standalone
```bash
node server.js
# Access at http://localhost:3000
```

### Static Hosting
The HTML can be served from any static host (Netlify, Vercel, GitHub Pages) by updating the `API_BASE` variable to point to your API server.

## Troubleshooting

**API shows Offline:**
- Check server is running: `curl http://localhost:3000/health`
- Verify port 3000 is not blocked
- Check browser console for CORS errors

**Canvas not working:**
- Ensure browser supports Canvas API
- Check JavaScript is enabled
- Try clearing browser cache

**Requests failing:**
- Verify JSON syntax is valid
- Check request body matches algorithm requirements
- Review API response for error messages

## Files

- `index.html` - Main dashboard (single-file app)
- All JavaScript is embedded in HTML
- No build step required
- No dependencies needed

## Performance

- Lightweight: ~30KB HTML (uncompressed)
- No external dependencies
- Renders in < 100ms
- API calls typically < 50ms locally

## Security

- CORS enabled on API server
- No sensitive data stored
- All computation on server
- Client-side validation only

## License

MIT
