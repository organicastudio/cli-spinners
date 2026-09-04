import process from 'node:process';
import path from 'node:path';
import {
        buildOrganizationBlueprint,
        renderBlueprintTree,
        materializeBlueprint,
        summarizeMaterialization,
        listBlueprintPaths,
} from '../organization.js';

function parseList(value) {
        if (!value) {
                return [];
        }

        return value
                .split(',')
                .map(part => part.trim())
                .filter(Boolean);
}

function parseArgs(argv) {
        const args = {
                apply: false,
                base: 'appworld',
                libraries: [],
                workflows: [],
                nfts: [],
                cwd: process.cwd(),
                rich: false,
        };

        for (const raw of argv) {
                if (raw === '--apply') {
                        args.apply = true;
                        continue;
                }

                if (raw === '--rich') {
                        args.rich = true;
                        continue;
                }

                const [flag, value] = raw.split('=');
                switch (flag) {
                case '--base':
                        args.base = value ?? args.base;
                        break;
                case '--cwd':
                        args.cwd = value ? path.resolve(value) : args.cwd;
                        break;
                case '--libraries':
                        args.libraries = parseList(value);
                        break;
                case '--workflows':
                        args.workflows = parseList(value);
                        break;
                case '--nfts':
                        args.nfts = parseList(value);
                        break;
                default:
                        throw new Error(`Unknown argument: ${raw}`);
                }
        }

        return args;
}

function defaultRichFormatter(node) {
        return node.children.length > 0 ? `[dir] ${node.path}` : node.path;
}

export async function runOrganize(argv) {
        const options = parseArgs(argv);
        const blueprint = buildOrganizationBlueprint({
                base: options.base,
                libraries: options.libraries,
                workflows: options.workflows,
                nftCollections: options.nfts,
                richFormatter: options.rich ? defaultRichFormatter : undefined,
        });

        if (!options.apply) {
                const tree = renderBlueprintTree(blueprint, {rich: options.rich});
                process.stdout.write(`${tree}\n`);
                const plannedPaths = listBlueprintPaths(blueprint);
                process.stdout.write(`\nPlanned directories: ${plannedPaths.length}\n`);
                return;
        }

        const result = await materializeBlueprint(blueprint, {
                cwd: options.cwd,
                dryRun: false,
                onCreate(relative, absolute) {
                        if (options.rich) {
                                process.stdout.write(`[create] ${relative} -> ${absolute}\n`);
                        } else {
                                process.stdout.write(`created ${relative}\n`);
                        }
                },
        });

        process.stdout.write(`${summarizeMaterialization(result)}\n`);
}
