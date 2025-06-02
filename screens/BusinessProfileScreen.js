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

        // Handle social_links - now it's an array of objects
        let socialLinksData = {};
        if (rawBusiness.social_links) {
          if (Array.isArray(rawBusiness.social_links)) {
            // New format: array of objects with social_link_name and business_link_url
            rawBusiness.social_links.forEach((link) => {
              if (link.business_link_url && link.business_link_url.trim() !== "") {
                socialLinksData[link.social_link_name] = link.business_link_url;
              }
            });
          } else if (typeof rawBusiness.social_links === "string") {
            // Old format: JSON string
            try {
              socialLinksData = JSON.parse(rawBusiness.social_links);
            } catch (e) {
              console.log("Failed to parse social_links as JSON");
              socialLinksData = {};
            }
          }
        }

        console.log("Processed social links:", socialLinksData);

        // Handle business_google_photos - it might be a string or array
        let businessImages = [];
        if (rawBusiness.business_google_photos) {
          if (typeof rawBusiness.business_google_photos === "string") {
            try {
              businessImages = JSON.parse(rawBusiness.business_google_photos);
            } catch (e) {
              console.log("Failed to parse business_google_photos as JSON, treating as single URL");
              businessImages = [rawBusiness.business_google_photos];
            }
          } else if (Array.isArray(rawBusiness.business_google_photos)) {
            businessImages = rawBusiness.business_google_photos;
          }
        }

        console.log("Processed business images:", businessImages);

        setBusiness({
          ...rawBusiness,
          facebook: socialLinksData.facebook || "",
          instagram: socialLinksData.instagram || "",
          linkedin: socialLinksData.linkedin || "",
          youtube: socialLinksData.youtube || "",
          images: businessImages,
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
        <Text style={styles.value}>
          {business.business_address_line_1 || "N/A"}
          {business.business_zip_code && `, ${business.business_zip_code}`}
        </Text>

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

        {business.business_website && (
          <>
            <Text style={styles.label}>Website:</Text>
            <Text style={styles.link}>🌐 {business.business_website}</Text>
          </>
        )}

        <Text style={styles.label}>Social Links:</Text>
        {business.facebook ? <Text style={styles.link}>📘 Facebook: {business.facebook}</Text> : null}
        {business.instagram ? <Text style={styles.link}>📸 Instagram: {business.instagram}</Text> : null}
        {business.linkedin ? <Text style={styles.link}>🔗 LinkedIn: {business.linkedin}</Text> : null}
        {business.youtube ? <Text style={styles.link}>▶️ YouTube: {business.youtube}</Text> : null}

        <Text style={styles.label}>Business Images:</Text>
        {Array.isArray(business.images) && business.images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {business.images.map((uri, index) => (
              <Image
                key={index}
                source={{ uri: typeof uri === "string" ? uri : uri.url || uri.photo_url }}
                style={styles.image}
                onError={(error) => console.log(`Image ${index} failed to load:`, error.nativeEvent.error)}
                onLoad={() => console.log(`Image ${index} loaded successfully`)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.value}>No images available</Text>
        )}

        <MiniCard
          business={{
            business_name: business.business_name,
            business_address_line_1: business.business_address_line_1,
            business_zip_code: business.business_zip_code,
            business_phone_number: business.business_phone_number,
            business_website: business.business_website,
            first_image: business.images && business.images.length > 0 ? business.images[0] : null,
            phoneIsPublic: business.phoneIsPublic,
          }}
        />

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
