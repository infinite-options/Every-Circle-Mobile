// import React, { useState } from "react";
// import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
// import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
// import AppleSignIn from "../AppleSignIn";
// import * as Crypto from "expo-crypto";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Correct

// // import axios from "axios";

// // Endpoints
// const SALT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE";
// const LOGIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE";
// const SOCIAL_LOGIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";

// export default function LoginScreen({ onGoogleSignIn, onAppleSignIn, onError, onSignUpPress, onSignInSuccess, onContinue }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isValid, setIsValid] = useState(false);
//   const [showSpinner, setShowSpinner] = useState(false);

//   const validateInputs = (email, password) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const isEmailValid = emailRegex.test(email);
//     const isPasswordValid = password.length >= 6;

//     setIsValid(isEmailValid && isPasswordValid);
//   };

//   const handleEmailChange = (text) => {
//     setEmail(text);
//     validateInputs(text, password);
//   };

//   const handlePasswordChange = (text) => {
//     setPassword(text);
//     validateInputs(email, text);
//   };

//   const handleContinue = async () => {
//     // if (!email || !password) {
//     //   Alert.alert("Error", "Please fill out all the fields.");
//     //   return;
//     // }
//     // if (!isValidEmail(email)) {
//     //   Alert.alert("Error", "Please enter a valid email address.");
//     //   return;
//     // }

//     try {
//       console.log("---Here 0---");
//       setShowSpinner(true);

//       // console.log("---Here 0.1---", email);
//       // console.log(
//       //   "---Here 0.2---",
//       //   JSON.stringify({
//       //     email,
//       //   })
//       // );

//       // 1. Get the salt for this email
//       const saltResponse = await fetch(SALT_ENDPOINT, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: email,
//         }),
//       });

//       // console.log("---Here 1---", saltResponse);
//       const saltObject = await saltResponse.json();
//       // console.log("---Here 1.1---", saltObject);

//       if (saltObject.code !== 200) {
//         Alert.alert("Error", "User does not exist. Please Sign Up.");
//         return;
//       }
//       // console.log("---Here 2---");

//       // 2. Combine salt with password and hash it
//       const salt = saltObject.result[0].password_salt;
//       const saltedPassword = password + salt;
//       const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltedPassword);
//       // console.log(
//       //   "---Here 3---",
//       //   JSON.stringify({
//       //     email,
//       //     password: hashedPassword,
//       //   })
//       // );

//       // 3. Call the Login endpoint with the hashed password
//       const loginResponse = await fetch(LOGIN_ENDPOINT, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           password: hashedPassword,
//         }),
//       });

//       // 4. If success, store the user data in AsyncStorage
//       // console.log("---Here 4---", loginResponse);
//       const loginObject = await loginResponse.json();
//       // console.log("---Here 4.1---", loginObject);
//       const { user_uid, user_email_id } = loginObject.result;
//       // console.log("---Here 4.2---", user_uid, user_email_id);
//       await AsyncStorage.setItem("user_uid", loginObject.result.user_uid);
//       await AsyncStorage.setItem("user_email_id", loginObject.result.user_email_id);

//       // 5. Create userInfo object and navigate
//       // console.log("---Here 5---");
//       const userInfo = {
//         user: {
//           email: email,
//           name: email.split("@")[0], // Use email username as name
//           id: user_uid,
//         },
//       };

//       // Call onSignInSuccess to trigger navigation
//       if (onSignInSuccess) {
//         onSignInSuccess(userInfo);
//         // onContinue();
//       }
//     } catch (error) {
//       console.error("LP Error occurred:", error);
//       Alert.alert("Error", "Invalid credentials. Please check your email and password and try again.");
//     } finally {
//       setShowSpinner(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Welcome to Every Circle!</Text>
//         <Text style={styles.subtitle}>Please choose a login option to continue.</Text>
//       </View>

//       <View style={styles.inputContainer}>
//         <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={handleEmailChange} keyboardType='email-address' autoCapitalize='none' />

//         <TextInput style={styles.input} placeholder='Password' value={password} onChangeText={handlePasswordChange} secureTextEntry />
//       </View>

//       <TouchableOpacity style={[styles.continueButton, isValid && styles.continueButtonActive]} onPress={handleContinue} disabled={!isValid}>
//         <Text style={[styles.continueButtonText, isValid && styles.continueButtonTextActive]}>Continue</Text>
//       </TouchableOpacity>

//       <View style={styles.dividerContainer}>
//         <View style={styles.divider} />
//         <Text style={styles.dividerText}>OR</Text>
//         <View style={styles.divider} />
//       </View>

//       <View style={styles.socialContainer}>
//         <GoogleSigninButton style={styles.googleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={onGoogleSignIn} />
//         <AppleSignIn onSignIn={onAppleSignIn} onError={onError} />
//       </View>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>
//           Don't have an account?{" "}
//           <Text style={styles.signUpText} onPress={onSignUpPress}>
//             Sign Up
//           </Text>
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 100,
//     padding: 20,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: "#007AFF",
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//   },
//   inputContainer: {
//     marginBottom: 30,
//   },
//   input: {
//     backgroundColor: "#F5F5F5",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   continueButton: {
//     backgroundColor: "#E5E5E5",
//     borderRadius: 25,
//     padding: 15,
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   continueButtonActive: {
//     backgroundColor: "#FF9500",
//   },
//   continueButtonText: {
//     color: "#999",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   continueButtonTextActive: {
//     color: "#fff",
//   },
//   dividerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#E5E5E5",
//   },
//   dividerText: {
//     marginHorizontal: 10,
//     color: "#666",
//   },
//   socialContainer: {
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   googleButton: {
//     width: 192,
//     height: 48,
//     marginBottom: 15,
//   },
//   footer: {
//     alignItems: "center",
//   },
//   footerText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   signUpText: {
//     color: "#FF9500",
//     fontWeight: "bold",
//   },
// });

import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import AppleSignIn from "../AppleSignIn";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import SignUpScreen from "./screens/SignUpScreen";
import axios from "axios";

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

      const user_uid = loginObject.result.user_uid;
      const user_email = loginObject.result.user_email_id;

      await AsyncStorage.setItem("user_uid", user_uid);
      await AsyncStorage.setItem("user_email_id", user_email);

      console.log("--- debug --- user_uid:", user_uid);
      console.log("--- debug --- user_email:", user_email);

      // 4. Fetch user profile
      const profileResponse = await fetch(`${PROFILE_ENDPOINT}/${user_uid}`);
      // const profileResponse = await axios.get(`${PROFILE_ENDPOINT}/${user_uid}`);
      const fullUser = await profileResponse.json();

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
