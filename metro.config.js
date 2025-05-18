const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'expo-sqlite': path.resolve(__dirname, 'components/emptyModule.js'),
};

module.exports = config;
