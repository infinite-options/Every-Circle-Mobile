// BusinessSetupController.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BusinessStep1 from './BusinessStep1';
import BusinessStep2 from './BusinessStep2';
import BusinessStep3 from './BusinessStep3';
import ContinueButton from '../components/ContinueButton';

const BusinessProfileApi = 'https://ioec2testsspm.infiniteoptions.com/api/v3/business_v3';

export default function BusinessSetupController({ navigation }) {
  const [activeStep, setActiveStep] = useState(0);
  const [userUid, setUserUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    location: '',
    phoneNumber: '',
    einNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    latitude: '',
    longitude: '',
    googleRating: '',
    businessGooglePhotos: [],
    favImage: '',
    priceLevel: '',
    googleId: '',
    types: [],
    yelp: '',
    google: '',
    website: '',
    shortBio: '',
    tagLine: '',
    images: [],
    categories: [],
    customTags: [],
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
  });

  useEffect(() => {
    const fetchUid = async () => {
      const uid = await AsyncStorage.getItem('user_uid');
      if (!uid) {
        Alert.alert('Error', 'User UID not found');
        return;
      }
      setUserUid(uid);
      setLoading(false);
    };
    fetchUid();
  }, []);

  const handleNext = () => {
    console.log('activeStep', activeStep);
    if (activeStep < 2) {
      setActiveStep(prev => prev + 1);
    } else {
      
      submitBusinessData();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const submitBusinessData = async () => {
    try {
      const data = new FormData();
      data.append('user_uid', userUid);
      data.append('business_name', formData.businessName);
      data.append('business_phone_number', formData.phoneNumber);
      data.append('business_ein_number', formData.einNumber);
      data.append('business_address_line_1', formData.addressLine1);
      data.append('business_address_line_2', formData.addressLine2); // Optional
      data.append('business_city', formData.city);
      data.append('business_state', formData.state);
      data.append('business_country', formData.country);
      data.append('business_zip_code', formData.zip);
      data.append('business_latitude', formData.latitude);
      data.append('business_longitude', formData.longitude);
      data.append('business_short_bio', formData.shortBio);
      data.append('business_tag_line', formData.tagLine);
      data.append('business_google_photos', JSON.stringify(formData.images));
      data.append('business_tags', JSON.stringify(formData.customTags));
      // data.append('business_categories_id', JSON.stringify(formData.categories));
      data.append('business_google_rating', formData.googleRating);
      data.append('business_google_photos', JSON.stringify(formData.businessGooglePhotos));
      // data.append('business_fav_image', formData.favImage);
      data.append('business_price_level', formData.priceLevel);
      data.append('business_google_id', formData.googleId);
      data.append('business_yelp', formData.yelp);
      data.append('business_website', formData.website);
      // data.append('business_facebook', formData.socialLinks.facebook);
      // data.append('business_twitter', formData.socialLinks.twitter);
      // data.append('business_linkedin', formData.socialLinks.linkedin);
      // data.append('business_youtube', formData.socialLinks.youtube);
      
      console.log('formData', formData);
      
      console.log('BusinessProfileApi', BusinessProfileApi);
      const response = await fetch(BusinessProfileApi, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        navigation.navigate('BusinessProfile', { business_uid: result.business_uid });
        console.log('Business created successfully');
        console.log('result', result);

      } else {
        throw new Error(result.message || 'Business creation failed.');
      }
    } catch (error) {
      Alert.alert('Submission Error', error.message);
    }
  };



  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#00C721" />;


  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <BusinessStep1 formData={formData} setFormData={setFormData} />;
      case 1:
        return <BusinessStep2 formData={formData} setFormData={setFormData} />;
      case 2:
        return <BusinessStep3 formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };



  return (
    <View style={styles.container}>
    {renderStep()}
      <ContinueButton 
      onNext={handleNext} 
      onBack={handleBack} 
      showBack={activeStep > 0} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
