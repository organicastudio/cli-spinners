/**
 * Graph Isomorphism and Tree Structures Library
 *
 * This library provides:
 * - Graph data structures and utilities
 * - Tree data structures (general and binary trees)
 * - Graph isomorphism detection algorithms
 */

export { Graph } from './graph.js';
export { Tree, TreeNode, BinaryTree, BinaryTreeNode } from './tree.js';
export {
	checkInvariants,
	detectIsomorphism,
	detectIsomorphismOptimized
} from './isomorphism.js';
