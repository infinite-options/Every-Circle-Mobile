// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Image, ScrollView } from 'react-native';
// import axios from 'axios';
// import MiniCard from '../components/MiniCard';

// const ProfileScreen = ({ route }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [editedUser, setEditedUser] = useState(null);

//   useEffect(() => {
//     if (route.params?.user) {
//       const apiUser = route.params.user;

//       console.log("🔵 Received User Data in ProfileScreen:", apiUser);

//       // ✅ Correctly mapping `profile_personal_uid` to `profile_uid`
//       const mappedUser = {
//         profile_uid: apiUser.personal_info?.profile_personal_uid || '', // ✅ FIXED: Correct field mapped
//         email: apiUser.user_email || '',
//         user_first_name: apiUser.personal_info?.profile_personal_first_name || '',
//         user_last_name: apiUser.personal_info?.profile_personal_last_name || '',
//         user_phone_number: apiUser.personal_info?.profile_personal_phone_number || '',
//         user_profile_image: apiUser.personal_info?.profile_personal_image || '',
//         user_tagline: apiUser.personal_info?.profile_personal_tag_line || '',
//         user_short_bio: apiUser.personal_info?.profile_personal_short_bio || '',
//         user_resume: apiUser.personal_info?.profile_personal_resume || '',
//         user_experience: apiUser.experience_info || [],
//         user_education: apiUser.education_info || [],
//         user_businesses: apiUser.business_info || [],
//         user_expertise: apiUser.expertise_info || [],
//         user_wishes: apiUser.wishes_info || [],
//       };

//       setUser(mappedUser);
//       setEditedUser(mappedUser);
//       setLoading(false);
//     } else {
//       console.error("❌ No user data received.");
//       Alert.alert('Error', 'Failed to load profile data.');
//       setLoading(false);
//     }
//   }, [route.params]);

//   const handleEdit = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleSave = async () => {
//     if (!user?.profile_uid) {
//       Alert.alert('Error', 'Profile UID is required for updating profile.');
//       return;
//     }

//     setLoading(true);

//     const updatedData = {
//       profile_uid: user.profile_uid, //  FIXED: Ensures `profile_uid` is sent
//       email: user.email,
//       user_first_name: editedUser?.user_first_name || user.user_first_name,
//       user_last_name: editedUser?.user_last_name || user.user_last_name,
//       user_phone_number: editedUser?.user_phone_number || user.user_phone_number,
//       user_profile_image: editedUser?.user_profile_image || user.user_profile_image,
//       user_tagline: editedUser?.user_tagline || user.user_tagline,
//       user_short_bio: editedUser?.user_short_bio || user.user_short_bio,
//       user_resume: editedUser?.user_resume || user.user_resume,
//       user_experience: editedUser?.user_experience || user.user_experience,
//       user_education: editedUser?.user_education || user.user_education,
//       user_businesses: editedUser?.user_businesses || user.user_businesses,
//       user_expertise: editedUser?.user_expertise || user.user_expertise,
//       user_wishes: editedUser?.user_wishes || user.user_wishes,
//     };

//     console.log("🟡 Sending profile update request:", JSON.stringify(updatedData, null, 2));

//     try {
//       const response = await axios.put(
//         'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo', // ✅ API URL
//         updatedData,
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       console.log("🟢 Update API Response:", response.data);

//       if (response.status === 200) {
//         Alert.alert('Success', 'Profile updated successfully!');
//         setUser(editedUser);
//         setIsEditing(false);
//       } else {
//         Alert.alert('Error', 'Failed to update profile.');
//       }
//     } catch (error) {
//       console.error('❌ Error updating profile:', error.response?.data || error.message);
//       Alert.alert('Error', 'Could not update profile.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />;
//   }

//   if (!user) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>No user data available.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.profileName}>
//           {user?.user_first_name || "User"} {user?.user_last_name || ""}
//         </Text>
//         <TouchableOpacity onPress={isEditing ? handleSave : handleEdit}>
//           <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
//         </TouchableOpacity>
//       </View>

//       <Image
//         source={{ uri: user?.user_profile_image || 'https://via.placeholder.com/100' }}
//         style={styles.profileImage}
//       />

//       <Text style={styles.label}>Email:</Text>
//       <TextInput
//         style={styles.input}
//         editable={false}
//         value={user?.email || ''}
//       />

//       {isEditing && (
//         <>
//           <Text style={styles.label}>First Name:</Text>
//           <TextInput
//             style={styles.input}
//             value={editedUser?.user_first_name || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_first_name: text })}
//           />

//           <Text style={styles.label}>Last Name:</Text>
//           <TextInput
//             style={styles.input}
//             value={editedUser?.user_last_name || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_last_name: text })}
//           />

//           <Text style={styles.label}>Phone Number:</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="phone-pad"
//             value={editedUser?.user_phone_number || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_phone_number: text })}
//           />

//           <Text style={styles.label}>Tagline:</Text>
//           <TextInput
//             style={styles.input}
//             value={editedUser?.user_tagline || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_tagline: text })}
//           />

//           <MiniCard user={user} />

//           <Text style={styles.label}>Short Bio:</Text>
//           <TextInput
//             style={styles.input}
//             value={editedUser?.user_short_bio || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_short_bio: text })}
//           />

//           <Text style={styles.sectionTitle}>Resume</Text>
//           <TextInput
//             style={styles.input}
//             value={editedUser?.user_resume || ''}
//             onChangeText={(text) => setEditedUser({ ...editedUser, user_resume: text })}
//           />

//           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//             <Text style={styles.saveButtonText}>Save</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#fff' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   profileName: { fontSize: 20, fontWeight: 'bold' },
//   editButton: { color: '#007BFF', fontSize: 16 },
//   profileImage: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 20 },
//   input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
//   saveButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
//   saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
// });

// export default ProfileScreen;


import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import axios from 'axios';
// import * as DocumentPicker from 'expo-document-picker';
// import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ route }) => {
  const { email = '', profile_uid = '' } = route.params?.user?.personal_info || {};
  const [profileUID, setProfileUID] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    tagLine: '',
    shortBio: '',
    profileImage: null,
    resume: null,
    experience: [{ company: '', title: '', startDate: '', endDate: '' }],
    education: [{ school: '', degree: '', startDate: '', endDate: '' }],
    expertise: [{ headline: '', description: '', cost: '', bounty: '' }],
    wishes: [{ helpNeeds: '', details: '' }],
    allowBannerAds: true,
    bannerAdsBounty: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.user) {
      const apiUser = route.params.user;
      console.log(' Received User Data:', apiUser);

      // Extract `profile_uid` safely and set it in state
      const userProfileUID = apiUser.personal_info?.profile_uid || '';
      setProfileUID(userProfileUID);
      console.log("🟢 Extracted Profile UID:", userProfileUID); // Debugging log


      setFormData({
        firstName: apiUser.personal_info?.profile_personal_first_name || '',
        lastName: apiUser.personal_info?.profile_personal_last_name || '',
        phoneNumber: apiUser.personal_info?.profile_personal_phone_number || '',
        tagLine: apiUser.personal_info?.profile_personal_tag_line || '',
        shortBio: apiUser.personal_info?.profile_personal_short_bio || '',
        profileImage: apiUser.personal_info?.profile_personal_image || null,
        resume: apiUser.personal_info?.profile_personal_resume || null,
        experience: apiUser.experience_info?.length ? apiUser.experience_info : [{ company: '', title: '', startDate: '', endDate: '' }],
        education: apiUser.education_info?.length ? apiUser.education_info : [{ school: '', degree: '', startDate: '', endDate: '' }],
        expertise: apiUser.expertise_info?.length ? apiUser.expertise_info : [{ headline: '', description: '', cost: '', bounty: '' }],
        wishes: apiUser.wishes_info?.length ? apiUser.wishes_info : [{ helpNeeds: '', details: '' }],
        allowBannerAds: apiUser.personal_info?.profile_personal_allow_banner_ads ?? true,
        bannerAdsBounty: apiUser.personal_info?.profile_personal_banner_ads_bounty || '',
      });

      setLoading(false);
    } else {
      console.error(' No user data received.');
      Alert.alert('Error', 'Failed to load profile data.');
      setLoading(false);
    }
  }, [route.params]);

  // const handleFileUpload = async (type) => {
  //   try {
  //     if (type === 'resume') {
  //       const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  //       if (result.type === 'success') {
  //         setFormData((prev) => ({ ...prev, resume: result.uri }));
  //       }
  //     } else if (type === 'profileImage') {
  //       const result = await ImagePicker.launchImageLibraryAsync({
  //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //         allowsEditing: true,
  //         quality: 1,
  //       });
  //       if (!result.canceled) {
  //         setFormData((prev) => ({ ...prev, profileImage: result.assets[0].uri }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error(' File Upload Error:', error);
  //   }
  // };

  const handleSave = async () => {
    console.log("🟢 Profile UID before saving:", profileUID); // Debugging log

    if (!profile_uid) {
      Alert.alert('Error', 'Profile UID is missing! Please try again.');
      return;
    }

    try {
      const form = new FormData();
      form.append('profile_uid', profile_uid);
      form.append('profile_personal_first_name', formData.firstName);
      form.append('profile_personal_last_name', formData.lastName);
      form.append('profile_personal_phone_number', formData.phoneNumber);
      form.append('profile_personal_tag_line', formData.tagLine || '');
      form.append('profile_personal_short_bio', formData.shortBio || '');
      form.append('profile_personal_allow_banner_ads', formData.allowBannerAds ? 1 : 0);
      form.append('profile_personal_banner_ads_bounty', formData.bannerAdsBounty || '');



      if (formData.profileImage && typeof formData.profileImage !== 'string') {
        form.append('profile_image', {
          uri: formData.profileImage,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      if (formData.resume && typeof formData.resume !== 'string') {
        form.append('profile_personal_resume', {
          uri: formData.resume,
          name: 'resume.pdf',
          type: 'application/pdf',
        });
      }

      form.append('experiences', JSON.stringify(formData.experience));
      form.append('educations', JSON.stringify(formData.education));
      form.append('expertises', JSON.stringify(formData.expertise));
      form.append('wishes', JSON.stringify(formData.wishes));

      console.log(' Sending Profile Update:', form);

      const response = await axios.put(
        'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log(' Update API Response:', response.data);

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error(' Error updating profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not update profile. Please try again later.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={styles.profileContainer} contentContainerStyle={styles.scrollContent}>
  <Text style={styles.profileHeader}>Edit Your Profile</Text>

  <TextInput style={styles.input} placeholder="First Name" value={formData.firstName} onChangeText={(text) => setFormData({ ...formData, firstName: text })} />
  <TextInput style={styles.input} placeholder="Last Name" value={formData.lastName} onChangeText={(text) => setFormData({ ...formData, lastName: text })} />
  <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })} />
  <TextInput style={styles.input} placeholder="Tagline" value={formData.tagLine} onChangeText={(text) => setFormData({ ...formData, tagLine: text })} />
  <TextInput style={styles.input} placeholder="Short Bio" value={formData.shortBio} onChangeText={(text) => setFormData({ ...formData, shortBio: text })} />

  <TouchableOpacity onPress={() => handleFileUpload('resume')} style={styles.uploadButton}>
    {/* <Text style={styles.uploadText}>{formData.resume ? 'Resume Uploaded' : 'Upload Resume'}</Text>  */}
  </TouchableOpacity>


  <Text style={styles.sectionTitle}>Education</Text>
      {formData.education.map((edu, index) => (
        <TextInput key={index} style={styles.input} placeholder="School Name" value={edu.school} onChangeText={(text) => {
          const newEdu = [...formData.education];
          newEdu[index].school = text;
          setFormData({ ...formData, education: newEdu });
        }} />
      ))}

      <Text style={styles.sectionTitle}>Experience</Text>
      {formData.experience.map((exp, index) => (
        <TextInput key={index} style={styles.input} placeholder="Company Name" value={exp.company} onChangeText={(text) => {
          const newExp = [...formData.experience];
          newExp[index].company = text;
          setFormData({ ...formData, experience: newExp });
        }} />
      ))}

      <Text style={styles.sectionTitle}>Wishes</Text>
      {formData.wishes.map((wish, index) => (
        <TextInput key={index} style={styles.input} placeholder="What help do you need?" value={wish.helpNeeds} onChangeText={(text) => {
          const newWishes = [...formData.wishes];
          newWishes[index].helpNeeds = text;
          setFormData({ ...formData, wishes: newWishes });
        }} />
      ))}



  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
    <Text style={styles.saveText}>Save Changes</Text>
  </TouchableOpacity>

  
</ScrollView>

  );
};

const styles = StyleSheet.create({
  profileContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  scrollContent: { alignItems: 'center' }, // Fix: Move alignItems here
  profileHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '90%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, paddingLeft: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  saveButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 10, marginTop: 10 },
  saveText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  uploadButton: { marginBottom: 20 },
  uploadText: { color: '#007BFF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
});


export default ProfileScreen;
