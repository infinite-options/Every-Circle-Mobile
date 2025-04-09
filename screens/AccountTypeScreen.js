
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');


const userProfileAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo/'


const AccountTypeScreen = ({ navigation, route }) => {
    const { email = '', user_uid = '' } = route.params || {};

    console.log("Email: ", email);
    console.log("User UID: ", user_uid);

  const handleSelectAccount = async () => {
    if (!user_uid) {
      Alert.alert('Error', 'User ID is missing. Cannot fetch profile.');
      return;
    }

    try {
      console.log(`Fetching profile for user_uid: ${user_uid}`);

      const url = userProfileAPI + user_uid;
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
<View style={styles.arcHeader}>
  <Text style={styles.arcText}>Choose Your Account</Text>
</View>
      <TouchableOpacity 
        style={[styles.accountButtonPersonal, styles.personal]} 
        onPress={handleSelectAccount}>
        <Text style={styles.accountText}>Personal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.accountButtonBusiness, styles.business]} onPress={() => navigation.navigate('BusinessSetup')}>
      <Text style={styles.accountText}>Business</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  accountContainer: {
    flex: 1,
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
  arcHeader: {
  width: width * 1.7,
  height: width * 0.8,
  backgroundColor: '#007AFF',
  borderBottomLeftRadius: width,
  borderBottomRightRadius: width,
  alignItems: 'center',
  justifyContent: 'flex-end',
  alignSelf: 'center',
  marginTop: -width * 0.6, // pull up to top
  paddingBottom: 40,
},
arcText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
  accountButtonPersonal: {
    marginLeft: width * 0.55,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  personal: {
    backgroundColor: '#FFA500',
    // borderTopRightRadius: 10, 
  },

  accountButtonBusiness: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end', 
    marginRight: width * 0.55, 
    marginVertical: 20,
  },
  
  business: {
    backgroundColor: '#00C721',
    // borderTopLeftRadius: 10, 
  },
  accountText: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
export default AccountTypeScreen;