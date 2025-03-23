

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const passwordSaltAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE'
const loginAPI = 'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE'
const getUserProfile = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/'


const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    // Step 1: Fetch the password salt from backend
    const getPasswordSalt = async (email) => {
      try {
        url = passwordSaltAPI;
        console.log("Check Email API: ", url); 
        // const response = await axios.post(
        //   'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE',
        //   { email }
        // );
  
        const response = await axios.post(
          url,
          { email }
        );
  
        console.log('Salt API Response:', response.data);
  
        if (response.data?.code === 200 && response.data?.result?.length > 0) {
          return response.data.result[0].password_salt; // Extract and return salt
        } else {
          Alert.alert('Error', 'Email not found. Please check your email.');
          return null;
        }
      } catch (error) {
        console.error('Error getting password salt:', error.response?.data || error.message);
        Alert.alert('Error', 'Could not retrieve password salt.');
        return null;
      }
    };
  
    // Step 2: Handle login
    const handleLogin = async () => {
        console.log("Entered HandleLogin...")
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password.');
        return;
      }
  
      // Fetch salt from backend
      const salt = await getPasswordSalt(email);
      if (!salt) return; // Stop if salt retrieval failed
  
      console.log("Received salt API response in handleLogin..")
      // Hash password using SHA-256
      const hashedPassword = CryptoJS.SHA256(password + salt).toString();
  
      console.log('Hashed Password:', hashedPassword);
  
      // Step 3: Send login request
      try {
        url = loginAPI
        console.log("Check Email API: ", url); 
        // const loginResponse = await axios.post(
        //   'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE',
        //   {
        //     email,
        //     password: hashedPassword, // Send hashed password
        //   }
        // );
  
        const loginResponse = await axios.post(
          url,
          {
            email,
            password: hashedPassword, // Send hashed password
          }
        );
  
        console.log('Login API Response:', loginResponse.data);
  
        if (loginResponse.data?.code === 200) {
          Alert.alert('Success', 'Logged in successfully!');

          // Extract user_uid from the response
          const userUID = loginResponse.data?.result?.user_uid;
          console.log(" Extracted User ID:", userUID);

          if (!userUID) {
            Alert.alert('Error', 'User ID not found.');
            return;
          }

          const url = getUserProfile + userUID;
          console.log(" Fetching user profile:", url);
          
          const profileResponse = await axios.get(url);    
          console.log(' User profile data:', profileResponse.data);

          if (profileResponse.status === 200) {
            const profileData = profileResponse.data;
            console.log(' Profile data structure:', JSON.stringify(profileData, null, 2));
            
            // Extract profile_uid from the response
            const profile_uid = profileData.personal_info?.profile_personal_uid;
            console.log(' Extracted profile_uid:', profile_uid);
            
            if (!profile_uid) {
              console.error(' No profile_uid found in response');
              Alert.alert('Error', 'Profile data is incomplete.');
              return;
            }

            // Create a properly structured user object
            const userData = {
              user_email: profileData.user_email || email,
              personal_info: {
                profile_personal_uid: profile_uid,
                profile_personal_first_name: profileData.personal_info?.profile_personal_first_name || '',
                profile_personal_last_name: profileData.personal_info?.profile_personal_last_name || '',
                profile_personal_phone_number: profileData.personal_info?.profile_personal_phone_number || '',
                profile_personal_tagline: profileData.personal_info?.profile_personal_tagline || '',
                profile_personal_short_bio: profileData.personal_info?.profile_personal_short_bio || '',
                profile_personal_email_is_public: profileData.personal_info?.profile_personal_email_is_public || '0',
                profile_personal_phone_number_is_public: profileData.personal_info?.profile_personal_phone_number_is_public || '0',
                profile_personal_tagline_is_public: profileData.personal_info?.profile_personal_tagline_is_public || '0',
                profile_personal_short_bio_is_public: profileData.personal_info?.profile_personal_short_bio_is_public || '0',
                profile_personal_experience_is_public: profileData.personal_info?.profile_personal_experience_is_public || '0',
                profile_personal_education_is_public: profileData.personal_info?.profile_personal_education_is_public || '0',
                profile_personal_expertise_is_public: profileData.personal_info?.profile_personal_expertise_is_public || '0',
                profile_personal_wishes_is_public: profileData.personal_info?.profile_personal_wishes_is_public || '0'
              },
              experience_info: profileData.experience_info || '[]',
              education_info: profileData.education_info || '[]',
              expertise_info: profileData.expertise_info || '[]',
              wishes_info: profileData.wishes_info || '[]',
              social_links: profileData.social_links || '{}'
            };

            console.log(' Structured user data:', JSON.stringify(userData, null, 2));

            // Navigate with both the complete profile data and profile_uid
            navigation.navigate('Profile', { 
              user: userData,
              profile_uid: profile_uid
            });
          } else {
            Alert.alert('Error', 'Failed to retrieve user profile.');
          }
        }
        else {
          Alert.alert('Error', loginResponse.data?.message || 'Invalid credentials. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Login to Every Circle</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.text} onPress={() => navigation.goBack()}>
          Don't have an account? <Text style={styles.link}>Sign Up</Text>
        </Text>
      </View>
    );
  };
  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#fff',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: '90%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingLeft: 10,
      marginBottom: 15,
    },
    button: {
      width: '90%',
      backgroundColor: '#007BFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    text: {
      marginTop: 10,
      fontSize: 14,
    },
    link: {
      color: '#007BFF',
      fontWeight: 'bold',
    },
  });
  
  
  export default LoginScreen;