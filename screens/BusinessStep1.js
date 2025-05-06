

// BusinessStep1.js

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../config";

const { width } = Dimensions.get('window');

export default function BusinessStep1({ formData, setFormData }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  // Helper function to update form data and persist to AsyncStorage
  const updateFormData = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  };

  // Function to handle Google Places Autocomplete result
  const handleGooglePlaceSelect = async(data, details = null) => {
    if (!details) return;

    const addressComponents = details.address_components || [];
    const getComponent = (type) =>
      addressComponents.find(comp => comp.types.includes(type))?.long_name || "";

    // Address fields
    const addressLine1 = `${getComponent("street_number")} ${getComponent("route")}`.trim();
    const addressLine2 = getComponent("subpremise");
    const city = getComponent("locality");
    const state = getComponent("administrative_area_level_1");
    const country = getComponent("country");
    const zip = getComponent("postal_code");

      // Coordinates
  const latFn = details.geometry?.location?.lat;
  const lngFn = details.geometry?.location?.lng;
  const latitude = typeof latFn === "function" ? latFn() : latFn ?? "";
  const longitude = typeof lngFn === "function" ? lngFn() : lngFn ?? "";
  

    // Photos 
    const photoReferences = details.photos?.map(photo => photo.photo_reference) || [];
    const photoUrls = photoReferences.map(ref => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${config.googleMapsApiKey}`
    );

    const updated = {
      ...formData,
      businessName: data.structured_formatting?.main_text || (details.name || "").split(" - ")[0].trim(),
      location: details.formatted_address || "",
      phoneNumber: details.formatted_phone_number || "",
      website: details.website || "",
      googleId: details.place_id || "",
      googleRating: details.rating || "",
      businessGooglePhotos: photoUrls,
      favImage: photoUrls[0] || "",
      priceLevel: details.price_level || "",
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zip,
      latitude,
      longitude,
      types: details.types || [],
    };

    setFormData(updated);
    await AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  
    
    fetchProfile(details.place_id);
  };

  const fetchProfile = async (googlePlaceId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://ioec2testsspm.infiniteoptions.com/business/${googlePlaceId}`);
      if (response.ok) {
        const result = await response.json();
        const business = result?.result?.[0];
        if (business) {
          console.log("Business claimed:", business);
          // Optionally store claim status in your state here
        } else {
          console.log("Business not claimed.");
        }
      } else {
        console.warn("Business profile fetch failed.");
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Every Circle!</Text>
      <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

      <Text style={styles.label}>Search Business</Text>
      {/* <View style={styles.googleInput}> */}
      <View style={{ width: '100%', marginBottom: 20 }}>
      <GooglePlacesAutocomplete
  placeholder="Search for a business"
  fetchDetails={true}
  onPress={handleGooglePlaceSelect}
  query={{
    key: config.googleMapsApiKey,
    language: "en",
    types: "establishment",
  }}
  textInputProps={{
    placeholderTextColor: "#999",
  }}
  styles={{
    textInput: {
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
    },
    listView: {
      backgroundColor: "#fff",
      zIndex: 9999, 
      position: "absolute",
      top: 60, 
    },
  }}
  enablePoweredByContainer={false}
/>

      </View>
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={formData.location}
        placeholder="Enter Location"
        onChangeText={text => updateFormData('location', text)}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        keyboardType='phone-pad'
        value={formData.phoneNumber}
        placeholder="(000) 000-0000"
        onChangeText={text => updateFormData('phoneNumber', text)}
      />

      <Text style={styles.label}>EIN Number</Text>
      <TextInput
        style={styles.input}
        value={formData.einNumber}
        placeholder="Enter EIN"
        onChangeText={text => updateFormData('einNumber', text)}
      />

      {loading && (
        <ActivityIndicator size="large" color="#00C721" style={styles.loadingIndicator} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: width * 1.3,
    flex: 1,
    backgroundColor: '#00C721',
    borderRadius: width,
    padding: 90,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 15,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  googleInput: {
    width: '100%',
    marginBottom: 50,
  },
});



