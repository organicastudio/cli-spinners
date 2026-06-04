/**
 * Organic Semantics & International Standards
 *
 * A comprehensive semantic graph mapping:
 * - International certification bodies
 * - Organic standards hierarchies
 * - Product categories
 * - Compliance relationships
 * - Equivalence agreements
 */

import { WeightedGraph, Tree, TreeNode } from '../src/index.js';
import cliSpinners from 'cli-spinners';
import { writeFileSync } from 'fs';

const C = {
	reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
	red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
	blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
	white: '\x1b[37m', bgGreen: '\x1b[42m', bgCyan: '\x1b[46m',
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

/* ═══════════════════════════════════════════════════════════
   ORGANIC STANDARDS DATA
   ═══════════════════════════════════════════════════════════ */

const STANDARDS = {
	// International Bodies
	bodies: [
		{
			id: 'ISO',
			name: 'International Organization for Standardization',
			type: 'Meta-standard',
			scope: 'Global',
			key_standard: 'ISO/IEC Guide 65',
			founded: 1947,
		},
		{
			id: 'IFOAM',
			name: 'International Federation of Organic Agriculture Movements',
			type: 'Umbrella organization',
			scope: 'Global',
			key_standard: 'IFOAM Organic Standard',
			founded: 1972,
		},
		{
			id: 'CAC',
			name: 'Codex Alimentarius Commission',
			type: 'UN body (WHO/FAO)',
			scope: 'Global',
			key_standard: 'CAC/GL 32-1999',
			founded: 1963,
		},
		{
			id: 'USDA',
			name: 'United States Department of Agriculture',
			type: 'National authority',
			scope: 'USA',
			key_standard: 'NOP (National Organic Program)',
			founded: 2002,
		},
		{
			id: 'EU',
			name: 'European Union',
			type: 'Regional authority',
			scope: 'EU-27',
			key_standard: 'EU Regulation 2018/848',
			founded: 1991,
		},
		{
			id: 'JAS',
			name: 'Japanese Agricultural Standard',
			type: 'National authority',
			scope: 'Japan',
			key_standard: 'JAS Organic',
			founded: 2000,
		},
		{
			id: 'COR',
			name: 'Canada Organic Regime',
			type: 'National authority',
			scope: 'Canada',
			key_standard: 'COR (CAN/CGSB-32.310)',
			founded: 2009,
		},
	],

	// Certification Bodies (CBs)
	certifiers: [
		{ id: 'ECOCERT', name: 'Ecocert', region: 'EU', scope: 'Global', accreditation: ['EU', 'USDA', 'JAS'] },
		{ id: 'DEMETER', name: 'Demeter International', region: 'Global', scope: 'Biodynamic', accreditation: ['IFOAM'] },
		{ id: 'SOIL_ASSOC', name: 'Soil Association', region: 'UK', scope: 'EU+', accreditation: ['EU', 'IFOAM'] },
		{ id: 'CCOF', name: 'California Certified Organic Farmers', region: 'USA', scope: 'USA', accreditation: ['USDA'] },
		{ id: 'QAI', name: 'Quality Assurance International', region: 'USA', scope: 'Global', accreditation: ['USDA', 'EU', 'JAS'] },
		{ id: 'ICEA', name: 'Istituto Certificazione Etica e Ambientale', region: 'Italy', scope: 'EU', accreditation: ['EU', 'IFOAM'] },
		{ id: 'NATURLAND', name: 'Naturland', region: 'Germany', scope: 'Global', accreditation: ['EU', 'IFOAM'] },
		{ id: 'BIO_SUISSE', name: 'Bio Suisse', region: 'Switzerland', scope: 'CH+', accreditation: ['IFOAM'] },
	],

	// Product Categories
	categories: {
		'Plant Products': ['Fruits', 'Vegetables', 'Grains', 'Herbs & Spices', 'Coffee & Tea', 'Oilseeds'],
		'Animal Products': ['Meat', 'Dairy', 'Eggs', 'Honey', 'Aquaculture'],
		'Processed Foods': ['Bakery', 'Beverages', 'Condiments', 'Prepared Meals', 'Baby Food'],
		'Textiles': ['Cotton', 'Wool', 'Linen', 'Hemp', 'Silk'],
		'Cosmetics': ['Skincare', 'Haircare', 'Makeup', 'Fragrances'],
		'Feed': ['Animal Feed', 'Pet Food'],
	},

	// Core Principles (IFOAM)
	principles: {
		Health: 'Sustain and enhance the health of soil, plant, animal, human and planet',
		Ecology: 'Based on living ecological systems and cycles',
		Fairness: 'Built on relationships that ensure fairness with regard to the common environment',
		Care: 'Managed in a precautionary and responsible manner',
	},

	// Key Requirements (common across standards)
	requirements: {
		'Soil Management': [
			'3-year conversion period',
			'No synthetic fertilizers',
			'Crop rotation mandatory',
			'Composting practices',
			'Soil testing required',
		],
		'Pest Control': [
			'IPM (Integrated Pest Management)',
			'No synthetic pesticides',
			'Biological controls preferred',
			'Physical barriers allowed',
			'Approved natural substances only',
		],
		'GMO Policy': [
			'GMOs prohibited',
			'<0.9% accidental presence (EU)',
			'<5% unavoidable presence (some regions)',
			'Testing & documentation required',
			'Buffer zones mandatory',
		],
		'Animal Welfare': [
			'Access to outdoors',
			'Natural behavior accommodation',
			'Organic feed 100%',
			'Preventive antibiotics prohibited',
			'Hormones prohibited',
		],
		'Processing': [
			'95% organic ingredients minimum',
			'Approved additives only',
			'No ionizing radiation',
			'Segregation from non-organic',
			'Traceability required',
		],
		'Labeling': [
			'Certification body name',
			'Organic % declaration',
			'Origin of ingredients',
			'Approved logos only',
			'No misleading claims',
		],
	},

	// Equivalence Agreements
	equivalence: [
		{ from: 'USDA', to: 'EU', status: 'Full equivalence', year: 2012 },
		{ from: 'USDA', to: 'COR', status: 'Full equivalence', year: 2009 },
		{ from: 'USDA', to: 'JAS', status: 'Partial equivalence', year: 2013 },
		{ from: 'EU', to: 'COR', status: 'Full equivalence', year: 2011 },
		{ from: 'EU', to: 'JAS', status: 'Negotiating', year: 2024 },
		{ from: 'JAS', to: 'COR', status: 'Partial equivalence', year: 2014 },
	],
};

/* ═══════════════════════════════════════════════════════════
   BUILD SEMANTIC GRAPH
   ═══════════════════════════════════════════════════════════ */

function buildStandardsGraph() {
	const graph = new WeightedGraph(true); // Directed for hierarchies

	// Add standard bodies as vertices
	STANDARDS.bodies.forEach(body => {
		graph.addVertex(body.id);
	});

	// Add certifiers
	STANDARDS.certifiers.forEach(cert => {
		graph.addVertex(cert.id);
	});

	// Hierarchical relationships (influence/accreditation)
	// Meta-level
	graph.addEdge('ISO', 'CAC', 10);      // ISO guides Codex
	graph.addEdge('CAC', 'IFOAM', 8);     // Codex influences IFOAM

	// National standards reference IFOAM
	graph.addEdge('IFOAM', 'USDA', 7);
	graph.addEdge('IFOAM', 'EU', 7);
	graph.addEdge('IFOAM', 'JAS', 7);
	graph.addEdge('IFOAM', 'COR', 7);

	// Certifiers accredited by standards
	graph.addEdge('USDA', 'CCOF', 5);
	graph.addEdge('USDA', 'QAI', 5);
	graph.addEdge('EU', 'ECOCERT', 5);
	graph.addEdge('EU', 'SOIL_ASSOC', 5);
	graph.addEdge('EU', 'ICEA', 5);
	graph.addEdge('EU', 'NATURLAND', 5);
	graph.addEdge('IFOAM', 'DEMETER', 6);
	graph.addEdge('IFOAM', 'BIO_SUISSE', 6);

	// Equivalence (bidirectional with lower weight = stronger equivalence)
	STANDARDS.equivalence.forEach(eq => {
		const weight = eq.status === 'Full equivalence' ? 2 :
		               eq.status === 'Partial equivalence' ? 4 : 8;
		graph.addEdge(eq.from, eq.to, weight);
		graph.addEdge(eq.to, eq.from, weight);
	});

	return graph;
}

function buildOntologyTree() {
	const tree = new Tree('Organic Standards Ontology');

	// Layer 1: Governance
	const governance = new TreeNode('Governance Framework');
	tree.root.addChild(governance);

	const intl = new TreeNode('International Bodies');
	governance.addChild(intl);
	intl.addChild(new TreeNode('ISO (Meta-standard)'));
	intl.addChild(new TreeNode('Codex Alimentarius (UN)'));
	intl.addChild(new TreeNode('IFOAM (Movement)'));

	const regional = new TreeNode('Regional/National Standards');
	governance.addChild(regional);
	regional.addChild(new TreeNode('USDA NOP (USA)'));
	regional.addChild(new TreeNode('EU Reg 2018/848 (EU-27)'));
	regional.addChild(new TreeNode('JAS Organic (Japan)'));
	regional.addChild(new TreeNode('COR (Canada)'));

	const certs = new TreeNode('Certification Bodies');
	governance.addChild(certs);
	certs.addChild(new TreeNode('Ecocert (Global)'));
	certs.addChild(new TreeNode('Demeter (Biodynamic)'));
	certs.addChild(new TreeNode('Soil Association (UK)'));

	// Layer 2: Principles
	const principles = new TreeNode('Core Principles (IFOAM)');
	tree.root.addChild(principles);
	Object.entries(STANDARDS.principles).forEach(([name, desc]) => {
		const pNode = new TreeNode(name);
		principles.addChild(pNode);
		pNode.addChild(new TreeNode(desc.slice(0, 50) + '…'));
	});

	// Layer 3: Requirements
	const requirements = new TreeNode('Compliance Requirements');
	tree.root.addChild(requirements);
	Object.entries(STANDARDS.requirements).forEach(([area, rules]) => {
		const aNode = new TreeNode(area);
		requirements.addChild(aNode);
		rules.slice(0, 3).forEach(rule => aNode.addChild(new TreeNode(rule)));
	});

	// Layer 4: Product Categories
	const products = new TreeNode('Product Scope');
	tree.root.addChild(products);
	Object.entries(STANDARDS.categories).forEach(([cat, subcats]) => {
		const cNode = new TreeNode(cat);
		products.addChild(cNode);
		subcats.slice(0, 4).forEach(sub => cNode.addChild(new TreeNode(sub)));
	});

	// Layer 5: Equivalence
	const equiv = new TreeNode('Equivalence Agreements');
	tree.root.addChild(equiv);
	const full = new TreeNode('Full Equivalence');
	equiv.addChild(full);
	full.addChild(new TreeNode('USDA ↔ EU (2012)'));
	full.addChild(new TreeNode('USDA ↔ Canada (2009)'));
	full.addChild(new TreeNode('EU ↔ Canada (2011)'));

	return tree;
}

/* ═══════════════════════════════════════════════════════════
   VISUALIZATIONS
   ═══════════════════════════════════════════════════════════ */

function renderHeader() {
	console.log(`\n${C.bgGreen}${C.white}${C.bold}                                                                      ${C.reset}`);
	console.log(`${C.bgGreen}${C.white}${C.bold}  ORGANIC SEMANTICS & INTERNATIONAL STANDARDS  —  Ontology Graph      ${C.reset}`);
	console.log(`${C.bgGreen}${C.white}${C.bold}                                                                      ${C.reset}\n`);
}

function renderBodies() {
	console.log(`${C.bold}${C.cyan}═══ International Standards Bodies ═══${C.reset}\n`);

	const sorted = STANDARDS.bodies.sort((a, b) => a.founded - b.founded);
	sorted.forEach(body => {
		const color = body.type === 'Meta-standard' ? C.magenta :
		             body.type === 'Umbrella organization' ? C.cyan :
		             body.type.includes('UN') ? C.blue :
		             body.type === 'Regional authority' ? C.yellow : C.green;

		console.log(`${color}${C.bold}▸ ${body.id}${C.reset} – ${body.name}`);
		console.log(`  ${C.dim}Type:${C.reset}     ${body.type}`);
		console.log(`  ${C.dim}Scope:${C.reset}    ${body.scope}`);
		console.log(`  ${C.dim}Standard:${C.reset} ${body.key_standard}`);
		console.log(`  ${C.dim}Founded:${C.reset}  ${body.founded}`);
		console.log();
	});
}

function renderPrinciples() {
	console.log(`${C.bold}${C.green}═══ IFOAM Core Principles ═══${C.reset}\n`);

	Object.entries(STANDARDS.principles).forEach(([name, desc]) => {
		console.log(`${C.bold}${C.green}◈ ${name}${C.reset}`);
		console.log(`  ${desc}`);
		console.log();
	});
}

function renderRequirements() {
	console.log(`${C.bold}${C.yellow}═══ Compliance Requirements (Sampling) ═══${C.reset}\n`);

	const sample = ['Soil Management', 'GMO Policy', 'Animal Welfare'];
	sample.forEach(area => {
		console.log(`${C.bold}${C.yellow}▸ ${area}${C.reset}`);
		STANDARDS.requirements[area].forEach((req, i) => {
			const icon = i < 3 ? '✓' : '·';
			console.log(`  ${C.green}${icon}${C.reset} ${req}`);
		});
		console.log();
	});
}

function renderEquivalence() {
	console.log(`${C.bold}${C.blue}═══ Equivalence Agreements ═══${C.reset}\n`);

	const byStatus = {};
	STANDARDS.equivalence.forEach(eq => {
		if (!byStatus[eq.status]) byStatus[eq.status] = [];
		byStatus[eq.status].push(eq);
	});

	Object.entries(byStatus).forEach(([status, agreements]) => {
		const color = status === 'Full equivalence' ? C.green :
		             status === 'Partial equivalence' ? C.yellow : C.red;
		console.log(`${color}${C.bold}${status}:${C.reset}`);
		agreements.forEach(eq => {
			console.log(`  ${eq.from} ↔ ${eq.to} ${C.dim}(since ${eq.year})${C.reset}`);
		});
		console.log();
	});
}

function renderGraph(graph) {
	console.log(`${C.bold}${C.magenta}═══ Standards Hierarchy Graph ═══${C.reset}\n`);

	console.log(`${C.dim}Nodes: ${graph.getVertexCount()}  |  Edges: ${graph.getEdgeCount()}${C.reset}\n`);

	// Show key paths
	console.log(`${C.bold}Key Influence Paths:${C.reset}`);
	console.log(`  ${C.magenta}ISO${C.reset} → ${C.blue}CAC${C.reset} → ${C.cyan}IFOAM${C.reset} → ${C.green}USDA${C.reset} → ${C.dim}CCOF${C.reset}`);
	console.log(`  ${C.magenta}ISO${C.reset} → ${C.blue}CAC${C.reset} → ${C.cyan}IFOAM${C.reset} → ${C.yellow}EU${C.reset} → ${C.dim}ECOCERT${C.reset}`);
	console.log();

	console.log(`${C.bold}Equivalence Network:${C.reset}`);
	console.log(`  ${C.green}USDA ⇄ EU ⇄ Canada${C.reset} ${C.dim}(triangle of full equivalence)${C.reset}`);
	console.log(`  ${C.yellow}USDA ⇄ JAS${C.reset} ${C.dim}(partial)${C.reset}`);
	console.log();
}

function renderCertifiers() {
	console.log(`${C.bold}${C.cyan}═══ Major Certification Bodies ═══${C.reset}\n`);

	const byRegion = {};
	STANDARDS.certifiers.forEach(cert => {
		const region = cert.scope === 'Global' ? 'Global' : cert.region;
		if (!byRegion[region]) byRegion[region] = [];
		byRegion[region].push(cert);
	});

	Object.entries(byRegion).forEach(([region, certs]) => {
		console.log(`${C.bold}${region}:${C.reset}`);
		certs.forEach(cert => {
			const accred = cert.accreditation.join(', ');
			console.log(`  ${C.cyan}◆${C.reset} ${cert.name} ${C.dim}[${accred}]${C.reset}`);
		});
		console.log();
	});
}

function renderCategories() {
	console.log(`${C.bold}${C.green}═══ Product Categories ═══${C.reset}\n`);

	let totalProducts = 0;
	Object.entries(STANDARDS.categories).forEach(([cat, subcats]) => {
		totalProducts += subcats.length;
		console.log(`${C.bold}${C.green}▸ ${cat}${C.reset} ${C.dim}(${subcats.length})${C.reset}`);
		console.log(`  ${subcats.slice(0, 4).join(' · ')}${subcats.length > 4 ? ' · …' : ''}`);
	});

	console.log(`\n${C.dim}Total: ${Object.keys(STANDARDS.categories).length} categories, ${totalProducts} subcategories${C.reset}\n`);
}

/* ═══════════════════════════════════════════════════════════
   CSV EXPORTS
   ═══════════════════════════════════════════════════════════ */

function exportCSVs() {
	// 1. Standards bodies
	const bodiesHeader = 'ID,Name,Type,Scope,Key Standard,Founded';
	const bodiesRows = STANDARDS.bodies.map(b =>
		`"${b.id}","${b.name}","${b.type}","${b.scope}","${b.key_standard}","${b.founded}"`);
	writeFileSync('./organic-standards-bodies.csv', [bodiesHeader, ...bodiesRows].join('\n'));

	// 2. Certifiers
	const certHeader = 'ID,Name,Region,Scope,Accreditation';
	const certRows = STANDARDS.certifiers.map(c =>
		`"${c.id}","${c.name}","${c.region}","${c.scope}","${c.accreditation.join('; ')}"`);
	writeFileSync('./organic-certifiers.csv', [certHeader, ...certRows].join('\n'));

	// 3. Equivalence
	const eqHeader = 'From,To,Status,Year';
	const eqRows = STANDARDS.equivalence.map(e =>
		`"${e.from}","${e.to}","${e.status}","${e.year}"`);
	writeFileSync('./organic-equivalence.csv', [eqHeader, ...eqRows].join('\n'));

	// 4. Requirements
	const reqHeader = 'Area,Requirement,Priority';
	const reqRows = [];
	Object.entries(STANDARDS.requirements).forEach(([area, reqs]) => {
		reqs.forEach((req, i) => {
			reqRows.push(`"${area}","${req}","${i < 3 ? 'High' : 'Medium'}"`);
		});
	});
	writeFileSync('./organic-requirements.csv', [reqHeader, ...reqRows].join('\n'));

	return [
		'./organic-standards-bodies.csv',
		'./organic-certifiers.csv',
		'./organic-equivalence.csv',
		'./organic-requirements.csv',
	];
}

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */

async function main() {
	renderHeader();

	let spinner = new Spinner('graphNodes', 'Building standards graph...');
	spinner.start();
	await wait(1200);
	const graph = buildStandardsGraph();
	spinner.stop('✓', 'Standards graph constructed');

	spinner = new Spinner('treeGrowth', 'Growing ontology tree...');
	spinner.start();
	await wait(1000);
	const tree = buildOntologyTree();
	spinner.stop('✓', 'Ontology tree built');

	console.log();
	renderBodies();
	renderPrinciples();
	renderRequirements();
	renderGraph(graph);
	renderEquivalence();
	renderCertifiers();
	renderCategories();

	// Tree view
	console.log(`${C.bold}${C.blue}═══ Ontology Tree View ═══${C.reset}\n`);
	console.log(tree.toString());
	console.log(`${C.dim}Nodes: ${tree.countNodes()}  |  Height: ${tree.getHeight()}  |  Leaves: ${tree.getLeaves().length}${C.reset}\n`);

	// Export
	spinner = new Spinner('adjacencyMatrix', 'Exporting CSV datasets...');
	spinner.start();
	await wait(800);
	const files = exportCSVs();
	spinner.stop('✓', `Exported ${files.length} CSV files`);

	files.forEach(f => console.log(`  ${C.dim}${f}${C.reset}`));

	console.log(`\n${C.bold}${C.green}✓ Organic standards ontology complete!${C.reset}\n`);
}

main().catch(console.error);
