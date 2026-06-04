/**
 * Dijkstra's Shortest Path Algorithm
 *
 * Finds the shortest path from a source vertex to all other vertices
 * in a weighted graph with non-negative edge weights.
 *
 * Time Complexity: O((V + E) log V) with priority queue
 * Space Complexity: O(V)
 */

class PriorityQueue {
	constructor() {
		this.items = [];
	}

	enqueue(vertex, priority) {
		this.items.push({ vertex, priority });
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
 * Run Dijkstra's algorithm
 * @param {WeightedGraph} graph - The weighted graph
 * @param {*} source - The source vertex
 * @param {Object} options - Options including onStep callback
 * @returns {Object} distances and previous vertices
 */
export function dijkstra(graph, source, options = {}) {
	const { onStep = null } = options;

	// Initialize
	const distances = new Map();
	const previous = new Map();
	const visited = new Set();
	const pq = new PriorityQueue();

	// Set all distances to infinity except source
	for (const vertex of graph.getVertices()) {
		distances.set(vertex, vertex === source ? 0 : Infinity);
		previous.set(vertex, null);
	}

	pq.enqueue(source, 0);
	let stepCount = 0;

	while (!pq.isEmpty()) {
		const { vertex: current } = pq.dequeue();

		if (visited.has(current)) continue;
		visited.add(current);

		// Callback for visualization
		if (onStep) {
			onStep({
				step: ++stepCount,
				current,
				distances: new Map(distances),
				visited: new Set(visited),
				previous: new Map(previous),
			});
		}

		// Check all neighbors
		const neighbors = graph.getNeighbors(current);
		for (const { vertex: neighbor, weight } of neighbors) {
			if (visited.has(neighbor)) continue;

			const newDist = distances.get(current) + weight;
			if (newDist < distances.get(neighbor)) {
				distances.set(neighbor, newDist);
				previous.set(neighbor, current);
				pq.enqueue(neighbor, newDist);
			}
		}
	}

	return { distances, previous, steps: stepCount };
}

/**
 * Get shortest path from source to target
 * @param {Map} previous - Previous vertices map from dijkstra()
 * @param {*} source - Source vertex
 * @param {*} target - Target vertex
 * @returns {Array} Path from source to target, or null if no path exists
 */
export function getPath(previous, source, target) {
	const path = [];
	let current = target;

	while (current !== null) {
		path.unshift(current);
		if (current === source) break;
		current = previous.get(current);
	}

	return path[0] === source ? path : null;
}

/**
 * Get all shortest paths from source
 * @param {Map} previous - Previous vertices map from dijkstra()
 * @param {*} source - Source vertex
 * @param {Array} vertices - All vertices
 * @returns {Map} Map of target -> path
 */
export function getAllPaths(previous, source, vertices) {
	const paths = new Map();

	for (const target of vertices) {
		if (target === source) {
			paths.set(target, [source]);
			continue;
		}

		const path = getPath(previous, source, target);
		if (path) {
			paths.set(target, path);
		}
	}

	return paths;
}

/**
 * Format results for display
 * @param {Object} result - Result from dijkstra()
 * @param {*} source - Source vertex
 * @returns {Array} Formatted results
 */
export function formatResults(result, source) {
	const { distances, previous } = result;
	const formatted = [];

	for (const [vertex, distance] of distances) {
		if (vertex === source) continue;

		const path = getPath(previous, source, vertex);
		formatted.push({
			target: vertex,
			distance: distance === Infinity ? '∞' : distance,
			path: path ? path.join(' → ') : 'No path',
		});
	}

	return formatted.sort((a, b) => {
		if (a.distance === '∞') return 1;
		if (b.distance === '∞') return -1;
		return a.distance - b.distance;
	});
}
