import fs from 'node:fs/promises';
import path from 'node:path';

const CATEGORY_BASE_DIRECTORIES = new Map([
        ['library', 'libraries'],
        ['workflow', 'workflows'],
        ['nft', 'nfts'],
]);

export const ORGANIC_SEMANTICS_TEMPLATE = Object.freeze({
        name: 'organic-semantics',
        description: 'Mirrored organic semantics layout with core and semantics artifacts.',
        libraries: ['core', 'semantics'],
        workflows: ['core', 'semantics'],
        nfts: ['core', 'semantics'],
        richTreeFallback: true,
});

export const DEFAULT_ORGANIZATION_TEMPLATES = new Map([
        [ORGANIC_SEMANTICS_TEMPLATE.name, ORGANIC_SEMANTICS_TEMPLATE],
]);

function toTemplateMap(templates) {
        if (!templates) {
                return DEFAULT_ORGANIZATION_TEMPLATES;
        }

        if (templates instanceof Map) {
                return templates;
        }

        return new Map(Object.entries(templates));
}

function normalizeTemplate(template, fallbackName) {
        if (!template) {
                return null;
        }

        const {name, description, libraries, workflows, nfts, richTreeFallback} = template;
        const normalizedLibraries = normalizeList(libraries, ['core']);
        const normalizedWorkflows = normalizeList(workflows, normalizedLibraries);
        const normalizedNfts = normalizeList(nfts, normalizedLibraries);
        const resolvedName = name ?? fallbackName ?? 'custom';
        const resolvedDescription = description ?? '';

        return {
                name: resolvedName,
                description: resolvedDescription,
                libraries: normalizedLibraries,
                workflows: normalizedWorkflows,
                nfts: normalizedNfts,
                richTreeFallback: richTreeFallback !== undefined ? Boolean(richTreeFallback) : true,
        };
}

function resolveTemplate(templateName, templates) {
        if (!templateName) {
                return null;
        }

        const templateMap = toTemplateMap(templates);
        const template = templateMap.get(templateName);
        if (!template) {
                throw new Error(`Unknown organization template: ${templateName}`);
        }

        return normalizeTemplate(template, templateName);
}

function normalizeList(value, fallback) {
        if (!value || value.length === 0) {
                return [...fallback];
        }

        return Array.from(new Set(value)).map(item => String(item).trim()).filter(Boolean);
}

function createEntry(root, category, name) {
        const baseDirectory = CATEGORY_BASE_DIRECTORIES.get(category);
        const relativePath = baseDirectory ? path.join(baseDirectory, name) : name;
        return {
                type: 'directory',
                category,
                name,
                path: path.join(root, relativePath),
        };
}

function sortEntryPaths(entries) {
        return [...entries].sort((a, b) => a.path.localeCompare(b.path));
}

function buildMirrorMap(root, libraries, workflows, nfts) {
        const mirrorNames = new Set([
                ...libraries,
                ...workflows,
                ...nfts,
        ]);

        const mirrors = new Map();
        for (const name of mirrorNames) {
                mirrors.set(name, {
                        name,
                        library: path.join(root, CATEGORY_BASE_DIRECTORIES.get('library'), name),
                        workflow: path.join(root, CATEGORY_BASE_DIRECTORIES.get('workflow'), name),
                        nft: path.join(root, CATEGORY_BASE_DIRECTORIES.get('nft'), name),
                });
        }

        return mirrors;
}

function ensureBaseEntries(root) {
        const baseEntries = [];
        for (const [category, directory] of CATEGORY_BASE_DIRECTORIES) {
                baseEntries.push({
                        type: 'directory',
                        category: 'group',
                        name: directory,
                        path: path.join(root, directory),
                });
        }

        return baseEntries;
}

function hierarchyFromEntries(root, entries) {
        const hierarchy = new Map();

        for (const entry of entries) {
                const relativePath = path.relative(root, entry.path);
                if (!relativePath) {
                        continue;
                }

                const parts = relativePath.split(path.sep);
                let currentLevel = hierarchy;
                for (const part of parts) {
                        if (!currentLevel.has(part)) {
                                currentLevel.set(part, new Map());
                        }

                        currentLevel = currentLevel.get(part);
                }
        }

        return hierarchy;
}

function renderHierarchy(hierarchy, options, prefix = '', isLast = true) {
        const {
                connectors: {branch, lastBranch, vertical, spacer},
        } = options;

        const entries = [...hierarchy.entries()].sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
        return entries.map(([name, children], index) => {
                const lastChild = index === entries.length - 1;
                const connector = lastChild ? lastBranch : branch;
                const nextPrefix = prefix + (isLast ? spacer : vertical + '   ');
                const line = `${prefix}${connector} ${name}`;

                if (children.size === 0) {
                        return line;
                }

                const renderedChildren = renderHierarchy(children, options, nextPrefix, lastChild);
                return [line, renderedChildren].flat().join('\n');
        }).join('\n');
}

export function assembleMirroredOrganizationBlueprint({
        root = process.cwd(),
        libraries,
        workflows,
        nfts,
        richTreeFallback,
        template,
        templates,
} = {}) {
        const normalizedRoot = path.resolve(root);
        const resolvedTemplate = template ? resolveTemplate(template, templates) : null;

        const defaultLibraries = resolvedTemplate?.libraries ?? ['core'];
        const normalizedLibraries = normalizeList(libraries, defaultLibraries);

        const defaultWorkflows = resolvedTemplate?.workflows ?? normalizedLibraries;
        const normalizedWorkflows = normalizeList(workflows, defaultWorkflows);

        const defaultNfts = resolvedTemplate?.nfts ?? normalizedLibraries;
        const normalizedNfts = normalizeList(nfts, defaultNfts);

        const normalizedRichTreeFallback =
                richTreeFallback === undefined
                        ? resolvedTemplate?.richTreeFallback ?? true
                        : Boolean(richTreeFallback);

        const baseEntries = ensureBaseEntries(normalizedRoot);
        const blueprintEntries = [...baseEntries];

        for (const name of normalizedLibraries) {
                blueprintEntries.push(createEntry(normalizedRoot, 'library', name));
        }

        for (const name of normalizedWorkflows) {
                blueprintEntries.push(createEntry(normalizedRoot, 'workflow', name));
        }

        for (const name of normalizedNfts) {
                blueprintEntries.push(createEntry(normalizedRoot, 'nft', name));
        }

        const mirrors = buildMirrorMap(normalizedRoot, normalizedLibraries, normalizedWorkflows, normalizedNfts);

        const hierarchy = hierarchyFromEntries(normalizedRoot, blueprintEntries);

        return {
                root: normalizedRoot,
                entries: sortEntryPaths(blueprintEntries),
                mirrors,
                richTreeFallback: normalizedRichTreeFallback,
                hierarchy,
                template: resolvedTemplate?.name ?? null,
                templateDetails: resolvedTemplate,
        };
}

export function renderOrganizationBlueprint(blueprint, {rich = true} = {}) {
        if (!blueprint || typeof blueprint !== 'object') {
                throw new TypeError('A blueprint generated by assembleMirroredOrganizationBlueprint is required.');
        }

        const {hierarchy, root, richTreeFallback} = blueprint;
        const useRichTree = rich || !richTreeFallback;

        const connectors = useRichTree
                ? {branch: '├──', lastBranch: '└──', vertical: '│', spacer: '    '}
                : {branch: '+--', lastBranch: '\\--', vertical: '|', spacer: '   '};

        const header = path.basename(root) || root;
        if (hierarchy.size === 0) {
                return header;
        }

        const rendered = renderHierarchy(hierarchy, {connectors});
        return `${header}\n${rendered}`;
}

export async function materializeOrganizationBlueprint(blueprint, {
        dryRun = true,
        fsPromises = fs,
} = {}) {
        if (!blueprint || typeof blueprint !== 'object') {
                throw new TypeError('A blueprint generated by assembleMirroredOrganizationBlueprint is required.');
        }

        const created = [];
        const skipped = [];

        for (const entry of blueprint.entries) {
                let exists = false;
                try {
                        const stats = await fsPromises.stat(entry.path);
                        exists = stats.isDirectory();
                } catch (error) {
                        if (!error || error.code !== 'ENOENT') {
                                throw error;
                        }
                }

                if (exists) {
                        skipped.push(entry.path);
                        continue;
                }

                if (!dryRun) {
                        await fsPromises.mkdir(entry.path, {recursive: true});
                }

                created.push(entry.path);
        }

        return {
                dryRun,
                created,
                skipped,
        };
}

export function summarizePlannedPaths(blueprint) {
        if (!blueprint || typeof blueprint !== 'object') {
                throw new TypeError('A blueprint generated by assembleMirroredOrganizationBlueprint is required.');
        }

        const summary = {
                total: blueprint.entries.length,
                groups: 0,
                libraries: 0,
                workflows: 0,
                nfts: 0,
        };

        for (const entry of blueprint.entries) {
                if (entry.category === 'group') {
                        summary.groups++;
                } else if (entry.category === 'library') {
                        summary.libraries++;
                } else if (entry.category === 'workflow') {
                        summary.workflows++;
                } else if (entry.category === 'nft') {
                        summary.nfts++;
                }
        }

        return summary;
}
