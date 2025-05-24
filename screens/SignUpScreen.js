import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import AppleSignIn from "../AppleSignIn";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import CryptoJS from "react-native-crypto-js";
// import * as CryptoJS from "react-native-crypto-js";
import * as Crypto from "expo-crypto";

const ACCOUNT_SALT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE";
const CREATE_ACCOUNT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/CreateAccount/EVERY-CIRCLE";
const GOOGLE_SIGNUP_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";

export default function SignUpScreen({ onGoogleSignUp, onAppleSignUp, onError, navigation }) {
  console.log("SignUpScreen - Rendering");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  const validateInputs = (email, password, confirmPassword) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;
    const doPasswordsMatch = password === confirmPassword;

    setIsValid(isEmailValid && isPasswordValid && doPasswordsMatch);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateInputs(text, password, confirmPassword);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validateInputs(email, text, confirmPassword);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    validateInputs(email, password, text);
  };

  //   const encryptPassword = (password) => {
  //     console.log("Encrypting password:", password);
  //     return CryptoJS.SHA256(password).toString();
  //   };

  const encryptPassword = async (password) => {
    console.log("Encrypting password:", password);
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
    // console.log("Encrypted password:", hash);
    return hash;
  };

  const handleContinue = async () => {
    try {
      const createAccountResponse = await fetch(CREATE_ACCOUNT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const createAccountData = await createAccountResponse.json();
      if (createAccountData.message === "User already exists") {
        Alert.alert("User Already Exists", "This email is already registered. Please log in instead.", [{ text: "OK", style: "cancel" }]);
      } else if (createAccountData.code === 281 && createAccountData.user_uid) {
        await AsyncStorage.setItem("user_uid", createAccountData.user_uid);
        await AsyncStorage.setItem("user_email_id", email);
        navigation.navigate("UserInfo");
      } else {
        throw new Error("Failed to create account");
      }
    } catch (error) {
      console.error("Error in account creation:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Every Circle!</Text>
        <Text style={styles.subtitle}>Please create your account to continue.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={handleEmailChange} keyboardType='email-address' autoCapitalize='none' />
        <TextInput style={styles.input} placeholder='Password' value={password} onChangeText={handlePasswordChange} secureTextEntry />
        <TextInput style={styles.input} placeholder='Confirm Password' value={confirmPassword} onChangeText={handleConfirmPasswordChange} secureTextEntry />
      </View>

      <TouchableOpacity style={[styles.continueButton, isValid && styles.continueButtonActive]} onPress={handleContinue} disabled={!isValid}>
        <Text style={[styles.continueButtonText, isValid && styles.continueButtonTextActive]}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialContainer}>
        <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={onGoogleSignUp} />
        {Platform.OS === "ios" && <AppleSignIn onSignIn={onAppleSignUp} onError={onError} />}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.logInText} onPress={() => navigation.navigate("Login")}>
            Log In
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 100,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#E5E5E5",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
  },
  continueButtonActive: {
    backgroundColor: "#FF9500",
  },
  continueButtonText: {
    color: "#fff",
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
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  googleButton: {
    width: 192,
    height: 48,
    marginBottom: 15,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "#666",
  },
  logInText: {
    color: "#FF9500",
    fontWeight: "bold",
  },
});
