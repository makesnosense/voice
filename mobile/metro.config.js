const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const mobileProjectRoot = __dirname;
const monorepoRoot = path.resolve(mobileProjectRoot, '..');

const config = {
  watchFolders: [path.resolve(monorepoRoot, 'shared')],
  resolver: {
    blockList: new RegExp(`${monorepoRoot}/shared/node_modules/.*`),
    nodeModulesPaths: [path.resolve(mobileProjectRoot, 'node_modules')],
  },
};

module.exports = mergeConfig(getDefaultConfig(mobileProjectRoot), config);
