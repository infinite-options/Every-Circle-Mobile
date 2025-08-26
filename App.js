import "./polyfills";
import React, { useEffect, useState, useCallback } from "react";

import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import config from "./config";
import { API_BASE_URL, GOOGLE_SIGNUP_ENDPOINT, GOOGLE_SIGNIN_ENDPOINT, APPLE_SIGNIN_ENDPOINT } from "./apiConfig";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import UserInfoScreen from "./screens/UserInfoScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AccountScreen from "./screens/AccountScreen";
import NetworkScreen from "./screens/NetworkScreen";
import SearchScreen from "./screens/SearchScreen";
import AppleSignIn from "./AppleSignIn";
import AccountTypeScreen from "./screens/AccountTypeScreen";
import BusinessSetupController from "./screens/BusinessSetupController";
import BusinessProfileScreen from "./screens/BusinessProfileScreen";
import SearchTab from "./screens/SearchTab";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import FilterScreen from "./screens/FilterScreen";
import TermsAndConditionsScreen from "./screens/TermsAndConditionsScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
//import SearchResults from './screens/SearchResults';
import EditBusinessProfileScreen from "./screens/EditBusinessProfileScreen";

const Stack = createNativeStackNavigator();

// API endpoints are now imported from apiConfig.js

export const mapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapsApiKeyDisplay = mapsApiKey ? "..." + mapsApiKey.slice(-4) : "Not set";

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showSpinner, setShowSpinner] = useState(false);
  // const [signInInProgress, setSignInInProgress] = useState(false);
  // const [showUserInfo, setShowUserInfo] = useState(false);
  // const [showUserProfile, setShowUserProfile] = useState(false);
  // const [showSignUp, setShowSignUp] = useState(false);
  // const [showLogin, setShowLogin] = useState(false);
  // const [appleAuthStatus, setAppleAuthStatus] = useState("Checking...");

  useEffect(() => {
    console.log("------- Program Starting in App.js -------");
    const initialize = async () => {
      try {
        // Check user first
        console.log("App.js - Checking if user in AsyncStorage...");
        const uid = await AsyncStorage.getItem("user_uid");
        console.log("App.js - User UID:", uid);
        if (uid) setInitialRoute("App");

        // Configure Google Sign-In
        console.log("App.js - Configuring Google Sign-In...");
        await GoogleSignin.configure({
          iosClientId: config.googleClientIds.ios,
          androidClientId: config.googleClientIds.android,
          webClientId: config.googleClientIds.web,
          offlineAccess: true,
          openIdRealm: config.bundleIdentifier,
        });
        console.log("App.js - Google Sign-In configured successfully");
      } catch (err) {
        console.error("App.js - Google Sign-In Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const signInHandler = useCallback(async (navigation) => {
    console.log("App.js - Google Sign In Pressed - signInHandler - Starting");
    try {
      // First check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

      // Check for Play Services
      await GoogleSignin.hasPlayServices();

      // Start new sign in process
      const userInfo = await GoogleSignin.signIn();
      console.log("App.js - Google Sign In successful:", userInfo);

      const response = await fetch(`${GOOGLE_SIGNIN_ENDPOINT}/${userInfo.user.email}`);
      const result = await response.json();
      console.log("App.js - Google Sign In result:", result);

      if (result.message === "Correct Email" && result.result?.[0]) {
        const user_uid = result.result[0];
        console.log("App.js - User UID (from IO Login API):", user_uid);
        await AsyncStorage.setItem("user_uid", user_uid);

        // const profileResponse = await fetch(`${API_BASE_URL}/api/v1/userprofileinfo/${user_uid}`);
        const endpointPath = `/api/v1/userprofileinfo/${user_uid}`;
        const endpoint = API_BASE_URL + endpointPath;
        console.log(`App.js - Full endpoint: ${endpoint}`);

        const profileResponse = await fetch(endpoint);
        const fullUser = await profileResponse.json();

        console.log("App.js - Endpoint Response:", JSON.stringify(fullUser, null, 2));

        if (fullUser.message === "Profile not found for this user") {
          // Sign out from Google when profile is not found
          await GoogleSignin.signOut();

          Alert.alert("User Not Found", "This account is not registered. Would you like to sign up?", [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                // No need to do anything here as we've already signed out
              },
            },
            {
              text: "Sign Up",
              onPress: () => {
                // Navigate directly to UserInfo with Google user info
                navigation.navigate("UserInfo", {
                  googleUserInfo: {
                    email: userInfo.user.email,
                    firstName: userInfo.user.givenName,
                    lastName: userInfo.user.familyName,
                    profilePicture: userInfo.user.photo,
                    googleId: userInfo.user.id,
                    accessToken: userInfo.idToken,
                  },
                });
              },
            },
          ]);
          return;
        }

        navigation.navigate("Profile", {
          user: {
            ...fullUser,
            user_email: userInfo.user.email,
          },
          profile_uid: fullUser.personal_info?.profile_personal_uid || "",
        });
      } else {
        // Sign out from Google when user is not found
        await GoogleSignin.signOut();

        Alert.alert("User Not Found", "This account is not registered. Would you like to sign up?", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              // No need to do anything here as we've already signed out
            },
          },
          {
            text: "Sign Up",
            onPress: () => {
              // Navigate directly to UserInfo with Google user info
              navigation.navigate("UserInfo", {
                googleUserInfo: {
                  email: userInfo.user.email,
                  firstName: userInfo.user.givenName,
                  lastName: userInfo.user.familyName,
                  profilePicture: userInfo.user.photo,
                  googleId: userInfo.user.id,
                  accessToken: userInfo.idToken,
                },
              });
            },
          },
        ]);
      }
    } catch (err) {
      console.error("App.js - Google Sign In error:", err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        return;
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        // Sign in is in progress already
        Alert.alert("Sign In In Progress", "Please wait for the current sign in process to complete.");
        return;
      }
      Alert.alert("Sign In Failed", "Please try again.");
    }
  }, []);

  const signUpHandler = useCallback(async (navigation) => {
    console.log("App.js - signUpHandler - Google Button Pressed");
    try {
      // Check if already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      console.log("App.js - Is user already signed in?", isSignedIn);

      if (isSignedIn) {
        console.log("App.js - Signing out existing user");
        await GoogleSignin.signOut();
      }

      // Check for Play Services
      console.log("App.js - Checking Play Services");
      await GoogleSignin.hasPlayServices();
      console.log("App.js - Play Services available");

      // Get user info from Google
      console.log("App.js - Starting Google Sign In");
      const userInfo = await GoogleSignin.signIn();
      console.log("App.js - Google Sign In successful");
      console.log("App.js - User Info:", {
        email: userInfo.user.email,
        name: userInfo.user.name,
        givenName: userInfo.user.givenName,
        familyName: userInfo.user.familyName,
        photo: userInfo.user.photo,
        id: userInfo.user.id,
      });

      // Get tokens for backend authentication
      console.log("App.js - Getting tokens");
      const tokens = await GoogleSignin.getTokens();
      console.log("App.js - Tokens received:", {
        accessToken: tokens.accessToken ? "Present" : "Missing",
        idToken: tokens.idToken ? "Present" : "Missing",
      });

      // Create the sign-up payload
      const payload = {
        email: userInfo.user.email,
        password: "GOOGLE_LOGIN",
        google_auth_token: tokens.accessToken,
        social_id: userInfo.user.id,
        first_name: userInfo.user.givenName || "",
        last_name: userInfo.user.familyName || "",
        profile_picture: userInfo.user.photo || "",
      };
      console.log("App.js - Sign up payload prepared:", payload);

      // Make the sign-up request
      console.log("App.js - Making sign-up request");
      const response = await fetch(GOOGLE_SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("App.js - Sign up response:", result);

      if (result.user_uid) {
        console.log("App.js - Sign up successful, storing user data");
        await AsyncStorage.setItem("user_uid", result.user_uid);
        await AsyncStorage.setItem("user_email_id", userInfo.user.email);
        // if (user_uid) {
        //   navigation.navigate("UserInfo");
        // } else {
        //   Alert.alert("Error", "Failed to store user ID. Please try again.");
        // }
      } else if (result.message === "User already exists") {
        console.log("App.js - User already exists");
        Alert.alert("Account Exists", "This Google account is already registered. Please sign in instead.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      } else {
        throw new Error("Failed to create account");
      }
      if (await AsyncStorage.getItem("user_uid")) {
        navigation.navigate("UserInfo");
      } else {
        Alert.alert("Error", "Failed to store user ID. Please try again.");
      }
    } catch (err) {
      console.error("App.js - Google Sign Up error:", err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("App.js - User cancelled the sign-in flow");
        return;
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        console.log("App.js - Sign in already in progress");
        Alert.alert("Sign In In Progress", "Please wait for the current sign in process to complete.", [{ text: "OK" }]);
        return;
      }
      Alert.alert("Sign Up Failed", "Unable to create account. Please try again.", [{ text: "OK" }]);
    }
  }, []);

  const handleAppleSignIn = useCallback(async (userInfo, navigation) => {
    try {
      // console.log("App.js - handleAppleSignIn - userInfo:", userInfo);
      const { user, idToken } = userInfo;
      // console.log("App.js - handleAppleSignIn - user:", user);
      // console.log("App.js - handleAppleSignIn - idToken:", idToken);
      let userEmail = user.email;
      // console.log("App.js - handleAppleSignIn - userEmail:", userEmail);
      if (!userEmail && idToken) {
        // console.log("App.js - handleAppleSignIn - idToken:", idToken);
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        userEmail = payload?.email || `apple_user_${user.id}@example.com`;
        // console.log("App.js - handleAppleSignIn - userEmail:", userEmail);
      }
      // console.log("App.js - handleAppleSignIn - before APPLE_SIGNIN_ENDPOINT:", APPLE_SIGNIN_ENDPOINT);
      const response = await fetch(APPLE_SIGNIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
        }),
      });
      // console.log("App.js - handleAppleSignIn - after APPLE_SIGNIN_ENDPOINT:", response);
      const result = await response.json();
      // console.log("App.js - handleAppleSignIn - result:", result);
      // if (result.message === "Correct Email" && result.result?.[0]) {
      if (result.message === "Successfully executed SQL query." && result.result?.[0]) {
        const userUid = result.result[0].user_uid;
        await AsyncStorage.setItem("user_uid", userUid);
        // console.log("Success", userUid);

        // Get full user profile data
        // const profileResponse = await fetch(`${API_BASE_URL}/api/v1/userprofileinfo/${userUid}`);
        const endpointPath = `/api/v1/userprofileinfo/${userUid}`;
        const endpoint = API_BASE_URL + endpointPath;
        console.log(`App.js - Full endpoint: ${endpoint}`);

        const profileResponse = await fetch(endpoint);
        const fullUser = await profileResponse.json();
        // console.log("App.js - Full user:", JSON.stringify(fullUser, null, 2));

        navigation.navigate("Profile", {
          user: {
            ...fullUser,
            user_email: userEmail,
          },
          profile_uid: fullUser.personal_info?.profile_personal_uid || "",
        });
      }
    } catch (err) {
      setError(err.message);
      console.log("Fail");
      Alert.alert("Apple Sign In Failed", err.message);
    }
  }, []);

  const handleAppleSignUp = useCallback(async (userInfo, navigation) => {
    try {
      const { user, idToken } = userInfo;
      let userEmail = user.email || `apple_user_${user.id}@example.com`;
      const payload = {
        email: userEmail,
        password: "APPLE_LOGIN",
        google_auth_token: idToken,
        google_refresh_token: "apple",
        social_id: user.id,
        first_name: user.name?.split(" ")[0] || "",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        profile_picture: "",
        login_type: "apple",
      };
      const response = await fetch(GOOGLE_SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.user_uid) {
        await AsyncStorage.setItem("user_uid", result.user_uid);
        navigation.navigate("UserInfo");
      }
    } catch (err) {
      setError(err.message);
      Alert.alert("Apple Sign Up Failed", err.message);
    }
  }, []);

  if (loading) {
    console.log("App.js - Showing loading screen");
    return (
      <SafeAreaProvider>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size='large' color='#0000ff' />
        </View>
      </SafeAreaProvider>
    );
  }

  const HomeScreen = ({ navigation }) => {
    console.log("App.js - Rendering HomeScreen");
    return (
      <View style={styles.container}>
        <View style={[styles.circleMain, { backgroundColor: "#FF9500" }]}>
          <Text style={styles.title}>Every Circle</Text>
        </View>
        <View style={styles.circlesContainer}>
          <TouchableOpacity style={styles.circleBox} onPress={() => navigation.navigate("SignUp")}>
            <View style={[styles.circle, { backgroundColor: "#007AFF" }]}>
              <Text style={styles.circleText}>Sign Up</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.circleBox}>
            <View style={[styles.circle, { backgroundColor: "#00C7BE" }]}>
              <Text style={styles.circleText}>How It Works</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.circleBox}
            onPress={() => {
              console.log("App.js - Login Button Pressed");
              navigation.navigate("Login");
            }}
          >
            <View style={[styles.circle, { backgroundColor: "#AF52DE" }]}>
              <Text style={styles.circleText}>Login</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  console.log("App.js - Rendering main App component with initialRoute:", initialRoute);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen
          name='Login'
          children={(props) => (
            <LoginScreen {...props} onGoogleSignIn={() => signInHandler(props.navigation)} onAppleSignIn={(userInfo) => handleAppleSignIn(userInfo, props.navigation)} onError={setError} />
          )}
        />
        <Stack.Screen
          name='SignUp'
          children={(props) => (
            <SignUpScreen {...props} onGoogleSignUp={() => signUpHandler(props.navigation)} onAppleSignUp={(userInfo) => handleAppleSignUp(userInfo, props.navigation)} onError={setError} />
          )}
        />
        <Stack.Screen name='UserInfo' component={UserInfoScreen} />
        {/* <Stack.Screen name="UserProfile" component={UserProfile} /> */}
        <Stack.Screen name='AccountType' component={AccountTypeScreen} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
        <Stack.Screen name='EditProfile' component={EditProfileScreen} />
        <Stack.Screen name='Settings' component={SettingsScreen} />
        <Stack.Screen name='Account' component={AccountScreen} />
        <Stack.Screen name='Network' component={NetworkScreen} />
        <Stack.Screen name='Search' component={SearchScreen} />
        <Stack.Screen name='BusinessSetup' component={BusinessSetupController} />
        <Stack.Screen name='BusinessProfile' component={BusinessProfileScreen} />
        <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
        <Stack.Screen name='Filters' component={FilterScreen} />
        <Stack.Screen name='SearchTab' component={SearchTab} />

        <Stack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} options={{ title: "Terms & Conditions" }} />
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} options={{ title: "Privacy Policy" }} />
        <Stack.Screen name='EditBusinessProfile' component={EditBusinessProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circlesContainer: {
    marginTop: 50,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 20,
  },
  circleBox: {
    margin: 10,
    alignItems: "center",
  },
  circleMain: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  circleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  apiKeysContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    top: "60%",
    width: "90%",
  },
});
