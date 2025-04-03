import "./polyfills";
import React, { useEffect, useState, useCallback } from "react";

import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import config from "./config";
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

const Stack = createNativeStackNavigator();

const GOOGLE_SIGNUP_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";
const GOOGLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/EVERY-CIRCLE";
const APPLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AppleLogin/EVERY-CIRCLE";

export const mapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapsApiKeyDisplay = mapsApiKey ? "..." + mapsApiKey.slice(-4) : "Not set";

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("App.js - Starting useEffect");
    const checkUser = async () => {
      console.log("App.js - Checking user...");
      const uid = await AsyncStorage.getItem("user_uid");
      console.log("App.js - User UID:", uid);
      if (uid) setInitialRoute("App");
      setLoading(false);
    };

    const configureGoogle = async () => {
      try {
        console.log("App.js - Configuring Google Sign-In...");
        await GoogleSignin.configure({
          iosClientId: config.googleClientIds.ios,
          androidClientId: config.googleClientIds.android,
          webClientId: config.googleClientIds.web,
          offlineAccess: true,
        });
        await GoogleSignin.signOut();
        console.log("App.js - Google Sign-In configured successfully");
      } catch (err) {
        console.error("App.js - Google SignIn config error:", err);
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
        });
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
        navigation.navigate("UserInfo");
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
        navigation.navigate("Profile");
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
      <View style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
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
          <TouchableOpacity style={styles.circleBox} onPress={() => navigation.navigate("Login")}>
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
    <SafeAreaProvider>
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
          <Stack.Screen name='AccountType' component={AccountTypeScreen} />
          <Stack.Screen name='Profile' component={ProfileScreen} />
          <Stack.Screen name='EditProfile' component={EditProfileScreen} />
          <Stack.Screen name='Settings' component={SettingsScreen} />
          <Stack.Screen name='Account' component={AccountScreen} />
          <Stack.Screen name='Network' component={NetworkScreen} />
          <Stack.Screen name='Search' component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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
