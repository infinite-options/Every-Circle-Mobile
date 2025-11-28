import { registerRootComponent } from 'expo';

// Check if we're on web and if App fails to load
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

let App;
try {
  App = require('./App').default;
} catch (error) {
  console.error("Failed to load App:", error);
  if (isWeb) {
    // Fallback to test component on web if App fails
    App = require('./TestWeb').default;
  } else {
    throw error;
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
