import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../apiConfig";
import config from "../config";
import { Dropdown } from "react-native-element-dropdown";

const { width } = Dimensions.get("window");
if (isNaN(width)) {
  console.error("BusinessStep1 - width is NaN! Setting to 400 as fallback.");
}
const safeWidth = isNaN(width) ? 400 : width;
console.log("BusinessStep1 - Initial width:", safeWidth);

export default function BusinessStep1({ formData, setFormData, navigation }) {
  const [loading, setLoading] = useState(false);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);
  const googlePlacesRef = useRef();

  // Log all numeric values in formData
  useEffect(() => {
    ["latitude", "longitude", "googleRating", "priceLevel"].forEach((key) => {
      const val = formData[key];
      if (typeof val === "number" && isNaN(val)) {
        console.error(`BusinessStep1 - formData.${key} is NaN!`, val);
      }
    });
  }, [formData]);

  useEffect(() => {
    console.log("In BusinessStep1");
    console.log("Google Maps API Key:", config.googleMapsApiKey);

    // Test basic internet connectivity with retry logic
    const testBasicConnectivity = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch("https://clients3.google.com/generate_204", {
            signal: controller.signal,
            method: "GET",
          });
          clearTimeout(timeoutId);
          console.log("Basic internet connectivity: OK");
          setIsNetworkAvailable(true);
          return true;
        } catch (error) {
          console.error(`Basic internet connectivity attempt ${i + 1} failed:`, {
            message: error.message,
            name: error.name,
            type: error.type || "unknown",
          });
          if (i === retries - 1) {
            setIsNetworkAvailable(false);
            return false;
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return false;
    };

    // Test Google Places API connectivity with retry logic
    const testGooglePlacesAPI = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=test&key=${config.googleMapsApiKey}`);
          if (response.ok) {
            console.log("Google Places API test: OK");
            return true;
          } else {
            console.error(`Google Places API test attempt ${i + 1} failed:`, response.status);
            if (i === retries - 1) return false;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Google Places API test attempt ${i + 1} error:`, error);
          if (i === retries - 1) return false;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return false;
    };

    // Run connectivity tests
    const runConnectivityTests = async () => {
      const basicConnectivity = await testBasicConnectivity();
      if (basicConnectivity) {
        await testGooglePlacesAPI();
      }
    };

    runConnectivityTests();

    // Log form data on mount to check for NaN values
    console.log("BusinessStep1 - Initial formData:", JSON.stringify(formData, null, 2));
  }, []);

  const updateFormData = (field, value) => {
    console.log(`BusinessStep1 - Updating field ${field} with value:`, value);
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    AsyncStorage.setItem("businessFormData", JSON.stringify(updated)).catch((err) => console.error("Save error", err));
  };

  const handleGooglePlaceSelect = async (data, details = null) => {
    if (!details) {
      console.log("BusinessStep1 - No details provided in handleGooglePlaceSelect");
      return;
    }

    console.log("BusinessStep1 - Google Place Details:", {
      name: details.name,
      vicinity: details.vicinity,
      formatted_address: details.formatted_address,
      geometry: details.geometry,
      photos: details.photos?.length,
    });

    const addressComponents = details.address_components || [];
    const getComponent = (type) => {
      const component = addressComponents.find((comp) => comp.types.includes(type))?.long_name || "";
      console.log(`BusinessStep1 - Address component for ${type}:`, component);
      return component;
    };

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

    console.log("BusinessStep1 - Location coordinates:", { latitude, longitude });

    const photoReferences = details.photos?.map((photo) => photo.photo_reference) || [];
    const photoUrls = photoReferences.map((ref) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${config.googleMapsApiKey}`);

    console.log("BusinessStep1 - Photo URLs count:", photoUrls.length);

    const updated = {
      ...formData,
      businessName: details.name || "",
      location: details.vicinity || details.formatted_address || "",
      phoneNumber: details.formatted_phone_number || "",
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

    console.log("BusinessStep1 - Updated form data:", JSON.stringify(updated, null, 2));
    setFormData(updated);
    await AsyncStorage.setItem("businessFormData", JSON.stringify(updated)).catch((err) => console.error("Save error", err));

    fetchProfile(details.place_id);
  };

  const fetchProfile = async (googlePlaceId) => {
    try {
      console.log("BusinessStep1 - Fetching business for Place ID:", googlePlaceId);
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/businessinfo/${googlePlaceId}`);
      console.log("BusinessStep1 - Business Fetch Response status:", response.status);
      if (response.ok) {
        const result = await response.json();
        console.log("BusinessStep1 - Business Fetch Result:", JSON.stringify(result, null, 2));
        const business = result?.result?.[0];
        if (business) {
          console.log("BusinessStep1 - Business claimed:", JSON.stringify(business, null, 2));
        } else {
          console.log("BusinessStep1 - Business not claimed.");
        }
      } else {
        console.log("BusinessStep1 - Business Fetch Response not OK:", response.status);
      }
    } catch (error) {
      console.error("BusinessStep1 - Error fetching business profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Log dimensions when component renders
  useEffect(() => {
    const dimensions = {
      window: Dimensions.get("window"),
      screen: Dimensions.get("screen"),
    };
    console.log("BusinessStep1 - Current dimensions:", dimensions);
  }, []);

  const businessRoles = [
    { label: "Owner", value: "owner" },
    { label: "Employee", value: "employee" },
    { label: "Partner", value: "partner" },
    { label: "Admin", value: "admin" },
    { label: "Other", value: "other" },
  ];

  // Add NaN guards for style values
  const containerStyle = {
    alignSelf: "center",
    width: isNaN(safeWidth * 1.3) ? 520 : safeWidth * 1.3,
    flex: 1,
    borderTopLeftRadius: isNaN(safeWidth) ? 400 : safeWidth,
    borderTopRightRadius: isNaN(safeWidth) ? 400 : safeWidth,
    padding: 90,
    paddingTop: 80,
    alignItems: "center",
  };
  Object.entries(containerStyle).forEach(([k, v]) => {
    if (typeof v === "number" && isNaN(v)) {
      console.error(`BusinessStep1 - containerStyle.${k} is NaN!`, v);
    }
  });

  // Add NaN guards for latitude/longitude in formData
  const latitude = isNaN(Number(formData.latitude)) ? 0 : Number(formData.latitude);
  const longitude = isNaN(Number(formData.longitude)) ? 0 : Number(formData.longitude);
  if (isNaN(latitude)) console.error("BusinessStep1 - latitude is NaN!", formData.latitude);
  if (isNaN(longitude)) console.error("BusinessStep1 - longitude is NaN!", formData.longitude);

  // Logging props/styles for GooglePlacesAutocomplete
  const gpaQuery = {
    key: config.googleMapsApiKey,
    language: "en",
    types: "establishment",
  };
  console.log("BusinessStep1 - GooglePlacesAutocomplete query:", gpaQuery);

  // Logging props/styles for Dropdown
  const dropdownValue = formData.businessRole || "";
  console.log("BusinessStep1 - Dropdown value:", dropdownValue);
  const dropdownData = [
    { label: "Owner", value: "owner" },
    { label: "Employee", value: "employee" },
    { label: "Partner", value: "partner" },
    { label: "Admin", value: "admin" },
    { label: "Other", value: "other" },
  ];
  console.log("BusinessStep1 - Dropdown data:", dropdownData);

  // Logging all TextInput values
  [
    { label: "businessName", value: formData.businessName },
    { label: "addressLine1", value: formData.addressLine1 },
    { label: "phoneNumber", value: formData.phoneNumber },
    { label: "einNumber", value: formData.einNumber },
  ].forEach(({ label, value }) => {
    if (typeof value === "number" && isNaN(value)) {
      console.error(`BusinessStep1 - TextInput ${label} is NaN!`, value);
    }
    if (value === undefined) {
      console.error(`BusinessStep1 - TextInput ${label} is undefined!`);
    }
    console.log(`BusinessStep1 - TextInput ${label}:`, value);
  });

  // Logging styles for main Views
  console.log("BusinessStep1 - containerStyle:", containerStyle);
  console.log("BusinessStep1 - styles.formCard:", styles.formCard);

  return (
    <View style={{ flex: 1, backgroundColor: "#00C721" }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
          <View
            style={{
              flex: 1,
              paddingTop: 60,
              paddingHorizontal: 20,
              paddingBottom: 0,
              alignItems: "center",
            }}
          >
            <View style={styles.formCard}>
              <Text style={styles.title}>Welcome to Every Circle!</Text>
              <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

              <Text style={styles.label}>Search Business</Text>
              <View style={{ width: "100%", marginBottom: 20, zIndex: 1000 }}>
                {/* Commenting out GooglePlacesAutocomplete for isolation test */}
                {/*
                {console.log("BusinessStep1 - Rendering GooglePlacesAutocomplete")}
                <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholder='Search for a business'
                  fetchDetails={true}
                  onPress={handleGooglePlaceSelect}
                  query={gpaQuery}
                  styles={{
                    textInput: {
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: "#ddd",
                    },
                    listView: {
                      backgroundColor: "#fff",
                      zIndex: 9999,
                      position: "absolute",
                      top: 60,
                      borderRadius: 10,
                      elevation: 3,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    },
                  }}
                  enablePoweredByContainer={false}
                />
                */}
                <View style={{ backgroundColor: "#eee", padding: 16, borderRadius: 8, alignItems: "center" }}>
                  <Text style={{ color: "#888" }}>[GooglePlacesAutocomplete temporarily removed for NaN bug test]</Text>
                </View>
              </View>

              <Text style={styles.label}>Business Name</Text>
              {console.log("BusinessStep1 - Rendering TextInput businessName")}
              <TextInput style={styles.input} value={formData.businessName || ""} placeholder='Enter business name' onChangeText={(text) => updateFormData("businessName", text)} />

              <Text style={styles.label}>Location</Text>
              {console.log("BusinessStep1 - Rendering TextInput addressLine1")}
              <TextInput style={styles.input} value={formData.addressLine1 || ""} placeholder='Enter business address' onChangeText={(text) => updateFormData("addressLine1", text)} />

              <Text style={styles.label}>Phone Number</Text>
              {console.log("BusinessStep1 - Rendering TextInput phoneNumber")}
              <TextInput style={styles.input} keyboardType='phone-pad' value={formData.phoneNumber || ""} placeholder='(000) 000-0000' onChangeText={(text) => updateFormData("phoneNumber", text)} />

              <Text style={styles.label}>Business Role</Text>
              {console.log("BusinessStep1 - Rendering Dropdown businessRole")}
              <Dropdown
                style={styles.input}
                data={dropdownData}
                labelField='label'
                valueField='value'
                placeholder='Select your role'
                value={dropdownValue}
                onChange={(item) => {
                  console.log("BusinessStep1 - Selected business role:", item);
                  updateFormData("businessRole", item.value);
                }}
                containerStyle={{ borderRadius: 10 }}
              />

              <Text style={styles.label}>EIN Number (Optional)</Text>
              <Text style={styles.helperText}>For verification purposes</Text>
              {console.log("BusinessStep1 - Rendering TextInput einNumber")}
              <TextInput style={styles.input} value={formData.einNumber || ""} placeholder='Enter EIN number' onChangeText={(text) => updateFormData("einNumber", text)} />

              {loading && <ActivityIndicator size='large' color='#00C721' style={styles.loadingIndicator} />}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    width: width * 1.3,
    flex: 1,
    // borderRadius: width,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    padding: 90,
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    color: "#333",
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    marginBottom: 15,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
});
