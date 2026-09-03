#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import {
        assembleMirroredOrganizationBlueprint,
        materializeOrganizationBlueprint,
        renderOrganizationBlueprint,
        summarizePlannedPaths,
} from '../appworld/common/organization.js';

function parseArguments(argv) {
        const options = {
                root: process.cwd(),
                libraries: [],
                workflows: [],
                nfts: [],
                apply: false,
                rich: true,
                template: undefined,
        };

        for (let index = 0; index < argv.length; index++) {
                const value = argv[index];

                if (value === '--root') {
                        options.root = path.resolve(argv[++index] ?? options.root);
                        continue;
                }

                if (value === '--apply') {
                        options.apply = true;
                        continue;
                }

                if (value === '--dry-run') {
                        options.apply = false;
                        continue;
                }

                if (value === '--plain') {
                        options.rich = false;
                        continue;
                }

                if (value === '--rich') {
                        options.rich = true;
                        continue;
                }

                if (value === '--template') {
                        const templateValue = argv[++index];
                        if (templateValue) {
                                options.template = templateValue.trim();
                        }
                        continue;
                }

                if (value === '--library' || value === '--libraries') {
                        const list = argv[++index];
                        if (list) {
                                options.libraries.push(...list.split(',').map(item => item.trim()).filter(Boolean));
                        }

                        continue;
                }

                if (value === '--workflow' || value === '--workflows') {
                        const list = argv[++index];
                        if (list) {
                                options.workflows.push(...list.split(',').map(item => item.trim()).filter(Boolean));
                        }

                        continue;
                }

                if (value === '--nft' || value === '--nfts' || value === '--asset' || value === '--assets') {
                        const list = argv[++index];
                        if (list) {
                                options.nfts.push(...list.split(',').map(item => item.trim()).filter(Boolean));
                        }

                        continue;
                }

                if (value === '--help' || value === '-h') {
                        options.help = true;
                        continue;
                }
        }

        return options;
}

function printHelp() {
        console.log(`Usage: appworld-organize [options]\n\n` +
                `Preview or apply the mirrored AppWorld library/workflow/NFT layout.\n\n` +
                `Options:\n` +
                `  --root <path>          Root directory for the structure (default: cwd)\n` +
                `  --library <names>      Comma separated library names\n` +
                `  --workflow <names>     Comma separated workflow names\n` +
                `  --nft <names>          Comma separated NFT asset names\n` +
                `  --template <name>      Apply a predefined organization template\n` +
                `  --apply                Create directories on disk\n` +
                `  --dry-run              Preview without writing (default)\n` +
                `  --rich                 Render using unicode tree characters (default)\n` +
                `  --plain                Render using ASCII connectors\n` +
                `  -h, --help             Show this message\n`);
}

async function main() {
        const argv = process.argv.slice(2);
        const options = parseArguments(argv);

        if (options.help) {
                printHelp();
                return;
        }

        const blueprint = assembleMirroredOrganizationBlueprint({
                root: options.root,
                libraries: options.libraries,
                workflows: options.workflows,
                nfts: options.nfts,
                richTreeFallback: !options.rich,
                template: options.template,
        });

        const renderedTree = renderOrganizationBlueprint(blueprint, {rich: options.rich});
        const summary = summarizePlannedPaths(blueprint);

        console.log(renderedTree);
        if (blueprint.template) {
                const description = blueprint.templateDetails?.description;
                const label = description ? `${blueprint.template} — ${description}` : blueprint.template;
                console.log('');
                console.log(`Template: ${label}`);
        }
        console.log('');
        console.log(`Libraries: ${summary.libraries}, Workflows: ${summary.workflows}, NFTs: ${summary.nfts}`);

        if (options.apply) {
                const result = await materializeOrganizationBlueprint(blueprint, {dryRun: false});
                console.log('');
                console.log('Materialized paths:');
                for (const directory of result.created) {
                        console.log(`  ${directory}`);
                }
        } else {
                console.log('');
                console.log('Dry run - no directories created. Use --apply to materialize.');
        }
}

main().catch(error => {
        console.error(error);
        process.exitCode = 1;
});
