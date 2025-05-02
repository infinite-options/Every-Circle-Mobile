import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import axios from 'axios';
import ExperienceSection from '../components/ExperienceSection';
import EducationSection from '../components/EducationSection';
import WishesSection from '../components/WishesSection';
import MiniCard from '../components/MiniCard';
import ExpertiseSection from '../components/ExpertiseSection';
import BusinessSection from '../components/BusinessSection';
const ProfileScreenAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo';

const EditProfileScreen = ({ route, navigation }) => {
  console.log('In EditProfileScreen');
  const { user, profile_uid: routeProfileUID } = route.params || {};
  const [profileUID, setProfileUID] = useState(routeProfileUID || user?.profile_uid || '');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '', 
    phoneNumber: user?.phoneNumber || '',
    tagLine: user?.tagLine || '',
    shortBio: user?.shortBio || '',
    emailIsPublic: user?.emailIsPublic || false,
    phoneIsPublic: user?.phoneIsPublic || false,
    tagLineIsPublic: user?.tagLineIsPublic || false,
    shortBioIsPublic: user?.shortBioIsPublic || false,
    experienceIsPublic: user?.experienceIsPublic || false,
    educationIsPublic: user?.educationIsPublic || false,
    expertiseIsPublic: user?.expertiseIsPublic || false,
    wishesIsPublic: user?.wishesIsPublic || false,
    businessIsPublic: user?.businessIsPublic || false,
    businesses: user?.businesses || [{ name: '', role: '', isPublic: true }],   
    experience: user?.experience || [{ company: '', title: '', startDate: '', endDate: '', isPublic: true }],
    education: user?.education || [{ school: '', degree: '', startDate: '', endDate: '', isPublic: true }],
    wishes: user?.wishes || [{ helpNeeds: '', details: '', isPublic: true }],
    expertise: user?.expertise || [{ headline: '', description: '', cost: '', bounty: '', isPublic: true }],
    facebook: user?.facebook || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    youtube: user?.youtube || ''
  });

  const toggleVisibility = (fieldName) => {
    setFormData((prev) => {
      const newValue = !prev[fieldName];
      const updated = { ...prev, [fieldName]: newValue };
      if (fieldName === 'experienceIsPublic' && prev.experience.length === 1) updated.experience[0].isPublic = newValue;
      if (fieldName === 'educationIsPublic' && prev.education.length === 1) updated.education[0].isPublic = newValue;
      if (fieldName === 'wishesIsPublic' && prev.wishes.length === 1) updated.wishes[0].isPublic = newValue;
      if (fieldName === 'expertiseIsPublic' && prev.expertise.length === 1) updated.expertise[0].isPublic = newValue;
      if (fieldName === 'businessIsPublic' && prev.businesses.length === 1) updated.businesses[0].isPublic = newValue;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First Name and Last Name are required.');
      return;
    }

    const trimmedProfileUID = profileUID.trim();
    if (!trimmedProfileUID) {
      Alert.alert('Error', 'Profile ID is missing.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('profile_uid', trimmedProfileUID);
      payload.append('user_email', formData.email);
      payload.append('profile_personal_first_name', formData.firstName);
      payload.append('profile_personal_last_name', formData.lastName);
      payload.append('profile_personal_phone_number', formData.phoneNumber);
      payload.append('profile_personal_tagline', formData.tagLine);
      payload.append('profile_personal_short_bio', formData.shortBio);

      payload.append('profile_personal_phone_number_is_public', formData.phoneIsPublic ? '1' : '0');
      payload.append('profile_personal_email_is_public', formData.emailIsPublic ? '1' : '0');
      payload.append('profile_personal_tagline_is_public', formData.tagLineIsPublic ? '1' : '0');
      payload.append('profile_personal_short_bio_is_public', formData.shortBioIsPublic ? '1' : '0');
      payload.append('profile_personal_experience_is_public', formData.experienceIsPublic ? '1' : '0');
      payload.append('profile_personal_education_is_public', formData.educationIsPublic ? '1' : '0');
      payload.append('profile_personal_expertise_is_public', formData.expertiseIsPublic ? '1' : '0');
      payload.append('profile_personal_wishes_is_public', formData.wishesIsPublic ? '1' : '0');
      payload.append('profile_personal_business_is_public', formData.businessIsPublic ? '1' : '0');

      payload.append('experience_info', JSON.stringify(formData.experience || []));
      payload.append('education_info', JSON.stringify(formData.education || []));
      payload.append('expertise_info', JSON.stringify(formData.expertise || []));
      payload.append('wishes_info', JSON.stringify(formData.wishes || []));
      payload.append('business_info', JSON.stringify(formData.businesses || []));
      payload.append('social_links', JSON.stringify({
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        youtube: formData.youtube
      }));

      const response = await axios({
        method: 'put',
        url: `${ProfileScreenAPI}?profile_uid=${trimmedProfileUID}`,
        data: payload,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');

        const updatedUserData = {
          user_email: formData.email,
          personal_info: {
            profile_personal_uid: trimmedProfileUID,
            profile_personal_first_name: formData.firstName,
            profile_personal_last_name: formData.lastName,
            profile_personal_phone_number: formData.phoneNumber,
            profile_personal_tagline: formData.tagLine,
            profile_personal_short_bio: formData.shortBio,
            profile_personal_email_is_public: formData.emailIsPublic ? '1' : '0',
            profile_personal_phone_number_is_public: formData.phoneIsPublic ? '1' : '0',
            profile_personal_tagline_is_public: formData.tagLineIsPublic ? '1' : '0',
            profile_personal_short_bio_is_public: formData.shortBioIsPublic ? '1' : '0',
            profile_personal_experience_is_public: formData.experienceIsPublic ? '1' : '0',
            profile_personal_education_is_public: formData.educationIsPublic ? '1' : '0',
            profile_personal_expertise_is_public: formData.expertiseIsPublic ? '1' : '0',
            profile_personal_wishes_is_public: formData.wishesIsPublic ? '1' : '0',
            profile_personal_business_is_public: formData.businessIsPublic ? '1' : '0'
          },
          experience_info: JSON.stringify(formData.experience || []),
          education_info: JSON.stringify(formData.education || []),
          expertise_info: JSON.stringify(formData.expertise || []),
          wishes_info: JSON.stringify(formData.wishes || []),
          business_info: JSON.stringify(formData.businesses || []),
          social_links: JSON.stringify({
            facebook: formData.facebook,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            youtube: formData.youtube
          })
        };

        navigation.navigate('Profile', {
          user: updatedUserData,
          profile_uid: trimmedProfileUID
        });
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      Alert.alert('Error', 'Update failed. Please try again.');
      console.error('Update Error:', error);
    }
  };

  const renderField = (label, value, isPublic, fieldName, visibilityFieldName, editable = true) => (
    <View style={styles.fieldContainer}>
    {/* Row: Label and Toggle */}
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={() => toggleVisibility(visibilityFieldName)}>
        <Text style={[styles.toggleText, { color: isPublic ? 'green' : 'red' }]}>
          {isPublic ? 'Public' : 'Private'}
        </Text>
      </TouchableOpacity>
    </View>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        value={value}
        onChangeText={(text) => setFormData({ ...formData, [fieldName]: text })}
        editable={editable}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </View>
  );

  // Create a preview user object for the MiniCard that matches ProfileScreen structure
  const previewUser = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    tagLine: formData.tagLine,
    // Include visibility flags
    emailIsPublic: formData.emailIsPublic,
    phoneIsPublic: formData.phoneIsPublic,
    tagLineIsPublic: formData.tagLineIsPublic,
    shortBioIsPublic: formData.shortBioIsPublic,
    experienceIsPublic: formData.experienceIsPublic,
    educationIsPublic: formData.educationIsPublic,
    expertiseIsPublic: formData.expertiseIsPublic,
    wishesIsPublic: formData.wishesIsPublic,
    businessIsPublic: formData.businessIsPublic,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>


      {renderField('First Name (Public)', formData.firstName, true, 'firstName', 'firstNameIsPublic')}
      {renderField('Last Name (Public)', formData.lastName, true, 'lastName', 'lastNameIsPublic')}
      {renderField('Phone Number', formData.phoneNumber, formData.phoneIsPublic, 'phoneNumber', 'phoneIsPublic')}
      {renderField('Email', formData.email, formData.emailIsPublic, 'email', 'emailIsPublic')}
      {renderField('Tag Line', formData.tagLine, formData.tagLineIsPublic, 'tagLine', 'tagLineIsPublic')}
      
      
      {/* MiniCard Live Preview Section */}
      <View style={styles.previewSection}>
        <Text style={styles.label}>Mini Card (how you'll appear in searches):</Text>
        <View style={styles.previewCard}>
          <MiniCard user={previewUser} />
        </View>
      </View>
      
      {renderField('Short Bio', formData.shortBio, formData.shortBioIsPublic, 'shortBio', 'shortBioIsPublic')}

      <ExperienceSection experience={formData.experience} setExperience={(e) => setFormData({ ...formData, experience: e })} toggleVisibility={() => toggleVisibility('experienceIsPublic')} isPublic={formData.experienceIsPublic} />
      <EducationSection education={formData.education} setEducation={(e) => setFormData({ ...formData, education: e })} toggleVisibility={() => toggleVisibility('educationIsPublic')} isPublic={formData.educationIsPublic} />
      <BusinessSection businesses={formData.businesses} setBusinesses={(e) => setFormData({ ...formData, businesses: e })} toggleVisibility={() => toggleVisibility('businessIsPublic')} isPublic={formData.businessIsPublic} />
      <ExpertiseSection expertise={formData.expertise} setExpertise={(e) => setFormData({ ...formData, expertise: e })} toggleVisibility={() => toggleVisibility('expertiseIsPublic')} isPublic={formData.expertiseIsPublic} />

      <WishesSection wishes={formData.wishes} setWishes={(e) => setFormData({ ...formData, wishes: e })} toggleVisibility={() => toggleVisibility('wishesIsPublic')} isPublic={formData.wishesIsPublic} />


      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>



      
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  disabledInput: { backgroundColor: '#eee', color: '#999' },
  saveButton: {
    backgroundColor: '#FFA500',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  saveText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  navContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20, paddingVertical: 10, borderTopWidth: 1, borderColor: '#ddd' },
  navButton: { alignItems: 'center' },
  navIcon: { width: 25, height: 25 },
  navLabel: { fontSize: 12, color: '#333', marginTop: 4 }
});

export default EditProfileScreen;
