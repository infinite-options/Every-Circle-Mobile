import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const MiniCard = ({ user }) => {
  // console.log("🔍 Received user data in MiniCard:", JSON.stringify(user, null, 2));

  // Extract user info
  // const firstName = user?.firstName || '';
  // const lastName = user?.lastName || '';
  // const email = user?.email || '';
  // const phone = user?.phoneNumber || '';
  // const tagLine = user?.tagLine || '';

  const firstName = user?.personal_info?.profile_personal_first_name ||  user?.firstName ||'';
  const lastName = user?.personal_info?.profile_personal_last_name || user?.lastName || '';
  const tagLine = user?.personal_info?.profile_personal_tagline || user?.tagLine || '';
  const email = user?.user_email || user?.email || '';
  const phone = user?.personal_info?.profile_personal_phone_number || user?.phoneNumber || '';


  // Extract visibility flags
  const emailIsPublic = user?.personal_info?.profile_personal_email_is_public == 1 || user?.emailIsPublic;
  const phoneIsPublic = user?.personal_info?.profile_personal_phone_number_is_public == 1 || user?.phoneIsPublic;
  const tagLineIsPublic = user?.personal_info?.profile_personal_tagline_is_public == 1 || user?.tagLineIsPublic;

  return (
    <View style={styles.cardContainer}>
      {/* Profile Image */}
      <Image 
        source={require('../assets/icons8-profile-picture-30.png')}
        style={styles.profileImage} 
      />

      {/* User Info */}
      <View style={styles.textContainer}>
        {/* Name is always visible */}
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>

        {/* Show tagline if public */}
        {tagLineIsPublic && tagLine && (
          <Text style={styles.tagline}>
            {tagLine}
          </Text>
        )}
        
        {/* Show email if public */}
        {emailIsPublic && email && (
          <Text style={styles.email}>
            {email}
          </Text>
        )}
        
        {/* Show phone if public */}
        {phoneIsPublic && phone && (
          <Text style={styles.phone}>
            {phone}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
});

export default MiniCard;