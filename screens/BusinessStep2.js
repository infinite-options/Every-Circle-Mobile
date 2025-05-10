

// BusinessStep2.js
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

  const googlePhotos = formData.businessGooglePhotos || [];
  const userUploadedImages = formData.images || [];

  const combinedImages = [...googlePhotos, ...userUploadedImages];

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
      businessCategoryId: selectedIds,
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
      const newImageUri = result.assets[0].uri;
      const updated = [...userUploadedImages];
      updated[index] = newImageUri;
      const newFormData = { ...formData, images: updated };
      setFormData(newFormData);
      AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
    }
  };

  const addTag = () => {
    if (customTag.trim()) {
      const updatedTags = [...customTags, customTag.trim()];
      setCustomTags(updatedTags);
      setFormData(prev => ({ ...prev, customTags: updatedTags }));
      AsyncStorage.setItem('businessFormData', JSON.stringify({ ...formData, customTags: updatedTags })).catch(err => console.error('Save error', err));
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
        <>
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
        </>
      )}

      {subSubCategories.length > 0 && (
        <>
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
        </>
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


















<Text style={styles.label}>Images</Text>
<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={true} style={styles.carousel}>
<View style={styles.imageRow}>

  {combinedImages.map((img, index) => (
    
    <View key={index} style={styles.imageWrapper}>
     
      <Image source={{ uri: img }} style={styles.uploadedImage} resizeMode="cover"  />
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => {
          const isGoogle = index < googlePhotos.length;
          const updated = isGoogle
            ? [...googlePhotos.slice(0, index), ...googlePhotos.slice(index + 1)]
            : [...userUploadedImages.slice(0, index - googlePhotos.length), ...userUploadedImages.slice(index - googlePhotos.length + 1)];

            const newFormData = {
            ...formData,
            businessGooglePhotos: isGoogle ? updated : googlePhotos,
            images: !isGoogle ? updated : userUploadedImages,
          };
          setFormData(newFormData); 
          AsyncStorage.setItem('businessFormData', JSON.stringify(newFormData)).catch(err => console.error('Save error', err));
        }}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
      
    </View>
   
  ))}
   
  {/* {userUploadedImages.length < 3 && ( */}
    <TouchableOpacity style={styles.uploadBox} onPress={() => handleImagePick(userUploadedImages.length)}>
      <Text style={styles.uploadText}>Upload Image</Text>
    </TouchableOpacity>
  {/* )} */}
 
</View>
</ScrollView>













{/*  custom tags */}

      <Text style={styles.label}>Custom Tags</Text>
      <View style={styles.tagRow}>
        <TextInput
          style={styles.tagInput}
          placeholder="Add tag"
          // value={customTag}
          // onChangeText={setCustomTag}
          // onSubmitEditing={addTag}
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
        // borderBottomLeftRadius: width,
        // borderBottomRightRadius: width,
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
        // justifyContent: 'space-between',
        marginBottom: 20,
        gap: 0,
      },
      uploadBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 80 ,
        height: 80,
        // aspectRatio: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        // aspectRatio: 1.5,
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



      imageWrapper: {
        width: 80,
        height: 80,
        // aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 10,
        backgroundColor: '#fff',
        position: 'relative',
        // transform: [{ scale: 0.5 }],
      },
      deleteIcon: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      },
      deleteText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
      },
      


      carousel: {
        marginVertical: 20,
        width: '100%',
        height: 120,
      },
      carouselImageWrapper: {
        width: '100%',
        height: 200,
        marginRight: 10,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'absolute',
        // transform: [{ scale: 0.5 }],
      },
      carouselImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
      },
      
});
