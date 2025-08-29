// BusinessSetupController.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessStep0 from "./BusinessStep0";
import BusinessStep1 from "./BusinessStep1";
import BusinessStep2 from "./BusinessStep2";
import BusinessStep3 from "./BusinessStep3";
import BusinessStep4 from "./BusinessStep4";
import BottomNavBar from "../components/BottomNavBar";
import { BUSINESS_INFO_ENDPOINT } from "../apiConfig";
import { useDarkMode } from "../contexts/DarkModeContext";

const BusinessProfileApi = BUSINESS_INFO_ENDPOINT;

export default function BusinessSetupController({ navigation }) {
  const { darkMode } = useDarkMode();
  console.log("BusinessSetupController - darkMode value:", darkMode);
  const [activeStep, setActiveStep] = useState(0);
  const [userUid, setUserUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: "",
    location: "",
    phoneNumber: "",
    businessRole: "",
    einNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    latitude: "",
    longitude: "",
    googleRating: "",
    businessGooglePhotos: [],
    favImage: "",
    priceLevel: "",
    googleId: "",
    types: [],
    yelp: "",
    google: "",
    website: "",
    shortBio: "",
    tagLine: "",
    images: [],
    businessCategoryId: "",
    categories: [],
    customTags: [],
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    business_is_active: 1,
    business_email_id_is_public: 1,
    business_phone_number_is_public: 1,
    // business_address_line_1_is_public: 1,
    // business_address_line_2_is_public: 1,
    // business_city_is_public: 1,
    // business_state_is_public: 1,
    // business_country_is_public: 1,
    business_tag_line_is_public: 1,
    business_short_bio_is_public: 1,
    // business_google_rating_is_public: 1,
    // business_google_photos_is_public: 1,
    // business_yelp_is_public: 1,
    // business_website_is_public: 1,
    business_images_is_public: 1,
    business_banner_ad_is_public: 1,
    business_short_bio_is_public: 1,
    business_services_is_public: 1,
    business_owners_is_public: 1,
    // email, phone number, tagline, shortbio, images, bannerads, shortbio, services,
    // owners.
  });

  useEffect(() => {
    const fetchUid = async () => {
      const uid = await AsyncStorage.getItem("user_uid");
      console.log("user_uid", uid);
      if (!uid) {
        Alert.alert("Error", "User UID not found");
        return;
      }
      setUserUid(uid);
      // Clear any existing business form data for fresh start
      await AsyncStorage.removeItem("businessFormData");
      setLoading(false);
    };
    fetchUid();
  }, []);

  const handleNext = () => {
    console.log("activeStep", activeStep);
    if (activeStep < 4) {
      setActiveStep((prev) => prev + 1);
    } else {
      submitBusinessData();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      // If we're at Step 0, go back to Settings
      navigation.navigate("Settings");
    }
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        // Step 0: Must have Business Name
        return formData.businessName && formData.businessName.trim() !== "";
      case 1:
        // Step 1: No required fields
        return true;
      case 2:
        // Step 2: Must select at least a Main Category
        return formData.businessCategoryId && formData.businessCategoryId.length > 0;
      case 3:
        // Step 3: No required fields
        return true;
      case 4:
        // Step 4: No required fields
        return true;
      default:
        return false;
    }
  };

  const handleContinue = () => {
    if (validateCurrentStep()) {
      if (activeStep < 4) {
        setActiveStep((prev) => prev + 1);
      } else {
        submitBusinessData();
      }
    } else {
      // Show validation error
      let errorMessage = "";
      switch (activeStep) {
        case 0:
          errorMessage = "Please enter a Business Name to continue.";
          break;
        case 2:
          errorMessage = "Please select at least a Main Category to continue.";
          break;
        default:
          errorMessage = "Please complete all required fields to continue.";
      }
      Alert.alert("Validation Error", errorMessage);
    }
  };

  const submitBusinessData = async () => {
    try {
      const data = new FormData();
      data.append("user_uid", userUid);
      data.append("business_name", formData.businessName);
      data.append("business_phone_number", formData.phoneNumber);
      data.append("business_ein_number", formData.einNumber);
      data.append("business_address_line_1", formData.addressLine1);
      data.append("business_address_line_2", formData.addressLine2); // Optional
      data.append("business_city", formData.city);
      data.append("business_state", formData.state);
      data.append("business_country", formData.country);
      data.append("business_zip_code", formData.zip);
      data.append("business_latitude", formData.latitude);
      data.append("business_longitude", formData.longitude);
      data.append("business_short_bio", formData.shortBio);
      data.append("business_tag_line", formData.tagLine);
      // data.append('business_role', formData.businessRole);
      data.append("business_category_id", formData.businessCategoryId);
      // data.append('business_google_photos', JSON.stringify(formData.images));
      // data.append('business_tags', JSON.stringify(formData.customTags));
      // data.append('business_categories_id', JSON.stringify(formData.categories));
      data.append("business_google_rating", formData.googleRating);
      data.append("business_google_photos", JSON.stringify(formData.businessGooglePhotos));
      // data.append('business_fav_image', formData.favImage);
      data.append("business_price_level", formData.priceLevel);
      data.append("business_google_id", formData.googleId);
      data.append("business_yelp", formData.yelp);
      data.append("business_website", formData.website);
      // Facebook, Twitter, LinkedIn, Youtube
      // data.append('business_facebook', formData.socialLinks.facebook);
      // data.append('business_twitter', formData.socialLinks.twitter);
      // data.append('business_linkedin', formData.socialLinks.linkedin);
      // data.append('business_youtube', formData.socialLinks.youtube);

      data.append("business_is_active", formData.business_is_active);

      data.append("business_email_id_is_public", formData.business_email_id_is_public);
      data.append("business_phone_number_is_public", formData.business_phone_number_is_public);
      data.append("business_tag_line_is_public", formData.business_tag_line_is_public);
      data.append("business_short_bio_is_public", formData.business_short_bio_is_public);
      data.append("business_images_is_public", formData.business_images_is_public);
      data.append("business_banner_ads_is_public", formData.business_banner_ad_is_public);
      data.append("business_short_bio_is_public", formData.business_short_bio_is_public);
      data.append("business_services_is_public", formData.business_services_is_public);
      data.append("business_owners_is_public", formData.business_owners_is_public);

      // Add business_services array as JSON string
      data.append("business_services", JSON.stringify(formData.business_services || []));

      // Print the endpoint and the entire payload
      console.log("BusinessProfileApi endpoint:", BusinessProfileApi);
      console.log("Full FormData payload:");
      if (data && data._parts) {
        data._parts.forEach(([key, value]) => {
          console.log(`${key}:`, value);
        });
      }

      console.log("BusinessProfileApi", BusinessProfileApi);
      const response = await fetch(BusinessProfileApi, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        // Clear any cached profile data to force refresh
        await AsyncStorage.removeItem("cachedProfileData");

        navigation.navigate("BusinessProfile", { business_uid: result.business_uid });
        // navigation.navigate('BusinessProfile');

        console.log("Business created successfully");
        console.log("result", result);
      } else {
        throw new Error(result.message || "Business creation failed.");
      }
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size='large' color='#00C721' />;

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <BusinessStep0 formData={formData} setFormData={setFormData} navigation={navigation} />;
      case 1:
        return <BusinessStep1 formData={formData} setFormData={setFormData} navigation={navigation} />;
      case 2:
        return <BusinessStep2 formData={formData} setFormData={setFormData} navigation={navigation} />;
      case 3:
        return <BusinessStep3 formData={formData} setFormData={setFormData} navigation={navigation} />;
      case 4:
        return <BusinessStep4 formData={formData} setFormData={setFormData} navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {renderStep()}
      <BottomNavBar navigation={navigation} businessStep={true} onBack={handleBack} onContinue={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // Dark mode styles
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
});
