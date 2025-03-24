
import "./src/utils/polyfills";
console.log("Polyfills loaded:", {
  setImmediate: typeof global.setImmediate !== "undefined",
  clearImmediate: typeof global.clearImmediate !== "undefined",
  process: typeof global.process !== "undefined",
});

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "./src/screens/ProfileScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import AccountTypeScreen from "./src/screens/AccountTypeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
// import ShareScreen from "./src/screens/ShareScreen";
// import SearchScreen from "./src/screens/SearchScreen";
import Svg, { Line } from 'react-native-svg';


const { width, height } = Dimensions.get("window");

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* App Tagline */}
      <Text style={styles.tagline}>It Pays To Be Connected!</Text>



      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.SignUpcircle, styles.signUp]}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Main Circle (Every Circle) - Now positioned on the far right */}
      <View style={styles.mainCircle}>
        <Text style={styles.mainText}>Every{"\n"}Circle</Text>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.circle, styles.login]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* How It Works Button */}
      <TouchableOpacity style={[styles.circle, styles.howItWorks]}>
        <Text style={styles.buttonText}>How It Works</Text>
      </TouchableOpacity>

      {/* <Svg style={StyleSheet.absoluteFill} height="100%" width="100%"> */}
  {/* Line from Sign Up to Main */}
  {/* <Line
    x1={width * 0.50}
    y1={height * 0.58}
    x2={width * 0.42}
    y2={height * 0.10}
    stroke="black"
    strokeWidth="2"
  /> */}

  {/* Line from Login to Main */}
  {/* <Line
    x1={width * 0.62}
    y1={height * 0.32}
    x2={width * 0.82}
    y2={height * 0.56}
    stroke="green"
    strokeWidth="2"
  /> */}

  {/* Line from Main to How It Works */}
  {/* <Line
    x1={width * 0.13}
    y1={height * 0.58}
    x2={width * 0.85}
    y2={height * 0.82}
    stroke="yellow"
    strokeWidth="2"
  /> */}
{/* </Svg> */}

    </View>

    
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />

        {/* 5 buttons below EditProfile and ProfileScreen */}
          {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
          {/* <Stack.Screen name="Share" component={ShareScreen} /> */}
          {/* <Stack.Screen name="Search" component={SearchScreen} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "bold",
    position: "absolute",
    top: height * 0.07,
  },
  mainCircle: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: height * 0.40,
    right: -width * 0.10, // Moves 30% off-screen
  },
  mainText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  circle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  SignUpcircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  signUp: {
    backgroundColor: "#4B7BEC",
    top: height * 0.22,
    left: width * 0.15,
  },
  login: {
    backgroundColor: "#A55EEA",
    bottom: height * 0.18,
    left: width * 0.15,
  },
  howItWorks: {
    backgroundColor: "#26DE81",
    bottom: height * 0.18,
    right: width * 0.15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  line: {
    position: "absolute",
    width: 2,
    backgroundColor: "#000",
  },

});

