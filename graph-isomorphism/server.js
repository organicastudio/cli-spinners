/**
 * HTTP API Server for Graph Algorithms
 *
 * RESTful API for executing graph algorithms remotely
 */

import http from 'http';
import { URL } from 'url';
import {
	Graph,
	WeightedGraph,
	dijkstra,
	prim,
	kruskal,
	bfs,
	dfs,
	findConnectedComponents,
	detectCycle,
	topologicalSort,
	detectIsomorphism
} from './src/index.js';

const PORT = process.env.PORT || 3000;

/**
 * Parse JSON body from request
 */
function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', chunk => body += chunk.toString());
		req.on('end', () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch (e) {
				reject(new Error('Invalid JSON'));
			}
		});
		req.on('error', reject);
	});
}

/**
 * Send JSON response
 */
function sendJSON(res, statusCode, data) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data, null, 2));
}

/**
 * Build graph from edge list
 */
function buildGraph(edges, directed = false, weighted = false) {
	const graph = weighted ? new WeightedGraph(directed) : new Graph(directed);

	for (const edge of edges) {
		if (weighted) {
			const [from, to, weight] = edge;
			graph.addEdge(from, to, weight);
		} else {
			const [from, to] = edge;
			graph.addEdge(from, to);
		}
	}

	return graph;
}

/**
 * API Routes
 */
const routes = {
	// Health check
	'GET /health': (req, res) => {
		sendJSON(res, 200, { status: 'ok', timestamp: Date.now() });
	},

	// Get available algorithms
	'GET /algorithms': (req, res) => {
		sendJSON(res, 200, {
			algorithms: [
				{ name: 'dijkstra', category: 'shortest-path', complexity: 'O((V+E) log V)' },
				{ name: 'prim', category: 'mst', complexity: 'O((V+E) log V)' },
				{ name: 'kruskal', category: 'mst', complexity: 'O(E log E)' },
				{ name: 'bfs', category: 'traversal', complexity: 'O(V+E)' },
				{ name: 'dfs', category: 'traversal', complexity: 'O(V+E)' },
				{ name: 'topological-sort', category: 'dag', complexity: 'O(V+E)' },
				{ name: 'connected-components', category: 'analysis', complexity: 'O(V+E)' },
				{ name: 'cycle-detection', category: 'analysis', complexity: 'O(V+E)' },
				{ name: 'isomorphism', category: 'analysis', complexity: 'O(n!)' }
			]
		});
	},

	// Dijkstra's shortest path
	'POST /dijkstra': async (req, res) => {
		try {
			const { edges, source } = await parseBody(req);
			const graph = buildGraph(edges, false, true);
			const result = dijkstra(graph, source);

			sendJSON(res, 200, {
				algorithm: 'dijkstra',
				source,
				distances: Object.fromEntries(result.distances),
				paths: Object.fromEntries(result.previous),
				steps: result.steps
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Prim's MST
	'POST /prim': async (req, res) => {
		try {
			const { edges, start } = await parseBody(req);
			const graph = buildGraph(edges, false, true);
			const result = prim(graph, start);

			sendJSON(res, 200, {
				algorithm: 'prim',
				mstEdges: result.mstEdges,
				totalWeight: result.totalWeight,
				steps: result.steps,
				isComplete: result.isComplete
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Kruskal's MST
	'POST /kruskal': async (req, res) => {
		try {
			const { edges } = await parseBody(req);
			const graph = buildGraph(edges, false, true);
			const result = kruskal(graph);

			sendJSON(res, 200, {
				algorithm: 'kruskal',
				mstEdges: result.mstEdges,
				totalWeight: result.totalWeight,
				steps: result.steps,
				isComplete: result.isComplete
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// BFS traversal
	'POST /bfs': async (req, res) => {
		try {
			const { edges, start, directed = false } = await parseBody(req);
			const graph = buildGraph(edges, directed, false);
			const result = bfs(graph, start);

			sendJSON(res, 200, {
				algorithm: 'bfs',
				order: result.order,
				distances: Object.fromEntries(result.distances),
				steps: result.steps
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// DFS traversal
	'POST /dfs': async (req, res) => {
		try {
			const { edges, start, directed = false } = await parseBody(req);
			const graph = buildGraph(edges, directed, false);
			const result = dfs(graph, start);

			sendJSON(res, 200, {
				algorithm: 'dfs',
				order: result.order,
				discoveryTime: Object.fromEntries(result.discoveryTime),
				finishTime: Object.fromEntries(result.finishTime),
				steps: result.steps
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Topological sort
	'POST /topological-sort': async (req, res) => {
		try {
			const { edges } = await parseBody(req);
			const graph = buildGraph(edges, true, false);
			const result = topologicalSort(graph);

			if (result.hasCycle) {
				sendJSON(res, 200, {
					algorithm: 'topological-sort',
					success: false,
					hasCycle: true,
					cycleEdge: result.cycleEdge
				});
			} else {
				sendJSON(res, 200, {
					algorithm: 'topological-sort',
					success: true,
					sorted: result.sorted,
					steps: result.steps
				});
			}
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Connected components
	'POST /connected-components': async (req, res) => {
		try {
			const { edges, directed = false } = await parseBody(req);
			const graph = buildGraph(edges, directed, false);
			const result = findConnectedComponents(graph);

			sendJSON(res, 200, {
				algorithm: 'connected-components',
				components: result.components,
				count: result.count,
				sizes: result.sizes,
				isConnected: result.isConnected
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Cycle detection
	'POST /cycle-detection': async (req, res) => {
		try {
			const { edges } = await parseBody(req);
			const graph = buildGraph(edges, true, false);
			const result = detectCycle(graph);

			sendJSON(res, 200, {
				algorithm: 'cycle-detection',
				hasCycle: result.hasCycle,
				cycleEdge: result.cycleEdge
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	},

	// Graph isomorphism
	'POST /isomorphism': async (req, res) => {
		try {
			const { edges1, edges2, directed = false } = await parseBody(req);
			const g1 = buildGraph(edges1, directed, false);
			const g2 = buildGraph(edges2, directed, false);
			const result = detectIsomorphism(g1, g2);

			sendJSON(res, 200, {
				algorithm: 'isomorphism',
				isIsomorphic: result.isIsomorphic,
				mapping: result.mapping,
				reason: result.reason,
				permutationsChecked: result.permutationsChecked
			});
		} catch (error) {
			sendJSON(res, 400, { error: error.message });
		}
	}
};

/**
 * Request handler
 */
function handleRequest(req, res) {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const routeKey = `${req.method} ${url.pathname}`;

	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// Handle OPTIONS (CORS preflight)
	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
		return;
	}

	// Route to handler
	const handler = routes[routeKey];
	if (handler) {
		handler(req, res);
	} else {
		sendJSON(res, 404, {
			error: 'Not found',
			availableRoutes: Object.keys(routes)
		});
	}
}

/**
 * Start server
 */
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
	console.log(`🚀 Graph Algorithms API Server`);
	console.log(`📡 Listening on http://0.0.0.0:${PORT}`);
	console.log(`💡 Try: curl http://localhost:${PORT}/health`);
	console.log(`📚 Algorithms: curl http://localhost:${PORT}/algorithms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	server.close(() => {
		console.log('HTTP server closed');
		process.exit(0);
	});
});
