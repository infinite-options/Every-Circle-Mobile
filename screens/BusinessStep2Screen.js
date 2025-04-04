import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const BusinessStep2Screen = ({ navigation }) => {
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([null, null, null]);

  const handleImagePick = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const updated = [...images];
      updated[index] = result.assets[0].uri;
      setImages(updated);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.greenHeader}>
        <Text style={styles.header}>Optional Info</Text>
        <Text style={styles.subheader}>Please Select the Most Appropriate Business Category</Text>

        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Primary Business Category</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Secondary Business Category</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.descriptionBox}
          placeholder="Brief Description"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.publicNote}>Show the world who you are (optional - this info is public)</Text>

        <View style={styles.imageRow}>
          {images.map((img, index) => (
            <TouchableOpacity key={index} style={styles.uploadBox} onPress={() => handleImagePick(index)}>
              {img ? (
                <Image source={{ uri: img }} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.uploadText}>Upload Image{'\n'}(png, jpeg){'\n'}&lt; 2.5MB</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('BusinessStep3')}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'flex-start' },
  greenHeader: {
    backgroundColor: '#00C721',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subheader: { color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 12,
  },
  dropdownText: { color: '#aaa', fontSize: 16 },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  publicNote: { color: '#fff', fontSize: 14, marginBottom: 10 },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  uploadBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  uploadText: { color: '#777', textAlign: 'center', fontSize: 12 },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 10 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  activeDot: {
    backgroundColor: '#00C7BE',
  },
  continueButton: {
    backgroundColor: '#FF9500',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessStep2Screen;
