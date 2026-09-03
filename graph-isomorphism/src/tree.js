/**
 * Tree Node class
 */
export class TreeNode {
	constructor(value) {
		this.value = value;
		this.children = [];
		this.parent = null;
	}

	/**
	 * Add a child node
	 * @param {TreeNode} child - Child node to add
	 */
	addChild(child) {
		child.parent = this;
		this.children.push(child);
	}

	/**
	 * Remove a child node
	 * @param {TreeNode} child - Child node to remove
	 */
	removeChild(child) {
		const index = this.children.indexOf(child);
		if (index !== -1) {
			this.children.splice(index, 1);
			child.parent = null;
		}
	}

	/**
	 * Check if this node is a leaf
	 * @returns {boolean} True if node is a leaf
	 */
	isLeaf() {
		return this.children.length === 0;
	}

	/**
	 * Check if this node is the root
	 * @returns {boolean} True if node is the root
	 */
	isRoot() {
		return this.parent === null;
	}

	/**
	 * Get the height of the subtree rooted at this node
	 * @returns {number} Height of subtree
	 */
	getHeight() {
		if (this.isLeaf()) {
			return 0;
		}
		return 1 + Math.max(...this.children.map(child => child.getHeight()));
	}

	/**
	 * Get the level (depth) of this node
	 * @returns {number} Level of the node
	 */
	getLevel() {
		let level = 0;
		let current = this;
		while (current.parent) {
			level++;
			current = current.parent;
		}
		return level;
	}
}

/**
 * Tree class (general tree, not binary)
 */
export class Tree {
	constructor(rootValue) {
		this.root = rootValue !== undefined ? new TreeNode(rootValue) : null;
	}

	/**
	 * Get the height of the tree
	 * @returns {number} Height of the tree
	 */
	getHeight() {
		return this.root ? this.root.getHeight() : -1;
	}

	/**
	 * Traverse tree in pre-order (root, children)
	 * @param {TreeNode} node - Starting node
	 * @param {Function} callback - Function to call on each node
	 */
	preOrder(node = this.root, callback) {
		if (!node) return;
		callback(node);
		for (const child of node.children) {
			this.preOrder(child, callback);
		}
	}

	/**
	 * Traverse tree in post-order (children, root)
	 * @param {TreeNode} node - Starting node
	 * @param {Function} callback - Function to call on each node
	 */
	postOrder(node = this.root, callback) {
		if (!node) return;
		for (const child of node.children) {
			this.postOrder(child, callback);
		}
		callback(node);
	}

	/**
	 * Traverse tree level by level (breadth-first)
	 * @param {Function} callback - Function to call on each node
	 */
	levelOrder(callback) {
		if (!this.root) return;

		const queue = [this.root];
		while (queue.length > 0) {
			const node = queue.shift();
			callback(node);
			queue.push(...node.children);
		}
	}

	/**
	 * Find a node by value
	 * @param {*} value - Value to search for
	 * @returns {TreeNode|null} Found node or null
	 */
	find(value) {
		let result = null;
		this.preOrder(this.root, (node) => {
			if (node.value === value) {
				result = node;
			}
		});
		return result;
	}

	/**
	 * Count total nodes in tree
	 * @returns {number} Number of nodes
	 */
	countNodes() {
		let count = 0;
		this.preOrder(this.root, () => count++);
		return count;
	}

	/**
	 * Get all leaf nodes
	 * @returns {Array<TreeNode>} Array of leaf nodes
	 */
	getLeaves() {
		const leaves = [];
		this.preOrder(this.root, (node) => {
			if (node.isLeaf()) {
				leaves.push(node);
			}
		});
		return leaves;
	}

	/**
	 * Print tree structure
	 * @param {TreeNode} node - Starting node
	 * @param {string} prefix - Prefix for indentation
	 * @param {boolean} isLast - Whether this is the last child
	 * @returns {string} String representation
	 */
	toString(node = this.root, prefix = '', isLast = true) {
		if (!node) return 'Empty tree';

		let result = prefix + (isLast ? '└── ' : '├── ') + node.value + '\n';
		const children = node.children;

		for (let i = 0; i < children.length; i++) {
			const isLastChild = i === children.length - 1;
			const newPrefix = prefix + (isLast ? '    ' : '│   ');
			result += this.toString(children[i], newPrefix, isLastChild);
		}

		return result;
	}
}

/**
 * Binary Tree Node class
 */
export class BinaryTreeNode {
	constructor(value) {
		this.value = value;
		this.left = null;
		this.right = null;
		this.parent = null;
	}

	/**
	 * Check if this node is a leaf
	 * @returns {boolean} True if node is a leaf
	 */
	isLeaf() {
		return !this.left && !this.right;
	}
}

/**
 * Binary Tree class
 */
export class BinaryTree {
	constructor(rootValue) {
		this.root = rootValue !== undefined ? new BinaryTreeNode(rootValue) : null;
	}

	/**
	 * In-order traversal (left, root, right)
	 * @param {BinaryTreeNode} node - Starting node
	 * @param {Function} callback - Function to call on each node
	 */
	inOrder(node = this.root, callback) {
		if (!node) return;
		this.inOrder(node.left, callback);
		callback(node);
		this.inOrder(node.right, callback);
	}

	/**
	 * Pre-order traversal (root, left, right)
	 * @param {BinaryTreeNode} node - Starting node
	 * @param {Function} callback - Function to call on each node
	 */
	preOrder(node = this.root, callback) {
		if (!node) return;
		callback(node);
		this.preOrder(node.left, callback);
		this.preOrder(node.right, callback);
	}

	/**
	 * Post-order traversal (left, right, root)
	 * @param {BinaryTreeNode} node - Starting node
	 * @param {Function} callback - Function to call on each node
	 */
	postOrder(node = this.root, callback) {
		if (!node) return;
		this.postOrder(node.left, callback);
		this.postOrder(node.right, callback);
		callback(node);
	}

	/**
	 * Get height of tree
	 * @param {BinaryTreeNode} node - Starting node
	 * @returns {number} Height of tree
	 */
	getHeight(node = this.root) {
		if (!node) return -1;
		return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
	}
}
