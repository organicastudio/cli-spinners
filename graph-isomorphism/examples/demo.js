/**
 * Demo: Graph Isomorphism Detection with CLI Spinners
 *
 * This example demonstrates:
 * 1. Creating graphs
 * 2. Detecting isomorphisms with progress visualization
 * 3. Using different graph-themed spinners
 */

import { Graph, detectIsomorphism, detectIsomorphismOptimized, checkInvariants } from '../src/index.js';
import cliSpinners from 'cli-spinners';

// ANSI color codes for terminal output
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	bold: '\x1b[1m',
};

/**
 * Simple spinner implementation for the terminal
 */
class Spinner {
	constructor(spinnerName = 'dots', text = '') {
		this.spinner = cliSpinners[spinnerName];
		this.text = text;
		this.frameIndex = 0;
		this.intervalId = null;
		this.isSpinning = false;
	}

	start() {
		if (this.isSpinning) return;
		this.isSpinning = true;
		this.frameIndex = 0;

		this.intervalId = setInterval(() => {
			const frame = this.spinner.frames[this.frameIndex];
			process.stdout.write(`\r${frame} ${this.text}`);
			this.frameIndex = (this.frameIndex + 1) % this.spinner.frames.length;
		}, this.spinner.interval);
	}

	update(text) {
		this.text = text;
	}

	succeed(text) {
		this.stop();
		console.log(`${colors.green}✓${colors.reset} ${text || this.text}`);
	}

	fail(text) {
		this.stop();
		console.log(`${colors.red}✗${colors.reset} ${text || this.text}`);
	}

	warn(text) {
		this.stop();
		console.log(`${colors.yellow}⚠${colors.reset} ${text || this.text}`);
	}

	info(text) {
		this.stop();
		console.log(`${colors.cyan}ℹ${colors.reset} ${text || this.text}`);
	}

	stop() {
		if (!this.isSpinning) return;
		this.isSpinning = false;
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
		process.stdout.write('\r\x1b[K'); // Clear line
	}
}

/**
 * Wait for a specified time
 */
function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create example graph 1: Triangle (K3)
 */
function createTriangle() {
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'A');
	return g;
}

/**
 * Create example graph 2: Another triangle with different labels
 */
function createTriangle2() {
	const g = new Graph(false);
	g.addEdge(1, 2);
	g.addEdge(2, 3);
	g.addEdge(3, 1);
	return g;
}

/**
 * Create example graph 3: Square (K4 cycle)
 */
function createSquare() {
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'D');
	g.addEdge('D', 'A');
	return g;
}

/**
 * Create example graph 4: Path graph
 */
function createPath() {
	const g = new Graph(false);
	g.addEdge('A', 'B');
	g.addEdge('B', 'C');
	g.addEdge('C', 'D');
	return g;
}

/**
 * Create a complete graph (K_n)
 */
function createCompleteGraph(n) {
	const g = new Graph(false);
	for (let i = 1; i <= n; i++) {
		for (let j = i + 1; j <= n; j++) {
			g.addEdge(i, j);
		}
	}
	return g;
}

/**
 * Demo 1: Simple isomorphism check
 */
async function demo1() {
	console.log(`\n${colors.bold}${colors.cyan}=== Demo 1: Triangle Isomorphism ===${colors.reset}\n`);

	const g1 = createTriangle();
	const g2 = createTriangle2();

	console.log('Graph 1:');
	console.log(g1.toString());
	console.log('Graph 2:');
	console.log(g2.toString());

	const spinner = new Spinner('graphTraversal', 'Checking graph isomorphism...');
	spinner.start();

	await wait(1500);

	const result = detectIsomorphism(g1, g2);

	if (result.isIsomorphic) {
		spinner.succeed('Graphs are isomorphic!');
		console.log(`\n${colors.green}Mapping:${colors.reset}`);
		for (const [v1, v2] of Object.entries(result.mapping)) {
			console.log(`  ${v1} → ${v2}`);
		}
	} else {
		spinner.fail('Graphs are not isomorphic');
	}

	console.log(`\nPermutations checked: ${result.permutationsChecked}`);
}

/**
 * Demo 2: Non-isomorphic graphs
 */
async function demo2() {
	console.log(`\n${colors.bold}${colors.cyan}=== Demo 2: Square vs Path ===${colors.reset}\n`);

	const square = createSquare();
	const path = createPath();

	console.log('Graph 1 (Square):');
	console.log(square.toString());
	console.log('Graph 2 (Path):');
	console.log(path.toString());

	const spinner = new Spinner('graphNodes', 'Checking invariants...');
	spinner.start();

	await wait(1000);

	const invariants = checkInvariants(square, path);

	if (invariants.isomorphismPossible) {
		spinner.update('Invariants match, checking isomorphism...');
		await wait(1500);
		const result = detectIsomorphism(square, path);
		if (result.isIsomorphic) {
			spinner.succeed('Graphs are isomorphic!');
		} else {
			spinner.fail('Graphs are not isomorphic');
		}
	} else {
		spinner.fail('Graphs cannot be isomorphic (invariants differ)');
		console.log(`\n${colors.yellow}Failed checks:${colors.reset}`);
		for (const [check, passed] of Object.entries(invariants.checks)) {
			if (!passed) {
				console.log(`  ✗ ${check}`);
			}
		}
	}
}

/**
 * Demo 3: Complete graph with progress
 */
async function demo3() {
	console.log(`\n${colors.bold}${colors.cyan}=== Demo 3: Complete Graph K5 ===${colors.reset}\n`);

	const k5_1 = createCompleteGraph(5);
	const k5_2 = createCompleteGraph(5);

	console.log(`Creating two K5 graphs (complete graph with 5 vertices)...`);
	console.log(`Each graph has ${k5_1.getVertexCount()} vertices and ${k5_1.getEdgeCount()} edges\n`);

	const spinner = new Spinner('bfsTraversal', 'Detecting isomorphism...');
	spinner.start();

	let lastProgress = 0;
	const result = detectIsomorphismOptimized(k5_1, k5_2, {
		onProgress: (progress) => {
			if (progress.percentage && progress.percentage - lastProgress >= 10) {
				spinner.update(`Checking permutations: ${progress.percentage}% (${progress.checked}/${progress.total})`);
				lastProgress = progress.percentage;
			}
		}
	});

	if (result.isIsomorphic) {
		spinner.succeed('Graphs are isomorphic!');
		console.log(`\nPermutations checked: ${result.permutationsChecked}`);
		console.log(`Algorithm: ${result.optimized ? 'Optimized (degree-based pruning)' : 'Brute force'}`);
	} else {
		spinner.fail('Graphs are not isomorphic');
	}
}

/**
 * Demo 4: Showcase different graph spinners
 */
async function demo4() {
	console.log(`\n${colors.bold}${colors.cyan}=== Demo 4: Graph-Themed Spinners Showcase ===${colors.reset}\n`);

	const graphSpinners = [
		'graphTraversal',
		'treeGrowth',
		'graphNodes',
		'graphIsomorphism',
		'bfsTraversal',
		'dfsTraversal',
		'treeStructure',
		'adjacencyMatrix'
	];

	for (const spinnerName of graphSpinners) {
		const spinner = new Spinner(spinnerName, `${spinnerName} spinner`);
		spinner.start();
		await wait(2000);
		spinner.succeed(`${spinnerName} completed`);
	}
}

/**
 * Main demo runner
 */
async function main() {
	console.log(`${colors.bold}${colors.blue}`);
	console.log('╔════════════════════════════════════════════════════════╗');
	console.log('║  Graph Isomorphism Detection with CLI Spinners Demo  ║');
	console.log('╚════════════════════════════════════════════════════════╝');
	console.log(colors.reset);

	try {
		await demo1();
		await wait(1000);

		await demo2();
		await wait(1000);

		await demo3();
		await wait(1000);

		await demo4();

		console.log(`\n${colors.bold}${colors.green}All demos completed!${colors.reset}\n`);
	} catch (error) {
		console.error(`\n${colors.red}Error:${colors.reset}`, error);
		process.exit(1);
	}
}

// Run the demo
main();
