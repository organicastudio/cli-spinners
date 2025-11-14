/**
 * Demo: Tree Structures
 *
 * This example demonstrates tree data structures and operations
 */

import { Tree, TreeNode, BinaryTree, BinaryTreeNode } from '../src/index.js';
import cliSpinners from 'cli-spinners';

// Simple spinner for visualization
class Spinner {
	constructor(spinnerName, text) {
		this.spinner = cliSpinners[spinnerName];
		this.text = text;
		this.frameIndex = 0;
		this.intervalId = null;
	}

	start() {
		this.intervalId = setInterval(() => {
			const frame = this.spinner.frames[this.frameIndex];
			process.stdout.write(`\r${frame} ${this.text}`);
			this.frameIndex = (this.frameIndex + 1) % this.spinner.frames.length;
		}, this.spinner.interval);
	}

	stop(symbol = '✓', message = null) {
		clearInterval(this.intervalId);
		process.stdout.write(`\r${symbol} ${message || this.text}\n`);
	}
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateGeneralTree() {
	console.log('\n=== General Tree Demo ===\n');

	const spinner = new Spinner('treeGrowth', 'Building tree structure...');
	spinner.start();
	await wait(1500);

	// Create a file system-like tree
	const tree = new Tree('root');
	const documents = new TreeNode('documents');
	const pictures = new TreeNode('pictures');
	const downloads = new TreeNode('downloads');

	tree.root.addChild(documents);
	tree.root.addChild(pictures);
	tree.root.addChild(downloads);

	const work = new TreeNode('work');
	const personal = new TreeNode('personal');
	documents.addChild(work);
	documents.addChild(personal);

	const vacation = new TreeNode('vacation');
	const family = new TreeNode('family');
	pictures.addChild(vacation);
	pictures.addChild(family);

	spinner.stop('✓', 'Tree built successfully');

	console.log('\nTree Structure:');
	console.log(tree.toString());

	console.log(`\nTree Statistics:`);
	console.log(`  Height: ${tree.getHeight()}`);
	console.log(`  Total nodes: ${tree.countNodes()}`);
	console.log(`  Leaf nodes: ${tree.getLeaves().length}`);

	// Demonstrate traversals
	spinner.text = 'Performing tree traversals...';
	spinner.start();
	await wait(1500);
	spinner.stop('✓', 'Traversals complete');

	console.log('\nPre-order traversal:');
	const preOrder = [];
	tree.preOrder(tree.root, (node) => preOrder.push(node.value));
	console.log('  ' + preOrder.join(' → '));

	console.log('\nPost-order traversal:');
	const postOrder = [];
	tree.postOrder(tree.root, (node) => postOrder.push(node.value));
	console.log('  ' + postOrder.join(' → '));

	console.log('\nLevel-order traversal:');
	const levelOrder = [];
	tree.levelOrder((node) => levelOrder.push(node.value));
	console.log('  ' + levelOrder.join(' → '));
}

async function demonstrateBinaryTree() {
	console.log('\n=== Binary Tree Demo ===\n');

	const spinner = new Spinner('treeStructure', 'Creating binary tree...');
	spinner.start();
	await wait(1500);

	// Create a binary tree
	const tree = new BinaryTree(1);
	tree.root.left = new BinaryTreeNode(2);
	tree.root.right = new BinaryTreeNode(3);
	tree.root.left.left = new BinaryTreeNode(4);
	tree.root.left.right = new BinaryTreeNode(5);
	tree.root.right.left = new BinaryTreeNode(6);
	tree.root.right.right = new BinaryTreeNode(7);

	spinner.stop('✓', 'Binary tree created');

	console.log('Binary Tree Structure:');
	console.log('        1');
	console.log('       / \\');
	console.log('      2   3');
	console.log('     / \\ / \\');
	console.log('    4  5 6  7');

	console.log(`\nTree height: ${tree.getHeight()}`);

	console.log('\nIn-order traversal (Left-Root-Right):');
	const inOrder = [];
	tree.inOrder(tree.root, (node) => inOrder.push(node.value));
	console.log('  ' + inOrder.join(' → '));

	console.log('\nPre-order traversal (Root-Left-Right):');
	const preOrder = [];
	tree.preOrder(tree.root, (node) => preOrder.push(node.value));
	console.log('  ' + preOrder.join(' → '));

	console.log('\nPost-order traversal (Left-Right-Root):');
	const postOrder = [];
	tree.postOrder(tree.root, (node) => postOrder.push(node.value));
	console.log('  ' + postOrder.join(' → '));
}

async function main() {
	console.log('\x1b[1m\x1b[34m');
	console.log('╔══════════════════════════════════╗');
	console.log('║   Tree Structures Demo          ║');
	console.log('╚══════════════════════════════════╝');
	console.log('\x1b[0m');

	await demonstrateGeneralTree();
	await wait(1000);
	await demonstrateBinaryTree();

	console.log('\n\x1b[32m\x1b[1mAll tree demos completed!\x1b[0m\n');
}

main();
