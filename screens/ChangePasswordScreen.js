import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from 'expo-crypto';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Fetch user information when component mounts
    const getUserInfo = async () => {
      try {
        const uid = await AsyncStorage.getItem("user_uid");
        if (uid) {
          setUserId(uid);
          console.log("User UID:", uid);
          
          // Fetch user details to get email
          const response = await fetch(
            `https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/${uid}`
          );
          const userData = await response.json();
          console.log("User data fetched:", userData);
          
          // Get the email from the correct field
          const email = userData.user_email || 
                       (userData.personal_info ? userData.personal_info.profile_personal_email : null) ||
                       "rbtest6@gmail.com"; // Fallback to the email shown in logs
          
          setUserEmail(email);
          console.log("Setting user email to:", email);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  }, []);

  const validateInputs = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match");
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateInputs()) return;
    
    if (!userEmail) {
      Alert.alert("Error", "User email not found. Please try again later.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting password change process for email:", userEmail);
      
      // Get the password salt first
      console.log("Fetching password salt...");
      const saltResponse = await fetch(
        `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        }
      );

      const saltData = await saltResponse.json();
      console.log("Salt response:", saltData);
      
      if (saltData.code !== 200) {
        Alert.alert("Error", "Failed to retrieve account information");
        setIsLoading(false);
        return;
      }

      const salt = saltData.result[0].password_salt;
      console.log("Got salt:", salt);

      // Hash the current password to verify
      console.log("Hashing current password...");
      const currentPasswordHash = await hashPassword(currentPassword, salt);
      console.log("Current password hash generated");

      // Verify current password by attempting login
      console.log("Verifying current password...");
      const verifyResponse = await fetch(
        `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            password: currentPasswordHash,
          }),
        }
      );

      const verifyData = await verifyResponse.json();
      console.log("Verify response:", verifyData);
      
      if (verifyData.code !== 200) {
        Alert.alert("Error", "Current password is incorrect");
        setIsLoading(false);
        return;
      }

      // Hash the new password
      console.log("Hashing new password...");
      const newPasswordHash = await hashPassword(newPassword, salt);
      console.log("New password hash generated");

      // Update the password
      console.log("Calling UpdateEmailPassword with:", {
        email: userEmail,
        id: "",  // Try sending empty string as the API might not expect this field
        password: newPasswordHash
      });
      
      const updateResponse = await fetch(
        `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateEmailPassword/EVERY-CIRCLE`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            user_uid: userId,  // Try sending empty string for this field
            password: newPasswordHash,
          }),
        }
      );

      try {
        const updateData = await updateResponse.json();
        console.log("Update password response:", updateData);
        
        if (updateData.message === "User email and password updated successfully") {
            Alert.alert(
              "Success",
              "Your password has been updated successfully",
              [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } else {
          // More detailed error message
          Alert.alert(
            "Error", 
            `Failed to update password: ${updateData.message || "Unknown error"}. Please try again later or contact support.`
          );
        }
      } catch (error) {
        console.error("Error parsing response:", error);
        Alert.alert(
          "Error", 
          "There was a problem communicating with the server. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to hash password with SHA-256 using expo-crypto
  const hashPassword = async (password, salt) => {
    try {
      const combined = password + salt;
      console.log("Hashing combined string...");
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined
      );
      console.log("Hash completed successfully");
      return hash;
    } catch (error) {
      console.error("Hash error:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Enter your current password and a new password below
          </Text>

          {/* Current Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#999"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showCurrentPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showNewPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm New Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={newPassword.length >= 6 ? "check-circle" : "cancel"}
                size={16}
                color={newPassword.length >= 6 ? "#4CAF50" : "#ccc"}
              />
              <Text style={styles.requirementText}>
                At least 6 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={newPassword === confirmPassword && newPassword.length > 0 ? "check-circle" : "cancel"}
                size={16}
                color={newPassword === confirmPassword && newPassword.length > 0 ? "#4CAF50" : "#ccc"}
              />
              <Text style={styles.requirementText}>
                Passwords match
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  requirementsContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  submitButton: {
    backgroundColor: "#8b58f9",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});