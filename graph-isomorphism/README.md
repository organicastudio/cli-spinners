# Graph Isomorphism and Tree Structures

A JavaScript library for graph isomorphism detection and tree data structures, with beautiful CLI spinner visualizations.

## Features

- **Graph Data Structures**: Create and manipulate directed and undirected graphs
- **Tree Structures**: General trees and binary trees with traversal algorithms
- **Isomorphism Detection**: Detect if two graphs are isomorphic
- **CLI Visualization**: Progress visualization using beautiful graph-themed spinners from cli-spinners

## Installation

```bash
cd graph-isomorphism
npm install
```

## Usage

### Graph Operations

```javascript
import { Graph } from './src/index.js';

// Create an undirected graph
const graph = new Graph(false);

// Add edges (vertices are added automatically)
graph.addEdge('A', 'B');
graph.addEdge('B', 'C');
graph.addEdge('C', 'A');

// Query the graph
console.log(graph.getVertexCount()); // 3
console.log(graph.getEdgeCount()); // 3
console.log(graph.getDegree('A')); // 2
console.log(graph.areAdjacent('A', 'B')); // true

// Get adjacency matrix
const matrix = graph.getAdjacencyMatrix();

// Get degree sequence
const degrees = graph.getDegreeSequence();
```

### Tree Operations

```javascript
import { Tree, TreeNode } from './src/index.js';

// Create a tree
const tree = new Tree('root');
const child1 = new TreeNode('child1');
const child2 = new TreeNode('child2');

tree.root.addChild(child1);
tree.root.addChild(child2);

// Tree statistics
console.log(tree.getHeight()); // 1
console.log(tree.countNodes()); // 3

// Traversals
tree.preOrder(tree.root, (node) => {
  console.log(node.value);
});

tree.levelOrder((node) => {
  console.log(node.value);
});

// Print tree structure
console.log(tree.toString());
```

### Isomorphism Detection

```javascript
import { Graph, detectIsomorphism, checkInvariants } from './src/index.js';

// Create two graphs
const g1 = new Graph();
g1.addEdge('A', 'B');
g1.addEdge('B', 'C');
g1.addEdge('C', 'A');

const g2 = new Graph();
g2.addEdge(1, 2);
g2.addEdge(2, 3);
g2.addEdge(3, 1);

// Check if they're isomorphic
const result = detectIsomorphism(g1, g2);

if (result.isIsomorphic) {
  console.log('Graphs are isomorphic!');
  console.log('Mapping:', result.mapping);
} else {
  console.log('Graphs are not isomorphic');
  console.log('Reason:', result.reason);
}
```

### With CLI Spinners

```javascript
import { detectIsomorphismOptimized } from './src/index.js';
import cliSpinners from 'cli-spinners';

const result = detectIsomorphismOptimized(g1, g2, {
  onProgress: (progress) => {
    console.log(`Checked ${progress.checked} permutations`);
  }
});
```

## Examples

Run the comprehensive demo:

```bash
npm run example
```

This will demonstrate:
- Graph creation and manipulation
- Isomorphism detection with progress visualization
- Different graph-themed spinners
- Tree structures and traversals

## New Graph-Themed Spinners

This project includes 8 new graph and tree-themed spinners added to cli-spinners:

1. **graphTraversal** - Visualizes nodes being visited in sequence
2. **treeGrowth** - Shows a tree growing from a seed
3. **graphNodes** - Nodes connecting to form a graph
4. **graphIsomorphism** - Graph transformation animation
5. **bfsTraversal** - Breadth-first search visualization
6. **dfsTraversal** - Depth-first search visualization
7. **treeStructure** - Tree building animation
8. **adjacencyMatrix** - Matrix filling animation

## Graph Isomorphism

Two graphs G₁ and G₂ are **isomorphic** if there exists a bijection f: V₁ → V₂ such that vertices u and v are adjacent in G₁ if and only if f(u) and f(v) are adjacent in G₂.

### Algorithm

The library implements two algorithms:

1. **Brute Force** (`detectIsomorphism`): Checks all possible vertex mappings. Suitable for small graphs (≤10 vertices).

2. **Optimized** (`detectIsomorphismOptimized`): Groups vertices by degree and only permutes within groups. Can handle slightly larger graphs (≤12 vertices).

### Invariant Checking

Before attempting full isomorphism detection, the library checks necessary conditions:
- Same number of vertices
- Same number of edges
- Same degree sequence

If these invariants don't match, the graphs cannot be isomorphic.

## API Reference

### Graph Class

- `constructor(isDirected = false)` - Create a new graph
- `addVertex(vertex)` - Add a vertex
- `addEdge(v1, v2)` - Add an edge
- `getNeighbors(vertex)` - Get adjacent vertices
- `getDegree(vertex)` - Get vertex degree
- `areAdjacent(v1, v2)` - Check if vertices are adjacent
- `getAdjacencyMatrix()` - Get matrix representation
- `getDegreeSequence()` - Get sorted degree sequence
- `getVertexCount()` - Get number of vertices
- `getEdgeCount()` - Get number of edges

### Tree Class

- `constructor(rootValue)` - Create a new tree
- `getHeight()` - Get tree height
- `preOrder(node, callback)` - Pre-order traversal
- `postOrder(node, callback)` - Post-order traversal
- `levelOrder(callback)` - Level-order traversal
- `find(value)` - Find node by value
- `countNodes()` - Count total nodes
- `getLeaves()` - Get all leaf nodes

### Isomorphism Functions

- `checkInvariants(g1, g2)` - Check necessary conditions
- `detectIsomorphism(g1, g2, options)` - Brute force detection
- `detectIsomorphismOptimized(g1, g2, options)` - Optimized detection

## Testing

```bash
npm test
```

## License

MIT

## Related

This project uses and extends [cli-spinners](https://github.com/sindresorhus/cli-spinners) with new graph-themed animations.
