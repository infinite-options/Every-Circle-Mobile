// BusinessProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
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

        // Filter out problematic URLs that won't work in React Native
        businessImages = businessImages.filter(uri => {
          // Check if URI is valid
          if (!uri || typeof uri !== "string" || uri.trim() === "" || uri === "null" || uri === "undefined") {
            return false;
          }
          
          // Filter out Google Maps API URLs that don't work in React Native
          if (uri.includes('maps.googleapis.com/maps/api/place/js/PhotoService') || 
              uri.includes('PhotoService.GetPhoto') ||
              uri.includes('callback=none')) {
            console.log("Filtering out Google API URL that won't work in React Native:", uri.substring(0, 100) + "...");
            return false;
          }
          
          // Only allow direct image URLs or valid http/https URLs
          const isValidImageUrl = uri.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) || 
                                 uri.startsWith('http://') || 
                                 uri.startsWith('https://');
          
          if (!isValidImageUrl) {
            console.log("Filtering out invalid image URL:", uri.substring(0, 100));
            return false;
          }
          
          return true;
        });

        console.log("Processed business images after filtering:", businessImages);

        // Handle custom tags if available
        let customTags = [];
        if (rawBusiness.custom_tags) {
          if (typeof rawBusiness.custom_tags === "string") {
            try {
              customTags = JSON.parse(rawBusiness.custom_tags);
            } catch (e) {
              console.log("Failed to parse custom_tags as JSON");
              customTags = [];
            }
          } else if (Array.isArray(rawBusiness.custom_tags)) {
            customTags = rawBusiness.custom_tags;
          }
        }

        setBusiness({
          ...rawBusiness,
          facebook: socialLinksData.facebook || "",
          instagram: socialLinksData.instagram || "",
          linkedin: socialLinksData.linkedin || "",
          youtube: socialLinksData.youtube || "",
          images: businessImages,
          customTags: customTags,
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
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Edit Button */}
        <View style={styles.editButtonContainer}>
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

        {/* Business Card (MiniCard at top) */}
        <View style={styles.card}>
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

        {/* Contact Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {business.business_address_line_1 || "N/A"}
              {business.business_address_line_2 && `, ${business.business_address_line_2}`}
              {business.business_city && `, ${business.business_city}`}
              {business.business_state && `, ${business.business_state}`}
              {business.business_zip_code && `, ${business.business_zip_code}`}
              {business.business_country && `, ${business.business_country}`}
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

          {business.business_role && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Business Role:</Text>
              <Text style={styles.value}>{business.business_role}</Text>
            </View>
          )}

          {business.ein_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>EIN Number:</Text>
              <Text style={styles.value}>{business.ein_number}</Text>
            </View>
          )}
        </View>

        {/* Business Details Card */}
        {(business.taglineIsPublic && business.tagline) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tagline</Text>
            <Text style={styles.bioText}>{business.tagline}</Text>
          </View>
        )}

        {/* About Section */}
        {business.shortBioIsPublic && business.business_short_bio && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.bioText}>{business.business_short_bio}</Text>
          </View>
        )}

        {/* Business Hours */}
        {business.business_hours && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Business Hours</Text>
            <Text style={styles.bioText}>{business.business_hours}</Text>
          </View>
        )}

        {/* Rating and Price Level */}
        {(business.google_rating || business.price_level) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rating & Pricing</Text>
            {business.google_rating && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Google Rating:</Text>
                <Text style={styles.value}>⭐ {business.google_rating}</Text>
              </View>
            )}
            {business.price_level && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Price Level:</Text>
                <Text style={styles.value}>{'$'.repeat(parseInt(business.price_level) || 1)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Custom Tags */}
        {business.customTags && business.customTags.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {business.customTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
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

        {/* Business Images Card - Only show if there are images */}
        {Array.isArray(business.images) && business.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Business Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {business.images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: uri }}
                    style={styles.image}
                    onError={(error) => {
                      console.log(`Business image ${index} failed to load:`, error.nativeEvent.error);
                      console.log(`Problematic URI:`, uri);
                    }}
                    onLoad={() => console.log(`Business image ${index} loaded successfully`)}
                    defaultSource={require("../assets/profile.png")}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            {business.images.length === 0 && (
              <Text style={styles.noDataText}>No compatible images available</Text>
            )}
          </View>
        )}
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
  header: {
    backgroundColor: "#9C45F7",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
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
  editButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#E8F4FD",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#1a73e8",
    fontSize: 14,
    fontWeight: "500",
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
  imageContainer: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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
