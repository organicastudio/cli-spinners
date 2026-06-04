/**
 * Complete Graph Algorithms Suite Demo
 *
 * Demonstrates all implemented algorithms:
 * 1. Kruskal's MST vs Prim's MST
 * 2. BFS & DFS Traversal
 * 3. Connected Components
 * 4. Cycle Detection
 * 5. Topological Sort (DFS & Kahn)
 *
 * With beautiful CLI spinner visualizations
 */

import {
	Graph,
	WeightedGraph,
	kruskal,
	formatKruskalMST,
	compareMSTAlgorithms,
	bfs,
	dfs,
	formatTraversal,
	findConnectedComponents,
	detectCycle,
	topologicalSort,
	topologicalSortKahn,
	formatTopologicalSort,
	prim
} from '../src/index.js';
import cliSpinners from 'cli-spinners';
import { writeFileSync } from 'fs';

const C = {
	reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
	red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
	blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
	bgBlue: '\x1b[44m', bgGreen: '\x1b[42m', bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m', bgYellow: '\x1b[43m',
};

class Spinner {
	constructor(name, text) {
		this.sp = cliSpinners[name];
		this.text = text;
		this.i = 0;
		this.tid = null;
	}
	start() {
		this.tid = setInterval(() => {
			process.stdout.write(`\r${this.sp.frames[this.i]} ${this.text}`);
			this.i = (this.i + 1) % this.sp.frames.length;
		}, this.sp.interval);
	}
	stop(sym = '✓', msg = null) {
		clearInterval(this.tid);
		process.stdout.write(`\r${sym} ${msg ?? this.text}\n`);
	}
}

const wait = ms => new Promise(r => setTimeout(r, ms));

/**
 * Demo 1: Kruskal vs Prim MST Comparison
 */
async function demoMSTComparison() {
	console.log(`\n${C.bgCyan}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgCyan}${C.bold}  MST ALGORITHM COMPARISON  —  Kruskal vs Prim                         ${C.reset}`);
	console.log(`${C.bgCyan}${C.bold}                                                                      ${C.reset}\n`);

	const graph = new WeightedGraph(false);
	graph.addEdge('A', 'B', 4);
	graph.addEdge('A', 'C', 2);
	graph.addEdge('B', 'C', 1);
	graph.addEdge('B', 'D', 5);
	graph.addEdge('C', 'D', 8);
	graph.addEdge('C', 'E', 10);
	graph.addEdge('D', 'E', 2);
	graph.addEdge('D', 'F', 6);
	graph.addEdge('E', 'F', 3);

	console.log(`${C.cyan}${C.bold}Network Graph:${C.reset}`);
	console.log(graph.toString());

	// Run Prim's
	console.log(`${C.yellow}${C.bold}Running Prim's algorithm...${C.reset}`);
	const spinner1 = new Spinner('primMST', 'Building MST from vertex A...');
	spinner1.start();
	await wait(1500);

	const primResult = prim(graph, 'A');
	spinner1.stop('✓', `Prim complete (${primResult.steps} steps)`);

	// Run Kruskal's
	console.log(`${C.yellow}${C.bold}Running Kruskal's algorithm...${C.reset}`);
	const spinner2 = new Spinner('kruskalMST', 'Sorting edges and building MST...');
	spinner2.start();
	await wait(1500);

	const kruskalResult = kruskal(graph);
	spinner2.stop('✓', `Kruskal complete (${kruskalResult.steps} steps)`);

	// Compare results
	const comparison = compareMSTAlgorithms(primResult, kruskalResult);

	console.log(`\n${C.green}${C.bold}Comparison Results:${C.reset}`);
	console.log(`${'─'.repeat(60)}`);
	console.log(`${'Metric'.padEnd(30)} ${'Prim'.padEnd(15)} ${'Kruskal'}`);
	console.log(`${'─'.repeat(60)}`);
	console.log(`${'Total Weight'.padEnd(30)} ${String(primResult.totalWeight).padEnd(15)} ${kruskalResult.totalWeight}`);
	console.log(`${'Edges in MST'.padEnd(30)} ${String(primResult.mstEdges.length).padEnd(15)} ${kruskalResult.mstEdges.length}`);
	console.log(`${'Algorithm Steps'.padEnd(30)} ${String(primResult.steps).padEnd(15)} ${kruskalResult.steps}`);
	console.log(`${'Same Result?'.padEnd(30)} ${comparison.sameWeight ? C.green + '✓ Yes' : C.red + '✗ No'}${C.reset}`);
	console.log(`${'─'.repeat(60)}`);

	console.log(`\n${C.dim}Both algorithms find the minimum spanning tree but use different approaches:${C.reset}`);
	console.log(`  ${C.cyan}Prim:${C.reset}    Grows MST from a starting vertex (vertex-centric)`);
	console.log(`  ${C.magenta}Kruskal:${C.reset} Sorts all edges and adds them if no cycle (edge-centric)`);
}

/**
 * Demo 2: BFS & DFS Traversal
 */
async function demoTraversal() {
	console.log(`\n${C.bgBlue}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgBlue}${C.bold}  GRAPH TRAVERSAL  —  BFS & DFS Comparison                             ${C.reset}`);
	console.log(`${C.bgBlue}${C.bold}                                                                      ${C.reset}\n`);

	const graph = new Graph(false);
	graph.addEdge('A', 'B');
	graph.addEdge('A', 'C');
	graph.addEdge('B', 'D');
	graph.addEdge('B', 'E');
	graph.addEdge('C', 'F');
	graph.addEdge('C', 'G');
	graph.addEdge('D', 'H');

	console.log(`${C.cyan}${C.bold}Graph Structure:${C.reset}`);
	console.log(graph.toString());

	// Run BFS
	console.log(`${C.yellow}${C.bold}Running Breadth-First Search from A...${C.reset}`);
	const spinner1 = new Spinner('bfsTraversal', 'Traversing level by level...');
	spinner1.start();

	const bfsResult = bfs(graph, 'A', {
		onStep: () => {}
	});

	await wait(1200);
	spinner1.stop('✓', 'BFS complete');

	const bfsFormatted = formatTraversal(bfsResult);
	console.log(`  ${C.green}Order:${C.reset} ${bfsFormatted.visitOrder}`);
	console.log(`  ${C.green}Distances from A:${C.reset}`);
	for (const [vertex, distance] of bfsResult.distances) {
		console.log(`    ${vertex}: ${distance}`);
	}

	// Run DFS
	console.log(`\n${C.yellow}${C.bold}Running Depth-First Search from A...${C.reset}`);
	const spinner2 = new Spinner('dfsTraversal', 'Traversing depth-first...');
	spinner2.start();

	const dfsResult = dfs(graph, 'A', {
		onStep: () => {}
	});

	await wait(1200);
	spinner2.stop('✓', 'DFS complete');

	const dfsFormatted = formatTraversal(dfsResult);
	console.log(`  ${C.green}Order:${C.reset} ${dfsFormatted.visitOrder}`);
	console.log(`  ${C.green}Discovery times:${C.reset}`);
	for (const [vertex, time] of dfsResult.discoveryTime) {
		console.log(`    ${vertex}: ${time} (finished: ${dfsResult.finishTime.get(vertex)})`);
	}

	console.log(`\n${C.dim}Key Differences:${C.reset}`);
	console.log(`  ${C.cyan}BFS:${C.reset} Explores all neighbors before going deeper (uses queue)`);
	console.log(`  ${C.magenta}DFS:${C.reset} Explores as deep as possible before backtracking (uses stack)`);
}

/**
 * Demo 3: Connected Components
 */
async function demoConnectedComponents() {
	console.log(`\n${C.bgGreen}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgGreen}${C.bold}  CONNECTED COMPONENTS  —  Finding Graph Components                    ${C.reset}`);
	console.log(`${C.bgGreen}${C.bold}                                                                      ${C.reset}\n`);

	const graph = new Graph(false);
	// Component 1
	graph.addEdge('A', 'B');
	graph.addEdge('B', 'C');
	graph.addEdge('C', 'A');
	// Component 2
	graph.addEdge('D', 'E');
	graph.addEdge('E', 'F');
	// Component 3 (isolated)
	graph.addVertex('G');

	console.log(`${C.cyan}${C.bold}Graph with Multiple Components:${C.reset}`);
	console.log(graph.toString());

	const spinner = new Spinner('graphNodes', 'Finding connected components...');
	spinner.start();
	await wait(1000);

	const result = findConnectedComponents(graph);
	spinner.stop('✓', `Found ${result.count} components`);

	console.log(`\n${C.green}${C.bold}Components:${C.reset}`);
	for (let i = 0; i < result.components.length; i++) {
		const color = i === 0 ? C.cyan : i === 1 ? C.magenta : C.yellow;
		console.log(`  ${color}Component ${i + 1}:${C.reset} {${result.components[i].join(', ')}} (size: ${result.sizes[i]})`);
	}

	console.log(`\n${C.dim}Graph is ${result.isConnected ? 'connected' : 'disconnected'}${C.reset}`);
}

/**
 * Demo 4: Cycle Detection
 */
async function demoCycleDetection() {
	console.log(`\n${C.bgMagenta}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgMagenta}${C.bold}  CYCLE DETECTION  —  Finding Cycles in Directed Graphs               ${C.reset}`);
	console.log(`${C.bgMagenta}${C.bold}                                                                      ${C.reset}\n`);

	// Graph with cycle
	const g1 = new Graph(true);
	g1.addEdge('A', 'B');
	g1.addEdge('B', 'C');
	g1.addEdge('C', 'D');
	g1.addEdge('D', 'B'); // Creates cycle: B → C → D → B

	console.log(`${C.cyan}${C.bold}Graph 1 (With Cycle):${C.reset}`);
	console.log(g1.toString());

	const spinner1 = new Spinner('dfsTraversal', 'Detecting cycles...');
	spinner1.start();
	await wait(800);

	const result1 = detectCycle(g1);
	spinner1.stop(result1.hasCycle ? '⚠' : '✓', result1.hasCycle ? 'Cycle detected' : 'No cycle');

	if (result1.hasCycle) {
		console.log(`  ${C.red}Cycle edge:${C.reset} ${result1.cycleEdge.from} → ${result1.cycleEdge.to}\n`);
	}

	// DAG (no cycle)
	const g2 = new Graph(true);
	g2.addEdge('A', 'B');
	g2.addEdge('A', 'C');
	g2.addEdge('B', 'D');
	g2.addEdge('C', 'D');

	console.log(`${C.cyan}${C.bold}Graph 2 (DAG - No Cycle):${C.reset}`);
	console.log(g2.toString());

	const spinner2 = new Spinner('dfsTraversal', 'Detecting cycles...');
	spinner2.start();
	await wait(800);

	const result2 = detectCycle(g2);
	spinner2.stop(result2.hasCycle ? '⚠' : '✓', result2.hasCycle ? 'Cycle detected' : 'No cycle - is a DAG');

	console.log(`  ${C.green}Graph is acyclic${C.reset} (can be topologically sorted)`);
}

/**
 * Demo 5: Topological Sort
 */
async function demoTopologicalSort() {
	console.log(`\n${C.bgYellow}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgYellow}${C.bold}  TOPOLOGICAL SORT  —  Ordering DAG Vertices                           ${C.reset}`);
	console.log(`${C.bgYellow}${C.bold}                                                                      ${C.reset}\n`);

	// Course prerequisites DAG
	const graph = new Graph(true);
	graph.addEdge('Intro CS', 'Data Structures');
	graph.addEdge('Intro CS', 'Algorithms');
	graph.addEdge('Data Structures', 'Advanced Algorithms');
	graph.addEdge('Algorithms', 'Advanced Algorithms');
	graph.addEdge('Data Structures', 'Databases');
	graph.addEdge('Algorithms', 'Machine Learning');
	graph.addEdge('Advanced Algorithms', 'Machine Learning');

	console.log(`${C.cyan}${C.bold}Course Prerequisite Graph:${C.reset}`);
	console.log(graph.toString());

	// DFS-based topological sort
	console.log(`${C.yellow}${C.bold}Method 1: DFS-based (Tarjan's algorithm)${C.reset}`);
	const spinner1 = new Spinner('topologicalSort', 'Computing topological order...');
	spinner1.start();
	await wait(1200);

	const result1 = topologicalSort(graph);
	const formatted1 = formatTopologicalSort(result1);
	spinner1.stop('✓', 'DFS-based sort complete');

	console.log(`  ${C.green}Order:${C.reset} ${formatted1.order}`);

	// Kahn's algorithm
	console.log(`\n${C.yellow}${C.bold}Method 2: Kahn's algorithm (BFS-based)${C.reset}`);
	const spinner2 = new Spinner('topologicalSort', 'Computing topological order...');
	spinner2.start();
	await wait(1200);

	const result2 = topologicalSortKahn(graph);
	const formatted2 = formatTopologicalSort(result2);
	spinner2.stop('✓', 'Kahn\'s algorithm complete');

	console.log(`  ${C.green}Order:${C.reset} ${formatted2.order}`);

	console.log(`\n${C.dim}Use Cases: Build systems, task scheduling, course planning${C.reset}`);
}

/**
 * Algorithm Summary Table
 */
async function showAlgorithmSummary() {
	console.log(`\n${C.bold}${C.magenta}${'═'.repeat(80)}${C.reset}`);
	console.log(`${C.bold}${C.magenta}  COMPLETE ALGORITHM SUITE SUMMARY${C.reset}`);
	console.log(`${C.bold}${C.magenta}${'═'.repeat(80)}${C.reset}\n`);

	const algorithms = [
		{
			name: 'Dijkstra',
			category: 'Shortest Path',
			time: 'O((V+E) log V)',
			space: 'O(V)',
			useCase: 'GPS navigation, network routing'
		},
		{
			name: 'Prim',
			category: 'MST',
			time: 'O((V+E) log V)',
			space: 'O(V+E)',
			useCase: 'Network design (vertex-centric)'
		},
		{
			name: 'Kruskal',
			category: 'MST',
			time: 'O(E log E)',
			space: 'O(V)',
			useCase: 'Network design (edge-centric)'
		},
		{
			name: 'BFS',
			category: 'Traversal',
			time: 'O(V+E)',
			space: 'O(V)',
			useCase: 'Shortest path (unweighted), level-order'
		},
		{
			name: 'DFS',
			category: 'Traversal',
			time: 'O(V+E)',
			space: 'O(V)',
			useCase: 'Cycle detection, topological sort'
		},
		{
			name: 'Topological Sort',
			category: 'DAG',
			time: 'O(V+E)',
			space: 'O(V)',
			useCase: 'Task scheduling, build systems'
		},
	];

	console.log(`${'Algorithm'.padEnd(20)} ${'Category'.padEnd(15)} ${'Time'.padEnd(18)} ${'Space'.padEnd(10)} ${'Use Case'}`);
	console.log(`${'─'.repeat(80)}`);

	for (const algo of algorithms) {
		const catColor = algo.category === 'MST' ? C.green : algo.category === 'Traversal' ? C.cyan : algo.category === 'DAG' ? C.yellow : C.blue;
		console.log(
			`${algo.name.padEnd(20)} ${catColor}${algo.category.padEnd(15)}${C.reset} ${C.yellow}${algo.time.padEnd(18)}${C.reset} ${C.dim}${algo.space.padEnd(10)}${C.reset} ${algo.useCase}`
		);
	}

	console.log(`\n${C.dim}Total: 6 core algorithms + Graph Isomorphism + Tree structures${C.reset}`);
}

/**
 * Main
 */
async function main() {
	console.log(`\n${C.bold}${C.blue}╔════════════════════════════════════════════════════════════════════════╗${C.reset}`);
	console.log(`${C.bold}${C.blue}║     COMPLETE GRAPH ALGORITHMS SUITE  —  Interactive Demonstration     ║${C.reset}`);
	console.log(`${C.bold}${C.blue}╚════════════════════════════════════════════════════════════════════════╝${C.reset}`);

	await demoMSTComparison();
	await wait(800);

	await demoTraversal();
	await wait(800);

	await demoConnectedComponents();
	await wait(800);

	await demoCycleDetection();
	await wait(800);

	await demoTopologicalSort();
	await wait(800);

	await showAlgorithmSummary();

	console.log(`${C.bold}${C.green}\n✓ All algorithm demonstrations complete!${C.reset}\n`);
}

main().catch(console.error);
