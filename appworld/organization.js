import path from 'node:path';
import {promises as fs} from 'node:fs';

const LIBRARY_TEMPLATE = {
        docs: null,
        src: {
                api: null,
                ui: null,
                services: null,
        },
        tests: {
                unit: null,
                integration: null,
        },
};

const WORKFLOW_TEMPLATE = {
	drafts: null,
	published: null,
	archive: null,
	results: null,
	scorings: null,
	outputs: null,
	milestones: null,
	objectives: null,
	targets: null,
	goals: null,
	cost: null,
	'risk-factors': null,
	timing: null,
	hp: null,
	'time-value': null,
	'dok-scoring': null,
};

const NFT_TEMPLATE = {
        assets: {
                art: null,
                previews: null,
        },
        metadata: {
                drafts: null,
                published: null,
        },
        drops: null,
};

function createNode(name, template, parentPath) {
        const nodePath = parentPath ? path.join(parentPath, name) : name;
        const children = [];

        if (template && typeof template === 'object') {
                for (const [childName, childTemplate] of Object.entries(template)) {
                        children.push(createNode(childName, childTemplate, nodePath));
                }
        }

        return {
                type: 'directory',
                name,
                path: nodePath,
                children,
        };
}

function buildGroup(label, items, template, basePath) {
        const children = items.map(item => createNode(item, template, path.join(basePath, label)));
        return {
                type: 'directory',
                name: label,
                path: path.join(basePath, label),
                children,
        };
}

export function buildOrganizationBlueprint({
        base = 'appworld',
        libraries = [],
        workflows = [],
        nftCollections = [],
        richFormatter,
} = {}) {
        const root = {
                type: 'directory',
                name: base,
                path: base,
                children: [
                        buildGroup('libraries', libraries, LIBRARY_TEMPLATE, base),
                        buildGroup('workflows', workflows, WORKFLOW_TEMPLATE, base),
                        buildGroup('nfts', nftCollections, NFT_TEMPLATE, base),
                ],
        };

        return {
                root,
                richFormatter,
        };
}

export function listBlueprintPaths(blueprint, {includeRoot = true} = {}) {
        const paths = [];
        const {root} = blueprint;

        const stack = [{node: root, isRoot: true}];
        while (stack.length > 0) {
                const {node, isRoot} = stack.pop();
                if (!isRoot || includeRoot) {
                        paths.push(node.path);
                }

                for (let index = node.children.length - 1; index >= 0; index -= 1) {
                        stack.push({node: node.children[index], isRoot: false});
                }
        }

        return paths;
}

function renderNode(node, formatter, prefix, isLast, lines) {
        const branch = prefix ? `${prefix}${isLast ? '└── ' : '├── '}` : '';
        const label = formatter ? formatter(node) : node.name;
        lines.push(`${branch}${label}`);

        const nextPrefix = prefix ? `${prefix}${isLast ? '    ' : '│   '}` : '';
        for (const [index, child] of node.children.entries()) {
                renderNode(child, formatter, nextPrefix, index === node.children.length - 1, lines);
        }
}

export function renderBlueprintTree(blueprint, {rich = false} = {}) {
        const lines = [];
        const formatter = rich ? blueprint.richFormatter : undefined;
        renderNode(blueprint.root, formatter, '', true, lines);
        return lines.join('\n');
}

async function ensureParent(directory) {
        const parentDirectory = path.dirname(directory);
        if (parentDirectory && parentDirectory !== directory) {
                await fs.mkdir(parentDirectory, {recursive: true});
        }
}

export async function materializeBlueprint(blueprint, {
        cwd = process.cwd(),
        dryRun = true,
        signal,
        onCreate,
} = {}) {
        const planned = listBlueprintPaths(blueprint);
        const created = [];
        const skipped = [];

        for (const relativePath of planned) {
                if (signal?.aborted) {
                        break;
                }

                const absolutePath = path.resolve(cwd, relativePath);

                if (dryRun) {
                        created.push(relativePath);
                        continue;
                }

                await ensureParent(absolutePath);
                try {
                        await fs.mkdir(absolutePath, {recursive: false});
                        created.push(relativePath);
                        onCreate?.(relativePath, absolutePath);
                } catch (error) {
                        if (error && error.code === 'EEXIST') {
                                skipped.push(relativePath);
                        } else {
                                throw error;
                        }
                }
        }

        return {
                planned,
                created,
                skipped,
                dryRun,
        };
}

export function summarizeMaterialization(result) {
        const summary = [];
        summary.push(`planned directories: ${result.planned.length}`);
        summary.push(`created directories: ${result.created.length}`);
        if (!result.dryRun) {
                summary.push(`skipped directories: ${result.skipped.length}`);
        }

        return summary.join('\n');
}
