

// // Import polyfills at the very beginning
// import './src/utils/polyfills';
// console.log('Polyfills loaded:', {
//   setImmediate: typeof global.setImmediate !== 'undefined',
//   clearImmediate: typeof global.clearImmediate !== 'undefined',
//   process: typeof global.process !== 'undefined'
// });

// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import axios from 'axios';
// import CryptoJS from 'crypto-js';
// import ProfileScreen from './src/screens/ProfileScreen';
// import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
// import AccountTypeScreen from './src/screens/AccountTypeScreen';
// import LoginScreen from './src/screens/LoginScreen';
// import SignUpScreen from './src/screens/SignUpScreen';
// import EditProfileScreen from './src/screens/EditProfileScreen';



// const Stack = createStackNavigator();
// const emailCheckAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetEmailId/EVERY-CIRCLE/'
// const creatAccountAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/CreateAccount/EVERY-CIRCLE'
// // const passwordSaltAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE'
// // const loginAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE'


// const HomeScreen = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Every Circle</Text>
//       <Text style={styles.title}>It Pays To Be Connected!</Text>
//       <TouchableOpacity style={[styles.button, styles.signUp]} onPress={() => navigation.navigate('SignUp')}>
//         <Text style={styles.buttonText}>Sign Up</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={[styles.button, styles.login]} onPress={() => navigation.navigate('Login')}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={[styles.button, styles.howItWorks]}>
//         <Text style={styles.buttonText}>How It Works</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };





// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} />
//         <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
//         <Stack.Screen name="AccountType" component={AccountTypeScreen} />
//         <Stack.Screen name="Profile" component={ProfileScreen} />
//         <Stack.Screen name="EditProfile" component={EditProfileScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#FFA500',
//     padding: 15,
//     borderRadius: 10,
//     width: '60%',
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   signUp: { backgroundColor: '#4B7BEC' },
//   login: { backgroundColor: '#A55EEA' },
//   howItWorks: { backgroundColor: '#26DE81' },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   signupContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#4B7BEC',
//   },
//   input: {
//     width: '90%',
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     marginBottom: 15,
//     paddingLeft: 10,
//   },
//   continueButton: {
//     backgroundColor: '#FFA500',
//     width: '90%',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   continueText: { color: '#fff', fontSize: 16 },
//   loginText: { marginTop: 20, fontSize: 14, color: '#333' },
//   loginLink: { color: '#F39C12', fontWeight: 'bold' },
//   profileContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   profileHeader: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#4B7BEC',
//     marginBottom: 10,
//   },
//   profileSubHeader: {
//     fontSize: 16,
//     color: '#4B7BEC',
//     marginBottom: 20,
//   },
//   accountContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   accountHeader: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#4B7BEC',
//     marginBottom: 20,
//   },
//   accountButton: {
//     padding: 30,
//     borderRadius: 50,
//     width: '60%',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   personal: { backgroundColor: '#FFA500' },
//   business: { backgroundColor: '#26DE81' },
//   accountText: {
//     color: '#000',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });























// Import polyfills at the very beginning
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

