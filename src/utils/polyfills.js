// Polyfills for React Native
import { Platform } from 'react-native';

// Add setImmediate polyfill
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = setTimeout;
}

// Add clearImmediate polyfill
if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = clearTimeout;
}

// Add process polyfill
if (typeof global.process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: __DEV__ ? 'development' : 'production',
      PLATFORM: Platform.OS,
    },
  };
}

// Add Buffer polyfill if needed
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Add URL polyfill if needed
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
} 