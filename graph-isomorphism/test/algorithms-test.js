/**
 * Tests for advanced graph algorithms
 */

import {
	WeightedGraph,
	dijkstra,
	getPath,
	prim,
	formatMST
} from '../src/index.js';

const colors = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	reset: '\x1b[0m',
	bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function assert(condition, testName) {
	if (condition) {
		console.log(`${colors.green}✓${colors.reset} ${testName}`);
		passed++;
	} else {
		console.log(`${colors.red}✗${colors.reset} ${testName}`);
		failed++;
	}
}

function assertEquals(actual, expected, testName) {
	assert(actual === expected, testName);
}

console.log(`${colors.bold}Running algorithm tests...\n${colors.reset}`);

// ── Weighted Graph Tests ────────────────────────────────────
console.log('Weighted Graph Tests:');
{
	const g = new WeightedGraph();
	g.addEdge('A', 'B', 5);
	g.addEdge('B', 'C', 3);
	g.addEdge('A', 'C', 10);

	assertEquals(g.getVertexCount(), 3, 'Graph should have 3 vertices');
	assertEquals(g.getEdgeCount(), 3, 'Graph should have 3 edges');
	assertEquals(g.getEdgeWeight('A', 'B'), 5, 'A-B weight should be 5');
	assertEquals(g.getEdgeWeight('B', 'C'), 3, 'B-C weight should be 3');
	assert(g.getNeighbors('A').length === 2, 'A should have 2 neighbors');
}

// ── Dijkstra Tests ──────────────────────────────────────────
console.log('\nDijkstra Algorithm Tests:');
{
	// Create simple graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 1);
	g.addEdge('B', 'C', 2);
	g.addEdge('A', 'C', 4);
	g.addEdge('C', 'D', 1);
	g.addEdge('B', 'D', 5);

	const result = dijkstra(g, 'A');

	// Test distances
	assertEquals(result.distances.get('A'), 0, 'Distance A-A should be 0');
	assertEquals(result.distances.get('B'), 1, 'Distance A-B should be 1');
	assertEquals(result.distances.get('C'), 3, 'Distance A-C should be 3');
	assertEquals(result.distances.get('D'), 4, 'Distance A-D should be 4');

	// Test path
	const path = getPath(result.previous, 'A', 'D');
	assert(JSON.stringify(path) === JSON.stringify(['A', 'B', 'C', 'D']),
		'Path A-D should be A→B→C→D');
}

{
	// Test disconnected graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 1);
	g.addVertex('C'); // isolated vertex

	const result = dijkstra(g, 'A');
	assertEquals(result.distances.get('C'), Infinity, 'Distance to disconnected vertex should be ∞');

	const path = getPath(result.previous, 'A', 'C');
	assert(path === null, 'Path to disconnected vertex should be null');
}

{
	// Test single vertex
	const g = new WeightedGraph(false);
	g.addVertex('A');

	const result = dijkstra(g, 'A');
	assertEquals(result.distances.get('A'), 0, 'Distance to self should be 0');
}

// ── Prim Tests ──────────────────────────────────────────────
console.log('\nPrim MST Algorithm Tests:');
{
	// Create simple graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 2);
	g.addEdge('A', 'C', 3);
	g.addEdge('B', 'C', 1);
	g.addEdge('B', 'D', 4);
	g.addEdge('C', 'D', 5);

	const result = prim(g, 'A');
	const formatted = formatMST(result);

	assertEquals(formatted.edgeCount, 3, 'MST should have 3 edges for 4 vertices');
	assertEquals(formatted.totalWeight, 7, 'MST total weight should be 7 (2+1+4)');
	assert(formatted.isComplete, 'MST should be complete');
}

{
	// Test larger graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 4);
	g.addEdge('A', 'C', 2);
	g.addEdge('B', 'C', 1);
	g.addEdge('B', 'D', 5);
	g.addEdge('C', 'D', 8);
	g.addEdge('C', 'E', 10);
	g.addEdge('D', 'E', 2);

	const result = prim(g, 'A');
	const formatted = formatMST(result);

	assertEquals(formatted.edgeCount, 4, 'MST should have 4 edges for 5 vertices');
	assertEquals(formatted.totalWeight, 10, 'MST total weight should be 10 (2+1+5+2)');
	assert(formatted.isComplete, 'MST should be complete');
}

{
	// Test disconnected graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 1);
	g.addEdge('C', 'D', 1); // separate component

	const result = prim(g, 'A');
	const formatted = formatMST(result);

	assertEquals(formatted.edgeCount, 1, 'MST should have 1 edge (only in component with A)');
	assert(!formatted.isComplete, 'MST should be incomplete (disconnected)');
}

{
	// Test single edge
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 5);

	const result = prim(g, 'A');
	const formatted = formatMST(result);

	assertEquals(formatted.edgeCount, 1, 'MST should have 1 edge');
	assertEquals(formatted.totalWeight, 5, 'MST total weight should be 5');
	assert(formatted.isComplete, 'MST should be complete');
}

// ── Edge Cases ──────────────────────────────────────────────
console.log('\nEdge Case Tests:');
{
	// Empty graph
	const g = new WeightedGraph(false);
	const result = dijkstra(g, 'A');
	assert(result.distances.size === 0, 'Empty graph should have no distances');
}

{
	// Graph with self-loop
	const g = new WeightedGraph(false);
	g.addEdge('A', 'A', 1);
	g.addEdge('A', 'B', 2);

	const result = dijkstra(g, 'A');
	assertEquals(result.distances.get('B'), 2, 'Distance A-B should be 2');
}

{
	// Test with zero-weight edges
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 0);
	g.addEdge('B', 'C', 0);

	const result = dijkstra(g, 'A');
	assertEquals(result.distances.get('C'), 0, 'Distance with zero weights should be 0');
}

// ── Summary ─────────────────────────────────────────────────
console.log(`\n${colors.bold}Test Results:${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
	process.exit(1);
}
