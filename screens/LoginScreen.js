// LoginScreen.js

import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import AppleSignIn from "../AppleSignIn";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// import SignUpScreen from "./screens/SignUpScreen";

// Endpoints
const SALT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE";
const LOGIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE";
const PROFILE_ENDPOINT = "https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo";

// Accept navigation from props
export default function LoginScreen({ navigation, onGoogleSignIn, onAppleSignIn, onError }) {
  console.log("LoginScreen - Rendering");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const validateInputs = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;
    setIsValid(isEmailValid && isPasswordValid);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateInputs(text, password);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validateInputs(email, text);
  };

  const handleContinue = async () => {
    try {
      setShowSpinner(true);

      // 1. Get salt
      const saltResponse = await fetch(SALT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const saltObject = await saltResponse.json();

      if (saltObject.code !== 200) {
        Alert.alert("Error", "User does not exist. Please Sign Up.");
        return;
      }

      // 2. Hash password
      const salt = saltObject.result[0].password_salt;
      const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password + salt);

      // 3. Login
      const loginResponse = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: hashedPassword }),
      });
      const loginObject = await loginResponse.json();
      console.log("loginObject", loginObject);

      const user_uid = loginObject.result.user_uid;
      const user_email = loginObject.result.user_email_id;

      await AsyncStorage.setItem("user_uid", user_uid);
      await AsyncStorage.setItem("user_email_id", user_email);

      console.log("user_uid", user_uid);
      console.log("User Email", user_email);

      // 4. Fetch user profile
      // console.log("user_uid", user_uid);
      // console.log("PROFILE_ENDPOINT", PROFILE_ENDPOINT);
      console.log("Profile Endpoint call: ", `${PROFILE_ENDPOINT}/${user_uid}`);
      // const profileResponse = await fetch(`https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/100-000356`);
      // const response = await axios.get(
      //   `https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/100-000356`
      // );
      // console.log("profileResponse", response);
      // const profileResponse = await fetch(`${PROFILE_ENDPOINT}/${user_uid}`);

      const profileResponse = await fetch(`https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/${user_uid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });



      console.log("profileResponse", profileResponse);
    
      const fullUser = await profileResponse.json();
      console.log("fullUser", fullUser);

      if (!fullUser || fullUser.message === "Profile not found for this user") {
        Alert.alert("Error", "Profile not found.");
        return;
      }

      // 5. Navigate to Profile screen
      navigation.navigate("Profile", {
        user: {
          ...fullUser,
          user_email: user_email,
        },
        profile_uid: fullUser.personal_info?.profile_personal_uid || "",
      });
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Every Circle!</Text>
        <Text style={styles.subtitle}>Please choose a login option to continue.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={handleEmailChange} keyboardType='email-address' autoCapitalize='none' />
        <TextInput style={styles.input} placeholder='Password' value={password} onChangeText={handlePasswordChange} secureTextEntry />
      </View>

      <TouchableOpacity style={[styles.continueButton, isValid && styles.continueButtonActive]} onPress={handleContinue} disabled={!isValid || showSpinner}>
        {showSpinner ? <ActivityIndicator color='#fff' /> : <Text style={[styles.continueButtonText, isValid && styles.continueButtonTextActive]}>Continue</Text>}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialContainer}>
        <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={onGoogleSignIn} />
        <AppleSignIn onSignIn={onAppleSignIn} onError={onError} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text style={styles.signUpText} onPress={() => navigation.navigate("SignUp")}>
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 100, padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#007AFF" },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center" },
  inputContainer: { marginBottom: 30 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#E5E5E5",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  continueButtonActive: {
    backgroundColor: "#FF9500",
  },
  continueButtonText: {
    color: "#999",
    fontSize: 18,
    fontWeight: "bold",
  },
  continueButtonTextActive: {
    color: "#fff",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#E5E5E5" },
  dividerText: { marginHorizontal: 10, color: "#666" },
  socialContainer: { alignItems: "center", marginBottom: 30 },
  googleButton: { width: 192, height: 48, marginBottom: 15 },
  footer: { alignItems: "center" },
  footerText: { fontSize: 16, color: "#666" },
  signUpText: { color: "#FF9500", fontWeight: "bold" },
});
