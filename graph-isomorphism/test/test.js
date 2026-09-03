/**
 * Simple test suite for graph-isomorphism
 */

import { Graph, Tree, TreeNode, detectIsomorphism, checkInvariants } from '../src/index.js';

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

console.log(`${colors.bold}Running tests...\n${colors.reset}`);

// Graph tests
console.log('Graph Tests:');
{
	const g = new Graph();
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');

	assertEquals(g.getVertexCount(), 3, 'Graph should have 3 vertices');
	assertEquals(g.getEdgeCount(), 2, 'Graph should have 2 edges');
	assert(g.areAdjacent('A', 'B'), 'A and B should be adjacent');
	assert(g.areAdjacent('B', 'A'), 'B and A should be adjacent (undirected)');
	assert(!g.areAdjacent('A', 'C'), 'A and C should not be adjacent');
	assertEquals(g.getDegree('B'), 2, 'B should have degree 2');
}

// Tree tests
console.log('\nTree Tests:');
{
	const tree = new Tree('root');
	const child1 = new TreeNode('child1');
	const child2 = new TreeNode('child2');

	tree.root.addChild(child1);
	tree.root.addChild(child2);

	assertEquals(tree.countNodes(), 3, 'Tree should have 3 nodes');
	assertEquals(tree.getHeight(), 1, 'Tree height should be 1');
	assert(!tree.root.isLeaf(), 'Root should not be a leaf');
	assert(child1.isLeaf(), 'child1 should be a leaf');
}

// Isomorphism tests
console.log('\nIsomorphism Tests:');
{
	// Test 1: Identical triangles
	const g1 = new Graph();
	g1.addEdge('A', 'B');
	g1.addEdge('B', 'C');
	g1.addEdge('C', 'A');

	const g2 = new Graph();
	g2.addEdge(1, 2);
	g2.addEdge(2, 3);
	g2.addEdge(3, 1);

	const result1 = detectIsomorphism(g1, g2);
	assert(result1.isIsomorphic, 'Two triangles should be isomorphic');

	// Test 2: Different structures
	const g3 = new Graph();
	g3.addEdge('A', 'B');
	g3.addEdge('B', 'C');

	const g4 = new Graph();
	g4.addEdge(1, 2);
	g4.addEdge(2, 3);
	g4.addEdge(3, 1);

	const result2 = detectIsomorphism(g3, g4);
	assert(!result2.isIsomorphic, 'Path and triangle should not be isomorphic');

	// Test 3: Invariants check
	const invariants = checkInvariants(g1, g3);
	assert(!invariants.isomorphismPossible, 'Invariants should fail for graphs with different edge counts');
}

// Adjacency matrix tests
console.log('\nAdjacency Matrix Tests:');
{
	const g = new Graph();
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');

	const matrix = g.getAdjacencyMatrix();
	assertEquals(matrix.length, 3, 'Matrix should be 3x3');
	assertEquals(matrix[0][1], 1, 'Matrix[0][1] should be 1 (A-B edge)');
	assertEquals(matrix[1][0], 1, 'Matrix[1][0] should be 1 (undirected)');
}

// Degree sequence tests
console.log('\nDegree Sequence Tests:');
{
	const g = new Graph();
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'A');
	g.addEdge('A', 'D');

	const degSeq = g.getDegreeSequence();
	assert(JSON.stringify(degSeq) === JSON.stringify([3, 2, 2, 1]), 'Degree sequence should be [3, 2, 2, 1]');
}

console.log(`\n${colors.bold}Test Results:${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
	process.exit(1);
}
