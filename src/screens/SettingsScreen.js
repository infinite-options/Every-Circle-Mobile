{/* <a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Freepik - Flaticon</a> */}


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Ionicons, FontAwesome } from '@expo/vector-icons';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [cookiesEnabled, setCookiesEnabled] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(false);
  const [displayPhone, setDisplayPhone] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Settings</Text>
      </View>

      {/* Toggles */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Allow notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark mode</Text>
        <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Allow Cookies</Text>
        <Switch value={cookiesEnabled} onValueChange={setCookiesEnabled} />
      </View>

      {/* Static text options */}
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Terms and Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Edit User Information</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Change Password</Text>
      </TouchableOpacity>

      {/* Additional toggles */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Display Email</Text>
        <Switch value={displayEmail} onValueChange={setDisplayEmail} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Display Phone Number</Text>
        <Switch value={displayPhone} onValueChange={setDisplayPhone} />
      </View>

      {/* Bottom Navigation Buttons */}
<View style={styles.navContainer}>
  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
    <Image source={require('../assets/profile.png')} style={styles.navIcon} />
    <Text style={styles.navLabel}>Profile</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
  <Image source={require('../assets/setting.png')} style={styles.navIcon} />
    <Text style={styles.navLabel}>Settings</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
  <Image source={require('../assets/pillar.png')} style={styles.navIcon} />
    <Text style={styles.navLabel}>Home</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Share')}>
  <Image source={require('../assets/share.png')} style={styles.navIcon} />
    <Text style={styles.navLabel}>Share</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Search')}>
  <Image source={require('../assets/search.png')} style={styles.navIcon} />
    <Text style={styles.navLabel}>Search</Text>
  </TouchableOpacity>
</View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerContainer: {  padding: 20, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  header: { fontSize: 22, color: '#000000', textAlign: 'center', fontWeight: 'bold' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: { fontSize: 16, color: '#000' },

  navContainer: {
    
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  
  navButton: {
    alignItems: 'center',
  },
  
  navIcon: {
    width: 25,
    height: 25,
  },
  
  navLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  }
});

export default SettingsScreen;
