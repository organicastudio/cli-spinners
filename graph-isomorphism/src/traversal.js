/**
 * Graph Traversal Algorithms
 *
 * Implements BFS and DFS with various applications
 */

/**
 * Breadth-First Search traversal
 * @param {Graph} graph
 * @param {*} startVertex
 * @param {Object} options
 * @returns {Object} Traversal order, distances, and parent pointers
 */
export function bfs(graph, startVertex, options = {}) {
	const { onVisit = null, onStep = null } = options;

	if (!graph.adjacencyList.has(startVertex)) {
		throw new Error(`Start vertex ${startVertex} not in graph`);
	}

	const visited = new Set();
	const queue = [startVertex];
	const order = [];
	const distances = new Map();
	const previous = new Map();
	let steps = 0;

	visited.add(startVertex);
	distances.set(startVertex, 0);
	previous.set(startVertex, null);

	while (queue.length > 0) {
		const current = queue.shift();
		order.push(current);
		steps++;

		if (onVisit) {
			onVisit(current, distances.get(current));
		}

		const neighbors = graph.getNeighbors(current);

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				queue.push(neighbor);
				distances.set(neighbor, distances.get(current) + 1);
				previous.set(neighbor, current);

				if (onStep) {
					onStep({
						type: 'discover',
						vertex: neighbor,
						from: current,
						distance: distances.get(neighbor),
						queueSize: queue.length
					});
				}
			}
		}
	}

	return {
		order,
		visited,
		distances,
		previous,
		steps,
		algorithm: 'BFS'
	};
}

/**
 * Depth-First Search traversal
 * @param {Graph} graph
 * @param {*} startVertex
 * @param {Object} options
 * @returns {Object} Traversal order, discovery/finish times, and classification
 */
export function dfs(graph, startVertex, options = {}) {
	const { onVisit = null, onStep = null } = options;

	if (!graph.adjacencyList.has(startVertex)) {
		throw new Error(`Start vertex ${startVertex} not in graph`);
	}

	const visited = new Set();
	const order = [];
	const discoveryTime = new Map();
	const finishTime = new Map();
	const previous = new Map();
	let time = 0;
	let steps = 0;

	function dfsVisit(vertex) {
		visited.add(vertex);
		time++;
		discoveryTime.set(vertex, time);
		order.push(vertex);
		steps++;

		if (onVisit) {
			onVisit(vertex, 'discover', time);
		}

		const neighbors = graph.getNeighbors(vertex);

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				previous.set(neighbor, vertex);

				if (onStep) {
					onStep({
						type: 'tree-edge',
						from: vertex,
						to: neighbor,
						time
					});
				}

				dfsVisit(neighbor);
			} else if (!finishTime.has(neighbor)) {
				if (onStep) {
					onStep({
						type: 'back-edge',
						from: vertex,
						to: neighbor,
						time
					});
				}
			}
		}

		time++;
		finishTime.set(vertex, time);

		if (onVisit) {
			onVisit(vertex, 'finish', time);
		}
	}

	previous.set(startVertex, null);
	dfsVisit(startVertex);

	return {
		order,
		visited,
		discoveryTime,
		finishTime,
		previous,
		steps,
		algorithm: 'DFS'
	};
}

/**
 * Find connected components using BFS
 */
export function findConnectedComponents(graph) {
	const vertices = graph.getVertices();
	const visited = new Set();
	const components = [];

	for (const vertex of vertices) {
		if (!visited.has(vertex)) {
			const result = bfs(graph, vertex);
			components.push(Array.from(result.visited));

			for (const v of result.visited) {
				visited.add(v);
			}
		}
	}

	return {
		components,
		count: components.length,
		sizes: components.map(c => c.length),
		isConnected: components.length === 1
	};
}

/**
 * Detect cycle using DFS
 */
export function detectCycle(graph) {
	const vertices = graph.getVertices();
	const visited = new Set();
	const recStack = new Set();
	let hasCycle = false;
	let cycleEdge = null;

	function dfsVisit(vertex) {
		visited.add(vertex);
		recStack.add(vertex);

		const neighbors = graph.getNeighbors(vertex);

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				if (dfsVisit(neighbor)) {
					return true;
				}
			} else if (recStack.has(neighbor)) {
				// Found back edge = cycle
				hasCycle = true;
				cycleEdge = { from: vertex, to: neighbor };
				return true;
			}
		}

		recStack.delete(vertex);
		return false;
	}

	for (const vertex of vertices) {
		if (!visited.has(vertex)) {
			if (dfsVisit(vertex)) {
				break;
			}
		}
	}

	return {
		hasCycle,
		cycleEdge
	};
}

/**
 * Format traversal results
 */
export function formatTraversal(result) {
	return {
		algorithm: result.algorithm,
		visitOrder: result.order.join(' → '),
		verticesVisited: result.visited.size,
		steps: result.steps
	};
}
