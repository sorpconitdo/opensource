const path = require('path');
const utils = require('../@tunnckocore/utils/src');

const ROOT = path.dirname(__dirname);
const { exts } = utils.getWorkspacesAndExtensions(ROOT);

module.exports = {
  rootDir: ROOT,
  displayName: 'bundle',
  testMatch: [
    // '<rootDir>/src/index.ts',
    // '<rootDir>/packages/*/src/**/*',
    '<rootDir>/@tunnckocore/*/src/index.js',
    '<rootDir>/@tunnckocore/jest-runner-*/src/runner.js',
    // '<rootDir>/packages/jest-runner-rollup/src/index.js',
    // '<rootDir>/packages/jest-runner-rollup/src/runner.js',
    // '<rootDir>/src/zzz*',
  ],
  testPathIgnorePatterns: [
    /node_modules/.toString(),
    /(?:__)?(?:fixtures?|supports?|shared)(?:__)?/.toString(),
    /.+\/@tunnckocore\/utils\/.+/.toString(),
  ],
  // moduleNameMapper: alias,
  moduleFileExtensions: exts,
  runner: path.join(ROOT, 'packages/jest-runner-rollup/src/index.js'),
};
