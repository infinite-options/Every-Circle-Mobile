// BusinessProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MiniCard from "../components/MiniCard";
import BottomNavBar from "../components/BottomNavBar";

const BusinessProfileApi = "https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo/";

export default function BusinessProfileScreen({ route, navigation }) {
  const { business_uid } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await fetch(`${BusinessProfileApi}${business_uid}`);
        const result = await response.json();
        console.log("Business API response:", result);

        if (!result || !result.business) {
          throw new Error("Business not found or malformed response");
        }

        console.log("Full API Response:", JSON.stringify(result, null, 2));

        const rawBusiness = result.business;
        const socialLinks = rawBusiness.social_links ? JSON.parse(rawBusiness.social_links) : {};

        setBusiness({
          ...rawBusiness,
          facebook: socialLinks.facebook || "",
          instagram: socialLinks.instagram || "",
          linkedin: socialLinks.linkedin || "",
          youtube: socialLinks.youtube || "",
          images: rawBusiness.business_google_photos || [],
          emailIsPublic: rawBusiness.email_is_public === "1",
          phoneIsPublic: rawBusiness.phone_is_public === "1",
          taglineIsPublic: rawBusiness.tagline_is_public === "1",
          shortBioIsPublic: rawBusiness.short_bio_is_public === "1",
        });
      } catch (err) {
        console.error("Error fetching business data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, [business_uid]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#00C721' />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load business data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditBusinessProfile", {
              business: business,
              business_uid: business_uid,
            })
          }
        >
          <Image source={require("../assets/Edit.png")} style={styles.editIcon} />
        </TouchableOpacity>

        <Text style={styles.header}>{business.business_name}</Text>

        {business.taglineIsPublic && business.tagline ? <Text style={styles.tagline}>{business.tagline}</Text> : null}

        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{business.business_address_line_1 || "N/A"}</Text>

        {business.phoneIsPublic && (
          <>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{business.business_phone_number || "N/A"}</Text>
          </>
        )}

        {business.emailIsPublic && (
          <>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{business.business_email || "N/A"}</Text>
          </>
        )}

        <Text style={styles.label}>Business Category:</Text>
        <Text style={styles.value}>{business.business_category || "N/A"}</Text>

        {business.shortBioIsPublic && (
          <>
            <Text style={styles.label}>Short Bio:</Text>
            <Text style={styles.value}>{business.business_short_bio || "N/A"}</Text>
          </>
        )}

        <Text style={styles.label}>Social Links:</Text>
        {business.facebook ? <Text style={styles.link}>📘 Facebook: {business.facebook}</Text> : null}
        {business.instagram ? <Text style={styles.link}>📸 Instagram: {business.instagram}</Text> : null}
        {business.linkedin ? <Text style={styles.link}>🔗 LinkedIn: {business.linkedin}</Text> : null}
        {business.youtube ? <Text style={styles.link}>▶️ YouTube: {business.youtube}</Text> : null}

        <Text style={styles.label}>Business Images:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {Array.isArray(business.images) && business.images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {business.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.image} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.value}>No images available</Text>
          )}
        </ScrollView>

        <MiniCard business={business} />

        {/* <TouchableOpacity style={styles.saveButton} onPress={() => console.log('Save button pressed')}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity> */}
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  link: {
    fontSize: 14,
    color: "#1a73e8",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  imageScroll: {
    marginVertical: 10,
  },
  image: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#00C721",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
});
