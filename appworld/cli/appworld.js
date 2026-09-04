#!/usr/bin/env node
import process from 'node:process';
import {runOrganize} from './organize.js';

async function main() {
        const [, , command, ...rest] = process.argv;

        if (!command || command === '--help' || command === '-h') {
                process.stdout.write(`Usage: appworld <command> [options]\n\n`);
                process.stdout.write(`Commands:\n`);
                process.stdout.write(`  organize   Preview or materialize the appworld organic layout.\n`);
                process.stdout.write(`\nUse "appworld organize --help" for organizer specific options.\n`);
                return;
        }

        if (command === 'organize') {
                if (rest.includes('--help')) {
                        process.stdout.write(`Usage: appworld organize [--apply] [--rich] [--base=name] [--libraries=a,b] [--workflows=a,b] [--nfts=a,b] [--cwd=path]\n`);
                        process.stdout.write(`\nPreview the planned tree by default or create it with --apply.\n`);
                        return;
                }

                await runOrganize(rest);
                return;
        }

        process.stderr.write(`Unknown command: ${command}\n`);
        process.exitCode = 1;
}

await main();
