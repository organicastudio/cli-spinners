/**
 * Kruskal's Minimum Spanning Tree Algorithm
 *
 * Finds the MST by sorting edges by weight and adding them
 * if they don't create a cycle (using Union-Find/Disjoint Set).
 *
 * Time: O(E log E) for sorting edges
 * Space: O(V) for Union-Find structure
 */

class UnionFind {
	constructor(vertices) {
		this.parent = new Map();
		this.rank = new Map();

		for (const v of vertices) {
			this.parent.set(v, v);
			this.rank.set(v, 0);
		}
	}

	find(x) {
		if (this.parent.get(x) !== x) {
			this.parent.set(x, this.find(this.parent.get(x))); // Path compression
		}
		return this.parent.get(x);
	}

	union(x, y) {
		const rootX = this.find(x);
		const rootY = this.find(y);

		if (rootX === rootY) {
			return false; // Already in same set
		}

		// Union by rank
		if (this.rank.get(rootX) < this.rank.get(rootY)) {
			this.parent.set(rootX, rootY);
		} else if (this.rank.get(rootX) > this.rank.get(rootY)) {
			this.parent.set(rootY, rootX);
		} else {
			this.parent.set(rootY, rootX);
			this.rank.set(rootX, this.rank.get(rootX) + 1);
		}

		return true;
	}
}

/**
 * Kruskal's algorithm for finding MST
 * @param {WeightedGraph} graph - Must be undirected
 * @param {Object} options - Optional callbacks
 * @returns {Object} MST edges, total weight, and statistics
 */
export function kruskal(graph, options = {}) {
	const { onStep = null } = options;

	if (graph.isDirected) {
		throw new Error('Kruskal\'s algorithm requires an undirected graph');
	}

	const vertices = graph.getVertices();
	const edges = graph.edges.slice();
	const mstEdges = [];
	let totalWeight = 0;
	let steps = 0;

	// Sort edges by weight (ascending)
	edges.sort((a, b) => a.weight - b.weight);

	// Initialize Union-Find
	const uf = new UnionFind(vertices);

	// Process edges in order
	for (const edge of edges) {
		steps++;

		if (onStep) {
			onStep({
				type: 'consider',
				edge,
				mstEdges: mstEdges.slice(),
				totalWeight,
				step: steps
			});
		}

		// Add edge if it doesn't create a cycle
		if (uf.union(edge.from, edge.to)) {
			mstEdges.push(edge);
			totalWeight += edge.weight;

			if (onStep) {
				onStep({
					type: 'add',
					edge,
					mstEdges: mstEdges.slice(),
					totalWeight,
					step: steps
				});
			}

			// Stop when we have V-1 edges (complete MST)
			if (mstEdges.length === vertices.length - 1) {
				break;
			}
		}
	}

	const isComplete = mstEdges.length === vertices.length - 1;

	return {
		mstEdges,
		totalWeight,
		steps,
		isComplete,
		algorithm: 'Kruskal'
	};
}

/**
 * Format Kruskal results for display
 */
export function formatKruskalMST(result) {
	const edges = result.mstEdges.map(e => ({
		edge: `${e.from} — ${e.to}`,
		weight: e.weight
	}));

	return {
		edges,
		edgeCount: result.mstEdges.length,
		totalWeight: result.totalWeight,
		isComplete: result.isComplete,
		algorithm: result.algorithm
	};
}

/**
 * Compare Prim and Kruskal results
 */
export function compareMSTAlgorithms(primResult, kruskalResult) {
	return {
		sameWeight: primResult.totalWeight === kruskalResult.totalWeight,
		primSteps: primResult.steps,
		kruskalSteps: kruskalResult.steps,
		primEdges: primResult.mstEdges.length,
		kruskalEdges: kruskalResult.mstEdges.length,
		bothComplete: primResult.isComplete && kruskalResult.isComplete
	};
}
