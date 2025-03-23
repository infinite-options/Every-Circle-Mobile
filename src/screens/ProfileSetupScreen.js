

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';



const profileSetupAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo'

const ProfileSetupScreen = ({ navigation, route }) => {
  // Ensure route.params exists, provide default values if undefined
  const { email = '', user_uid = '' } = route.params || {};

  

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');


  

 // Function to format phone number
 const formatPhoneNumber = (input) => {
  // Remove non-numeric characters
  let cleaned = input.replace(/\D/g, '');

  // Limit to 10 digits
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }

  // Apply formatting
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
};

const handlePhoneChange = (text) => {
  setPhone(formatPhoneNumber(text));
};






  const handleContinue = async () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
  
    if (!user_uid) {
      Alert.alert('Error', 'User ID is missing! Please try again.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("user_uid", user_uid);  // Match backend expectation
      formData.append("profile_personal_first_name", firstName);
      formData.append("profile_personal_last_name", lastName);
      formData.append("profile_personal_phone_number", phone);
  
      console.log(" Sending user profile data:", formData);
  

      url = profileSetupAPI;
      console.log("Check Email API: ", url); 
      
      // const response = await axios.post(
      //   'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo',
      //   formData,
      //   { headers: { 'Content-Type': 'multipart/form-data' } }
      // );

      const response = await axios.post(
        url,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      console.log(" API Response:", response.data);
  
      if (response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate('AccountType', {
            user_uid: user_uid,
            email: email
        });
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error(' Error saving profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not save profile. Please try again later.');
    }
  };
  

  return (
    <View style={styles.profileContainer}>
      <Text style={styles.profileHeader}>Welcome to Every Circle!</Text>
      <Text style={styles.profileSubHeader}>Let's Build Your Profile Page!</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      {/* <TextInput
        style={styles.input}
        placeholder="(000) 000-0000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={12}
      /> */}


<TextInput
        style={styles.input}
        placeholder="000-000-0000"
        keyboardType="numeric"
        value={phone}
        onChangeText={handlePhoneChange}
        maxLength={12} 
      />

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Save & Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  continueText: { color: '#fff', fontSize: 16 }
});

export default ProfileSetupScreen;