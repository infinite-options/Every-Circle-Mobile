import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MiniCard = ({ user }) => {
  // console.log(" Received user data in MiniCard:", JSON.stringify(user, null, 2));

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
    <View style={styles.cardContainer}>
      {/* Profile Image */}
      <Image source={profileImage && profileImage !== "" ? { uri: String(profileImage) } : require("../assets/profile.png")} style={styles.profileImage} />

      {/* User Info */}
      <View style={styles.textContainer}>
        {/* Name is always visible */}
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>

        {/* Show tagline if public */}
        {tagLineIsPublic && tagLine && <Text style={styles.tagline}>{tagLine}</Text>}

        {/* Show email if public */}
        {emailIsPublic && email && <Text style={styles.email}>{email}</Text>}

        {/* Show phone if public */}
        {phoneIsPublic && phone && <Text style={styles.phone}>{phone}</Text>}
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
});

export default MiniCard;
