// ReviewDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MiniCard from "../components/MiniCard";
import ProductCard from "../components/ProductCard";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BusinessProfileApi = "https://ioec2ecaspm.infiniteoptions.com/api/v1/businessinfo/";

export default function ReviewDetailScreen({ route, navigation }) {
  const { business_uid, business_name, reviewer_profile_id } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Load cart items when component mounts
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const storedCartData = await AsyncStorage.getItem(`cart_${business_uid}`);
        if (storedCartData) {
          const cartData = JSON.parse(storedCartData);
          setCartItems(cartData.items || []);
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      }
    };

    loadCartItems();
  }, [business_uid]);

  // Add focus listener to refresh cart data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ReviewDetailScreen focused - refreshing cart data');
      const loadCartItems = async () => {
        try {
          const storedCartData = await AsyncStorage.getItem(`cart_${business_uid}`);
          if (storedCartData) {
            const cartData = JSON.parse(storedCartData);
            setCartItems(cartData.items || []);
          }
        } catch (error) {
          console.error('Error loading cart items:', error);
        }
      };
      loadCartItems();
    });

    return unsubscribe;
  }, [navigation, business_uid]);

  const fetchBusinessInfo = async () => {
    try {
      setLoading(true);
      const endpoint = `${BusinessProfileApi}${business_uid}`;
      console.log('ReviewDetailScreen GET endpoint:', endpoint);
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!result || !result.business) {
        throw new Error("Business not found or malformed response");
      }

      console.log("ReviewDetailScreen received data:", JSON.stringify(result, null, 2));

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
        business_services: (() => {
          if (rawBusiness.business_services) {
            if (typeof rawBusiness.business_services === 'string') {
              try {
                return JSON.parse(rawBusiness.business_services);
              } catch (e) {
                console.log('Failed to parse business_services as JSON');
                return [];
              }
            } else if (Array.isArray(rawBusiness.business_services)) {
              return rawBusiness.business_services;
            }
          }
          // Fallback: use result.services if present
          if (Array.isArray(result.services)) {
            return result.services;
          }
          return [];
        })(),
      });
    } catch (err) {
      console.error("Error fetching business data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessInfo();
  }, [business_uid]);

  const handleProductPress = (service) => {
    setSelectedService(service);
    setQuantity(1);
    setQuantityModalVisible(true);
  };

  const handleQuantityConfirm = async () => {
    try {
      const serviceWithQuantity = {
        ...selectedService,
        quantity: quantity,
        totalPrice: (parseFloat(selectedService.bs_cost) * quantity).toFixed(2)
      };

      // Check if the item already exists in the cart
      const existingItemIndex = cartItems.findIndex(item => item.bs_uid === selectedService.bs_uid);
      
      let newCartItems;
      if (existingItemIndex !== -1) {
        // Item exists, update its quantity
        newCartItems = [...cartItems];
        const existingItem = newCartItems[existingItemIndex];
        const newQuantity = (existingItem.quantity || 1) + quantity;
        newCartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: (parseFloat(existingItem.bs_cost) * newQuantity).toFixed(2)
        };
        console.log(`Updated quantity for existing item ${selectedService.bs_service_name} to ${newQuantity}`);
      } else {
        // Item doesn't exist, add it as new
        newCartItems = [...cartItems, serviceWithQuantity];
        console.log(`Added new item ${selectedService.bs_service_name} with quantity ${quantity}`);
      }
      
      setCartItems(newCartItems);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(`cart_${business_uid}`, JSON.stringify({
        items: newCartItems
      }));
      
      setQuantityModalVisible(false);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleRemoveItem = async (index) => {
    try {
      const newCartItems = cartItems.filter((_, i) => i !== index);
      setCartItems(newCartItems);
      
      // Update AsyncStorage
      await AsyncStorage.setItem(`cart_${business_uid}`, JSON.stringify({
        items: newCartItems
      }));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handleViewCart = () => {
    navigation.navigate('ShoppingCart', {
      cartItems,
      onRemoveItem: handleRemoveItem,
      businessName: business.business_name,
      business_uid: business_uid,
      recommender_profile_id: reviewer_profile_id // Pass the referral profile ID
    });
  };

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
        <Text style={styles.headerTitle}>Review Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Reviewer Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reviewer Information</Text>
          <View style={styles.reviewerInfo}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitial}>
                {reviewer_profile_id === 'Charity' ? 'C' : (reviewer_profile_id ? reviewer_profile_id.charAt(0).toUpperCase() : 'U')}
              </Text>
            </View>
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>
                {reviewer_profile_id === 'Charity' ? 'Charity' : `User ${reviewer_profile_id}`}
              </Text>
              <Text style={styles.reviewerLabel}>
                {reviewer_profile_id === 'Charity' ? 'Charity Organization' : `Profile ID: ${reviewer_profile_id}`}
              </Text>
            </View>
          </View>
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
          </View>
        )}

        {/* Business Services Section */}
        {Array.isArray(business.business_services) && business.business_services.length > 0 && (
          <View style={styles.card}>
            <View style={styles.servicesHeader}>
              <Text style={styles.cardTitle}>Products & Services</Text>
              {cartItems.length > 0 && (
                <TouchableOpacity 
                  style={styles.cartButton}
                  onPress={handleViewCart}
                >
                  <Ionicons name="cart" size={24} color="#9C45F7" />
                  <Text style={styles.cartCount}>{cartItems.length}</Text>
                </TouchableOpacity>
              )}
            </View>
            {business.business_services.map((service, idx) => (
              <ProductCard 
                key={idx} 
                service={service} 
                showEditButton={false}
                onPress={() => handleProductPress(service)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar navigation={navigation} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={quantityModalVisible}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quantity</Text>
            <Text style={styles.serviceName}>{selectedService?.bs_service_name}</Text>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                <Ionicons name="remove" size={24} color="#9C45F7" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(prev => prev + 1)}
              >
                <Ionicons name="add" size={24} color="#9C45F7" />
              </TouchableOpacity>
            </View>

            <Text style={styles.totalPrice}>
              Total: ${selectedService ? (parseFloat(selectedService.bs_cost) * quantity).toFixed(2) : '0.00'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleQuantityConfirm}
              >
                <Text style={styles.confirmButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewerDetails: {
    marginLeft: 15,
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 20,
  },
  cartCount: {
    marginLeft: 5,
    color: '#9C45F7',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
  },
  quantityText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
  },
  totalPrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#9C45F7',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
    marginRight: 6,
  },
  confirmButton: {
    backgroundColor: '#9C45F7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#9C45F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C45F7',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 