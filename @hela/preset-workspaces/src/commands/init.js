// SPDX-License-Identifier: MPL-2.0

import path from 'node:path';
import { hela } from '@hela/core';
import fastGlob from 'fast-glob';
import { readJSON, writeJSON, getWorkspaceFile } from '../utils.js';

export default hela()
  .command('init', 'Resolve workspaces and packages information')
  // TODO: Yaro should camelize flags
  .option(
    '--workspace-file',
    'File path to write workspaces metadata',
    'hela-workspace.json',
  )
  .option(
    '--dry-run',
    'Run the command without writing new versions to disk',
    false,
  )
  // eslint-disable-next-line max-statements
  .action(async ({ flags }) => {
    const { workspaces } = await readJSON(path.join(flags.cwd, 'package.json'));
    const workspaceFilePath = getWorkspaceFile(flags);

    // "packages/@tunnckocore/*/package.json", // ! works
    // "projects/@hela/*/package.json", // ! works
    // "@tunnckocore/*/package.json",
    // "@hela/*/package.json",
    // "packages/*/package.json",
    // "configs/*/package.json",
    const stream = fastGlob.stream(
      workspaces.map((workspaceGlob) => `${workspaceGlob}/package.json`),
    );

    const graph = {};

    for await (const pkgJsonPath of stream) {
      const pkgRoot = path.dirname(pkgJsonPath);
      const { name, dependencies = {}, license } = await readJSON(pkgJsonPath);

      graph[name] = {
        name,
        resolved: pkgRoot,
        dependencies,
        license,
      };
    }

    for (const item of Object.values(graph)) {
      const requiredDeps = Object.keys(item.dependencies);
      for (const depName of requiredDeps) {
        if (graph[depName]) {
          graph[depName].dependents = graph[depName].dependents ?? [];
          graph[depName].dependents.push({
            name: item.name,
            resolved: item.resolved,
            dependents: item.dependents,
          });
        }
      }
      delete graph[item.name].dependencies;
    }

    const packages = Object.values(graph);

    const wsFile = {
      __COMMENT__: 'DO NOT EDIT THIS FILE MANUALLY! GENERATED WITH `hela init`',
      version: 1,
      workspaces: workspaces.sort(),
      resolved: packages.map((x) => x.resolved).sort(),
      packages: packages.map((x) => x.name).sort(),
      graph: Object.fromEntries(Object.entries(graph).sort()),
    };

    if (flags.verbose) {
      console.log('Writing workspace data to', workspaceFilePath);
    }

    if (flags.dryRun) {
      console.log('Workspaces resolved data:', JSON.stringify(wsFile, null, 2));
    } else {
      await writeJSON(workspaceFilePath, wsFile);
    }

    return wsFile;
  });
