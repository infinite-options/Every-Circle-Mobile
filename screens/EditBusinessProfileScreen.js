// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native';
// import axios from 'axios';
// import MiniCard from '../components/MiniCard';
// import { Dropdown } from 'react-native-element-dropdown';

// const BusinessProfileAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo';
// const CategoryAPI = 'https://ioec2testsspm.infiniteoptions.com/category_list/all';

// export default function EditBusinessProfileScreen({ route, navigation }) {
//   const { business } = route.params || {};
//   const [businessUID] = useState(business?.business_uid || '');

//   const [categories, setCategories] = useState([]);
//   const [formData, setFormData] = useState({
//     name: business?.business_name || '',
//     location: business?.business_address_line_1 || '',
//     phone: business?.business_phone_number || '',
//     email: business?.business_email_id || '',
//     category: business?.business_category_id || '',
//     tagline: business?.business_tag_line || '',
//     shortBio: business?.business_short_bio || '',
//     website: business?.business_website || '',
//     socialLinks: {
//       facebook: business?.facebook || '',
//       instagram: business?.instagram || '',
//       linkedin: business?.linkedin || '',
//       twitter: business?.twitter || '',
//       youtube: business?.youtube || '',
//     },
//     emailIsPublic: business?.business_email_id_is_public || false,
//     phoneIsPublic: business?.business_phone_number_is_public || false,
//     taglineIsPublic: business?.business_tag_line_is_public || false,
//     shortBioIsPublic: business?.business_short_bio_is_public || false,
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch(CategoryAPI);
//       const json = await res.json();
//       if (Array.isArray(json.result)) {
//         setCategories(json.result.map(c => ({
//           label: c.category_name,
//           value: c.category_uid,
//         })));
//       }
//     } catch (error) {
//       console.error('Failed to fetch categories:', error);
//     }
//   };

//   const toggleVisibility = (fieldName) => {
//     setFormData(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
//   };

//   const handleSave = async () => {
//     if (!formData.name.trim() || !businessUID.trim()) {
//       Alert.alert('Error', 'Business name and ID are required.');
//       return;
//     }

//     if (!formData.category) {
//       Alert.alert('Error', 'Please select a business category.');
//       return;
//     }

//     try {
//       const payload = new FormData();

//       payload.append('business_uid', businessUID);
//       payload.append('business_name', formData.name);
//       payload.append('business_address_line_1', formData.location);
//       payload.append('business_phone_number', formData.phone);

//       if (formData.email?.trim()) {
//         payload.append('business_email_id', formData.email);
//       }
//       if (formData.tagline?.trim()) {
//         payload.append('business_tag_line', formData.tagline);
//       }
//       if (formData.shortBio?.trim()) {
//         payload.append('business_short_bio', formData.shortBio);
//       }
//       if (formData.website?.trim()) {
//         payload.append('business_website', formData.website);
//       }

//       payload.append('business_category_id', formData.category);

//       payload.append('business_email_id_is_public', formData.emailIsPublic ? '1' : '0');
//       payload.append('business_phone_number_is_public', formData.phoneIsPublic ? '1' : '0');
//       payload.append('business_tag_line_is_public', formData.taglineIsPublic ? '1' : '0');
//       payload.append('business_short_bio_is_public', formData.shortBioIsPublic ? '1' : '0');

//       const cleanLinks = {};
//       ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'].forEach(platform => {
//         if (formData.socialLinks[platform]?.trim()) {
//           cleanLinks[platform] = formData.socialLinks[platform];
//         }
//       });

//       if (Object.keys(cleanLinks).length > 0) {
//         payload.append('social_links', JSON.stringify(cleanLinks));
//       }

//       console.log('📤 Payload Preview:');
//       for (let pair of payload.entries()) {
//         console.log(`${pair[0]}: ${pair[1]}`);
//       }

//       const response = await axios.put(`${BusinessProfileAPI}`, payload, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       if (response.status === 200) {
//         Alert.alert('Success', 'Business profile updated.');
//         navigation.navigate('BusinessProfile', { business_uid: businessUID });
//       } else {
//         Alert.alert('Error', 'Update failed. Try again.');
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       Alert.alert('Error', 'Something went wrong.');
//     }
//   };

//   const renderField = (label, value, key, placeholder, visibilityKey = null) => (
//     <View style={styles.fieldContainer}>
//       <View style={styles.labelRow}>
//         <Text style={styles.label}>{label}</Text>
//         {visibilityKey && (
//           <TouchableOpacity onPress={() => toggleVisibility(visibilityKey)}>
//             <Text style={{ color: formData[visibilityKey] ? 'green' : 'red' }}>
//               {formData[visibilityKey] ? 'Public' : 'Private'}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//       <TextInput
//         style={styles.input}
//         value={value}
//         placeholder={placeholder || label}
//         onChangeText={(text) => setFormData({ ...formData, [key]: text })}
//       />
//     </View>
//   );

//   const renderSocialField = (label, platform) => (
//     <View style={styles.fieldContainer} key={platform}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.socialLinks[platform]}
//         placeholder={`Enter ${platform} link`}
//         onChangeText={(text) =>
//           setFormData({
//             ...formData,
//             socialLinks: { ...formData.socialLinks, [platform]: text },
//           })
//         }
//       />
//     </View>
//   );

//   const previewBusiness = {
//     business_name: formData.name,
//     tagline: formData.tagline,
//     business_short_bio: formData.shortBio,
//     business_phone_number: formData.phone,
//     business_email: formData.email,
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Edit Business Profile</Text>

//       {renderField('Business Name', formData.name, 'name')}
//       {renderField('Location', formData.location, 'location')}
//       {renderField('Phone Number', formData.phone, 'phone', '', 'phoneIsPublic')}
//       {renderField('Email', formData.email, 'email', '', 'emailIsPublic')}

//       <View style={styles.fieldContainer}>
//         <Text style={styles.label}>Business Category</Text>
//         <Dropdown
//           style={styles.input}
//           data={categories}
//           labelField="label"
//           valueField="value"
//           placeholder="Select a category"
//           value={formData.category}
//           onChange={(item) => setFormData({ ...formData, category: item.value })}
//         />
//       </View>

//       {renderField('Website', formData.website, 'website')}
//       {renderField('Tag Line', formData.tagline, 'tagline', '', 'taglineIsPublic')}
//       {renderField('Short Bio', formData.shortBio, 'shortBio', '', 'shortBioIsPublic')}

//       {/* <View style={styles.previewSection}>
//         <Text style={styles.label}>MiniCard Preview:</Text>
//         <MiniCard business={previewBusiness} />
//       </View> */}

//       <Text style={styles.label}>Social Links</Text>
//       {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map(platform =>
//         renderSocialField(platform.charAt(0).toUpperCase() + platform.slice(1), platform)
//       )}

//       <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//         <Text style={styles.saveButtonText}>Save</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 20 },
//   header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   fieldContainer: { marginBottom: 15 },
//   label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
//   labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
//   saveButton: {
//     backgroundColor: '#00C721',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 30,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   previewSection: {
//     marginVertical: 20,
//     backgroundColor: '#f5f5f5',
//     padding: 10,
//     borderRadius: 8,
//   },
// });



import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MiniCard from '../components/MiniCard';
const BusinessProfileAPI = 'https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo';
const CategoryAPI = 'https://ioec2testsspm.infiniteoptions.com/category_list/all';

export default function EditBusinessProfileScreen({ route, navigation }) {
  const { business_uid } = route.params || {};
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (business_uid) fetchBusinessInfo();
    fetchCategories();
  }, [business_uid]);

  const fetchBusinessInfo = async () => {
    try {
      const res = await fetch(`${BusinessProfileAPI}/${business_uid}`);
      const json = await res.json();
      const b = json.business;

      setFormData({
        name: b.business_name || '',
        location: b.business_address_line_1 || '',
        phone: b.business_phone_number || '',
        email: b.business_email_id || '',
        category: b.business_category_id || '',
        tagline: b.business_tag_line || '',
        shortBio: b.business_short_bio || '',
        website: b.business_website || '',
        emailIsPublic: String(b.business_email_id_is_public) === '1',
        phoneIsPublic: String(b.business_phone_number_is_public) === '1',
        taglineIsPublic: String(b.business_tag_line_is_public) === '1',
        shortBioIsPublic: String(b.business_short_bio_is_public) === '1',
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          ...(b.social_links ? JSON.parse(b.social_links) : {}),
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch business data.');
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryAPI);
      const json = await res.json();
      setCategories(json.result.map(c => ({ label: c.category_name, value: c.category_uid })));
    } catch (err) {
      console.error('Category fetch error:', err);
    }
  };

  const toggleVisibility = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!formData.name || !business_uid || !formData.category) {
      Alert.alert('Missing Info', 'Name, Category and ID are required.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('business_uid', business_uid);
      payload.append('business_name', formData.name);
      payload.append('business_address_line_1', formData.location);
      payload.append('business_phone_number', formData.phone);
      payload.append('business_email_id', formData.email);
      payload.append('business_website', formData.website);
      payload.append('business_tag_line', formData.tagline);
      payload.append('business_short_bio', formData.shortBio);
      payload.append('business_category_id', formData.category);
      payload.append('business_email_id_is_public', formData.emailIsPublic ? '1' : '0');
      payload.append('business_phone_number_is_public', formData.phoneIsPublic ? '1' : '0');
      payload.append('business_tag_line_is_public', formData.taglineIsPublic ? '1' : '0');
      payload.append('business_short_bio_is_public', formData.shortBioIsPublic ? '1' : '0');
      payload.append('social_links', JSON.stringify(formData.socialLinks));

      const res = await axios.put(BusinessProfileAPI, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        Alert.alert('Success', 'Business profile updated!');
        navigation.navigate('BusinessProfile', { business_uid });
      } else {
        Alert.alert('Error', 'Update failed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
      console.error(err);
    }
  };

  const renderField = (label, key, isPublicKey = null) => (
    <View style={styles.fieldContainer} key={key}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isPublicKey && (
          <TouchableOpacity onPress={() => toggleVisibility(isPublicKey)}>
            <Text style={{ color: formData[isPublicKey] ? 'green' : 'red' }}>
              {formData[isPublicKey] ? 'Public' : 'Private'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder={label}
        value={formData[key]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
      />
    </View>
  );

  if (!formData) return <Text style={{ margin: 20 }}>Loading...</Text>;


  const previewBusiness = {
    business_name: formData.name,
    business_email: formData.email,
    business_phone_number: formData.phone,
    business_tagline: formData.tagline,
    business_short_bio: formData.shortBio,
    emailIsPublic: formData.emailIsPublic,
    phoneIsPublic: formData.phoneIsPublic,
    taglineIsPublic: formData.taglineIsPublic,
    shortBioIsPublic: formData.shortBioIsPublic,
  };




  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Business Profile</Text>

      {renderField('Business Name', 'name')}
      {renderField('Location', 'location')}
      {renderField('Phone Number', 'phone', 'phoneIsPublic')}
      {renderField('Email', 'email', 'emailIsPublic')}
      {renderField('Website', 'website')}
      {renderField('Tag Line', 'tagline', 'taglineIsPublic')}
      {renderField('Short Bio', 'shortBio', 'shortBioIsPublic')}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Business Category</Text>
        <Dropdown
          style={styles.input}
          data={categories}
          labelField="label"
          valueField="value"
          value={formData.category}
          placeholder="Select Category"
          onChange={(item) => setFormData(prev => ({ ...prev, category: item.value }))}
        />
      </View>



      <View style={styles.previewSection}>
        <Text style={styles.label}>Mini Card (how your business appears):</Text>
        <MiniCard business={previewBusiness} type="business" />
      </View>

      <Text style={styles.label}>Social Links</Text>
      {['facebook', 'twitter', 'linkedin', 'youtube'].map(platform => (
        <TextInput
          key={platform}
          style={styles.input}
          placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
          value={formData.socialLinks[platform]}
          onChangeText={text =>
            setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, [platform]: text },
            }))
          }
        />
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5 },
  saveButton: {
    backgroundColor: '#00C721',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
