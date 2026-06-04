/**
 * Prim's Minimum Spanning Tree Algorithm
 *
 * Finds a minimum spanning tree for a weighted undirected graph.
 * A spanning tree connects all vertices with minimum total edge weight.
 *
 * Time Complexity: O((V + E) log V) with priority queue
 * Space Complexity: O(V + E)
 */

class PriorityQueue {
	constructor() {
		this.items = [];
	}

	enqueue(item, priority) {
		this.items.push({ item, priority });
		this.items.sort((a, b) => a.priority - b.priority);
	}

	dequeue() {
		return this.items.shift();
	}

	isEmpty() {
		return this.items.length === 0;
	}
}

/**
 * Run Prim's algorithm
 * @param {WeightedGraph} graph - The weighted graph (must be undirected)
 * @param {*} startVertex - The starting vertex (optional, uses first vertex if not provided)
 * @param {Object} options - Options including onStep callback
 * @returns {Object} MST edges, total weight, and spanning tree
 */
export function prim(graph, startVertex = null, options = {}) {
	const { onStep = null } = options;

	if (graph.isDirected) {
		throw new Error('Prim\'s algorithm requires an undirected graph');
	}

	const vertices = graph.getVertices();
	if (vertices.length === 0) {
		return { mstEdges: [], totalWeight: 0, spanningTree: [] };
	}

	// Start from first vertex if not specified
	const start = startVertex || vertices[0];

	const mstEdges = [];
	const visited = new Set();
	const pq = new PriorityQueue();
	let totalWeight = 0;
	let stepCount = 0;

	// Start with the initial vertex
	visited.add(start);

	// Add all edges from start vertex to priority queue
	for (const { vertex, weight } of graph.getNeighbors(start)) {
		pq.enqueue({ from: start, to: vertex, weight }, weight);
	}

	// Main algorithm loop
	while (!pq.isEmpty() && visited.size < vertices.length) {
		const { item: edge } = pq.dequeue();
		const { from, to, weight } = edge;

		// Skip if vertex already in MST
		if (visited.has(to)) continue;

		// Add vertex to MST
		visited.add(to);
		mstEdges.push(edge);
		totalWeight += weight;

		// Callback for visualization
		if (onStep) {
			onStep({
				step: ++stepCount,
				currentEdge: edge,
				mstEdges: [...mstEdges],
				visited: new Set(visited),
				totalWeight,
			});
		}

		// Add all edges from newly added vertex
		for (const { vertex: neighbor, weight: edgeWeight } of graph.getNeighbors(to)) {
			if (!visited.has(neighbor)) {
				pq.enqueue({ from: to, to: neighbor, weight: edgeWeight }, edgeWeight);
			}
		}
	}

	// Build spanning tree adjacency list
	const spanningTree = new Map();
	for (const vertex of vertices) {
		spanningTree.set(vertex, []);
	}
	for (const { from, to, weight } of mstEdges) {
		spanningTree.get(from).push({ vertex: to, weight });
		spanningTree.get(to).push({ vertex: from, weight });
	}

	return {
		mstEdges,
		totalWeight,
		spanningTree,
		steps: stepCount,
		isComplete: visited.size === vertices.length,
	};
}

/**
 * Format MST results for display
 * @param {Object} result - Result from prim()
 * @returns {Object} Formatted results
 */
export function formatMST(result) {
	const { mstEdges, totalWeight, isComplete } = result;

	const edgeList = mstEdges.map(({ from, to, weight }) => ({
		edge: `${from} ↔ ${to}`,
		weight,
	}));

	return {
		edges: edgeList,
		edgeCount: mstEdges.length,
		totalWeight,
		isComplete,
		status: isComplete ? 'Complete MST' : 'Incomplete (disconnected graph)',
	};
}

/**
 * Visualize MST as ASCII tree
 * @param {Object} result - Result from prim()
 * @param {*} root - Root vertex for tree visualization
 * @returns {string} ASCII tree representation
 */
export function visualizeMST(result, root = null) {
	const { spanningTree, mstEdges } = result;
	if (mstEdges.length === 0) return 'Empty MST';

	// Use first vertex as root if not specified
	const startVertex = root || mstEdges[0].from;

	const lines = [];
	const visited = new Set();

	function buildTree(vertex, prefix = '', isLast = true) {
		visited.add(vertex);
		const connector = isLast ? '└── ' : '├── ';
		lines.push(prefix + connector + vertex);

		const neighbors = spanningTree.get(vertex) || [];
		const unvisited = neighbors
			.filter(n => !visited.has(n.vertex))
			.sort((a, b) => a.weight - b.weight);

		unvisited.forEach((neighbor, index) => {
			const isLastChild = index === unvisited.length - 1;
			const extension = isLast ? '    ' : '│   ';
			const weightLabel = ` (${neighbor.weight})`;
			lines.push(prefix + extension + (isLastChild ? '└' : '├') + '─' + weightLabel);
			buildTree(neighbor.vertex, prefix + extension, isLastChild);
		});
	}

	lines.push(startVertex + ' (root)');
	const neighbors = spanningTree.get(startVertex) || [];
	neighbors
		.filter(n => !visited.has(n.vertex))
		.sort((a, b) => a.weight - b.weight)
		.forEach((neighbor, index) => {
			const isLastChild = index === neighbors.length - 1;
			const weightLabel = ` (${neighbor.weight})`;
			lines.push((isLastChild ? '└' : '├') + '─' + weightLabel);
			buildTree(neighbor.vertex, isLastChild ? '    ' : '│   ', isLastChild);
		});

	return lines.join('\n');
}
