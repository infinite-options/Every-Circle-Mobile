import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
// import * as Crypto from 'expo-crypto';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Every Circle</Text>
      <Text style={styles.title}>It Pays To Be Connected!</Text>
      <TouchableOpacity style={[styles.button, styles.signUp]} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.login]} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.howItWorks]}>
        <Text style={styles.buttonText}>How It Works</Text>
      </TouchableOpacity>
    </View>
  );
};


const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checkEmailExists = async () => {
    try {
      const response = await axios.get(
        `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetEmailId/EVERY-CIRCLE/${email}`
      );

      console.log('API Response:', response.data);

      if (response.data.message === "User EmailID exists") {
        Alert.alert("Error", "Email already exists. Please use a different email.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      Alert.alert("Error", "Could not verify email. Please try again later.");
      return false;
    }
  };

  const handleContinue = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
  
    const isEmailValid = await checkEmailExists();
    if (!isEmailValid) return;
  
    // If email does not exist, proceed to register the user
    try {
      const response = await axios.post(
        'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/CreateAccount/EVERY-CIRCLE',
        {
          email: email,
          password: password,
          role: "user"
        }
      );
  
      console.log('Signup API Response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate('ProfileSetup');
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "Could not create account. Please try again later.");
    }
  };
  

  return (
    <View style={styles.signupContainer}>
      <Text style={styles.header}>Welcome to Every Circle!</Text>
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
      <Text style={styles.loginText} onPress={() => navigation.goBack()}>Already have an account? <Text style={styles.loginLink}>Log In</Text></Text>
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    // Navigate to next screen or perform login API call
    Alert.alert('Login Attempt', `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <View style={styles.signupContainer}>
      <Text style={styles.header}>Login to Every Circle</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
      <Text style={styles.loginText} onPress={() => navigation.goBack()}>
        Don't have an account? <Text style={styles.loginLink}>Sign Up</Text>
      </Text>
    </View>
  );
};



const ProfileSetupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
    navigation.navigate('AccountType');
  };

  return (
    <View style={styles.profileContainer}>
      <Text style={styles.profileHeader}>Welcome to Every Circle!</Text>
      <Text style={styles.profileSubHeader}>Let's Build Your Profile Page!</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="(000) 000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const AccountTypeScreen = () => {
  return (
    <View style={styles.accountContainer}>
      <Text style={styles.accountHeader}>Choose Your Account</Text>
      <TouchableOpacity style={[styles.accountButton, styles.personal]}>
        <Text style={styles.accountText}>Personal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.accountButton, styles.business]}>
        <Text style={styles.accountText}>Business</Text>
      </TouchableOpacity>
    </View>
  );
};


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
    marginVertical: 10,
  },
  signUp: { backgroundColor: '#4B7BEC' },
  login: { backgroundColor: '#A55EEA' },
  howItWorks: { backgroundColor: '#26DE81' },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B7BEC',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  continueButton: {
    backgroundColor: '#FFA500',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  continueText: { color: '#fff', fontSize: 16 },
  loginText: { marginTop: 20, fontSize: 14, color: '#333' },
  loginLink: { color: '#F39C12', fontWeight: 'bold' },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  profileHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B7BEC',
    marginBottom: 10,
  },
  profileSubHeader: {
    fontSize: 16,
    color: '#4B7BEC',
    marginBottom: 20,
  },
  accountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  accountHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B7BEC',
    marginBottom: 20,
  },
  accountButton: {
    padding: 30,
    borderRadius: 50,
    width: '60%',
    alignItems: 'center',
    marginVertical: 20,
  },
  personal: { backgroundColor: '#FFA500' },
  business: { backgroundColor: '#26DE81' },
  accountText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});