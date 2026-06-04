/**
 * Graph Isomorphism and Tree Structures Library
 *
 * This library provides:
 * - Graph data structures and utilities
 * - Tree data structures (general and binary trees)
 * - Graph isomorphism detection algorithms
 * - Advanced graph algorithms (Dijkstra, Prim's MST)
 */

export { Graph } from './graph.js';
export { Tree, TreeNode, BinaryTree, BinaryTreeNode } from './tree.js';
export {
	checkInvariants,
	detectIsomorphism,
	detectIsomorphismOptimized
} from './isomorphism.js';
export { WeightedGraph } from './weighted-graph.js';
export {
	dijkstra,
	getPath,
	getAllPaths,
	formatResults as formatDijkstraResults
} from './dijkstra.js';
export {
	prim,
	formatMST,
	visualizeMST
} from './prim.js';
