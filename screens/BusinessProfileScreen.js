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
        {/* Header Section with Edit Button */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.header}>{business.business_name}</Text>
            {business.taglineIsPublic && business.tagline ? (
              <Text style={styles.tagline}>{business.tagline}</Text>
            ) : null}
          </View>
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
        </View>

        {/* Contact Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {business.business_address_line_1 || "N/A"}
              {business.business_city && `, ${business.business_city}`}
              {business.business_zip_code && `, ${business.business_zip_code}`}
            </Text>
          </View>

          {business.phoneIsPublic && business.business_phone_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{business.business_phone_number}</Text>
            </View>
          )}

          {business.emailIsPublic && business.business_email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{business.business_email}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Business Category:</Text>
            <Text style={styles.value}>{business.business_category || "N/A"}</Text>
          </View>

          {business.business_website && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Website:</Text>
              <Text style={styles.link}>🌐 {business.business_website}</Text>
            </View>
          )}
        </View>

        {/* About Section */}
        {business.shortBioIsPublic && business.business_short_bio && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.bioText}>{business.business_short_bio}</Text>
          </View>
        )}

        {/* Social Links Card */}
        {(business.facebook || business.instagram || business.linkedin || business.youtube) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Social Links</Text>
            {business.facebook && <Text style={styles.socialLink}>📘 Facebook: {business.facebook}</Text>}
            {business.instagram && <Text style={styles.socialLink}>📸 Instagram: {business.instagram}</Text>}
            {business.linkedin && <Text style={styles.socialLink}>🔗 LinkedIn: {business.linkedin}</Text>}
            {business.youtube && <Text style={styles.socialLink}>▶️ YouTube: {business.youtube}</Text>}
          </View>
        )}

        {/* Business Images Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Images</Text>
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
            <Text style={styles.noDataText}>No images available</Text>
          )}
        </View>

        {/* Business Card Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Card Preview</Text>
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
        </View>
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
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  tagline: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  link: {
    fontSize: 16,
    color: "#1a73e8",
    textDecorationLine: "underline",
  },
  bioText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  socialLink: {
    fontSize: 16,
    color: "#1a73e8",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
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
    backgroundColor: "#f0f0f0",
  },
  editButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    width: 20,
    height: 20,
  },
});
