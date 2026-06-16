// Babel configuration.
//
// The `react-native-worklets/plugin` is REQUIRED by react-native-reanimated v4
// (which expo-router uses for navigation animations). Without it the app runs
// fine in Expo Go but CRASHES ON LAUNCH in a real/standalone build, because the
// animation engine isn't initialized. The worklets plugin MUST be listed last.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
