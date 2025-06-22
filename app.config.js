const path = require("path");
const { config } = require("dotenv");

// Load the environment variables from .env file
config({ path: path.resolve(__dirname, ".env") });

module.exports = ({ config: expoConfig }) => ({
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "EveryCircle",
    slug: process.env.EXPO_PUBLIC_APP_SLUG || "everycircle",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER || "com.infiniteoptions.everycircle",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME || "com.googleusercontent.apps.255320444536-fjgkn445u968bhsp7i57fpqquemqbmn5"
            ],
            CFBundleURLName: "google",
          },
        ],
        NSLocationWhenInUseUsageDescription: "This app needs access to location to show it on the map.",
        NSLocationAlwaysUsageDescription: "This app needs access to location to show it on the map.",
      },
      config: {
        usesNonExemptEncryption: false,
        googleServicesFile: "./GoogleService-Info.plist", // Add this if you have it
      },
      usesAppleSignIn: true,
      buildNumber: "1",
      deploymentTarget: "13.0",
    },
    android: {
      package: process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER || "com.infiniteoptions.everycircle",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION", 
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAPoq8L-jM4diZmj80ayQj6_8Gd8z5XwJY",
        },
      },
      buildToolsVersion: "34.0.0",
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 24,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    scheme: process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME || "com.googleusercontent.apps.255320444536-fjgkn445u968bhsp7i57fpqquemqbmn5",
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME || "com.googleusercontent.apps.255320444536-fjgkn445u968bhsp7i57fpqquemqbmn5",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
          android: {
            extraProguardRules: "-keep class com.google.android.gms.maps.** { *; }",
            gradleProperties: {
              MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAPoq8L-jM4diZmj80ayQj6_8Gd8z5XwJY",
            },
          },
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      "expo-font",
      // Add Apple Sign In plugin if you're using it
      "expo-apple-authentication",
    ],
    extra: {
      eas: {
        projectId: "41f75dab-7e42-4a6c-99dd-afa123482c34",
      },
      androidClientIdDebug: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID_DEBUG || "255320444536-4qnfvi5bl76dq5gih0qo6dg580sb5g6j.apps.googleusercontent.com",
      androidClientIdRelease: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID_RELEASE || "255320444536-4qnfvi5bl76dq5gih0qo6dg580sb5g6j.apps.googleusercontent.com",
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "255320444536-fjgkn445u968bhsp7i57fpqquemqbmn5.apps.googleusercontent.com",
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "255320444536-hg6bgpsso4gn08mefu87qpti02fmd0s2.apps.googleusercontent.com",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAPoq8L-jM4diZmj80ayQj6_8Gd8z5XwJY",
      appleServicesId: process.env.EXPO_PUBLIC_APPLE_SERVICES_ID || "com.infiniteoptions.everycircle.signin",
    },
  },
});