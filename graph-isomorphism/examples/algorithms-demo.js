/**
 * Advanced Graph Algorithms Demo
 *
 * Demonstrates:
 * 1. Dijkstra's Shortest Path Algorithm
 * 2. Prim's Minimum Spanning Tree Algorithm
 *
 * With beautiful CLI spinner visualizations
 */

import {
	WeightedGraph,
	dijkstra,
	getPath,
	getAllPaths,
	formatDijkstraResults,
	prim,
	formatMST,
	visualizeMST
} from '../src/index.js';
import cliSpinners from 'cli-spinners';
import { writeFileSync } from 'fs';

const C = {
	reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
	red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
	blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
	bgBlue: '\x1b[44m', bgGreen: '\x1b[42m',
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
 * Create example city graph for shortest path
 */
function createCityGraph() {
	const graph = new WeightedGraph(false);

	// Cities and distances
	const cities = {
		'NYC': [['Boston', 215], ['Philadelphia', 95], ['Washington', 225]],
		'Boston': [['NYC', 215], ['Albany', 170]],
		'Philadelphia': [['NYC', 95], ['Washington', 140], ['Pittsburgh', 305]],
		'Washington': [['NYC', 225], ['Philadelphia', 140], ['Richmond', 110]],
		'Albany': [['Boston', 170], ['Buffalo', 290]],
		'Pittsburgh': [['Philadelphia', 305], ['Buffalo', 220], ['Cleveland', 135]],
		'Buffalo': [['Albany', 290], ['Pittsburgh', 220], ['Cleveland', 190]],
		'Cleveland': [['Pittsburgh', 135], ['Buffalo', 190], ['Detroit', 170]],
		'Richmond': [['Washington', 110]],
		'Detroit': [['Cleveland', 170]],
	};

	for (const [city, connections] of Object.entries(cities)) {
		for (const [neighbor, distance] of connections) {
			if (!graph.adjacencyList.has(city) || !graph.adjacencyList.get(city).some(e => e.vertex === neighbor)) {
				graph.addEdge(city, neighbor, distance);
			}
		}
	}

	return graph;
}

/**
 * Create example network graph for MST
 */
function createNetworkGraph() {
	const graph = new WeightedGraph(false);

	// Network nodes and connection costs
	const connections = [
		['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 7],
		['B', 'C', 1], ['B', 'E', 5],
		['C', 'D', 3], ['C', 'E', 8],
		['D', 'E', 6], ['D', 'F', 4],
		['E', 'F', 2], ['E', 'G', 3],
		['F', 'G', 5]
	];

	for (const [from, to, weight] of connections) {
		graph.addEdge(from, to, weight);
	}

	return graph;
}

/**
 * Demo 1: Dijkstra's Shortest Path
 */
async function demoDijkstra() {
	console.log(`\n${C.bgBlue}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgBlue}${C.bold}  DIJKSTRA'S SHORTEST PATH  —  Interstate Travel Route Planner        ${C.reset}`);
	console.log(`${C.bgBlue}${C.bold}                                                                      ${C.reset}\n`);

	const spinner = new Spinner('dijkstraPath', 'Building city network...');
	spinner.start();
	await wait(1200);

	const graph = createCityGraph();
	spinner.stop('✓', 'City network built');

	console.log(`\n${C.cyan}${C.bold}City Graph:${C.reset}`);
	console.log(graph.toString());

	// Run Dijkstra from NYC
	const source = 'NYC';
	console.log(`\n${C.yellow}${C.bold}Finding shortest paths from ${source}...${C.reset}\n`);

	const spinner2 = new Spinner('dijkstraPath', 'Running Dijkstra\'s algorithm...');
	spinner2.start();

	let stepCount = 0;
	const result = dijkstra(graph, source, {
		onStep: (step) => {
			stepCount++;
			if (stepCount % 3 === 0) {
				spinner2.sp.frames[spinner2.i % spinner2.sp.frames.length];
			}
		}
	});

	await wait(1800);
	spinner2.stop('✓', `Algorithm complete (${result.steps} steps)`);

	// Display results
	console.log(`\n${C.green}${C.bold}Shortest Paths from ${source}:${C.reset}`);
	console.log(`${'─'.repeat(60)}`);
	console.log(`${'Destination'.padEnd(20)} ${'Distance'.padEnd(12)} ${'Path'}`);
	console.log(`${'─'.repeat(60)}`);

	const formatted = formatDijkstraResults(result, source);
	for (const { target, distance, path } of formatted) {
		const distColor = distance === '∞' ? C.red : distance < 200 ? C.green : distance < 300 ? C.yellow : C.magenta;
		console.log(`${target.padEnd(20)} ${distColor}${String(distance).padEnd(12)}${C.reset} ${C.dim}${path}${C.reset}`);
	}

	// Highlight specific path
	const target = 'Detroit';
	const path = getPath(result.previous, source, target);
	const distance = result.distances.get(target);

	console.log(`\n${C.cyan}${C.bold}Optimal Route: ${source} → ${target}${C.reset}`);
	console.log(`  ${C.green}Path:${C.reset}     ${path.join(' → ')}`);
	console.log(`  ${C.green}Distance:${C.reset} ${distance} miles`);
	console.log(`  ${C.green}Stops:${C.reset}    ${path.length - 1} intermediate cities`);

	// Export to CSV
	const csvRows = formatted.map(r => `"${r.target}","${r.distance}","${r.path}"`);
	writeFileSync('./dijkstra-results.csv', ['Target,Distance,Path', ...csvRows].join('\n'));
	console.log(`\n${C.dim}Results exported to ./dijkstra-results.csv${C.reset}`);
}

/**
 * Demo 2: Prim's Minimum Spanning Tree
 */
async function demoPrim() {
	console.log(`\n${C.bgGreen}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgGreen}${C.bold}  PRIM'S MST  —  Minimum Cost Network Infrastructure                  ${C.reset}`);
	console.log(`${C.bgGreen}${C.bold}                                                                      ${C.reset}\n`);

	const spinner = new Spinner('graphNodes', 'Building network topology...');
	spinner.start();
	await wait(1200);

	const graph = createNetworkGraph();
	spinner.stop('✓', 'Network topology built');

	console.log(`\n${C.cyan}${C.bold}Network Graph:${C.reset}`);
	console.log(graph.toString());

	const totalEdges = graph.edges.reduce((sum, e) => sum + e.weight, 0);
	console.log(`\n${C.dim}Total cost if all edges used: ${totalEdges}${C.reset}`);

	// Run Prim's algorithm
	console.log(`\n${C.yellow}${C.bold}Finding Minimum Spanning Tree...${C.reset}\n`);

	const spinner2 = new Spinner('primMST', 'Running Prim\'s algorithm...');
	spinner2.start();

	let stepCount = 0;
	const result = prim(graph, 'A', {
		onStep: (step) => {
			stepCount++;
		}
	});

	await wait(2000);
	spinner2.stop('✓', `MST found (${result.steps} steps)`);

	// Display results
	const formatted = formatMST(result);

	console.log(`\n${C.green}${C.bold}Minimum Spanning Tree:${C.reset}`);
	console.log(`${'─'.repeat(50)}`);
	console.log(`${'Edge'.padEnd(20)} ${'Weight'}`);
	console.log(`${'─'.repeat(50)}`);

	for (const { edge, weight } of formatted.edges) {
		const color = weight <= 2 ? C.green : weight <= 4 ? C.yellow : C.magenta;
		console.log(`${edge.padEnd(20)} ${color}${weight}${C.reset}`);
	}

	console.log(`${'─'.repeat(50)}`);
	console.log(`${C.bold}Total Weight: ${C.green}${formatted.totalWeight}${C.reset} (saved ${totalEdges - formatted.totalWeight} vs. full graph)`);
	console.log(`${C.bold}Status: ${formatted.isComplete ? C.green + '✓ Complete' : C.red + '✗ Incomplete'}${C.reset}`);

	// Visualize MST as tree
	console.log(`\n${C.cyan}${C.bold}MST Tree Visualization:${C.reset}\n`);
	console.log(visualizeMST(result, 'A'));

	// Export to CSV
	const csvRows = formatted.edges.map(r => `"${r.edge}","${r.weight}"`);
	writeFileSync('./prim-mst.csv', ['Edge,Weight', ...csvRows].join('\n'));
	console.log(`\n${C.dim}MST exported to ./prim-mst.csv${C.reset}`);

	// Statistics
	console.log(`\n${C.cyan}${C.bold}MST Statistics:${C.reset}`);
	console.log(`  Nodes in graph:    ${graph.getVertexCount()}`);
	console.log(`  Edges in graph:    ${graph.getEdgeCount()}`);
	console.log(`  Edges in MST:      ${formatted.edgeCount}`);
	console.log(`  Cost reduction:    ${((1 - formatted.totalWeight / totalEdges) * 100).toFixed(1)}%`);
}

/**
 * Demo 3: Algorithm Comparison
 */
async function demoComparison() {
	console.log(`\n${C.bold}${C.magenta}${'═'.repeat(72)}${C.reset}`);
	console.log(`${C.bold}${C.magenta}  ALGORITHM COMPARISON${C.reset}`);
	console.log(`${C.bold}${C.magenta}${'═'.repeat(72)}${C.reset}\n`);

	const comparison = [
		{
			algorithm: 'Dijkstra',
			purpose: 'Shortest path from source to all vertices',
			timeComplexity: 'O((V + E) log V)',
			spaceComplexity: 'O(V)',
			useCase: 'GPS navigation, network routing',
			constraint: 'Non-negative edge weights',
		},
		{
			algorithm: 'Prim',
			purpose: 'Minimum spanning tree',
			timeComplexity: 'O((V + E) log V)',
			spaceComplexity: 'O(V + E)',
			useCase: 'Network design, clustering',
			constraint: 'Undirected graph',
		},
	];

	for (const algo of comparison) {
		console.log(`${C.bold}${C.cyan}${algo.algorithm}'s Algorithm${C.reset}`);
		console.log(`  Purpose:      ${algo.purpose}`);
		console.log(`  Time:         ${C.yellow}${algo.timeComplexity}${C.reset}`);
		console.log(`  Space:        ${C.yellow}${algo.spaceComplexity}${C.reset}`);
		console.log(`  Use Case:     ${C.green}${algo.useCase}${C.reset}`);
		console.log(`  Constraint:   ${C.dim}${algo.constraint}${C.reset}`);
		console.log();
	}
}

/**
 * Main
 */
async function main() {
	console.log(`\n${C.bold}${C.blue}╔════════════════════════════════════════════════════════════════════╗${C.reset}`);
	console.log(`${C.bold}${C.blue}║        ADVANCED GRAPH ALGORITHMS  —  Interactive Demo            ║${C.reset}`);
	console.log(`${C.bold}${C.blue}╚════════════════════════════════════════════════════════════════════╝${C.reset}`);

	await demoDijkstra();
	await wait(1000);

	await demoPrim();
	await wait(1000);

	await demoComparison();

	console.log(`${C.bold}${C.green}\n✓ All demos complete!${C.reset}\n`);
}

main().catch(console.error);
