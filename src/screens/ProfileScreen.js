import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import axios from 'axios';
import MiniCard from '../components/MiniCard';

const ProfileScreenAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo';

const ProfileScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileUID, setProfileUID] = useState('');


  useEffect(() => {
    // console.log(' Route Params in ProfileScreen:', JSON.stringify(route.params, null, 2));
    
    if (route.params?.user) {
      const apiUser = route.params.user;
      console.log(' Received API User Data:', JSON.stringify(apiUser, null, 2));

      // Get profile_uid from route.params first, then fallback to user data
      const extractedProfileUID = route.params.profile_uid || apiUser.personal_info?.profile_personal_uid || '';
      console.log(' Extracted Profile UID in ProfileScreen:', extractedProfileUID);

      const extractedEmail = apiUser?.user_email || route.params?.email || '';
      console.log(' Extracted Email:', extractedEmail);
      
      if (!extractedProfileUID) {
        console.error(' No profile_uid found in ProfileScreen');
        Alert.alert('Error', 'Profile ID is missing.');
        setLoading(false);
        return;
      }
      
      setProfileUID(extractedProfileUID);

      // Set user state with data from the database
      const userData = {
        profile_uid: extractedProfileUID,
        email: apiUser?.user_email || extractedEmail,
        firstName: apiUser.personal_info?.profile_personal_first_name || '',
        lastName: apiUser.personal_info?.profile_personal_last_name || '',
        phoneNumber: apiUser.personal_info?.profile_personal_phone_number || '',
        tagLine: apiUser.personal_info?.profile_personal_tagline || '',
        shortBio: apiUser.personal_info?.profile_personal_short_bio || '',
        emailIsPublic: apiUser.personal_info?.profile_personal_email_is_public === '1',
        phoneIsPublic: apiUser.personal_info?.profile_personal_phone_number_is_public === '1',
        tagLineIsPublic: apiUser.personal_info?.profile_personal_tagline_is_public === '1',
        shortBioIsPublic: apiUser.personal_info?.profile_personal_short_bio_is_public === '1',
        experienceIsPublic: apiUser.personal_info?.profile_personal_experience_is_public === '1',
        educationIsPublic: apiUser.personal_info?.profile_personal_education_is_public === '1',
        expertiseIsPublic: apiUser.personal_info?.profile_personal_expertise_is_public === '1',
        wishesIsPublic: apiUser.personal_info?.profile_personal_wishes_is_public === '1',
      };

      // Safely parse JSON strings
      try {
        // Parse experience info
        if (apiUser.experience_info && typeof apiUser.experience_info === 'string') {
          userData.experience = JSON.parse(apiUser.experience_info);
        } else {
          userData.experience = [];
        }

        // Parse education info
        if (apiUser.education_info && typeof apiUser.education_info === 'string') {
          userData.education = JSON.parse(apiUser.education_info);
        } else {
          userData.education = [];
        }

        // Parse expertise info
        if (apiUser.expertise_info && typeof apiUser.expertise_info === 'string') {
          userData.expertise = JSON.parse(apiUser.expertise_info);
        } else {
          userData.expertise = [];
        }

        // Parse wishes info
        if (apiUser.wishes_info && typeof apiUser.wishes_info === 'string') {
          userData.wishes = JSON.parse(apiUser.wishes_info);
        } else {
          userData.wishes = [];
        }

        // Parse social links
        if (apiUser.social_links && typeof apiUser.social_links === 'string') {
          const socialLinks = JSON.parse(apiUser.social_links);
          userData.facebook = socialLinks.facebook || '';
          userData.twitter = socialLinks.twitter || '';
          userData.linkedin = socialLinks.linkedin || '';
          userData.youtube = socialLinks.youtube || '';
        } else {
          userData.facebook = '';
          userData.twitter = '';
          userData.linkedin = '';
          userData.youtube = '';
        }
      } catch (error) {
        console.error(' Error parsing JSON data:', error);
        // Set default values for arrays if parsing fails
        userData.experience = [];
        userData.education = [];
        userData.expertise = [];
        userData.wishes = [];
        userData.facebook = '';
        userData.twitter = '';
        userData.linkedin = '';
        userData.youtube = '';
      }

      console.log(' Setting user data:', JSON.stringify(userData, null, 2));
      setUser(userData);
      setLoading(false);
    } else {
      console.error(' No user data received in ProfileScreen');
      Alert.alert('Error', 'Failed to load profile data.');
      setLoading(false);
    }
  }, [route.params]);

  const renderField = (label, value, isPublic) => {
    if (isPublic && value && value.trim() !== '') {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{label}:</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{value}</Text>
          </View>
        </View>
      );
    }
    return null;
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
       <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Profile</Text>
        
        {/* Edit Button with Image */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            console.log(' Navigating to EditProfile with:', {
              user: user,
              profile_uid: profileUID
            });
            navigation.navigate('EditProfile', { 
              user: user,
              profile_uid: profileUID
            });
          }}
        >
          <Image 
            source={require('../assets/Edit.png')}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {renderField('First Name (Public)', user?.firstName, true)}
      {renderField('Last Name (Public)', user?.lastName, true)}
      {renderField('Phone Number', user?.phoneNumber, user?.phoneIsPublic)}
      {renderField('Email', user?.email, user?.emailIsPublic)}
      {renderField('Tag Line (40 characters)', user?.tagLine, user?.tagLineIsPublic)}
      {renderField('Short Bio (15 words)', user?.shortBio, user?.shortBioIsPublic)}



      {/* {renderField('Experience', user?.experience, user?.experienceIsPublic)}
      {renderField('Education', user?.education, user?.educationIsPublic)}
      {renderField('Expertise', user?.expertise, user?.expertiseIsPublic)}
      {renderField('Wishes', user?.wishes, user?.wishesIsPublic)} */}

      {/* {(user?.tagLineIsPublic || user?.phoneIsPublic || 
  user?.firstname || user?.lastname) && (
  <MiniCard user={route.params.user} />
)} */}


      <MiniCard user={route.params.user} />










{/* Display Experience */}


      {user.experience?.some(exp => exp.isPublic) && (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>Experience:</Text>
    {user.experience.filter(exp => exp.isPublic).map((exp, index) => (
      <View key={index} style={styles.inputContainer}>
                <Text style={styles.inputText}>
          {exp.startDate || "MM/YYYY"} - {exp.endDate || "MM/YYYY"}
        </Text>
        <Text style={styles.inputText}>
          {exp.title || 'Title not specified'} 
        </Text>
        <Text style={styles.inputText}>
          {exp.company || 'Company not specified'}
        </Text>

      </View>
    ))}
  </View>
)}


{/* Display Education */}

{user.education?.some(edu => edu.isPublic) && (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>Education:</Text>
    {user.education.filter(edu => edu.isPublic).map((edu, index) => (
      <View key={index} style={styles.inputContainer}>
        <Text style={styles.inputText}>{edu.startDate || 'Start'} - {edu.endDate || 'End'}</Text>
        <Text style={styles.inputText}>{edu.degree || 'Degree not specified'}</Text>
        <Text style={styles.inputText}>{edu.school || 'School not specified'}</Text>
      </View>
    ))}
  </View>
)}


{/* Display Wishes */}

{user.wishes?.some(wish => wish.isPublic) && (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>Wishes:</Text>
    {user.wishes.filter(wish => wish.isPublic).map((wish, index) => (
      <View key={index} style={styles.inputContainer}>
        <Text style={styles.inputText}>
          {wish.helpNeeds || "No Title"}
        </Text>
        <Text style={styles.inputText}>
          {wish.details || "No Description"}
        </Text>
        <Text style={styles.inputText}>
          💰 {wish.amount ? `$${wish.amount}` : "Free"}
        </Text>
      </View>
    ))}
  </View>
)}




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
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  header: { fontSize: 24, fontWeight: 'bold' },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  inputText: { fontSize: 14, color: '#333' },
  editButton: { 
    padding: 20, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  editIcon: {
    width: 30,
    height: 30
  },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },

  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
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

export default ProfileScreen;