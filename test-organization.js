import test from 'ava';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
        assembleMirroredOrganizationBlueprint,
        renderOrganizationBlueprint,
        materializeOrganizationBlueprint,
        summarizePlannedPaths,
        ORGANIC_SEMANTICS_TEMPLATE,
} from './appworld/common/organization.js';

function uniqueTempDir() {
        return fs.mkdtemp(path.join(os.tmpdir(), 'appworld-org-'));
}

test('assembleMirroredOrganizationBlueprint creates mirrored entries', t => {
        const blueprint = assembleMirroredOrganizationBlueprint({
                root: '/virtual/appworld',
                libraries: ['core', 'stories'],
                workflows: ['core'],
                nfts: ['core', 'collectibles'],
        });

        t.is(blueprint.entries.filter(entry => entry.category === 'library').length, 2);
        t.is(blueprint.entries.filter(entry => entry.category === 'workflow').length, 1);
        t.is(blueprint.entries.filter(entry => entry.category === 'nft').length, 2);

        const coreMirror = blueprint.mirrors.get('core');
        t.truthy(coreMirror);
        t.is(coreMirror.library, path.join('/virtual/appworld', 'libraries', 'core'));
        t.is(coreMirror.workflow, path.join('/virtual/appworld', 'workflows', 'core'));
        t.is(coreMirror.nft, path.join('/virtual/appworld', 'nfts', 'core'));

        const summary = summarizePlannedPaths(blueprint);
        t.deepEqual(summary, {
                total: blueprint.entries.length,
                groups: 3,
                libraries: 2,
                workflows: 1,
                nfts: 2,
        });
});

test('assembleMirroredOrganizationBlueprint supports templates', t => {
        const blueprint = assembleMirroredOrganizationBlueprint({
                root: '/virtual/appworld',
                template: ORGANIC_SEMANTICS_TEMPLATE.name,
        });

        t.is(blueprint.template, ORGANIC_SEMANTICS_TEMPLATE.name);
        t.deepEqual(blueprint.templateDetails?.libraries ?? [], ORGANIC_SEMANTICS_TEMPLATE.libraries);
        t.true(blueprint.entries.some(entry => entry.path.endsWith(path.join('libraries', 'semantics'))));
        t.true(blueprint.entries.some(entry => entry.path.endsWith(path.join('workflows', 'semantics'))));
        t.true(blueprint.entries.some(entry => entry.path.endsWith(path.join('nfts', 'semantics'))));
});

test('assembleMirroredOrganizationBlueprint rejects unknown templates', t => {
        t.throws(() => {
                assembleMirroredOrganizationBlueprint({
                        root: '/virtual/appworld',
                        template: 'unknown-template',
                });
        }, {message: /Unknown organization template/});
});

test('renderOrganizationBlueprint falls back to ASCII connectors when requested', t => {
        const blueprint = assembleMirroredOrganizationBlueprint({
                root: '/virtual/appworld',
                libraries: ['core'],
        });

        const rendered = renderOrganizationBlueprint(blueprint, {rich: false});
        t.true(rendered.includes('+-- libraries'));
        t.true(rendered.includes('\\-- core'));
});

test('materializeOrganizationBlueprint dry run reports planned paths without creating them', async t => {
        const root = await uniqueTempDir();
        const blueprint = assembleMirroredOrganizationBlueprint({root, libraries: ['core']});
        const result = await materializeOrganizationBlueprint(blueprint, {dryRun: true});

        t.true(result.dryRun);
        t.is(result.skipped.length, 0);
        t.true(result.created.length >= 3);
        await t.throwsAsync(fs.access(path.join(root, 'libraries')));
});

test('materializeOrganizationBlueprint is idempotent when applied repeatedly', async t => {
        const root = await uniqueTempDir();
        const blueprint = assembleMirroredOrganizationBlueprint({root, libraries: ['core'], workflows: ['core'], nfts: ['core']});

        const firstRun = await materializeOrganizationBlueprint(blueprint, {dryRun: false});
        t.true(firstRun.created.length >= 4);
        t.is(firstRun.skipped.length, 0);

        for (const entry of blueprint.entries) {
                const stats = await fs.stat(entry.path);
                t.true(stats.isDirectory());
        }

        const secondRun = await materializeOrganizationBlueprint(blueprint, {dryRun: false});
        t.is(secondRun.created.length, 0);
        t.is(secondRun.skipped.length, blueprint.entries.length);
});
