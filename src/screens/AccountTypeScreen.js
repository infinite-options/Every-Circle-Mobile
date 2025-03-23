
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const userProfileAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/'


const AccountTypeScreen = ({ navigation, route }) => {
    const { email = '', user_uid = '' } = route.params || {};

  const handleSelectAccount = async () => {
    if (!user_uid) {
      Alert.alert('Error', 'User ID is missing. Cannot fetch profile.');
      return;
    }

    try {
      console.log(`Fetching profile for user_uid: ${user_uid}`);

      url = userProfileAPI + user_uid;
      console.log("Check Email API: ", url); 


      // const response = await axios.get(
      //   https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/${user_uid}
      // );

      const response = await axios.get(
        url
      );

      console.log("Profile API Response:", response.data);

      if (response.status === 200 && response.data) {
        navigation.navigate('Profile', { user: response.data });
      } else {
        Alert.alert('Error', 'Failed to fetch profile.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not load profile. Please try again.');
    }
  };

  return (
    <View style={styles.accountContainer}>
      <Text style={styles.accountHeader}>Choose Your Account Type</Text>

      <TouchableOpacity 
        style={[styles.accountButton, styles.personal]} 
        onPress={handleSelectAccount}>
        <Text style={styles.accountText}>Personal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.accountButton, styles.business]}>
        <Text style={styles.accountText}>Business</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  personal: { backgroundColor: '#FFA500' },
  business: { backgroundColor: '#26DE81' },
  accountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountTypeScreen;