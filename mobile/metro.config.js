const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const mobileProjectRoot = __dirname;

const monorepoRoot = path.resolve(mobileProjectRoot, '..');

const config = {
  watchFolders: [path.resolve(monorepoRoot, 'shared')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

module.exports = mergeConfig(getDefaultConfig(mobileProjectRoot), config);
