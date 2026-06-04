/**
 * Topological Sort Algorithms
 *
 * For Directed Acyclic Graphs (DAGs), produces a linear ordering
 * where for every edge u→v, u comes before v in the ordering.
 *
 * Applications: task scheduling, build systems, course prerequisites
 */

/**
 * Topological sort using DFS (Tarjan's algorithm)
 * @param {Graph} graph - Must be directed
 * @param {Object} options
 * @returns {Object} Sorted vertices or cycle detection
 */
export function topologicalSort(graph, options = {}) {
	const { onStep = null } = options;

	if (!graph.isDirected) {
		throw new Error('Topological sort requires a directed graph');
	}

	const vertices = graph.getVertices();
	const visited = new Set();
	const recStack = new Set();
	const sorted = [];
	let hasCycle = false;
	let cycleEdge = null;
	let steps = 0;

	function dfsVisit(vertex) {
		visited.add(vertex);
		recStack.add(vertex);
		steps++;

		if (onStep) {
			onStep({
				type: 'visit',
				vertex,
				visitedCount: visited.size,
				step: steps
			});
		}

		const neighbors = graph.getNeighbors(vertex);

		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				if (!dfsVisit(neighbor)) {
					return false; // Cycle detected in recursion
				}
			} else if (recStack.has(neighbor)) {
				// Back edge = cycle
				hasCycle = true;
				cycleEdge = { from: vertex, to: neighbor };

				if (onStep) {
					onStep({
						type: 'cycle',
						edge: cycleEdge,
						step: steps
					});
				}

				return false;
			}
		}

		recStack.delete(vertex);
		sorted.unshift(vertex); // Add to front of result

		if (onStep) {
			onStep({
				type: 'finish',
				vertex,
				position: sorted.length - 1,
				step: steps
			});
		}

		return true;
	}

	// Process all vertices
	for (const vertex of vertices) {
		if (!visited.has(vertex)) {
			if (!dfsVisit(vertex)) {
				break; // Stop if cycle found
			}
		}
	}

	return {
		sorted: hasCycle ? null : sorted,
		hasCycle,
		cycleEdge,
		steps,
		vertexCount: vertices.length,
		isDAG: !hasCycle
	};
}

/**
 * Topological sort using Kahn's algorithm (BFS-based)
 * @param {Graph} graph - Must be directed
 * @param {Object} options
 * @returns {Object} Sorted vertices or cycle detection
 */
export function topologicalSortKahn(graph, options = {}) {
	const { onStep = null } = options;

	if (!graph.isDirected) {
		throw new Error('Topological sort requires a directed graph');
	}

	const vertices = graph.getVertices();
	const inDegree = new Map();
	const sorted = [];
	const queue = [];
	let steps = 0;

	// Calculate in-degrees
	for (const v of vertices) {
		inDegree.set(v, 0);
	}

	for (const v of vertices) {
		for (const neighbor of graph.getNeighbors(v)) {
			inDegree.set(neighbor, inDegree.get(neighbor) + 1);
		}
	}

	// Find vertices with no incoming edges
	for (const v of vertices) {
		if (inDegree.get(v) === 0) {
			queue.push(v);
		}
	}

	// Process vertices
	while (queue.length > 0) {
		const current = queue.shift();
		sorted.push(current);
		steps++;

		if (onStep) {
			onStep({
				type: 'add',
				vertex: current,
				position: sorted.length - 1,
				queueSize: queue.length,
				step: steps
			});
		}

		// Reduce in-degree of neighbors
		for (const neighbor of graph.getNeighbors(current)) {
			const newDegree = inDegree.get(neighbor) - 1;
			inDegree.set(neighbor, newDegree);

			if (newDegree === 0) {
				queue.push(neighbor);
			}
		}
	}

	const hasCycle = sorted.length !== vertices.length;

	return {
		sorted: hasCycle ? null : sorted,
		hasCycle,
		cycleEdge: hasCycle ? { detected: true } : null,
		steps,
		vertexCount: vertices.length,
		isDAG: !hasCycle,
		algorithm: 'Kahn'
	};
}

/**
 * Find all valid topological orderings (for small DAGs only, O(n! * n))
 * WARNING: Exponential complexity - use only for graphs with <8 vertices
 */
export function allTopologicalSorts(graph) {
	if (!graph.isDirected) {
		throw new Error('Topological sort requires a directed graph');
	}

	const vertices = graph.getVertices();

	if (vertices.length > 7) {
		throw new Error('allTopologicalSorts is limited to graphs with ≤7 vertices (factorial complexity)');
	}

	const inDegree = new Map();
	const allSorts = [];

	// Calculate in-degrees
	for (const v of vertices) {
		inDegree.set(v, 0);
	}

	for (const v of vertices) {
		for (const neighbor of graph.getNeighbors(v)) {
			inDegree.set(neighbor, inDegree.get(neighbor) + 1);
		}
	}

	const visited = new Array(vertices.length).fill(false);
	const currentSort = [];

	function findAll(currentInDegree) {
		if (currentSort.length === vertices.length) {
			allSorts.push([...currentSort]);
			return;
		}

		// Try all vertices with in-degree 0
		for (let i = 0; i < vertices.length; i++) {
			const v = vertices[i];
			if (!visited[i] && currentInDegree.get(v) === 0) {
				// Choose this vertex
				visited[i] = true;
				currentSort.push(v);

				// Update in-degrees
				const neighbors = graph.getNeighbors(v);
				for (const neighbor of neighbors) {
					currentInDegree.set(neighbor, currentInDegree.get(neighbor) - 1);
				}

				// Recurse
				findAll(currentInDegree);

				// Backtrack
				currentSort.pop();
				visited[i] = false;
				for (const neighbor of neighbors) {
					currentInDegree.set(neighbor, currentInDegree.get(neighbor) + 1);
				}
			}
		}
	}

	findAll(new Map(inDegree));

	return {
		orderings: allSorts,
		count: allSorts.length
	};
}

/**
 * Format topological sort results
 */
export function formatTopologicalSort(result) {
	if (result.hasCycle) {
		return {
			success: false,
			error: 'Graph contains a cycle - not a DAG',
			cycleEdge: result.cycleEdge
		};
	}

	return {
		success: true,
		order: result.sorted.join(' → '),
		vertexCount: result.vertexCount,
		steps: result.steps,
		algorithm: result.algorithm || 'DFS'
	};
}
