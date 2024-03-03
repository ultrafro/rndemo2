// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  transformer: { ...config.transformer, allowOptionalDependencies: true },
  resolver: {
    ...config.resolver,
    assetExts: [
      ...config.resolver.assetExts,
      "db",
      "mp3",
      "ttf",
      "obj",
      "png",
      "jpg",
      "yarn",
      "txt",
    ],
  },
};
