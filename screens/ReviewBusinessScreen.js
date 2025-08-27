import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNavBar from '../components/BottomNavBar';
import { RATINGS_ENDPOINT } from '../apiConfig';

export default function ReviewBusinessScreen({ route, navigation }) {
  const { business_uid, business_name, reviewData, isEdit } = route.params;
  const [profileId, setProfileId] = useState('');
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('profile_uid').then(setProfileId);
    // Pre-populate if editing
    if (reviewData) {
      setRating(Number(reviewData.rating_star) || 0);
      setDescription(reviewData.rating_description || '');
      if (reviewData.rating_receipt_date) {
        setReceiptDate(new Date(reviewData.rating_receipt_date));
      }
      // Note: For files, we can't pre-populate the file picker, but we could show a label if needed
    }
  }, [reviewData]);

  const pickFile = async (setter) => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!rating || !description || !receiptDate) {
      Alert.alert('Please fill all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('rating_profile_id', profileId);
    formData.append('rating_business_id', business_uid);
    formData.append('rating_star', rating);
    formData.append('rating_description', description);
    formData.append('rating_receipt_date', receiptDate.toISOString().split('T')[0]);
    if (receiptFile) {
      formData.append('rating_receipt_image', {
        uri: receiptFile.uri,
        name: receiptFile.name,
        type: receiptFile.mimeType || 'image/jpeg',
      });
    }
    if (imageFile) {
      formData.append('rating_image', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.mimeType || 'image/jpeg',
      });
    }

    // Print out the FormData object being sent
    console.log('--- FormData being sent ---');
    for (let pair of formData._parts || formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    // Print out the endpoint and HTTP method
    const method = isEdit ? 'PUT' : 'POST';
    console.log(`Calling endpoint: ${RATINGS_ENDPOINT} [${method}]`);

    try {
      const response = await fetch(RATINGS_ENDPOINT, {
        method,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        // Build the new review object
        const newReview = {
          rating_profile_id: profileId,
          rating_business_id: business_uid,
          rating_star: rating,
          rating_description: description,
          rating_receipt_date: receiptDate.toISOString().split('T')[0],
          // Optionally add file info if you want to display it locally
        };

        try {
          // Get current ratings_info from AsyncStorage
          const ratingsInfoStr = await AsyncStorage.getItem('user_ratings_info');
          let ratingsInfo = [];
          if (ratingsInfoStr) {
            ratingsInfo = JSON.parse(ratingsInfoStr);
            // Remove any existing review for this business
            ratingsInfo = ratingsInfo.filter(r => r.rating_business_id !== business_uid);
          }
          // Add the new/updated review
          ratingsInfo.push(newReview);
          // Save back to AsyncStorage
          await AsyncStorage.setItem('user_ratings_info', JSON.stringify(ratingsInfo));
          console.log('Updated user_ratings_info in AsyncStorage:', ratingsInfo);
        } catch (e) {
          console.warn('Failed to update user_ratings_info in AsyncStorage:', e);
        }

        Alert.alert('Success', isEdit ? 'Review updated!' : 'Review submitted!');
        navigation.goBack();
      } else {
        throw new Error(result.message || 'Failed to submit review');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{isEdit ? 'Edit' : 'Review'} {business_name}</Text>
        <Text style={styles.label}>Your Rating:</Text>
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <View style={[styles.circle, rating >= i && styles.circleSelected]} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Comments:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter your comments"
          multiline
        />
        <Text style={styles.label}>Receipt Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text>{receiptDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={receiptDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setReceiptDate(date);
            }}
          />
        )}
        <TouchableOpacity onPress={() => pickFile(setReceiptFile)} style={styles.uploadButton}>
          <Text>{receiptFile ? receiptFile.name : 'Upload Receipt'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickFile(setImageFile)} style={styles.uploadButton}>
          <Text>{imageFile ? imageFile.name : 'Upload Image'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEdit ? 'Update Review' : 'Save Review'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, paddingTop: 50 },
  label: { fontSize: 16, marginTop: 10 },
  ratingRow: { flexDirection: 'row', marginVertical: 10 },
  circle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#ccc', marginHorizontal: 5 },
  circleSelected: { backgroundColor: '#9C45F7', borderColor: '#9C45F7' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 80, marginTop: 5 },
  dateButton: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginTop: 5 },
  uploadButton: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginTop: 10, alignItems: 'center' },
  saveButton: { backgroundColor: '#9C45F7', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 