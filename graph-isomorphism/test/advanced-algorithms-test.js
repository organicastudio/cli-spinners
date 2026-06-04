/**
 * Tests for Kruskal, Traversal, and Topological Sort algorithms
 */

import {
	Graph,
	WeightedGraph,
	kruskal,
	formatKruskalMST,
	compareMSTAlgorithms,
	bfs,
	dfs,
	findConnectedComponents,
	detectCycle,
	topologicalSort,
	topologicalSortKahn,
	allTopologicalSorts,
	formatTopologicalSort,
	prim
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

console.log(`${colors.bold}Running advanced algorithm tests...\n${colors.reset}`);

// ── Kruskal MST Tests ───────────────────────────────────────
console.log('Kruskal MST Tests:');
{
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 2);
	g.addEdge('A', 'C', 3);
	g.addEdge('B', 'C', 1);
	g.addEdge('B', 'D', 4);
	g.addEdge('C', 'D', 5);

	const result = kruskal(g);
	const formatted = formatKruskalMST(result);

	assertEquals(formatted.edgeCount, 3, 'MST should have 3 edges for 4 vertices');
	assertEquals(formatted.totalWeight, 7, 'MST total weight should be 7 (1+2+4)');
	assert(formatted.isComplete, 'MST should be complete');
}

{
	// Larger graph
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 4);
	g.addEdge('A', 'C', 2);
	g.addEdge('B', 'C', 1);
	g.addEdge('B', 'D', 5);
	g.addEdge('C', 'D', 8);
	g.addEdge('C', 'E', 10);
	g.addEdge('D', 'E', 2);

	const result = kruskal(g);
	const formatted = formatKruskalMST(result);

	assertEquals(formatted.edgeCount, 4, 'MST should have 4 edges for 5 vertices');
	assertEquals(formatted.totalWeight, 10, 'MST total weight should be 10 (1+2+5+2)');
}

{
	// Compare Prim vs Kruskal
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 3);
	g.addEdge('A', 'C', 1);
	g.addEdge('B', 'C', 2);
	g.addEdge('B', 'D', 4);

	const primResult = prim(g, 'A');
	const kruskalResult = kruskal(g);
	const comparison = compareMSTAlgorithms(primResult, kruskalResult);

	assert(comparison.sameWeight, 'Prim and Kruskal should produce same total weight');
	assert(comparison.bothComplete, 'Both algorithms should produce complete MST');
}

// ── BFS Tests ───────────────────────────────────────────────
console.log('\nBFS Traversal Tests:');
{
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('A', 'C');
	g.addEdge('B', 'D');
	g.addEdge('C', 'D');
	g.addEdge('D', 'E');

	const result = bfs(g, 'A');

	assertEquals(result.order[0], 'A', 'BFS should start with A');
	assertEquals(result.distances.get('A'), 0, 'Distance to start should be 0');
	assertEquals(result.distances.get('B'), 1, 'Distance A-B should be 1');
	assertEquals(result.distances.get('D'), 2, 'Distance A-D should be 2');
	assertEquals(result.distances.get('E'), 3, 'Distance A-E should be 3');
	assert(result.visited.size === 5, 'BFS should visit all 5 vertices');
}

{
	// Test path reconstruction
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'D');

	const result = bfs(g, 'A');

	// Reconstruct path A → D
	const path = [];
	let current = 'D';
	while (current !== null) {
		path.unshift(current);
		current = result.previous.get(current);
	}

	assert(JSON.stringify(path) === JSON.stringify(['A', 'B', 'C', 'D']),
		'BFS should find path A→B→C→D');
}

// ── DFS Tests ───────────────────────────────────────────────
console.log('\nDFS Traversal Tests:');
{
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('A', 'C');
	g.addEdge('B', 'D');
	g.addEdge('C', 'D');

	const result = dfs(g, 'A');

	assertEquals(result.order[0], 'A', 'DFS should start with A');
	assert(result.visited.size === 4, 'DFS should visit all 4 vertices');
	assert(result.discoveryTime.get('A') < result.finishTime.get('A'),
		'Discovery time should be before finish time');
}

{
	// Directed graph DFS
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('A', 'C');

	const result = dfs(g, 'A');

	assert(result.order.length === 3, 'DFS should visit 3 vertices');
	assertEquals(result.order[0], 'A', 'Should start with A');
}

// ── Connected Components Tests ──────────────────────────────
console.log('\nConnected Components Tests:');
{
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('D', 'E'); // Separate component

	const result = findConnectedComponents(g);

	assertEquals(result.count, 2, 'Graph should have 2 components');
	assert(result.sizes.includes(3), 'Should have component of size 3');
	assert(result.sizes.includes(2), 'Should have component of size 2');
	assert(!result.isConnected, 'Graph should not be connected');
}

{
	// Fully connected graph
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'A');

	const result = findConnectedComponents(g);

	assertEquals(result.count, 1, 'Graph should have 1 component');
	assert(result.isConnected, 'Graph should be connected');
}

// ── Cycle Detection Tests ───────────────────────────────────
console.log('\nCycle Detection Tests:');
{
	// Directed graph with cycle
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'A');

	const result = detectCycle(g);

	assert(result.hasCycle, 'Should detect cycle');
	assert(result.cycleEdge !== null, 'Should identify cycle edge');
}

{
	// DAG (no cycle)
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('A', 'C');

	const result = detectCycle(g);

	assert(!result.hasCycle, 'DAG should have no cycle');
	assert(result.cycleEdge === null, 'Should have no cycle edge');
}

// ── Topological Sort Tests ──────────────────────────────────
console.log('\nTopological Sort Tests:');
{
	// Simple DAG
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('A', 'C');
	g.addEdge('B', 'D');
	g.addEdge('C', 'D');

	const result = topologicalSort(g);
	const formatted = formatTopologicalSort(result);

	assert(formatted.success, 'Should successfully sort DAG');
	assert(!result.hasCycle, 'Should have no cycle');
	assert(result.sorted.length === 4, 'Should sort 4 vertices');

	// Check ordering constraint: A before B, A before C, B before D, C before D
	const order = result.sorted;
	assert(order.indexOf('A') < order.indexOf('B'), 'A should come before B');
	assert(order.indexOf('A') < order.indexOf('C'), 'A should come before C');
	assert(order.indexOf('B') < order.indexOf('D'), 'B should come before D');
	assert(order.indexOf('C') < order.indexOf('D'), 'C should come before D');
}

{
	// Kahn's algorithm
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('A', 'C');

	const result = topologicalSortKahn(g);
	const formatted = formatTopologicalSort(result);

	assert(formatted.success, 'Kahn should successfully sort DAG');
	assertEquals(formatted.algorithm, 'Kahn', 'Should use Kahn algorithm');

	const order = result.sorted;
	assert(order.indexOf('A') < order.indexOf('B'), 'A should come before B');
	assert(order.indexOf('B') < order.indexOf('C'), 'B should come before C');
}

{
	// Graph with cycle (should fail)
	const g = new Graph(true);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'A');

	const result = topologicalSort(g);
	const formatted = formatTopologicalSort(result);

	assert(!formatted.success, 'Should fail on cyclic graph');
	assert(result.hasCycle, 'Should detect cycle');
	assert(result.sorted === null, 'Should return null for cyclic graph');
}

{
	// All topological sorts (very small DAG to avoid memory issues)
	const g = new Graph(true);
	g.addEdge('A', 'B');

	const result = allTopologicalSorts(g);

	assertEquals(result.count, 1, 'Should have 1 valid ordering for linear DAG');
	assert(result.orderings.some(o => JSON.stringify(o) === JSON.stringify(['A', 'B'])),
		'Should include [A, B]');
}

// ── Edge Cases ──────────────────────────────────────────────
console.log('\nEdge Case Tests:');
{
	// Single vertex
	const g = new Graph(false);
	g.addVertex('A');

	const bfsResult = bfs(g, 'A');
	assertEquals(bfsResult.order.length, 1, 'BFS on single vertex should visit 1');

	const dfsResult = dfs(g, 'A');
	assertEquals(dfsResult.order.length, 1, 'DFS on single vertex should visit 1');
}

{
	// Disconnected graph for Kruskal
	const g = new WeightedGraph(false);
	g.addEdge('A', 'B', 1);
	g.addEdge('C', 'D', 1);

	const result = kruskal(g);

	assertEquals(result.mstEdges.length, 2, 'Should include both edges');
	assert(!result.isComplete, 'MST should be incomplete (disconnected)');
}

{
	// Empty DAG
	const g = new Graph(true);
	g.addVertex('A');

	const result = topologicalSort(g);

	assert(result.sorted.length === 1, 'Should sort single vertex');
	assert(!result.hasCycle, 'Single vertex has no cycle');
}

// ── Summary ─────────────────────────────────────────────────
console.log(`\n${colors.bold}Test Results:${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
	process.exit(1);
}
