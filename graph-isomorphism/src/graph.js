/**
 * Graph data structure implementation
 * Supports both directed and undirected graphs
 */
export class Graph {
	constructor(isDirected = false) {
		this.isDirected = isDirected;
		this.adjacencyList = new Map();
		this.vertices = new Set();
		this.edges = [];
	}

	/**
	 * Add a vertex to the graph
	 * @param {string|number} vertex - The vertex to add
	 */
	addVertex(vertex) {
		if (!this.vertices.has(vertex)) {
			this.vertices.add(vertex);
			this.adjacencyList.set(vertex, []);
		}
	}

	/**
	 * Add an edge between two vertices
	 * @param {string|number} v1 - First vertex
	 * @param {string|number} v2 - Second vertex
	 */
	addEdge(v1, v2) {
		// Ensure both vertices exist
		this.addVertex(v1);
		this.addVertex(v2);

		// Add edge
		this.adjacencyList.get(v1).push(v2);
		this.edges.push([v1, v2]);

		// If undirected, add reverse edge
		if (!this.isDirected) {
			this.adjacencyList.get(v2).push(v1);
		}
	}

	/**
	 * Get all neighbors of a vertex
	 * @param {string|number} vertex - The vertex
	 * @returns {Array} Array of adjacent vertices
	 */
	getNeighbors(vertex) {
		return this.adjacencyList.get(vertex) || [];
	}

	/**
	 * Get the degree of a vertex
	 * @param {string|number} vertex - The vertex
	 * @returns {number} The degree of the vertex
	 */
	getDegree(vertex) {
		return this.getNeighbors(vertex).length;
	}

	/**
	 * Check if two vertices are adjacent
	 * @param {string|number} v1 - First vertex
	 * @param {string|number} v2 - Second vertex
	 * @returns {boolean} True if vertices are adjacent
	 */
	areAdjacent(v1, v2) {
		return this.adjacencyList.get(v1)?.includes(v2) || false;
	}

	/**
	 * Get adjacency matrix representation
	 * @returns {Array<Array<number>>} The adjacency matrix
	 */
	getAdjacencyMatrix() {
		const vertexArray = Array.from(this.vertices);
		const n = vertexArray.length;
		const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (this.areAdjacent(vertexArray[i], vertexArray[j])) {
					matrix[i][j] = 1;
				}
			}
		}

		return matrix;
	}

	/**
	 * Get degree sequence (sorted list of vertex degrees)
	 * @returns {Array<number>} Sorted degree sequence
	 */
	getDegreeSequence() {
		const degrees = Array.from(this.vertices).map(v => this.getDegree(v));
		return degrees.sort((a, b) => b - a);
	}

	/**
	 * Get number of vertices
	 * @returns {number} Number of vertices
	 */
	getVertexCount() {
		return this.vertices.size;
	}

	/**
	 * Get number of edges
	 * @returns {number} Number of edges
	 */
	getEdgeCount() {
		return this.isDirected ? this.edges.length : this.edges.length;
	}

	/**
	 * Clone the graph
	 * @returns {Graph} A copy of the graph
	 */
	clone() {
		const newGraph = new Graph(this.isDirected);
		for (const vertex of this.vertices) {
			newGraph.addVertex(vertex);
		}
		for (const [v1, v2] of this.edges) {
			newGraph.addEdge(v1, v2);
		}
		return newGraph;
	}

	/**
	 * Print graph representation
	 * @returns {string} String representation of the graph
	 */
	toString() {
		let result = `Graph (${this.isDirected ? 'directed' : 'undirected'}):\n`;
		for (const [vertex, neighbors] of this.adjacencyList) {
			result += `  ${vertex} -> ${neighbors.join(', ')}\n`;
		}
		return result;
	}
}
