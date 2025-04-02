// // App.js
// import React, { useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import LoginScreen from "./screens/LoginScreen";
// import SignUpScreen from "./screens/SignUpScreen";
// import UserInfoScreen from "./screens/UserInfoScreen";
// import UserProfile from "./screens/UserProfile";
// import ProfileScreen from "./screens/ProfileScreen";
// import SettingsScreen from "./screens/SettingsScreen";
// import AccountScreen from "./screens/AccountScreen";
// import NetworkScreen from "./screens/NetworkScreen";
// import EditProfileScreen from "./screens/EditProfileScreen";
// import SearchScreen from "./screens/SearchScreen";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState("Login");

//   useEffect(() => {
//     const checkUser = async () => {
//       const uid = await AsyncStorage.getItem("user_uid");
//       if (uid) {
//         setInitialRoute("UserProfile");
//       }
//       else {
//         setInitialRoute("Login");
//       }
//     };
//     checkUser();
//   }, []);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} />
//         <Stack.Screen name="UserInfo" component={UserInfoScreen} />
//         <Stack.Screen name="UserProfile" component={UserProfile} />
//         <Stack.Screen name="Profile" component={ProfileScreen} />
//         <Stack.Screen name="EditProfile" component={EditProfileScreen} />
//         <Stack.Screen name="Settings" component={SettingsScreen} />
//         <Stack.Screen name="Account" component={AccountScreen} />
//         <Stack.Screen name="Network" component={NetworkScreen} />
//         <Stack.Screen name="Search" component={SearchScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }








import "./polyfills";
import React, { useEffect, useState, useCallback } from "react";

import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import config from "./config";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import UserInfoScreen from "./screens/UserInfoScreen";
// import UserProfile from "./screens/UserProfile";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AccountScreen from "./screens/AccountScreen";
import NetworkScreen from "./screens/NetworkScreen";
import SearchScreen from "./screens/SearchScreen";
import AppleSignIn from "./AppleSignIn"; // Component for Apple Sign In button
import AccountTypeScreen from "./screens/AccountTypeScreen";
const Stack = createNativeStackNavigator();

const GOOGLE_SIGNUP_ENDPOINT =
  "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";
const GOOGLE_SIGNIN_ENDPOINT =
  "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/EVERY-CIRCLE";
const APPLE_SIGNIN_ENDPOINT =
  "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AppleLogin/EVERY-CIRCLE";

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const uid = await AsyncStorage.getItem("user_uid");
      if (uid) setInitialRoute("App");
      setLoading(false);
    };

    const configureGoogle = async () => {
      try {
        await GoogleSignin.configure({
          iosClientId: config.googleClientIds.ios,
          androidClientId: config.googleClientIds.android,
          webClientId: config.googleClientIds.web,
          offlineAccess: true,
        });
        await GoogleSignin.signOut();
      } catch (err) {
        console.error("Google SignIn config error:", err);
      }
    };

    configureGoogle();
    checkUser();
  }, []);




  const signInHandler = useCallback(async (navigation) => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const response = await fetch(`${GOOGLE_SIGNIN_ENDPOINT}/${userInfo.user.email}`);
      const result = await response.json();
      if (result.message === "Correct Email" && result.result?.[0]) {
        const user_uid = result.result[0];
        await AsyncStorage.setItem("user_uid", user_uid);

        const profileResponse = await fetch(`https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/${user_uid}`);
        const fullUser = await profileResponse.json();

        console.log("Full user:", JSON.stringify(fullUser, null, 2));

        navigation.navigate("Profile", { 
          user: {
            ...fullUser,
            user_email: userInfo.user.email,
          },
          profile_uid: fullUser.personal_info?.profile_personal_uid || "",
        }); // your intended screen
      }
    } catch (err) {
      setError(err.message);
      Alert.alert("Sign In Failed", err.message);
    }
  }, []);
  


  const signUpHandler = useCallback(async (navigation) => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const payload = {
        email: userInfo.user.email,
        password: "GOOGLE_LOGIN",
        google_auth_token: tokens.accessToken,
        social_id: userInfo.user.id,
        first_name: userInfo.user.givenName,
        last_name: userInfo.user.familyName,
        profile_picture: userInfo.user.photo,
      };

      const response = await fetch(GOOGLE_SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.user_uid) {
        await AsyncStorage.setItem("user_uid", result.user_uid);
        navigation.navigate("UserInfo"); // your intended screen
      }

    } catch (err) {
      setError(err.message);
      Alert.alert("Sign Up Failed", err.message);
    }
  }, []);

  const handleAppleSignIn = useCallback(async (userInfo, navigation) => {
    try {
      const { user, idToken } = userInfo;
      let userEmail = user.email;
      if (!userEmail && idToken) {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        userEmail = payload?.email || `apple_user_${user.id}@example.com`;
      }
      const response = await fetch(`${GOOGLE_SIGNIN_ENDPOINT}/${userEmail}`);
      const result = await response.json();
      if (result.message === "Correct Email" && result.result?.[0]) {
        await AsyncStorage.setItem("user_uid", result.result[0]);
        navigation.navigate("Profile"); // Or your intended screen
      }
    } catch (err) {
      setError(err.message);
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
        navigation.navigate("UserInfo"); // Or your intended screen
      }
    } catch (err) {
      setError(err.message);
      Alert.alert("Apple Sign Up Failed", err.message);
    }
  }, []); 





  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const HomeScreen = ({ navigation }) => (
    <View style={styles.container}>
      <View style={[styles.circleMain, { backgroundColor: "#FF9500" }]}>
        <Text style={styles.title}>Every Circle</Text>
      </View>
      <View style={styles.circlesContainer}>
        <TouchableOpacity
          style={styles.circleBox}
          onPress={() => navigation.navigate("SignUp")}
        >
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
          onPress={() => navigation.navigate("Login")}
        >
          <View style={[styles.circle, { backgroundColor: "#AF52DE" }]}>
            <Text style={styles.circleText}>Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

 


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Login"
          children={(props) => (
            <LoginScreen
              {...props}
              onGoogleSignIn={() => signInHandler(props.navigation)}
              onAppleSignIn={(userInfo) => handleAppleSignIn(userInfo, props.navigation)}
              onError={setError}
            />
          )}
        />
        <Stack.Screen
          name="SignUp"
          children={(props) => (
            <SignUpScreen
              {...props}
              onGoogleSignUp={() => signUpHandler(props.navigation)}
              onAppleSignUp={(userInfo) => handleAppleSignUp(userInfo, props.navigation)}
              onError={setError}
            />
          )}
        />
        <Stack.Screen name="UserInfo" component={UserInfoScreen} />
        {/* <Stack.Screen name="UserProfile" component={UserProfile} /> */}
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Network" component={NetworkScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        
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
    // padding: 10,
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
});












































































































































// import "./polyfills";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Text, View, Platform, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
// import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
// import config from "./config";
// import MapScreen from "./screens/MapScreen";
// import UserInfoScreen from "./screens/UserInfoScreen";
// import UserProfile from "./screens/UserProfile";
// import SignUpScreen from "./screens/SignUpScreen";
// import LoginScreen from "./screens/LoginScreen";
// import Constants from "expo-constants";
// import AppleSignIn from "./AppleSignIn";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NavigationProvider } from "./contexts/NavigationContext";
// import AppNavigator from "./components/AppNavigator";


// import ProfileScreen from "./screens/ProfileScreen";
// import EditProfileScreen from "./screens/EditProfileScreen";

// const GOOGLE_SIGNUP_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";
// const GOOGLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/EVERY-CIRCLE";
// const APPLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AppleLogin/EVERY-CIRCLE";

// console.log("App.js - Imported config:", config);

// // Get Maps API Key from environment variables and export it for use in other components
// export const mapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
// const mapsApiKeyDisplay = mapsApiKey ? "..." + mapsApiKey.slice(-4) : "Not set";

// export default function App() {
//   const [userInfo, setUserInfo] = useState(null);
//   const [error, setError] = useState(null);
//   const [showSpinner, setShowSpinner] = useState(false);
//   const [signInInProgress, setSignInInProgress] = useState(false);
//   const [showUserInfo, setShowUserInfo] = useState(false);
//   const [showUserProfile, setShowUserProfile] = useState(false);
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [showLogin, setShowLogin] = useState(false);
//   const [appleAuthStatus, setAppleAuthStatus] = useState("Checking...");
//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         console.log("Configuring Google Sign-In...");
//         console.log("Environment:", __DEV__ ? "Development" : "Production");

//         console.log("Using client IDs:", {
//           ios: config.googleClientIds.ios,
//           android: config.googleClientIds.android,
//           web: config.googleClientIds.web,
//         });

//         console.log("Using URL scheme:", config.googleURLScheme);

//         const googleConfig = {
//           iosClientId: config.googleClientIds.ios,
//           androidClientId: config.googleClientIds.android,
//           webClientId: config.googleClientIds.web,
//           offlineAccess: true,
//         };
//         console.log("Google Sign-In configuration:", googleConfig);

//         await GoogleSignin.configure(googleConfig);
//         console.log("Google Sign-In configured successfully");

//         // Sign out any existing user on app start
//         await GoogleSignin.signOut();
//         setUserInfo(null);
//       } catch (error) {
//         console.error("Google Sign-In configuration error:", error);
//         setError(error.message);
//       }
//     };

//     initialize();
//   }, []);

//   const handleSignIn = async (userInfo) => {
//     try {
//       console.log("handleSignIn - userInfo:", userInfo);
//       const { user } = userInfo;
//       const userEmail = user.email;
//       console.log("User email for sign in:", userEmail);

//       // Call the sign-in endpoint
//       const response = await fetch(`${GOOGLE_SIGNIN_ENDPOINT}/${userEmail}`);

//       const result = await response.json();
//       console.log("Sign-in endpoint response:", result);

//       if (result.message === "Correct Email" && result.result && result.result[0]) {
//         const userUid = result.result[0];
//         console.log("Extracted user_uid:", userUid);

//         // Save the user_uid to AsyncStorage
//         await AsyncStorage.setItem("user_uid", userUid);
//         await AsyncStorage.setItem("user_email_id", userEmail);

//         // Update state
//         setUserInfo(userInfo);
//         setShowUserInfo(false); // Don't show UserInfo screen
//         setShowUserProfile(true); // Show UserProfile directly
//         setError(null);
//       } else {
//         throw new Error("Failed to get user_uid from sign-in response");
//       }
//     } catch (error) {
//       console.error("Error in handleSignIn:", error);
//       Alert.alert("Error", "Failed to complete sign in. Please try again.");
//       setError(error.message);
//     }
//   };

//   const handleSignUp = async (userInfo) => {
//     try {
//       const { idToken, user } = userInfo;
//       console.log("User email:", user.email);
//       console.log("User ID:", user.id);

//       // Get tokens
//       const tokens = await GoogleSignin.getTokens();
//       console.log("Retrieved tokens:", tokens);

//       // Create user data payload
//       const userData = {
//         email: user.email,
//         password: "GOOGLE_LOGIN",
//         phone_number: "",
//         google_auth_token: tokens.accessToken,
//         google_refresh_token: tokens.refreshToken || "",
//         social_id: user.id,
//         first_name: user.givenName || "",
//         last_name: user.familyName || "",
//         profile_picture: user.photo || "",
//       };

//       console.log("Sending data to backend:", userData);

//       // Call backend endpoint for Google signup
//       const response = await fetch(GOOGLE_SIGNUP_ENDPOINT, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const result = await response.json();
//       console.log("Backend Signup response:", result);

//       // Handle response
//       if (result.message === "User already exists") {
//         Alert.alert("User Already Exists", "This Google account is already registered. Would you like to log in instead?", [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Log In",
//             onPress: () => signIn(),
//           },
//         ]);
//         return;
//       }

//       // Store user data in AsyncStorage
//       if (result.user_uid) {
//         await AsyncStorage.setItem("user_uid", result.user_uid);
//         await AsyncStorage.setItem("user_email_id", user.email);

//         if (user.givenName || user.familyName) {
//           await AsyncStorage.setItem("user_first_name", user.givenName || "");
//           await AsyncStorage.setItem("user_last_name", user.familyName || "");
//         }

//         // Show UserInfoScreen instead of MapScreen
//         setUserInfo(userInfo);
//         setShowUserInfo(true);
//         setError(null);
//       } else {
//         Alert.alert("Error", "Failed to create account. Please try again. Error 3", [{ text: "OK" }]);
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//       Alert.alert("Error", "Failed to complete sign up. Please try again. Error 4", [{ text: "OK" }]);
//       setError(error.message);
//     }
//   };

//   const handleError = (errorMessage) => {
//     setError(errorMessage);
//   };

//   const signIn = async () => {
//     try {
//       console.log("Starting Google Sign-In process...");
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       console.log("Sign-in successful:", userInfo);
//       handleSignIn(userInfo);
//     } catch (error) {
//       console.error("Sign-in error:", error);
//       handleError(error.message);
//     }
//   };

//   const signUp = async () => {
//     try {
//       console.log("Starting Google Sign-Up process...");
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       console.log("Sign-up successful:", userInfo);
//       handleSignUp(userInfo);
//     } catch (error) {
//       console.error("Sign-up error:", error);
//       handleError(error.message);
//     }
//   };

//   const signOut = async () => {
//     try {
//       console.log("Signing out...");
//       await GoogleSignin.signOut();
//       console.log("Sign-out successful");
//       setUserInfo(null);
//       setError(null);
//       // Reset all screen states to show initial welcome screen
//       setShowUserInfo(false);
//       setShowUserProfile(false);
//       setShowSignUp(false);
//       setShowLogin(false);
//     } catch (error) {
//       console.error("Sign-out error:", error);
//       setError(error.message);
//     }
//   };

//   const handleAppleSignIn = async (userInfo) => {
//     console.log("Apple sign-in called with userInfo:", JSON.stringify(userInfo, null, 2));
//     let result = null;
//     // Set a timeout to reset the sign-in state in case the process hangs
//     const signInTimeoutId = setTimeout(() => {
//       console.log("Apple sign-up timeout - resetting state");
//       setSignInInProgress(false);
//       setShowSpinner(false);
//     }, 30000); // 30 seconds timeout

//     try {
//       setShowSpinner(true);
//       setSignInInProgress(true);

//       // Extract user data from Apple Sign In response
//       const { user, idToken } = userInfo;

//       console.log("Apple User ID:", user.id);
//       console.log("Apple User Email:", user.email);
//       console.log("Apple User Name:", user.name);
//       console.log("Apple ID Token Length:", idToken ? idToken.length : 0);

//       // Extract email from idToken if user.email is null
//       let userEmail = user.email;

//       // If email is null, try to extract it from the idToken, which is a JSON Web Token (JWT)
//       if (!userEmail && idToken) {
//         try {
//           const tokenParts = idToken.split(".");
//           if (tokenParts.length >= 2) {
//             const payload = JSON.parse(atob(tokenParts[1]));
//             if (payload.email) {
//               userEmail = payload.email;
//               console.log("Extracted email from idToken:", userEmail);
//             }
//           }
//         } catch (e) {
//           console.log("Error extracting email from idToken:", e);
//         }
//       }

//       console.log("User email for sign in:", userEmail);

//       // Logic for Apple
//       if (userEmail === null) {
//         console.log("User email is null, calling AppleSignIn Endpoint");
//         const response = await fetch(APPLE_SIGNIN_ENDPOINT, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id: user.id }),
//         });
//         const result = await response.json();
//         console.log("Apple Login endpoint response:", result);
//         return;
//       } else {
//         // Call the sign-in endpoint
//         const response = await fetch(`${GOOGLE_SIGNIN_ENDPOINT}/${userEmail}`);

//         result = await response.json();
//         console.log("Sign-in endpoint response:", result);
//         // console.log("result:", result);
//         // console.log("result.result:", result.result);
//         // console.log("result.result[0]:", result.result[0]);
//       }

//       // console.log("result:", result);
//       // console.log("result.result:", result.result);
//       // console.log("result.result[0]:", result.result[0]);

//       console.log("result.result[0].user_uid:", result.result[0].user_uid);
//       if (result.message === "Correct Email" && result.result && result.result[0]) {
//         const userUid = result.result[0];
//         console.log("Extracted user_uid:", userUid);

//         // Save the user_uid to AsyncStorage
//         await AsyncStorage.setItem("user_uid", userUid);
//         await AsyncStorage.setItem("user_email_id", userEmail);

//         // Update state
//         setUserInfo(userInfo);
//         setShowUserInfo(false); // Don't show UserInfo screen
//         setShowUserProfile(true); // Show UserProfile directly
//         setError(null);
//       } else {
//         throw new Error("Failed to get user_uid from sign-in response");
//       }
//     } catch (error) {
//       console.error("Error in handleAppleSignIn:", error);
//       Alert.alert("Error", "Failed to complete sign in. Please try again.");
//       setError(error.message);
//     }
//   };

//   const handleAppleSignUp = async (userInfo) => {
//     console.log("Apple sign-up called with userInfo:", JSON.stringify(userInfo, null, 2));

//     // Set a timeout to reset the sign-in state in case the process hangs
//     const signInTimeoutId = setTimeout(() => {
//       console.log("Apple sign-up timeout - resetting state");
//       setSignInInProgress(false);
//       setShowSpinner(false);
//     }, 30000); // 30 seconds timeout

//     try {
//       setShowSpinner(true);
//       setSignInInProgress(true);

//       // Extract user data from Apple Sign In response
//       const { user, idToken } = userInfo;

//       console.log("Apple User ID:", user.id);
//       console.log("Apple User Email:", user.email);
//       console.log("Apple User Name:", user.name);
//       console.log("Apple ID Token Length:", idToken ? idToken.length : 0);

//       // Extract email from idToken if user.email is null
//       let userEmail = user.email;

//       // If email is null, try to extract it from the idToken, which is a JSON Web Token (JWT)
//       if (!userEmail && idToken) {
//         try {
//           const tokenParts = idToken.split(".");
//           if (tokenParts.length >= 2) {
//             const payload = JSON.parse(atob(tokenParts[1]));
//             if (payload.email) {
//               userEmail = payload.email;
//               console.log("Extracted email from idToken:", userEmail);
//             }
//           }
//         } catch (e) {
//           console.log("Error extracting email from idToken:", e);
//         }
//       }

//       // If still no email, use a placeholder
//       if (!userEmail) {
//         userEmail = `apple_user_${user.id}@example.com`;
//         console.log("Using placeholder email:", userEmail);
//       }

//       // Create user data payload for backend
//       const userData = {
//         email: userEmail,
//         password: "APPLE_LOGIN",
//         phone_number: "",
//         google_auth_token: idToken,
//         google_refresh_token: "apple",
//         social_id: user.id,
//         first_name: user.name ? user.name.split(" ")[0] : "",
//         last_name: user.name ? user.name.split(" ").slice(1).join(" ") : "",
//         profile_picture: "",
//         login_type: "apple",
//       };

//       console.log("Sending Apple data to backend:", JSON.stringify(userData, null, 2));

//       // Call backend endpoint for Apple signup
//       const response = await fetch(GOOGLE_SIGNUP_ENDPOINT, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const result = await response.json();
//       console.log("Backend response for Apple Sign Up:", JSON.stringify(result, null, 2));

//       // Handle response
//       if (result.message === "User already exists") {
//         // const appleLoginEndpoint = "https://41c664jpz1.execute-api.us-west-1.amazonaws.com/dev/appleLogin";
//         console.log("Calling appleLogin endpoint with ID:", user.id);

//         const loginResponse = await fetch(APPLE_SIGNIN_ENDPOINT, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Access-Control-Allow-Origin": "*",
//           },
//           body: JSON.stringify({ id: user.id }),
//         });

//         const loginData = await loginResponse.json();
//         console.log("Apple Login endpoint response:", loginData);

//         if (loginData?.result?.[0]?.user_uid) {
//           const userData = loginData.result[0];
//           await AsyncStorage.setItem("user_uid", userData.user_uid);
//           await AsyncStorage.setItem("user_email_id", userData.user_email_id || userEmail);
//           setUserInfo(userInfo);
//           setShowUserInfo(false);
//           setShowUserProfile(true);
//           setError(null);
//         } else {
//           Alert.alert("Error", "Failed to login with Apple. Please try again.");
//         }
//       } else if (result.user_uid) {
//         console.log("Storing Apple user data in AsyncStorage - user_uid:", result.user_uid);
//         await AsyncStorage.setItem("user_uid", result.user_uid);
//         await AsyncStorage.setItem("user_email_id", userEmail);

//         if (user.name) {
//           const firstName = user.name.split(" ")[0] || "";
//           const lastName = user.name.split(" ").slice(1).join(" ") || "";
//           await AsyncStorage.setItem("user_first_name", firstName);
//           await AsyncStorage.setItem("user_last_name", lastName);
//         }

//         setUserInfo(userInfo);
//         setShowUserInfo(true);
//         setError(null);
//       } else {
//         Alert.alert("Error", "Failed to create account. Please try again. Error 2");
//       }
//     } catch (error) {
//       console.error("Apple sign-up error:", error);
//       Alert.alert("Error", "Failed to complete Apple sign up. Please try again.");
//       setError(error.message);
//     } finally {
//       clearTimeout(signInTimeoutId);
//       setShowSpinner(false);
//       setSignInInProgress(false);
//     }
//   };

//   const handleUserInfoComplete = () => {
//     setShowUserInfo(false);
//     setShowUserProfile(true);
//   };

//   const handleUserProfileComplete = () => {
//     setShowUserProfile(false);
//   };

//   const handleEditProfile = () => {
//     setShowUserProfile(false);
//     setShowUserInfo(true);
//   };

//   const handleSignUpClick = () => {
//     setShowSignUp(true);
//     setShowLogin(false);
//   };

//   const handleLoginClick = () => {
//     setShowLogin(true);
//     setShowSignUp(false);
//   };

//   // Helper function to extract the last two digits before .apps.googleusercontent.com
//   const getLastTwoDigits = (clientId) => {
//     if (!clientId) return "Not set";

//     // Extract the part before .apps.googleusercontent.com
//     const match = clientId.match(/(.+)\.apps\.googleusercontent\.com$/);
//     if (match) {
//       const idPart = match[1];
//       // Get the last two digits of the ID part
//       return "..." + idPart.slice(-2);
//     }

//     // Fallback if the pattern doesn't match
//     return "..." + clientId.slice(-2);
//   };

//   console.log("Full URL Scheme:", config.googleURLScheme);
//   console.log("URL Scheme exists:", !!config.googleURLScheme);

//   return (
//     <View style={styles.container}>
//       {/* Logic: There are 4 states to track.  
//       ShowUserInfo
//       ShowUserProfile
//       ShowSignUp
//       ShowLogin
//       The App displays different pages depending on which is true.  
//       The Home Page is displayed when userInfo is False (ie no user info) and showSignUp and showLogin are false.
//        */}
//       {!userInfo ? (
//         showSignUp ? (
//           <SignUpScreen
//             onGoogleSignUp={signUp}
//             onAppleSignUp={handleAppleSignUp}
//             onError={handleError}
//             onLoginPress={handleLoginClick}
//             onSignUpSuccess={(userInfo) => {
//               setUserInfo(userInfo);
//               setShowSignUp(false);
//               setShowUserInfo(true);
//             }}
//           />
//         ) : showLogin ? (
//           <LoginScreen
//             onGoogleSignIn={signIn}
//             onAppleSignIn={handleAppleSignIn}
//             onError={handleError}
//             onSignUpPress={handleSignUpClick}
//             onSignInSuccess={(userInfo) => {
//               setUserInfo(userInfo);
//               setShowLogin(false);
//               setShowUserInfo(false); // Don't show UserInfo screen
//               setShowUserProfile(true); // Show UserProfile directly
//             }}
//           />
//         ) : (
//           <>
//             <View style={styles.circlesContainer}>
//               <TouchableOpacity style={styles.circleBox} onPress={handleSignUpClick}>
//                 <View style={[styles.circle, { backgroundColor: "#007AFF" }]}>
//                   <Text style={styles.circleText}>Sign Up</Text>
//                 </View>
//               </TouchableOpacity>
//               <View style={styles.circleBox}>
//                 <View style={[styles.circle, { backgroundColor: "#00C7BE" }]}>
//                   <Text style={styles.circleText}>How It Works</Text>
//                 </View>
//               </View>
//               <TouchableOpacity style={styles.circleBox} onPress={handleLoginClick}>
//                 <View style={[styles.circle, { backgroundColor: "#AF52DE" }]}>
//                   <Text style={styles.circleText}>Login</Text>
//                 </View>
//               </TouchableOpacity>
//               <View style={styles.circleBox}>
//                 <View style={[styles.circle, { backgroundColor: "#FF9500" }]}>
//                   <Text style={styles.circleText}>Every Circle</Text>
//                 </View>
//               </View>
//             </View>
//             <View style={styles.apiKeysContainer}>
//               <Text style={styles.apiKeysTitle}>API Keys (Last 2 Digits):</Text>
//               <Text style={styles.apiKeysText}>iOS: {getLastTwoDigits(config.googleClientIds.ios)}</Text>
//               <Text style={styles.apiKeysText}>Android: {getLastTwoDigits(config.googleClientIds.android)}</Text>
//               <Text style={styles.apiKeysText}>Web: {getLastTwoDigits(config.googleClientIds.web)}</Text>
//               <Text style={styles.apiKeysText}>URL Scheme: {config.googleURLScheme ? "..." + config.googleURLScheme.slice(-2) : "Not set"}</Text>
//               <Text style={styles.apiKeysText}>Maps API: {mapsApiKeyDisplay}</Text>
//               <Text style={styles.apiKeysText}>Apple Auth: {appleAuthStatus}</Text>
//               <Text style={styles.apiKeysText}>Environment: {__DEV__ ? "Development" : "Production"}</Text>
//             </View>
//             {/* Buttons below are for Google and Apple Sign In and Sign Up */}
//             {/* <View style={styles.authContainer}>
//               <Text style={styles.title}>Sign In</Text>
//               {error && <Text style={styles.error}>Error: {error}</Text>}
//               <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={signIn} />
//               <AppleSignIn onSignIn={handleAppleSignIn} onError={handleError} />
//               <Text style={styles.title}>Sign Up</Text>
//               {error && <Text style={styles.error}>Error: {error}</Text>}
//               <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={signUp} />
//               <AppleSignIn onSignIn={handleAppleSignUp} onError={handleError} />
//             </View> */}
//             {showSpinner && (
//               <View style={styles.spinnerContainer}>
//                 <ActivityIndicator size='large' color='#0000ff' />
//               </View>
//             )}
//           </>
//         )
//       ) : showUserInfo ? (
//         <UserInfoScreen onContinue={handleUserInfoComplete} />
//       ) : showUserProfile ? (
//         <NavigationProvider>
//           <AppNavigator onContinue={handleUserProfileComplete} onEdit={handleEditProfile} onLogout={signOut} />
//         </NavigationProvider>
//       ) : (
//         <View style={styles.mainContainer}>
//           <View style={styles.header}>
//             <Text>Welcome {userInfo.user.name}</Text>
//           </View>
//           <MapScreen onLogout={signOut} />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   circlesContainer: {
//     position: "absolute",
//     top: 150,
//     left: 0,
//     right: 0,
//     height: 300,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     padding: 20,
//   },
//   circleBox: {
//     width: 150,
//     height: 150,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   circle: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 10,
//   },
//   circleText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   authContainer: {
//     marginTop: 400,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   googleButton: {
//     width: 192,
//     height: 48,
//     marginTop: 20,
//   },
//   error: {
//     color: "red",
//     marginBottom: 20,
//   },
//   mainContainer: {
//     flex: 1,
//     width: "100%",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#fff",
//   },
//   spinnerContainer: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.8)",
//   },
//   apiKeysContainer: {
//     backgroundColor: "rgba(255, 255, 255, 0.8)",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     position: "absolute",
//     top: "60%", // Position below the title
//     width: "90%",
//   },
// });