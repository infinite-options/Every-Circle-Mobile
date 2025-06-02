import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from "react-native";
import axios from "axios";
import MiniCard from "../components/MiniCard";
import BottomNavBar from "../components/BottomNavBar";

const BusinessProfileAPI = "https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo";

export default function EditBusinessProfileScreen({ route, navigation }) {
  const { business } = route.params || {};
  const [businessUID, setBusinessUID] = useState(business?.business_uid || "");

  const [formData, setFormData] = useState({
    name: business?.business_name || "",
    location: business?.business_address_line_1 || "",
    phone: business?.business_phone_number || "",
    email: business?.business_email || "",
    category: business?.business_category || "",
    tagline: business?.tagline || "",
    shortBio: business?.business_short_bio || "",
    images: business?.business_google_photos || [],
    socialLinks: {
      facebook: business?.facebook || "",
      instagram: business?.instagram || "",
      linkedin: business?.linkedin || "",
      youtube: business?.youtube || "",
    },
    emailIsPublic: business?.email_is_public === "1",
    phoneIsPublic: business?.phone_is_public === "1",
    taglineIsPublic: business?.tagline_is_public === "1",
    shortBioIsPublic: business?.short_bio_is_public === "1",
  });

  const toggleVisibility = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !businessUID.trim()) {
      Alert.alert("Error", "Business name and ID are required.");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("business_uid", businessUID);
      payload.append("business_name", formData.name);
      payload.append("business_address_line_1", formData.location);
      payload.append("business_phone_number", formData.phone);
      payload.append("business_email_id", formData.email);
      payload.append("business_category_id", formData.category);
      payload.append("business_short_bio", formData.shortBio);
      payload.append("business_tag_line", formData.tagline);
      payload.append("social_links", JSON.stringify(formData.socialLinks));
      payload.append("business_email_id_is_public", formData.emailIsPublic ? "1" : "0");
      payload.append("business_phone_number_is_public", formData.phoneIsPublic ? "1" : "0");
      payload.append("business_tag_line_is_public", formData.taglineIsPublic ? "1" : "0");
      payload.append("business_short_bio_is_public", formData.shortBioIsPublic ? "1" : "0");

      const cleanLinks = {};
      ["facebook", "instagram", "linkedin", "youtube"].forEach((platform) => {
        if (formData.socialLinks[platform]) {
          cleanLinks[platform] = formData.socialLinks[platform];
        }
      });
      console.log("FormData to be submitted:");
      for (let pair of payload.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      console.log("Before API Call:", payload);
      console.log("Business Endpoint:", `${BusinessProfileAPI}/${businessUID}`);
      // const response = await axios.put(`${BusinessProfileAPI}/${businessUID}`, payload, {
      const response = await axios.put(`${BusinessProfileAPI}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Business profile updated.");
        navigation.navigate("BusinessProfile", { business_uid: businessUID });
      } else {
        Alert.alert("Error", "Update failed. Try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const renderField = (label, value, key, placeholder, visibilityKey = null) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {visibilityKey && (
          <TouchableOpacity onPress={() => toggleVisibility(visibilityKey)}>
            <Text style={{ color: formData[visibilityKey] ? "green" : "red" }}>{formData[visibilityKey] ? "Public" : "Private"}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput style={styles.input} value={value} placeholder={placeholder || label} onChangeText={(text) => setFormData({ ...formData, [key]: text })} />
    </View>
  );

  const renderSocialField = (label, platform) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={formData.socialLinks[platform]}
        placeholder={`Enter ${platform} link`}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            socialLinks: { ...formData.socialLinks, [platform]: text },
          })
        }
      />
    </View>
  );

  const previewBusiness = {
    business_name: formData.name,
    tagline: formData.tagline,
    business_short_bio: formData.shortBio,
    business_phone_number: formData.phone,
    business_email: formData.email,
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Edit Business Profile</Text>

        {renderField("Business Name", formData.name, "name")}
        {renderField("Location", formData.location, "location")}
        {renderField("Phone Number", formData.phone, "phone", "", "phoneIsPublic")}
        {renderField("Email", formData.email, "email", "", "emailIsPublic")}
        {renderField("Business Category", formData.category, "category")}
        {renderField("Tag Line", formData.tagline, "tagline", "", "taglineIsPublic")}
        {renderField("Short Bio", formData.shortBio, "shortBio", "", "shortBioIsPublic")}

        <View style={styles.previewSection}>
          <Text style={styles.label}>MiniCard Preview:</Text>
          <MiniCard business={previewBusiness} />
        </View>

        <Text style={styles.label}>Social Links</Text>
        {renderSocialField("Facebook", "facebook")}
        {renderSocialField("Instagram", "instagram")}
        {renderSocialField("LinkedIn", "linkedin")}
        {renderSocialField("YouTube", "youtube")}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  saveButton: {
    backgroundColor: "#00C721",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  previewSection: {
    marginVertical: 20,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
});
