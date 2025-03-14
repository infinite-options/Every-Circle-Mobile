import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const UploadImage = ({ user, onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState(user?.user_profile_image || null);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      onImageUpload(result.assets[0].uri); // Pass the image URI to parent
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Image</Text>
      <Text style={styles.publicText}>Public</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={styles.uploadTextContainer}>
            <Text style={styles.uploadText}>Upload</Text>
            <Text style={styles.uploadText}>Image</Text>
            <Text style={styles.fileInfo}>(png, jpeg)</Text>
            <Text style={styles.fileInfo}>{"< 2.5MB"}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  publicText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 'auto',
  },
  uploadBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginLeft: 10,
  },
  uploadTextContainer: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  fileInfo: {
    fontSize: 10,
    color: '#999',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default UploadImage;
