/**
 * Graph Isomorphism Detection
 *
 * Two graphs G1 and G2 are isomorphic if there exists a bijection f: V1 -> V2
 * such that vertices u and v are adjacent in G1 if and only if f(u) and f(v)
 * are adjacent in G2.
 */

/**
 * Check if two graphs have the same invariants
 * These are necessary (but not sufficient) conditions for isomorphism
 * @param {Graph} g1 - First graph
 * @param {Graph} g2 - Second graph
 * @returns {Object} Object with result and details
 */
export function checkInvariants(g1, g2) {
	const checks = {
		vertexCount: g1.getVertexCount() === g2.getVertexCount(),
		edgeCount: g1.getEdgeCount() === g2.getEdgeCount(),
		degreeSequence: JSON.stringify(g1.getDegreeSequence()) === JSON.stringify(g2.getDegreeSequence()),
	};

	const allPass = Object.values(checks).every(v => v);

	return {
		isomorphismPossible: allPass,
		checks,
		details: {
			g1: {
				vertices: g1.getVertexCount(),
				edges: g1.getEdgeCount(),
				degrees: g1.getDegreeSequence(),
			},
			g2: {
				vertices: g2.getVertexCount(),
				edges: g2.getEdgeCount(),
				degrees: g2.getDegreeSequence(),
			}
		}
	};
}

/**
 * Generate all permutations of an array
 * @param {Array} arr - Input array
 * @returns {Array<Array>} All permutations
 */
function permute(arr) {
	if (arr.length <= 1) return [arr];
	const result = [];

	for (let i = 0; i < arr.length; i++) {
		const current = arr[i];
		const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
		const perms = permute(remaining);

		for (const perm of perms) {
			result.push([current, ...perm]);
		}
	}

	return result;
}

/**
 * Check if a mapping preserves adjacency
 * @param {Graph} g1 - First graph
 * @param {Graph} g2 - Second graph
 * @param {Map} mapping - Vertex mapping from g1 to g2
 * @returns {boolean} True if mapping preserves adjacency
 */
function isValidMapping(g1, g2, mapping) {
	const vertices1 = Array.from(g1.vertices);

	// Check all edges in g1
	for (const v1 of vertices1) {
		for (const v2 of vertices1) {
			const adjacent1 = g1.areAdjacent(v1, v2);
			const adjacent2 = g2.areAdjacent(mapping.get(v1), mapping.get(v2));

			if (adjacent1 !== adjacent2) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Detect if two graphs are isomorphic using brute force
 * WARNING: This has factorial time complexity - only suitable for small graphs
 * @param {Graph} g1 - First graph
 * @param {Graph} g2 - Second graph
 * @param {Object} options - Options object
 * @returns {Object} Result with isomorphism status and mapping
 */
export function detectIsomorphism(g1, g2, options = {}) {
	const { maxVertices = 10, onProgress = null } = options;

	// First check invariants
	const invariantCheck = checkInvariants(g1, g2);
	if (!invariantCheck.isomorphismPossible) {
		return {
			isIsomorphic: false,
			reason: 'Invariants do not match',
			invariantCheck,
			mapping: null,
		};
	}

	// Check if graphs are too large for brute force
	const n = g1.getVertexCount();
	if (n > maxVertices) {
		return {
			isIsomorphic: null,
			reason: `Graph too large (${n} vertices > ${maxVertices} max). Use specialized algorithms.`,
			invariantCheck,
			mapping: null,
		};
	}

	// Get vertices as arrays
	const vertices1 = Array.from(g1.vertices);
	const vertices2 = Array.from(g2.vertices);

	// Try all permutations of vertices2
	const permutations = permute(vertices2);
	let checkedCount = 0;

	for (const perm of permutations) {
		checkedCount++;

		// Create mapping
		const mapping = new Map();
		for (let i = 0; i < vertices1.length; i++) {
			mapping.set(vertices1[i], perm[i]);
		}

		// Report progress
		if (onProgress) {
			onProgress({
				checked: checkedCount,
				total: permutations.length,
				percentage: (checkedCount / permutations.length * 100).toFixed(1),
			});
		}

		// Check if this mapping works
		if (isValidMapping(g1, g2, mapping)) {
			return {
				isIsomorphic: true,
				mapping: Object.fromEntries(mapping),
				invariantCheck,
				permutationsChecked: checkedCount,
			};
		}
	}

	return {
		isIsomorphic: false,
		reason: 'No valid mapping found after checking all permutations',
		invariantCheck,
		mapping: null,
		permutationsChecked: checkedCount,
	};
}

/**
 * Optimized isomorphism detection with early pruning
 * Groups vertices by degree and only permutes within groups
 * @param {Graph} g1 - First graph
 * @param {Graph} g2 - Second graph
 * @param {Object} options - Options object
 * @returns {Object} Result with isomorphism status and mapping
 */
export function detectIsomorphismOptimized(g1, g2, options = {}) {
	const { maxVertices = 12, onProgress = null } = options;

	// First check invariants
	const invariantCheck = checkInvariants(g1, g2);
	if (!invariantCheck.isomorphismPossible) {
		return {
			isIsomorphic: false,
			reason: 'Invariants do not match',
			invariantCheck,
			mapping: null,
		};
	}

	const n = g1.getVertexCount();
	if (n > maxVertices) {
		return {
			isIsomorphic: null,
			reason: `Graph too large (${n} vertices > ${maxVertices} max)`,
			invariantCheck,
			mapping: null,
		};
	}

	// Group vertices by degree
	const degreeGroups1 = new Map();
	const degreeGroups2 = new Map();

	for (const v of g1.vertices) {
		const degree = g1.getDegree(v);
		if (!degreeGroups1.has(degree)) {
			degreeGroups1.set(degree, []);
		}
		degreeGroups1.get(degree).push(v);
	}

	for (const v of g2.vertices) {
		const degree = g2.getDegree(v);
		if (!degreeGroups2.has(degree)) {
			degreeGroups2.set(degree, []);
		}
		degreeGroups2.get(degree).push(v);
	}

	// Verify degree groups match
	if (degreeGroups1.size !== degreeGroups2.size) {
		return {
			isIsomorphic: false,
			reason: 'Different number of degree groups',
			invariantCheck,
			mapping: null,
		};
	}

	// Generate permutations within degree groups
	function* generateMappings(degrees, index, currentMapping) {
		if (index === degrees.length) {
			yield new Map(currentMapping);
			return;
		}

		const degree = degrees[index];
		const group1 = degreeGroups1.get(degree);
		const group2 = degreeGroups2.get(degree);
		const perms = permute(group2);

		for (const perm of perms) {
			const newMapping = new Map(currentMapping);
			for (let i = 0; i < group1.length; i++) {
				newMapping.set(group1[i], perm[i]);
			}
			yield* generateMappings(degrees, index + 1, newMapping);
		}
	}

	const degrees = Array.from(degreeGroups1.keys());
	let checkedCount = 0;

	for (const mapping of generateMappings(degrees, 0, new Map())) {
		checkedCount++;

		if (onProgress && checkedCount % 100 === 0) {
			onProgress({ checked: checkedCount });
		}

		if (isValidMapping(g1, g2, mapping)) {
			return {
				isIsomorphic: true,
				mapping: Object.fromEntries(mapping),
				invariantCheck,
				permutationsChecked: checkedCount,
				optimized: true,
			};
		}
	}

	return {
		isIsomorphic: false,
		reason: 'No valid mapping found',
		invariantCheck,
		mapping: null,
		permutationsChecked: checkedCount,
		optimized: true,
	};
}
