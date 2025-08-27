import { registerRootComponent } from "expo";

console.log("🚀 INDEX.JS - Starting execution...");

import App from "./App";

console.log("🚀 INDEX.JS - App imported successfully, about to register root component...");

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

console.log("🚀 INDEX.JS - Root component registered, execution complete.");
