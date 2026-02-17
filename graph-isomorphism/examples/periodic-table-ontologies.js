/**
 * Periodic Table and Development Ontologies Demo
 *
 * This example demonstrates:
 * 1. Periodic table structure as a graph
 * 2. Development ontologies as a tree
 * 3. CSV export functionality
 */

import { Graph, Tree, TreeNode } from '../src/index.js';
import cliSpinners from 'cli-spinners';
import { writeFileSync } from 'fs';

// Colors
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	magenta: '\x1b[35m',
	bold: '\x1b[1m',
};

class Spinner {
	constructor(spinnerName, text) {
		this.spinner = cliSpinners[spinnerName];
		this.text = text;
		this.frameIndex = 0;
		this.intervalId = null;
		this.isSpinning = false;
	}

	start() {
		if (this.isSpinning) return;
		this.isSpinning = true;
		this.intervalId = setInterval(() => {
			const frame = this.spinner.frames[this.frameIndex];
			process.stdout.write(`\r${frame} ${this.text}`);
			this.frameIndex = (this.frameIndex + 1) % this.spinner.frames.length;
		}, this.spinner.interval);
	}

	update(text) { this.text = text; }

	stop(symbol = '✓', message = null) {
		if (!this.isSpinning) return;
		this.isSpinning = false;
		clearInterval(this.intervalId);
		process.stdout.write(`\r${symbol} ${message || this.text}\n`);
	}
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a simplified periodic table structure
 */
function createPeriodicTableGraph() {
	const elements = [
		// Period 1
		{ symbol: 'H', name: 'Hydrogen', period: 1, group: 1, category: 'Nonmetal' },
		{ symbol: 'He', name: 'Helium', period: 1, group: 18, category: 'Noble Gas' },
		// Period 2
		{ symbol: 'Li', name: 'Lithium', period: 2, group: 1, category: 'Alkali Metal' },
		{ symbol: 'Be', name: 'Beryllium', period: 2, group: 2, category: 'Alkaline Earth' },
		{ symbol: 'B', name: 'Boron', period: 2, group: 13, category: 'Metalloid' },
		{ symbol: 'C', name: 'Carbon', period: 2, group: 14, category: 'Nonmetal' },
		{ symbol: 'N', name: 'Nitrogen', period: 2, group: 15, category: 'Nonmetal' },
		{ symbol: 'O', name: 'Oxygen', period: 2, group: 16, category: 'Nonmetal' },
		{ symbol: 'F', name: 'Fluorine', period: 2, group: 17, category: 'Halogen' },
		{ symbol: 'Ne', name: 'Neon', period: 2, group: 18, category: 'Noble Gas' },
		// Period 3
		{ symbol: 'Na', name: 'Sodium', period: 3, group: 1, category: 'Alkali Metal' },
		{ symbol: 'Mg', name: 'Magnesium', period: 3, group: 2, category: 'Alkaline Earth' },
		{ symbol: 'Al', name: 'Aluminum', period: 3, group: 13, category: 'Post-transition' },
		{ symbol: 'Si', name: 'Silicon', period: 3, group: 14, category: 'Metalloid' },
		{ symbol: 'P', name: 'Phosphorus', period: 3, group: 15, category: 'Nonmetal' },
		{ symbol: 'S', name: 'Sulfur', period: 3, group: 16, category: 'Nonmetal' },
		{ symbol: 'Cl', name: 'Chlorine', period: 3, group: 17, category: 'Halogen' },
		{ symbol: 'Ar', name: 'Argon', period: 3, group: 18, category: 'Noble Gas' },
	];

	const graph = new Graph(false);

	// Add vertices for each element
	elements.forEach(el => {
		graph.addVertex(el.symbol);
	});

	// Connect elements in the same period (horizontal)
	elements.forEach((el1, i) => {
		elements.forEach((el2, j) => {
			if (i < j && el1.period === el2.period) {
				graph.addEdge(el1.symbol, el2.symbol);
			}
		});
	});

	return { graph, elements };
}

/**
 * Create development ontologies tree
 */
function createDevelopmentOntologiesTree() {
	const tree = new Tree('Software Development');

	// Programming Paradigms
	const paradigms = new TreeNode('Programming Paradigms');
	tree.root.addChild(paradigms);

	const imperative = new TreeNode('Imperative');
	const declarative = new TreeNode('Declarative');
	paradigms.addChild(imperative);
	paradigms.addChild(declarative);

	imperative.addChild(new TreeNode('Procedural'));
	imperative.addChild(new TreeNode('Object-Oriented'));
	imperative.addChild(new TreeNode('Parallel'));

	declarative.addChild(new TreeNode('Functional'));
	declarative.addChild(new TreeNode('Logic'));
	declarative.addChild(new TreeNode('Reactive'));

	// Development Methodologies
	const methodologies = new TreeNode('Development Methodologies');
	tree.root.addChild(methodologies);

	const agile = new TreeNode('Agile');
	const traditional = new TreeNode('Traditional');
	methodologies.addChild(agile);
	methodologies.addChild(traditional);

	agile.addChild(new TreeNode('Scrum'));
	agile.addChild(new TreeNode('Kanban'));
	agile.addChild(new TreeNode('XP'));
	agile.addChild(new TreeNode('Lean'));

	traditional.addChild(new TreeNode('Waterfall'));
	traditional.addChild(new TreeNode('V-Model'));
	traditional.addChild(new TreeNode('Spiral'));

	// Architecture Patterns
	const architecture = new TreeNode('Architecture Patterns');
	tree.root.addChild(architecture);

	const structural = new TreeNode('Structural');
	const distributed = new TreeNode('Distributed');
	architecture.addChild(structural);
	architecture.addChild(distributed);

	structural.addChild(new TreeNode('MVC'));
	structural.addChild(new TreeNode('MVVM'));
	structural.addChild(new TreeNode('Layered'));
	structural.addChild(new TreeNode('Hexagonal'));

	distributed.addChild(new TreeNode('Microservices'));
	distributed.addChild(new TreeNode('Event-Driven'));
	distributed.addChild(new TreeNode('Service-Oriented'));

	// Data Structures
	const dataStructures = new TreeNode('Data Structures');
	tree.root.addChild(dataStructures);

	const linear = new TreeNode('Linear');
	const nonLinear = new TreeNode('Non-Linear');
	dataStructures.addChild(linear);
	dataStructures.addChild(nonLinear);

	linear.addChild(new TreeNode('Array'));
	linear.addChild(new TreeNode('Linked List'));
	linear.addChild(new TreeNode('Stack'));
	linear.addChild(new TreeNode('Queue'));

	nonLinear.addChild(new TreeNode('Tree'));
	nonLinear.addChild(new TreeNode('Graph'));
	nonLinear.addChild(new TreeNode('Hash Table'));

	// Design Patterns
	const patterns = new TreeNode('Design Patterns');
	tree.root.addChild(patterns);

	const creational = new TreeNode('Creational');
	const structural2 = new TreeNode('Structural');
	const behavioral = new TreeNode('Behavioral');
	patterns.addChild(creational);
	patterns.addChild(structural2);
	patterns.addChild(behavioral);

	creational.addChild(new TreeNode('Singleton'));
	creational.addChild(new TreeNode('Factory'));
	creational.addChild(new TreeNode('Builder'));

	structural2.addChild(new TreeNode('Adapter'));
	structural2.addChild(new TreeNode('Decorator'));
	structural2.addChild(new TreeNode('Proxy'));

	behavioral.addChild(new TreeNode('Observer'));
	behavioral.addChild(new TreeNode('Strategy'));
	behavioral.addChild(new TreeNode('Command'));

	return tree;
}

/**
 * Export periodic table to CSV
 */
function exportPeriodicTableCSV(elements, filename = 'periodic-table.csv') {
	const headers = ['Symbol', 'Name', 'Period', 'Group', 'Category'];
	const rows = elements.map(el =>
		[el.symbol, el.name, el.period, el.group, el.category].join(',')
	);
	const csv = [headers.join(','), ...rows].join('\n');
	writeFileSync(filename, csv);
	return filename;
}

/**
 * Export tree to CSV (hierarchical format)
 */
function exportTreeCSV(tree, filename = 'development-ontologies.csv') {
	const rows = [];
	rows.push(['Level', 'Path', 'Node', 'Parent', 'Is Leaf']);

	function traverse(node, level = 0, path = [], parent = '') {
		const currentPath = [...path, node.value];
		const pathString = currentPath.join(' > ');

		rows.push([
			level,
			pathString,
			node.value,
			parent,
			node.isLeaf() ? 'Yes' : 'No'
		].map(v => `"${v}"`).join(','));

		for (const child of node.children) {
			traverse(child, level + 1, currentPath, node.value);
		}
	}

	traverse(tree.root);
	const csv = rows.join('\n');
	writeFileSync(filename, csv);
	return filename;
}

/**
 * Display periodic table as ASCII art
 */
function displayPeriodicTable(elements) {
	console.log(`\n${colors.bold}${colors.cyan}Periodic Table Structure (Periods 1-3)${colors.reset}\n`);

	// Group by period
	const periods = {};
	elements.forEach(el => {
		if (!periods[el.period]) periods[el.period] = [];
		periods[el.period].push(el);
	});

	// Display each period
	for (let p = 1; p <= 3; p++) {
		const period = periods[p] || [];
		const line = period.map(el => {
			const color = el.category === 'Noble Gas' ? colors.magenta :
			             el.category === 'Alkali Metal' ? colors.yellow :
			             el.category === 'Nonmetal' ? colors.green :
			             el.category === 'Halogen' ? colors.red :
			             colors.blue;
			return `${color}${el.symbol.padEnd(3)}${colors.reset}`;
		}).join(' ');
		console.log(`Period ${p}: ${line}`);
	}

	console.log(`\n${colors.bold}Categories:${colors.reset}`);
	const categories = [...new Set(elements.map(e => e.category))];
	categories.forEach(cat => {
		const count = elements.filter(e => e.category === cat).length;
		console.log(`  ${cat}: ${count} elements`);
	});
}

/**
 * Display graph statistics
 */
function displayGraphStats(graph, elements) {
	console.log(`\n${colors.bold}Graph Statistics:${colors.reset}`);
	console.log(`  Vertices (Elements): ${graph.getVertexCount()}`);
	console.log(`  Edges (Connections): ${graph.getEdgeCount()}`);
	console.log(`  Degree Sequence: ${graph.getDegreeSequence().join(', ')}`);

	// Find most connected element
	let maxDegree = 0;
	let maxElement = '';
	elements.forEach(el => {
		const degree = graph.getDegree(el.symbol);
		if (degree > maxDegree) {
			maxDegree = degree;
			maxElement = el.symbol;
		}
	});
	console.log(`  Most connected element: ${maxElement} (degree ${maxDegree})`);
}

/**
 * Display tree statistics
 */
function displayTreeStats(tree) {
	console.log(`\n${colors.bold}Tree Statistics:${colors.reset}`);
	console.log(`  Total nodes: ${tree.countNodes()}`);
	console.log(`  Height: ${tree.getHeight()}`);
	console.log(`  Leaf nodes: ${tree.getLeaves().length}`);

	// Count nodes at each level
	const levelCounts = {};
	tree.levelOrder((node) => {
		const level = node.getLevel();
		levelCounts[level] = (levelCounts[level] || 0) + 1;
	});

	console.log(`  Nodes per level:`);
	Object.keys(levelCounts).sort((a, b) => a - b).forEach(level => {
		console.log(`    Level ${level}: ${levelCounts[level]} nodes`);
	});
}

/**
 * Main demo
 */
async function main() {
	console.log(`${colors.bold}${colors.blue}`);
	console.log('╔════════════════════════════════════════════════════════════╗');
	console.log('║  Periodic Table & Development Ontologies Visualization   ║');
	console.log('╚════════════════════════════════════════════════════════════╝');
	console.log(colors.reset);

	// Part 1: Periodic Table
	console.log(`\n${colors.bold}${colors.cyan}=== Part 1: Periodic Table Structure ===${colors.reset}\n`);

	const spinner1 = new Spinner('adjacencyMatrix', 'Building periodic table graph...');
	spinner1.start();
	await wait(1500);

	const { graph: periodicGraph, elements } = createPeriodicTableGraph();
	spinner1.stop('✓', 'Periodic table graph created');

	displayPeriodicTable(elements);
	displayGraphStats(periodicGraph, elements);

	// Export periodic table to CSV
	const spinner2 = new Spinner('graphNodes', 'Exporting periodic table to CSV...');
	spinner2.start();
	await wait(1000);
	const csvFile1 = exportPeriodicTableCSV(elements, './periodic-table.csv');
	spinner2.stop('✓', `Exported to ${csvFile1}`);

	// Part 2: Development Ontologies
	console.log(`\n${colors.bold}${colors.cyan}=== Part 2: Development Ontologies Tree ===${colors.reset}\n`);

	const spinner3 = new Spinner('treeGrowth', 'Building development ontologies tree...');
	spinner3.start();
	await wait(1500);

	const devTree = createDevelopmentOntologiesTree();
	spinner3.stop('✓', 'Development ontologies tree created');

	console.log('\n' + devTree.toString());
	displayTreeStats(devTree);

	// Export tree to CSV
	const spinner4 = new Spinner('treeStructure', 'Exporting tree to CSV...');
	spinner4.start();
	await wait(1000);
	const csvFile2 = exportTreeCSV(devTree, './development-ontologies.csv');
	spinner4.stop('✓', `Exported to ${csvFile2}`);

	// Part 3: Tree Traversals
	console.log(`\n${colors.bold}${colors.cyan}=== Part 3: Tree Traversal Paths ===${colors.reset}\n`);

	const spinner5 = new Spinner('bfsTraversal', 'Performing breadth-first traversal...');
	spinner5.start();
	await wait(1200);

	const bfsPath = [];
	devTree.levelOrder((node) => bfsPath.push(node.value));
	spinner5.stop('✓', 'BFS complete');

	console.log(`${colors.green}Level-order (BFS):${colors.reset}`);
	console.log(`  ${bfsPath.slice(0, 10).join(' → ')}...`);

	const spinner6 = new Spinner('dfsTraversal', 'Performing depth-first traversal...');
	spinner6.start();
	await wait(1200);

	const dfsPath = [];
	devTree.preOrder(devTree.root, (node) => dfsPath.push(node.value));
	spinner6.stop('✓', 'DFS complete');

	console.log(`${colors.green}Pre-order (DFS):${colors.reset}`);
	console.log(`  ${dfsPath.slice(0, 10).join(' → ')}...`);

	// Summary
	console.log(`\n${colors.bold}${colors.cyan}=== Summary ===${colors.reset}\n`);
	console.log(`${colors.green}✓${colors.reset} Created periodic table graph with ${periodicGraph.getVertexCount()} elements`);
	console.log(`${colors.green}✓${colors.reset} Created development ontologies tree with ${devTree.countNodes()} concepts`);
	console.log(`${colors.green}✓${colors.reset} Exported 2 CSV files:`);
	console.log(`    - ${csvFile1}`);
	console.log(`    - ${csvFile2}`);
	console.log(`\n${colors.bold}${colors.green}Demo completed!${colors.reset}\n`);
}

main().catch(console.error);
