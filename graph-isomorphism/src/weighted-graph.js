/**
 * Weighted Graph Extension
 * Adds support for weighted edges to the base Graph class
 */

export class WeightedGraph {
	constructor(isDirected = false) {
		this.isDirected = isDirected;
		this.adjacencyList = new Map(); // vertex -> [{vertex, weight}]
		this.vertices = new Set();
		this.edges = []; // [{from, to, weight}]
	}

	/**
	 * Add a vertex to the graph
	 */
	addVertex(vertex) {
		if (!this.vertices.has(vertex)) {
			this.vertices.add(vertex);
			this.adjacencyList.set(vertex, []);
		}
	}

	/**
	 * Add a weighted edge
	 */
	addEdge(from, to, weight = 1) {
		this.addVertex(from);
		this.addVertex(to);

		this.adjacencyList.get(from).push({ vertex: to, weight });
		this.edges.push({ from, to, weight });

		if (!this.isDirected) {
			this.adjacencyList.get(to).push({ vertex: from, weight });
		}
	}

	/**
	 * Get neighbors with weights
	 */
	getNeighbors(vertex) {
		return this.adjacencyList.get(vertex) || [];
	}

	/**
	 * Get edge weight
	 */
	getEdgeWeight(from, to) {
		const neighbors = this.getNeighbors(from);
		const edge = neighbors.find(n => n.vertex === to);
		return edge ? edge.weight : Infinity;
	}

	/**
	 * Get all vertices as array
	 */
	getVertices() {
		return Array.from(this.vertices);
	}

	/**
	 * Get vertex count
	 */
	getVertexCount() {
		return this.vertices.size;
	}

	/**
	 * Get edge count
	 */
	getEdgeCount() {
		return this.isDirected ? this.edges.length : this.edges.length;
	}

	/**
	 * String representation
	 */
	toString() {
		let result = `Weighted Graph (${this.isDirected ? 'directed' : 'undirected'}):\n`;
		for (const [vertex, neighbors] of this.adjacencyList) {
			const neighborStr = neighbors.map(n => `${n.vertex}(${n.weight})`).join(', ');
			result += `  ${vertex} -> ${neighborStr}\n`;
		}
		return result;
	}
}
