import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useDarkMode } from "../contexts/DarkModeContext";

const MiniCard = ({ user, business }) => {
  const { darkMode } = useDarkMode();
  // console.log(" Received user data in MiniCard:", JSON.stringify(user, null, 2));

  // Handle business data if provided
  if (business) {
    const businessName = business.business_name || "";
    const location = business.business_address_line_1 || "";
    const zipCode = business.business_zip_code || "";
    const phone = business.business_phone_number || "";
    const website = business.business_website || "";
    const phoneIsPublic = business.phoneIsPublic;

    // Get first image from business images
    let businessImage = null;
    if (business.first_image) {
      if (typeof business.first_image === "string") {
        businessImage = business.first_image;
      } else if (business.first_image.url) {
        businessImage = business.first_image.url;
      } else if (business.first_image.photo_url) {
        businessImage = business.first_image.photo_url;
      }
    }

    return (
      <View style={[styles.cardContainer, darkMode && styles.darkCardContainer]}>
        {/* Business Image */}
        <Image
          source={businessImage && businessImage.trim() !== "" ? { uri: businessImage } : require("../assets/profile.png")}
          style={[styles.profileImage, darkMode && styles.darkProfileImage]}
          onError={(error) => {
            console.log("MiniCard business image failed to load:", error.nativeEvent.error);
            console.log("Problematic business image URI:", businessImage);
          }}
          defaultSource={require("../assets/profile.png")}
        />

        {/* Business Info */}
        <View style={styles.textContainer}>
          {/* Business name is always visible */}
          <Text style={[styles.name, darkMode && styles.darkName]}>{businessName}</Text>

          {/* Show location */}
          {location && (
            <Text style={[styles.location, darkMode && styles.darkText]}>
              {location}
              {zipCode && `, ${zipCode}`}
            </Text>
          )}

          {/* Show phone if public */}
          {phoneIsPublic && phone && <Text style={[styles.phone, darkMode && styles.darkText]}>{phone}</Text>}

          {/* Show website */}
          {website && <Text style={[styles.website, darkMode && styles.darkText]}>{website}</Text>}
        </View>
      </View>
    );
  }

  // Handle user data (existing functionality)
  const firstName = user?.personal_info?.profile_personal_first_name || user?.firstName || "";
  const lastName = user?.personal_info?.profile_personal_last_name || user?.lastName || "";
  const tagLine = user?.personal_info?.profile_personal_tagline || user?.tagLine || "";
  const email = user?.user_email || user?.email || "";
  const phone = user?.personal_info?.profile_personal_phone_number || user?.phoneNumber || "";
  const profileImage = user?.profileImage;

  // Extract visibility flags
  const emailIsPublic = user?.personal_info?.profile_personal_email_is_public == 1 || user?.emailIsPublic;
  const phoneIsPublic = user?.personal_info?.profile_personal_phone_number_is_public == 1 || user?.phoneIsPublic;
  const tagLineIsPublic = user?.personal_info?.profile_personal_tagline_is_public == 1 || user?.tagLineIsPublic;
  const imageIsPublic = user?.personal_info?.profile_personal_image_is_public == 1 || user?.imageIsPublic;

  return (
    <View style={[styles.cardContainer, darkMode && styles.darkCardContainer]}>
      {/* Profile Image */}
      <Image
        source={profileImage && profileImage !== "" && String(profileImage).trim() !== "" ? { uri: String(profileImage) } : require("../assets/profile.png")}
        style={[styles.profileImage, darkMode && styles.darkProfileImage]}
        onError={(error) => {
          console.log("MiniCard user image failed to load:", error.nativeEvent.error);
          console.log("Problematic user image URI:", profileImage);
        }}
        defaultSource={require("../assets/profile.png")}
      />

      {/* User Info */}
      <View style={styles.textContainer}>
        {/* Name is always visible */}
        <Text style={[styles.name, darkMode && styles.darkName]}>
          {firstName} {lastName}
        </Text>

        {/* Show tagline if public */}
        {tagLineIsPublic && tagLine && <Text style={[styles.tagline, darkMode && styles.darkText]}>{tagLine}</Text>}

        {/* Show email if public */}
        {emailIsPublic && email && <Text style={[styles.email, darkMode && styles.darkText]}>{email}</Text>}

        {/* Show phone if public */}
        {phoneIsPublic && phone && <Text style={[styles.phone, darkMode && styles.darkText]}>{phone}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: "#666",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  website: {
    fontSize: 14,
    color: "#1a73e8",
    marginBottom: 2,
  },

  // Dark mode styles
  darkCardContainer: {
    backgroundColor: "#2d2d2d",
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  darkName: {
    color: "#ffffff",
  },
  darkText: {
    color: "#cccccc",
  },
  darkProfileImage: {
    tintColor: "#ffffff",
  },
});

export default MiniCard;
