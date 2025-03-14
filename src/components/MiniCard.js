import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const MiniCard = ({ user }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Profile Image */}
      <Image 
        source={user?.user_profile_image ? { uri: user.user_profile_image } : require('../images/icons8-profile-picture-30.png')}
        style={styles.profileImage} 
      />

      {/* User Info */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{user?.user_first_name || "User"} {user?.user_last_name || ""}</Text>
        <Text style={styles.tagline}>{user?.user_tagline || "Your tagline here"}</Text>
        <Text style={styles.email}>{user?.user_email_id || "user@example.com"}</Text>
        <Text style={styles.phone}>{user?.user_phone_number || "Phone number not available"}</Text>
      </View>

      {/* Checkmark Icon (If needed) */}
      {/* <Image 
        source={require('../images/icons8-checkmark.png')} 
        style={styles.checkmarkIcon} 
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2, // Shadow effect
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, 
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    color: '#555',
  },
  email: {
    fontSize: 12,
    color: '#777',
  },
  phone: {
    fontSize: 12,
    color: '#777',
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    tintColor: '#007BFF', // Optional: Change color
  },
});

export default MiniCard;
