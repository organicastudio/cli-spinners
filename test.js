import test from 'ava';
import stringLength from 'string-length';
import os from 'node:os';
import path from 'node:path';
import {promises as fs} from 'node:fs';
import cliSpinners, {randomSpinner} from './index.js';
import {
        buildOrganizationBlueprint,
        listBlueprintPaths,
        materializeBlueprint,
} from './appworld/common.js';

function mockMathRandom(fixedResult) {
        unMockMathRandom();
        const originalImplementation = Math.random;
        Math.random = () => fixedResult;
        Math.random.originalImplementation = originalImplementation;
}

function unMockMathRandom() {
        if (Math.random.originalImplementation) {
                Math.random = Math.random.originalImplementation;
        }
}

async function withTempDir(callback) {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'appworld-'));
        try {
                await callback(directory);
        } finally {
                await fs.rm(directory, {recursive: true, force: true});
        }
}

console.log('Spinner count:', Object.keys(cliSpinners).length);

test('main', t => {
        t.is(typeof cliSpinners, 'object');
        t.is(cliSpinners.dots.interval, 80);
        t.true(Array.isArray(cliSpinners.dots.frames));
});

test('constant width', t => {
        for (const key of Object.keys(cliSpinners)) {
                const {
                        [key]: {
                                frames,
                                frames: [
                                        firstFrame,
                                ],
                        },
                } = cliSpinners;

                const firstFrameLength = stringLength(firstFrame);

                t.true(frames.every(frame => stringLength(frame) === firstFrameLength));
        }
});

test('randomSpinner()', t => {
        const spinnersList = Object.values(cliSpinners);

        // Should always return an item from the spinners list.
        t.true(spinnersList.includes(randomSpinner()));

        // Should return the first spinner when `Math.random()` is the minimum value.
        mockMathRandom(0);
        t.is(randomSpinner(), spinnersList[0]);

        mockMathRandom(0.99);
        // Should return the last spinner when `Math.random()` is the maximum value.
        t.is(randomSpinner(), spinnersList.at(-1));

        unMockMathRandom();
});

const sortStrings = values => [...values].sort();

test('organization blueprint mirrors templates across artifacts', t => {
        const blueprint = buildOrganizationBlueprint({
                libraries: ['core', 'shared'],
                workflows: ['deploy'],
                nftCollections: ['stellar'],
        });

        const libraryGroup = blueprint.root.children.find(child => child.name === 'libraries');
        t.truthy(libraryGroup);
        t.is(libraryGroup.children.length, 2);
        const [firstLibrary, secondLibrary] = libraryGroup.children;
        t.deepEqual(sortStrings(firstLibrary.children.map(child => child.name)), sortStrings(secondLibrary.children.map(child => child.name)));

        const workflowGroup = blueprint.root.children.find(child => child.name === 'workflows');
        t.truthy(workflowGroup);
        t.is(workflowGroup.children.length, 1);
        t.true(workflowGroup.children[0].children.length > 0);

        const nftGroup = blueprint.root.children.find(child => child.name === 'nfts');
        t.truthy(nftGroup);
        t.is(nftGroup.children.length, 1);
        t.true(nftGroup.children[0].children.length > 0);
});

test('materializeBlueprint dry-run reports every planned directory', async t => {
        const blueprint = buildOrganizationBlueprint({
                libraries: ['core'],
                workflows: ['deploy'],
                nftCollections: ['stellar'],
        });

        const result = await materializeBlueprint(blueprint, {dryRun: true});
        t.deepEqual(sortStrings(result.created), sortStrings(listBlueprintPaths(blueprint)));
        t.true(result.dryRun);
});

test('materializeBlueprint is idempotent when applied repeatedly', async t => {
        const blueprint = buildOrganizationBlueprint({
                libraries: ['core'],
                workflows: ['deploy'],
                nftCollections: ['stellar'],
        });

        await withTempDir(async directory => {
                const first = await materializeBlueprint(blueprint, {cwd: directory, dryRun: false});
                t.true(first.created.length > 0);
                t.is(first.skipped.length, 0);

                const second = await materializeBlueprint(blueprint, {cwd: directory, dryRun: false});
                t.is(second.created.length, 0);
                t.deepEqual(sortStrings(second.skipped), sortStrings(first.planned));
        });
});
