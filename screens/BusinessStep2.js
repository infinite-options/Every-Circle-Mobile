





// BusinessStep2.js (Updated with AsyncStorage)
// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Dropdown } from 'react-native-element-dropdown';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get('window');

// export default function BusinessStep2({ formData, setFormData }) {
//   const [allCategories, setAllCategories] = useState([]);
//   const [mainCategories, setMainCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [subSubCategories, setSubSubCategories] = useState([]);

//   const [selectedMain, setSelectedMain] = useState(null);
//   const [selectedSub, setSelectedSub] = useState(null);
//   const [selectedSubSub, setSelectedSubSub] = useState(null);
//   const [customTag, setCustomTag] = useState('');
//   const [customTags, setCustomTags] = useState(formData.customTags || []);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("https://ioec2testsspm.infiniteoptions.com/category_list/all");
//         const json = await res.json();
//         setAllCategories(json.result);
//         setMainCategories(json.result.filter(cat => cat.category_parent_id === null));
//       } catch (e) {
//         console.error("Fetch category error:", e);
//       }
//     };
//     fetchCategories();

//     const loadSavedForm = async () => {
//       try {
//         const stored = await AsyncStorage.getItem('businessFormData');
//         if (stored) {
//           const parsed = JSON.parse(stored);
//           setFormData(prev => ({ ...prev, ...parsed }));
//         }
//       } catch (err) {
//         console.error('Error loading saved form data:', err);
//       }
//     };
//     loadSavedForm();
//   }, []);

//   useEffect(() => {
//     const updated = allCategories.filter(c => c.category_parent_id === selectedMain);
//     setSubCategories(updated);
//     setSelectedSub(null);
//     setSelectedSubSub(null);
//     setSubSubCategories([]);
//   }, [selectedMain]);

//   useEffect(() => {
//     const updated = allCategories.filter(c => c.category_parent_id === selectedSub);
//     setSubSubCategories(updated);
//     setSelectedSubSub(null);
//   }, [selectedSub]);

//   useEffect(() => {
//     const selectedIds = [selectedMain, selectedSub, selectedSubSub].filter(Boolean);
//     const updatedForm = {
//       ...formData,
//       categories: selectedIds,
//       customTags,
//     };
//     setFormData(updatedForm);
//     AsyncStorage.setItem('businessFormData', JSON.stringify(updatedForm)).catch(err => console.error('Save error', err));
//   }, [selectedMain, selectedSub, selectedSubSub, customTags]);

//   const handleImagePick = async (index) => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 1,
//     });
//     if (!result.canceled) {
//       const updated = [...formData.images];
//       updated[index] = result.assets[0].uri;
//       const newFormData = { ...formData, images: updated };
//       setFormData(newFormData);
//       AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
//     }
//   };

//   const addTag = () => {
//     if (customTag.trim()) {
//       const updatedTags = [...customTags, customTag.trim()];
//       setCustomTags(updatedTags);
//       const newFormData = { ...formData, customTags: updatedTags };
//       setFormData(newFormData);
//       AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
//       setCustomTag('');
//     }
//   };

//   const removeTag = (tag) => {
//     const updatedTags = customTags.filter(t => t !== tag);
//     setCustomTags(updatedTags);
//     const newFormData = { ...formData, customTags: updatedTags };
//     setFormData(newFormData);
//     AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
//       <Text style={styles.title}>Select Category</Text>
//       <Text style={styles.subtitle}>Select Tags for your business</Text>

//       <Text style={styles.label}>Main Categories</Text>
//       <Dropdown
//         style={styles.dropdown}
//         data={mainCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
//         labelField="label"
//         valueField="value"
//         placeholder="Select Main Category"
//         value={selectedMain}
//         onChange={item => setSelectedMain(item.value)}
//       />

//       {subCategories.length > 0 && (
//         <>
//           <Text style={styles.label}>Sub Categories</Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={subCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Sub Category"
//             value={selectedSub}
//             onChange={item => setSelectedSub(item.value)}
//           />
//         </>
//       )}

//       {subSubCategories.length > 0 && (
//         <>
//           <Text style={styles.label}>Sub-Sub Categories (Optional)</Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={subSubCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
//             labelField="label"
//             valueField="value"
//             placeholder="Select Sub-Sub Category"
//             value={selectedSubSub}
//             onChange={item => setSelectedSubSub(item.value)}
//           />
//         </>
//       )}

//       <Text style={styles.label}>Brief Description</Text>
//       <TextInput
//         style={styles.textarea}
//         placeholder="Describe your business..."
//         value={formData.shortBio}
//         multiline
//         numberOfLines={4}
//         onChangeText={text => {
//           const updated = { ...formData, shortBio: text };
//           setFormData(updated);
//           AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
//         }}
//       />

//       <Text style={styles.label}>Upload Images</Text>
//       <View style={styles.imageRow}>
//         {Array.from({ length: 3 }).map((_, index) => (
//           <TouchableOpacity key={index} style={styles.uploadBox} onPress={() => handleImagePick(index)}>
//             {formData.images?.[index] ? (
//               <Image source={{ uri: formData.images[index] }} style={styles.uploadedImage} />
//             ) : (
//               <Text style={styles.uploadText}>Upload Image</Text>
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>

//       <Text style={styles.label}>Custom Tags</Text>
//       <View style={styles.tagRow}>
//         <TextInput
//           style={styles.tagInput}
//           placeholder="Add tag"
//           value={customTag}
//           onChangeText={setCustomTag}
//           onSubmitEditing={addTag}
//         />
//         <TouchableOpacity onPress={addTag} style={styles.tagButton}>
//           <Text style={styles.tagButtonText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.tagList}>
//         {customTags.map((tag, i) => (
//           <TouchableOpacity key={i} onPress={() => removeTag(tag)} style={styles.tagItem}>
//             <Text>{tag} ✕</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     width: width*1.3,
//     flex: 1, 
//     backgroundColor: '#00C721',
//     borderTopLeftRadius: width,
//     borderTopRightRadius: width,
//     borderBottomLeftRadius: width,
//     borderBottomRightRadius: width,
//     alignSelf: 'center',
//     paddingLeft: 80,
//     paddingRight: 80,
//    },
//   scrollContent: {
//     borderBottomLeftRadius: width,
//     borderBottomRightRadius: width,
//     padding: 30,
//     paddingTop: 50,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   subtitle: {
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   label: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   dropdown: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 20,
//     height: 50,
//   },
//   textarea: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 12,
//     height: 100,
//     textAlignVertical: 'top',
//     marginBottom: 20,
//   },
//   imageRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     gap: 5,
//   },
//   uploadBox: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     width: '25%',
//     aspectRatio: 1.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   uploadedImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   uploadText: {
//     color: '#888',
//     fontSize: 12,
//     textAlign: 'center',
//   },
//   tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
//   tagInput: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 10,
//   },
//   tagButton: {
//     backgroundColor: '#FFA500',
//     padding: 10,
//     borderRadius: 10,
//   },
//   tagButtonText: { color: '#fff', fontWeight: 'bold' },
//   tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//   tagItem: {
//     backgroundColor: '#fff',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//   },
// });



import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function BusinessStep2({ formData, setFormData }) {
  const [allCategories, setAllCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedSubSub, setSelectedSubSub] = useState(null);
  const [customTag, setCustomTag] = useState('');
  const [customTags, setCustomTags] = useState(formData.customTags || []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://ioec2testsspm.infiniteoptions.com/category_list/all');
        const json = await res.json();
        setAllCategories(json.result);
        setMainCategories(json.result.filter(cat => cat.category_parent_id === null));
      } catch (e) {
        console.error('Fetch category error:', e);
      }
    };
    fetchCategories();

    const loadSavedForm = async () => {
      try {
        const stored = await AsyncStorage.getItem('businessFormData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Error loading saved form data:', err);
      }
    };
    loadSavedForm();
  }, []);

  useEffect(() => {
    const updated = allCategories.filter(c => c.category_parent_id === selectedMain);
    setSubCategories(updated);
    setSelectedSub(null);
    setSelectedSubSub(null);
    setSubSubCategories([]);
  }, [selectedMain]);

  useEffect(() => {
    const updated = allCategories.filter(c => c.category_parent_id === selectedSub);
    setSubSubCategories(updated);
    setSelectedSubSub(null);
  }, [selectedSub]);

  useEffect(() => {
    const selectedIds = [selectedMain, selectedSub, selectedSubSub].filter(Boolean);
    const updatedForm = {
      ...formData,
      categories: selectedIds,
      customTags,
    };
    setFormData(updatedForm);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updatedForm)).catch(err => console.error('Save error', err));
  }, [selectedMain, selectedSub, selectedSubSub, customTags]);

  const handleImagePick = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const updated = [...formData.images];
      updated[index] = result.assets[0].uri;
      const newFormData = { ...formData, images: updated };
      setFormData(newFormData);
      AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
    }
  };

  const addTag = () => {
    if (customTag.trim()) {
      const updatedTags = [...customTags, customTag.trim()];
      setCustomTags(updatedTags);
      const newFormData = { ...formData, customTags: updatedTags };
      setFormData(newFormData);
      AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
      setCustomTag('');
    }
  };

  const removeTag = (tag) => {
    const updatedTags = customTags.filter(t => t !== tag);
    setCustomTags(updatedTags);
    const newFormData = { ...formData, customTags: updatedTags };
    setFormData(newFormData);
    AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Select Category</Text>
      <Text style={styles.subtitle}>Select Tags for your business</Text>

      <Text style={styles.label}>Main Categories</Text>
      <Dropdown
        style={styles.dropdown}
        data={mainCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
        labelField="label"
        valueField="value"
        placeholder="Select Main Category"
        value={selectedMain}
        onChange={item => setSelectedMain(item.value)}
      />

      {subCategories.length > 0 && (
        <View style={styles.subCategoryContainer}>
          <Text style={styles.label}>Sub Categories (Optional)</Text>
          <Dropdown
            style={styles.dropdown}
            data={subCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
            labelField="label"
            valueField="value"
            placeholder="Select Sub Category"
            value={selectedSub}
            onChange={item => setSelectedSub(item.value)}
          />
        </View>
      )}

      {subSubCategories.length > 0 && (
        <View style={styles.subSubCategoryContainer}>
          <Text style={styles.label}>Sub-Sub Categories (Optional)</Text>
          <Dropdown
            style={styles.dropdown}
            data={subSubCategories.map(c => ({ label: c.category_name, value: c.category_uid }))}
            labelField="label"
            valueField="value"
            placeholder="Select Sub-Sub Category"
            value={selectedSubSub}
            onChange={item => setSelectedSubSub(item.value)}
          />
        </View>
      )}

      <Text style={styles.label}>Brief Description</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Describe your business..."
        value={formData.shortBio}
        multiline
        numberOfLines={4}
        onChangeText={text => {
          const updated = { ...formData, shortBio: text };
          setFormData(updated);
          AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
        }}
      />

      <Text style={styles.label}>Upload Images</Text>
      <View style={styles.imageRow}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TouchableOpacity key={index} style={styles.uploadBox} onPress={() => handleImagePick(index)}>
            {formData.images?.[index] ? (
              <Image source={{ uri: formData.images[index] }} style={styles.uploadedImage} />
            ) : (
              <Text style={styles.uploadText}>Upload Image</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Custom Tags</Text>
      <View style={styles.tagRow}>
        <TextInput
          style={styles.tagInput}
          placeholder="Add tag"
          value={customTag}
          onChangeText={setCustomTag}
          onSubmitEditing={addTag}
        />
        <TouchableOpacity onPress={addTag} style={styles.tagButton}>
          <Text style={styles.tagButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagList}>
        {customTags.map((tag, i) => (
          <TouchableOpacity key={i} onPress={() => removeTag(tag)} style={styles.tagItem}>
            <Text>{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 1.3,
    flex: 1,
    backgroundColor: '#00C721',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    alignSelf: 'center',
    paddingLeft: 80,
    paddingRight: 80,
  },
  scrollContent: {
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    padding: 30,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 50,
  },
  subCategoryContainer: {
    marginTop: -10,
  },
  subSubCategoryContainer: {
    marginTop: -10,
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 5,
  },
  uploadBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '25%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  tagButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 10,
  },
  tagButtonText: { color: '#fff', fontWeight: 'bold' },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagItem: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});

