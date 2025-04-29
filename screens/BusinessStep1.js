
// BusinessStep1.js (Name, Location, Phone Number, EIN Number)
// import React from 'react';
// import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// import config from "../config";
// const { width } = Dimensions.get('window');

// export default function BusinessStep1({ formData, setFormData }) {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to Every Circle!</Text>
//       <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

//       <Text style={styles.label}>Search Business</Text>
//       <View style={styles.googleInput}>
//       <GooglePlacesAutocomplete
//         placeholder="Search for a business"
//         fetchDetails={true}
//         onPress={(data, details = null) => {
//           if (!details) return;

//           const addressComponents = details.address_components || [];

//           const getComponent = (type) =>
//             addressComponents.find(comp => comp.types.includes(type))?.long_name || "";

//           const addressLine1 = `${getComponent("street_number")} ${getComponent("route")}`.trim();
//           const city = getComponent("locality");
//           const state = getComponent("administrative_area_level_1");
//           const zip = getComponent("postal_code");
//           const country = getComponent("country");

//           setFormData({
//             ...formData,
//             businessName: details.name || "",
//             location: details.formatted_address || "",
//             phoneNumber: details.formatted_phone_number || "",
//             addressLine1,
//             city,
//             state,
//             country,
//             zip,
//           });
//         }}
//         query={{
//           key: config.GOOGLE_MAPS_API_KEY, 
//           language: 'en',
//           types: 'establishment',
//         }}
//         styles={{
          
//           listView: { backgroundColor: 'white' },
//         }}
//         enablePoweredByContainer={false}
//       />
//       </View>


//       <Text style={styles.label}>Location</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.location}
//         placeholder="Enter Location"
//         onChangeText={text => setFormData({ ...formData, location: text })}
//       />

//       <Text style={styles.label}>Phone Number</Text>
//       <TextInput
//         style={styles.input}
//         keyboardType='phone-pad'
//         value={formData.phoneNumber}
//         placeholder="(000) 000-0000"
//         onChangeText={text => setFormData({ ...formData, phoneNumber: text })}
//       />

//       <Text style={styles.label}>EIN Number</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.einNumber}
//         placeholder="Enter EIN"
//         onChangeText={text => setFormData({ ...formData, einNumber: text })}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignSelf: 'center',
//     width: width * 1.3,
//     flex: 1,
//     backgroundColor: '#00C721',
//     borderRadius: width,
//     padding: 90,
//     paddingTop: 80,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   label: {
//     alignSelf: 'flex-start',
//     color: '#fff',
//     fontWeight: 'bold',
//     marginBottom: 4,
//     marginTop: 10,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 12,
//     width: '100%',
//     marginBottom: 15,
//   },
//   googleInput: {
//     width: '100%',
//     marginBottom: 50,
//   },
// });





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
  const handleGooglePlaceSelect = (data, details = null) => {
    if (!details) return;

    const addressComponents = details.address_components || [];
    const getComponent = (type) =>
      addressComponents.find(comp => comp.types.includes(type))?.long_name || "";

    const addressLine1 = `${getComponent("street_number")} ${getComponent("route")}`.trim();
    const city = getComponent("locality");
    const state = getComponent("administrative_area_level_1");
    const zip = getComponent("postal_code");
    const country = getComponent("country");

    const updated = {
      ...formData,
      businessName: details.name || "",
      location: details.formatted_address || "",
      phoneNumber: details.formatted_phone_number || "",
      addressLine1,
      city,
      state,
      country,
      zip,
    };

    setFormData(updated);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Every Circle!</Text>
      <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

      <Text style={styles.label}>Search Business</Text>
      <View style={styles.googleInput}>
        <GooglePlacesAutocomplete
          placeholder="Search for a business"
          fetchDetails={true}
          onPress={handleGooglePlaceSelect}
          query={{
            key: config.GOOGLE_MAPS_API_KEY,  // Ensure your API key is set correctly
            language: 'en',
            types: 'establishment',  // This ensures we only get business establishments
          }}
          styles={{
            listView: { backgroundColor: 'white' },
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



