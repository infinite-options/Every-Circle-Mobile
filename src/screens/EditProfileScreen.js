import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image} from 'react-native';
import axios from 'axios';
import MiniCard from '../components/MiniCard';
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from '../components/EducationSection';
import WishesSection from "../components/WishesSection";




const ProfileScreenAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo';

const EditProfileScreen = ({ route, navigation }) => {
  // console.log(' EditProfileScreen Route Params:', route.params);
  
  // Extract profile_uid and user data from route params
  const { user, profile_uid: routeProfileUID } = route.params || {};
  
  // Initialize state with profile_uid from route params
  const [profileUID, setProfileUID] = useState(() => {
    const uid = routeProfileUID || user?.profile_uid || '';
    console.log(' Initial Profile UID:', uid);
    return uid.trim();
  });

  // Initialize form data with user data
  const [formData, setFormData] = useState(() => {
    console.log(' Initializing form data with user:', user);
    return {
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
      businessIsPublic: user?.businessIsPublic || false,
      expertiseIsPublic: user?.expertiseIsPublic || false,
      wishesIsPublic: user?.wishesIsPublic || false,
      experience: user?.experience || [{ company: '', title: '', startDate: '', endDate: '', isPublic: true  }],
      education: user?.education || [{ school: '', degree: '', startDate: '', endDate: '', isPublic: true }],
      businesses: user?.businesses || [{ name: '', industry: '', location: '' }],
      expertise: user?.expertise || [{ headline: '', description: '', cost: '', bounty: '' }],
      wishes: user?.wishes || [{ helpNeeds: '', details: '', isPublic: true }],
      facebook: user?.facebook || '',
      twitter: user?.twitter || '',
      linkedin: user?.linkedin || '',
      youtube: user?.youtube || ''
    };
  });

  // Validate profile_uid on component mount
  useEffect(() => {
    if (!profileUID) {
      console.error(' No profile_uid available in EditProfileScreen');
      Alert.alert('Error', 'Profile ID is missing. Please try again.');
      navigation.goBack();
    }
  }, []);

  useEffect(() => {
    if (route.params?.user) {
      const apiUser = route.params.user;

      
      // Extract profile_uid from either route.params or user object
      const extractedProfileUID = route.params.profile_uid || apiUser.profile_uid;
      console.log(' Extracted Profile UID:', extractedProfileUID);
      
      if (!extractedProfileUID) {
        console.error(' No profile_uid found in either route.params or user object');
        Alert.alert('Error', 'Profile ID is missing. Please try again.');
        return;
      }
      
      setProfileUID(extractedProfileUID);
      
      // Update form data with user information
      setFormData(prevData => ({
        ...prevData,
        email: apiUser.email || prevData.email,
        firstName: apiUser.firstName || prevData.firstName,
        lastName: apiUser.lastName || prevData.lastName,
        phoneNumber: apiUser.phoneNumber || prevData.phoneNumber,
        tagLine: apiUser.tagLine || prevData.tagLine,
        shortBio: apiUser.shortBio || prevData.shortBio,
        emailIsPublic: apiUser.emailIsPublic ?? prevData.emailIsPublic,
        phoneIsPublic: apiUser.phoneIsPublic ?? prevData.phoneIsPublic,
        tagLineIsPublic: apiUser.tagLineIsPublic ?? prevData.tagLineIsPublic,
        shortBioIsPublic: apiUser.shortBioIsPublic ?? prevData.shortBioIsPublic,
        experienceIsPublic: apiUser.experienceIsPublic ?? prevData.experienceIsPublic,
        educationIsPublic: apiUser.educationIsPublic ?? prevData.educationIsPublic,
        expertiseIsPublic: apiUser.expertiseIsPublic ?? prevData.expertiseIsPublic,
        wishesIsPublic: apiUser.wishesIsPublic ?? prevData.wishesIsPublic,
      }));
    }
  }, [route.params]);

  const toggleVisibility = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First Name and Last Name are required fields.');
      return;
    }

    // Validate public fields are not empty
    const publicFields = [
      { field: 'phoneNumber', isPublic: formData.phoneIsPublic },
      { field: 'tagLine', isPublic: formData.tagLineIsPublic },
      { field: 'shortBio', isPublic: formData.shortBioIsPublic }
    ];

    for (const { field, isPublic } of publicFields) {
      if (isPublic && !formData[field].trim()) {
        Alert.alert('Error', `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty when public.`);
        return;
      }
    }

    // Validate arrays if they are public
    if (formData.experienceIsPublic && formData.experience[0]?.company.trim() === '') {
      Alert.alert('Error', 'Experience cannot be empty when public.');
      return;
    }

    if (formData.educationIsPublic && formData.education[0]?.school.trim() === '') {
      Alert.alert('Error', 'Education cannot be empty when public.');
      return;
    }
    if (formData.businessIsPublic && formData.businesses[0]?.name.trim() === '') {
      Alert.alert('Error', 'Business cannot be empty when public.');
      return;
    }

    if (formData.expertiseIsPublic && formData.expertise[0]?.headline.trim() === '') {
      Alert.alert('Error', 'Expertise cannot be empty when public.');
      return;
    }

    if (formData.wishesIsPublic && formData.wishes[0]?.helpNeeds.trim() === '') {
      Alert.alert('Error', 'Wishes cannot be empty when public.');
      return;
    }

    console.log(' Save button clicked');
    const trimmedProfileUID = profileUID.trim();
    
    if (!trimmedProfileUID) {
      console.error(' Profile UID is missing or empty:', { 
        raw: profileUID,
        trimmed: trimmedProfileUID 
      });
      Alert.alert('Error', 'Profile ID is missing. Please try again.');
      return;
    }

    try {
      console.log(' Starting profile update with UID:', trimmedProfileUID);
      console.log(' Form Data:', formData);

      // Create FormData object for the request
      const payload = new FormData();
      
      // Add profile_uid
      payload.append('profile_uid', trimmedProfileUID);
      
      // Add personal info
      payload.append('user_email', formData.email);
      payload.append('profile_personal_first_name', formData.firstName);
      payload.append('profile_personal_last_name', formData.lastName);
      payload.append('profile_personal_phone_number', formData.phoneNumber);
      payload.append('profile_personal_tagline', formData.tagLine);
      payload.append('profile_personal_short_bio', formData.shortBio);
      
      // Add visibility settings
      payload.append('profile_personal_phone_number_is_public', formData.phoneIsPublic ? '1' : '0');
      payload.append('profile_personal_email_is_public', formData.emailIsPublic ? '1' : '0');
      payload.append('profile_personal_tagline_is_public', formData.tagLineIsPublic ? '1' : '0');
      payload.append('profile_personal_short_bio_is_public', formData.shortBioIsPublic ? '1' : '0');
      payload.append('profile_personal_experience_is_public', formData.experienceIsPublic ? '1' : '0');
      payload.append('profile_personal_education_is_public', formData.educationIsPublic ? '1' : '0');
      payload.append('profile_personal_business_is_public', formData.businessIsPublic ? '1' : '0');
      payload.append('profile_personal_expertise_is_public', formData.expertiseIsPublic ? '1' : '0');
      payload.append('profile_personal_wishes_is_public', formData.wishesIsPublic ? '1' : '0');

      // Add arrays as JSON strings
      payload.append('experience_info', JSON.stringify(formData.experience || []));
      payload.append('education_info', JSON.stringify(formData.education || []));
      payload.append('business_info', JSON.stringify(formData.businesses || []));
      payload.append('expertise_info', JSON.stringify(formData.expertise || []));
      payload.append('wishes_info', JSON.stringify(formData.wishes || []));
      
      // Add social links as JSON string
      payload.append('social_links', JSON.stringify({
        facebook: formData.facebook || '',
        twitter: formData.twitter || '',
        linkedin: formData.linkedin || '',
        youtube: formData.youtube || ''
      }));

      console.log(' Sending payload:', payload);
      console.log('Edit Profile PUT API: ',`${ProfileScreenAPI}?profile_uid=${trimmedProfileUID}`);

      const response = await axios({
        method: 'put',
        url: `${ProfileScreenAPI}?profile_uid=${trimmedProfileUID}`,
        data: payload,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('API Response:', response.data);

      if (response.status === 200) {
        console.log(' Profile updated successfully');
        Alert.alert('Success', 'Profile updated successfully!');
        
        // Structure the user data for navigation
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
            profile_personal_business_is_public: formData.businessIsPublic ? '1' : '0',
            profile_personal_expertise_is_public: formData.expertiseIsPublic ? '1' : '0',
            profile_personal_wishes_is_public: formData.wishesIsPublic ? '1' : '0'
          },
          experience_info: JSON.stringify(formData.experience || []),
          education_info: JSON.stringify(formData.education || []),
          expertise_info: JSON.stringify(formData.expertise || []),
          wishes_info: JSON.stringify(formData.wishes || []),
          social_links: JSON.stringify({
            facebook: formData.facebook || '',
            twitter: formData.twitter || '',
            linkedin: formData.linkedin || '',
            youtube: formData.youtube || ''
          })
        };

        console.log(' Navigating back to Profile with:', {
          user: updatedUserData,
          profile_uid: trimmedProfileUID
        });

        // Navigate back to Profile screen with fresh data
        navigation.navigate('Profile', { 
          user: updatedUserData,
          profile_uid: trimmedProfileUID
        });
      } else {
        console.error(' Non-200 response:', response.status, response.data);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error(' Error updating profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        profileUID: trimmedProfileUID,
        url: `${ProfileScreenAPI}?profile_uid=${trimmedProfileUID}`
      });

      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message ||
                         'Could not update profile. Please try again later.';
      
      console.error(' Error details:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const renderField = (label, value, isPublic, onChangeText, isEditable = true, fieldName, showToggle = true) => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label}:</Text>

          {/* Only show toggle if enabled */}
          {showToggle && (
          <TouchableOpacity 
            style={[
              styles.toggleButton
              ]} 
            onPress={() => toggleVisibility(fieldName)}

          >
             <Text style={[styles.toggleText, { color: isPublic ? '#4CAF50' : '#f44336' }]}>
              {isPublic ? 'Public' : 'Private'}
            </Text>
          </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[styles.input, !isEditable && styles.disabledInput]}
          value={value}
          // onChangeText={onChangeText}
          onChangeText={(text) => {
            if (onChangeText) {
              onChangeText(text);
            } else {
              setFormData(prev => ({
                ...prev,
                [fieldName]: text
              }));
            }
          }}
          editable={isEditable}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </View>
    );
  };

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
    wishesIsPublic: formData.wishesIsPublic
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>



      {renderField('First Name (Public)', formData.firstName, true, 
        (text) => setFormData({ ...formData, firstName: text }), true, null, false)}
      {renderField('Last Name (Public)', formData.lastName, true, 
        (text) => setFormData({ ...formData, lastName: text }), true, null, false)}

      {renderField('Phone Number', formData.phoneNumber, formData.phoneIsPublic, 
      (text) => setFormData({ ...formData, phoneNumber: text }), true, 'phoneIsPublic')}  

      {renderField('Email', formData.email, formData.emailIsPublic, null, false, 'emailIsPublic')}
      {renderField('Tag Line', formData.tagLine, formData.tagLineIsPublic, 
        (text) => setFormData({ ...formData, tagLine: text }), true, 'tagLineIsPublic')}

      {/* Live Preview Section */}
      <View style={styles.previewSection}>
        <Text style={styles.label}>Mini Card (how you'll appear in searches):</Text>
        <View style={styles.previewCard}>
          <MiniCard user={previewUser} />
        </View>
      </View>

      {renderField('Short Bio', formData.shortBio, formData.shortBioIsPublic, 
        (text) => setFormData({ ...formData, shortBio: text }), true, 'shortBioIsPublic')}










 {/* Experience Section */}

<ExperienceSection
  experience={formData.experience}
  setExperience={(updatedExperience) => setFormData({ ...formData, experience: updatedExperience })}
  toggleVisibility={() => toggleVisibility("experienceIsPublic")}
  isPublic={formData.experienceIsPublic}
/>


 {/* Education Section */}
 <EducationSection
  education={formData.education}
  setEducation={(updatedEducation) => setFormData({ ...formData, education: updatedEducation })}
  toggleVisibility={() => toggleVisibility("educationIsPublic")}
  isPublic={formData.educationIsPublic}
/>


 {/* Businesses Section */}




 {/* Expertise Section */}




 {/* Wishes Section */}
 <WishesSection
  wishes={formData.wishes}
  setWishes={(updatedWishes) => setFormData({ ...formData, wishes: updatedWishes })}
  toggleVisibility={() => toggleVisibility("wishesIsPublic")}
  isPublic={formData.wishesIsPublic}
/>


     
      

       {/**  Businesses Section **/}
       <View style={styles.sectionContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Businesses:</Text>
          <TouchableOpacity 
            style={[styles.toggleButton]}  
            onPress={() => toggleVisibility('businessIsPublic')}
          >
            <Text style={[styles.toggleText, { color: formData.businessIsPublic ? '#4CAF50' : '#f44336' }]}>
              {formData.businessIsPublic ? 'Public' : 'Private'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Business Name"
          value={formData.businesses[0]?.name || ''}
          onChangeText={(text) => {
            const newBusinesses = [...formData.businesses];
            newBusinesses[0] = { ...newBusinesses[0], name: text };
            setFormData({ ...formData, businesses: newBusinesses });
          }}
        />
      </View>

      {/* Expertise Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expertise:</Text>
          <TouchableOpacity 
            style={[
              styles.toggleButton
              ]}  
            onPress={() => toggleVisibility('expertiseIsPublic')}
          >
            <Text style={[styles.toggleText, { color: formData.expertiseIsPublic ? '#4CAF50' : '#f44336' }]}>
              {formData.expertiseIsPublic ? 'Public' : 'Private'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Headline"
          value={formData.expertise[0]?.headline || ''}
          onChangeText={(text) => {
            const newExpertise = [...formData.expertise];
            if (newExpertise.length === 0) {
              newExpertise.push({ headline: text, description: '', cost: '', bounty: '' });
            } else {
              newExpertise[0] = { ...newExpertise[0], headline: text };
            }
            setFormData({ ...formData, expertise: newExpertise });
          }}
        />
      </View>

      

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>



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
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  sectionContainer: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: { fontSize: 16, fontWeight: 'bold' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  toggleButton: {
    padding: 5,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  toggleText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  saveButton: { 
    backgroundColor: '#FFA500', 
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    // elevation: 4,
  },
  saveText: { 
    color: '#fff', 
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  previewSection: { marginBottom: 20 },
  previewCard: { marginBottom: 10 },
  previewSubtitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },


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

export default EditProfileScreen;