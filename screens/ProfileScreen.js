import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MenuBar from "../components/MenuBar";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.content}>
          <Text>Profile content goes here</Text>
        </View>
      </View>

      <MenuBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60, // Manual safe area handling
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
});






// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Image,
//   Alert
// } from 'react-native';
// // import MiniCard from '../components/MiniCard';

// export default function ProfileScreen({ route, navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [profileUID, setProfileUID] = useState('');

//   useEffect(() => {
//     if (route.params?.user) {
//       const apiUser = route.params.user;
//       const extractedProfileUID =
//         route.params.profile_uid || apiUser.personal_info?.profile_personal_uid || '';
//       const extractedEmail = apiUser?.user_email || route.params?.email || '';

//       if (!extractedProfileUID) {
//         Alert.alert('Error', 'Profile ID is missing.');
//         setLoading(false);
//         return;
//       }

//       setProfileUID(extractedProfileUID);

//       const userData = {
//         profile_uid: extractedProfileUID,
//         email: extractedEmail,
//         firstName: apiUser.personal_info?.profile_personal_first_name || '',
//         lastName: apiUser.personal_info?.profile_personal_last_name || '',
//         phoneNumber: apiUser.personal_info?.profile_personal_phone_number || '',
//         tagLine: apiUser.personal_info?.profile_personal_tagline || '',
//         shortBio: apiUser.personal_info?.profile_personal_short_bio || '',
//         emailIsPublic: apiUser.personal_info?.profile_personal_email_is_public === '1',
//         phoneIsPublic: apiUser.personal_info?.profile_personal_phone_number_is_public === '1',
//         tagLineIsPublic: apiUser.personal_info?.profile_personal_tagline_is_public === '1',
//         shortBioIsPublic: apiUser.personal_info?.profile_personal_short_bio_is_public === '1',
//         experienceIsPublic: apiUser.personal_info?.profile_personal_experience_is_public === '1',
//         educationIsPublic: apiUser.personal_info?.profile_personal_education_is_public === '1',
//         expertiseIsPublic: apiUser.personal_info?.profile_personal_expertise_is_public === '1',
//         wishesIsPublic: apiUser.personal_info?.profile_personal_wishes_is_public === '1',
//         experience: [],
//         education: [],
//         expertise: [],
//         wishes: [],
//         facebook: '',
//         twitter: '',
//         linkedin: '',
//         youtube: ''
//       };

//       try {
//         userData.experience = JSON.parse(apiUser.experience_info || '[]');
//         userData.education = JSON.parse(apiUser.education_info || '[]');
//         userData.expertise = JSON.parse(apiUser.expertise_info || '[]');
//         userData.wishes = JSON.parse(apiUser.wishes_info || '[]');
//         const socialLinks = JSON.parse(apiUser.social_links || '{}');
//         userData.facebook = socialLinks.facebook || '';
//         userData.twitter = socialLinks.twitter || '';
//         userData.linkedin = socialLinks.linkedin || '';
//         userData.youtube = socialLinks.youtube || '';
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }

//       setUser(userData);
//       setLoading(false);
//     } else {
//       Alert.alert('Error', 'No user data received.');
//       setLoading(false);
//     }
//   }, [route.params]);

//   const renderField = (label, value, isPublic) => {
//     if (isPublic && value) {
//       return (
//         <View style={styles.fieldContainer}>
//           <Text style={styles.label}>{label}:</Text>
//           <View style={styles.inputContainer}>
//             <Text style={styles.inputText}>{value}</Text>
//           </View>
//         </View>
//       );
//     }
//     return null;
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
//       <View style={styles.headerContainer}>
//         <Text style={styles.header}>Your Profile</Text>
//         <TouchableOpacity
//           style={styles.editButton}
//           onPress={() =>
//             navigation.navigate('EditProfile', {
//               user,
//               profile_uid: profileUID
//             })
//           }
//         >
//           <Image source={require('../assets/Edit.png')} style={styles.editIcon} />
//         </TouchableOpacity>
//       </View>

//       {renderField('First Name', user.firstName, true)}
//       {renderField('Last Name', user.lastName, true)}
//       {renderField('Phone Number', user.phoneNumber, user.phoneIsPublic)}
//       {renderField('Email', user.email, user.emailIsPublic)}
//       {renderField('Tagline', user.tagLine, user.tagLineIsPublic)}
//       {renderField('Short Bio', user.shortBio, user.shortBioIsPublic)}

//       <MiniCard user={route.params.user} />

//       {user.experience?.some(exp => exp.isPublic) && (
//         <View style={styles.fieldContainer}>
//           <Text style={styles.label}>Experience:</Text>
//           {user.experience
//             .filter(exp => exp.isPublic)
//             .map((exp, index) => (
//               <View key={index} style={styles.inputContainer}>
//                 <Text style={styles.inputText}>
//                   {exp.startDate} - {exp.endDate}
//                 </Text>
//                 <Text style={styles.inputText}>{exp.title}</Text>
//                 <Text style={styles.inputText}>{exp.company}</Text>
//               </View>
//             ))}
//         </View>
//       )}

//       {user.education?.some(edu => edu.isPublic) && (
//         <View style={styles.fieldContainer}>
//           <Text style={styles.label}>Education:</Text>
//           {user.education
//             .filter(edu => edu.isPublic)
//             .map((edu, index) => (
//               <View key={index} style={styles.inputContainer}>
//                 <Text style={styles.inputText}>
//                   {edu.startDate} - {edu.endDate}
//                 </Text>
//                 <Text style={styles.inputText}>{edu.degree}</Text>
//                 <Text style={styles.inputText}>{edu.school}</Text>
//               </View>
//             ))}
//         </View>
//       )}

//       {user.wishes?.some(wish => wish.isPublic) && (
//         <View style={styles.fieldContainer}>
//           <Text style={styles.label}>Wishes:</Text>
//           {user.wishes
//             .filter(wish => wish.isPublic)
//             .map((wish, index) => (
//               <View key={index} style={styles.inputContainer}>
//                 <Text style={styles.inputText}>{wish.helpNeeds}</Text>
//                 <Text style={styles.inputText}>{wish.details}</Text>
//                 <Text style={styles.inputText}>
//                   💰 {wish.amount ? `$${wish.amount}` : 'Free'}
//                 </Text>
//               </View>
//             ))}
//         </View>
//       )}

//       <View style={styles.navContainer}>
//         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
//           <Image source={require('../assets/profile.png')} style={styles.navIcon} />
//           <Text style={styles.navLabel}>Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
//           <Image source={require('../assets/setting.png')} style={styles.navIcon} />
//           <Text style={styles.navLabel}>Settings</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
//           <Image source={require('../assets/pillar.png')} style={styles.navIcon} />
//           <Text style={styles.navLabel}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Share')}>
//           <Image source={require('../assets/share.png')} style={styles.navIcon} />
//           <Text style={styles.navLabel}>Share</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Search')}>
//           <Image source={require('../assets/search.png')} style={styles.navIcon} />
//           <Text style={styles.navLabel}>Search</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 20 },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20
//   },
//   header: { fontSize: 24, fontWeight: 'bold' },
//   fieldContainer: { marginBottom: 15 },
//   label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
//   inputContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     borderRadius: 5,
//     backgroundColor: '#f5f5f5'
//   },
//   inputText: { fontSize: 14, color: '#333' },
//   editButton: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   editIcon: {
//     width: 30,
//     height: 30
//   },
//   errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
//   navContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: '#ddd'
//   },
//   navButton: {
//     alignItems: 'center'
//   },
//   navIcon: {
//     width: 25,
//     height: 25
//   },
//   navLabel: {
//     fontSize: 12,
//     color: '#333',
//     marginTop: 4
//   }
// });

