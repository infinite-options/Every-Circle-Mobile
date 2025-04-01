import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import axios from 'axios';
import ExperienceSection from '../components/ExperienceSection';
import EducationSection from '../components/EducationSection';
import WishesSection from '../components/WishesSection';

const ProfileScreenAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo';

const EditProfileScreen = ({ route, navigation }) => {
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

      payload.append('experience_info', JSON.stringify(formData.experience || []));
      payload.append('education_info', JSON.stringify(formData.education || []));
      payload.append('expertise_info', JSON.stringify(formData.expertise || []));
      payload.append('wishes_info', JSON.stringify(formData.wishes || []));
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
            profile_personal_wishes_is_public: formData.wishesIsPublic ? '1' : '0'
          },
          experience_info: JSON.stringify(formData.experience || []),
          education_info: JSON.stringify(formData.education || []),
          expertise_info: JSON.stringify(formData.expertise || []),
          wishes_info: JSON.stringify(formData.wishes || []),
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

  const renderField = (label, value, isPublic, fieldName, editable = true) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        value={value}
        onChangeText={(text) => setFormData({ ...formData, [fieldName]: text })}
        editable={editable}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <TouchableOpacity onPress={() => toggleVisibility(fieldName + 'IsPublic')}>
        <Text style={{ color: isPublic ? 'green' : 'red' }}>{isPublic ? 'Public' : 'Private'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      {renderField('First Name', formData.firstName, true, 'firstName')}
      {renderField('Last Name', formData.lastName, true, 'lastName')}
      {renderField('Phone Number', formData.phoneNumber, formData.phoneIsPublic, 'phoneNumber')}
      {renderField('Email', formData.email, formData.emailIsPublic, 'email')}
      {renderField('Tag Line', formData.tagLine, formData.tagLineIsPublic, 'tagLine')}
      {renderField('Short Bio', formData.shortBio, formData.shortBioIsPublic, 'shortBio')}

      <ExperienceSection experience={formData.experience} setExperience={(e) => setFormData({ ...formData, experience: e })} toggleVisibility={() => toggleVisibility('experienceIsPublic')} isPublic={formData.experienceIsPublic} />
      <EducationSection education={formData.education} setEducation={(e) => setFormData({ ...formData, education: e })} toggleVisibility={() => toggleVisibility('educationIsPublic')} isPublic={formData.educationIsPublic} />
      <WishesSection wishes={formData.wishes} setWishes={(e) => setFormData({ ...formData, wishes: e })} toggleVisibility={() => toggleVisibility('wishesIsPublic')} isPublic={formData.wishesIsPublic} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
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
  saveText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

export default EditProfileScreen;
