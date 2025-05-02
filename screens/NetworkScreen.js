import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

const NetworkScreen = ({ navigation }) => {
  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Network</Text>
        </View>
        
        <View style={styles.content}>
          <Text>Fast Router</Text>
        </View>
      </ScrollView>

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

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Network')}>
          <Image source={require('../assets/share.png')} style={styles.navIcon} />
          <Text style={styles.navLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Search')}>
          <Image source={require('../assets/search.png')} style={styles.navIcon} />
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 0
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  content: {
    flex: 1,
  },
  navContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingVertical: 10, 
    borderTopWidth: 1, 
    borderColor: '#ddd' 
  },
  navButton: { 
    alignItems: 'center' 
  },
  navIcon: { 
    width: 25, 
    height: 25 
  },
  navLabel: { 
    fontSize: 12, 
    color: '#333', 
    marginTop: 4 
  },
});

export default NetworkScreen;