import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../config";
import { Dropdown } from 'react-native-element-dropdown';

const { width } = Dimensions.get('window');

export default function BusinessStep1({ formData, setFormData, navigation }) {
  const [loading, setLoading] = useState(false);
  const googlePlacesRef = useRef();

  useEffect(() => {
    console.log('In BusinessStep1');
    // Don't load saved form data - start fresh for new business
    // const loadSavedForm = async () => {
    //   try {
    //     const stored = await AsyncStorage.getItem('businessFormData');
    //     if (stored) {
    //       const parsed = JSON.parse(stored);
    //       setFormData(prev => ({ ...prev, ...parsed }));
    //     }
    //   } catch (err) {
    //     console.error('Error loading saved form data:', err);
    //   }
    // };
    // loadSavedForm();
  }, []);

  const updateFormData = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  };

  const handleGooglePlaceSelect = async (data, details = null) => {
    if (!details) return;

    console.log("handleGooglePlaceSelect Data: ", data);
    // console.log("handleGooglePlaceSelect Details: ", details);

    const addressComponents = details.address_components || [];
    const getComponent = (type) =>
      addressComponents.find(comp => comp.types.includes(type))?.long_name || "";

    const addressLine1 = `${getComponent("street_number")} ${getComponent("route")}`.trim();
    const addressLine2 = getComponent("subpremise");
    const city = getComponent("locality");
    const state = getComponent("administrative_area_level_1");
    const country = getComponent("country");
    const zip = getComponent("postal_code");

    const latFn = details.geometry?.location?.lat;
    const lngFn = details.geometry?.location?.lng;
    const latitude = typeof latFn === "function" ? latFn() : latFn ?? "";
    const longitude = typeof lngFn === "function" ? lngFn() : lngFn ?? "";

    const photoReferences = details.photos?.map(photo => photo.photo_reference) || [];
    const photoUrls = photoReferences.map(ref =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${config.googleMapsApiKey}`
    );

    const updated = {
      ...formData,
      businessName: details.name || "", // Only the name
      location: details.vicinity || details.formatted_address || "", // Just the address
      phoneNumber: details.formatted_phone_number || "", // Phone
      website: details.website || "",
      googleId: details.place_id || "",
      googleRating: details.rating || "",
      businessGooglePhotos: photoUrls,
      favImage: photoUrls[0] || "",
      priceLevel: details.price_level || "",
      addressLine1: details.vicinity || details.formatted_address || "",
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
      console.log("Fetching business for Place ID:", googlePlaceId);
      setLoading(true);
      const response = await fetch(`https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo/${googlePlaceId}`);
      console.log("Business Fetch Response:", response);
      if (response.ok) {
        const result = await response.json();
        console.log("here 3")
        console.log("Business Fetch Result:", result);
        const business = result?.result?.[0];
        if (business) {
          console.log("Business claimed:", business);
        } else {
          console.log("Business not claimed.");
        }
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const businessRoles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Employee', value: 'employee' },
    { label: 'Partner', value: 'partner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Other', value: 'other' },
  ];
  

  return (
    <View style={{ flex: 1, backgroundColor: '#00C721' }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, alignItems: 'center', paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.title}>Welcome to Every Circle!</Text>
              <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

              <Text style={styles.label}>Search Business</Text>
              <View style={{ width: '100%', marginBottom: 20, zIndex: 1000 }}>
                <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholder="Search for a business"
                  fetchDetails={true}
                  onPress={handleGooglePlaceSelect}
                  query={{
                    key: config.googleMapsApiKey,
                    language: "en",
                    types: "establishment",
                  }}
                  styles={{
                    textInput: {
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#ddd',
                    },
                    listView: {
                      backgroundColor: "#fff",
                      zIndex: 9999,
                      position: "absolute",
                      top: 60,
                      borderRadius: 10,
                      elevation: 3,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    },
                  }}
                  enablePoweredByContainer={false}
                />
              </View>

              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName || ''}
                placeholder="Enter business name"
                onChangeText={(text) => updateFormData("businessName", text)}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.addressLine1 || ''}
                placeholder="Enter business address"
                onChangeText={(text) => updateFormData("addressLine1", text)}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.phoneNumber || ''}
                placeholder="(000) 000-0000"
                onChangeText={(text) => updateFormData("phoneNumber", text)}
              />

              <Text style={styles.label}>Business Role</Text>
              <Dropdown
                style={styles.input}
                data={businessRoles}
                labelField="label"
                valueField="value"
                placeholder="Select your role"
                value={formData.businessRole || ''}
                onChange={item => updateFormData('businessRole', item.value)}
                containerStyle={{ borderRadius: 10 }}
              />

              <Text style={styles.label}>EIN Number (Optional)</Text>
              <Text style={styles.helperText}>For verification purposes</Text>
              <TextInput
                style={styles.input}
                value={formData.einNumber || ''}
                placeholder="Enter EIN number"
                onChangeText={text => updateFormData('einNumber', text)}
              />

              {loading && (
                <ActivityIndicator size="large" color="#00C721" style={styles.loadingIndicator} />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: width * 1.3,
    flex: 1,
    // borderRadius: width,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    padding: 90,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#333',
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    width: '90%',
    maxWidth: 420,
    alignSelf: 'center',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
});




