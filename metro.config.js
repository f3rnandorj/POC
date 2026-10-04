const path = require("path");

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// React Native ships `@react-native/virtualized-lists` importing this subpath of its own
// `react-native` package, and `react-native`'s `exports` map never declares it. Metro still
// finds the file — it falls back to file-based resolution — but warns on every bundle. Pointing
// the one specifier straight at the file skips the lookup that produces the warning, and nothing
// else changes resolution. Still undeclared in 0.88.0-rc.3; drop this once `exports` in
// `node_modules/react-native/package.json` covers `./src/private/*`.
const UNDECLARED_SUBPATH =
  "react-native/src/private/featureflags/ReactNativeFeatureFlags";

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === UNDECLARED_SUBPATH) {
        return {
          type: "sourceFile",
          filePath: require.resolve(
            path.join(__dirname, "node_modules", UNDECLARED_SUBPATH),
          ),
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
