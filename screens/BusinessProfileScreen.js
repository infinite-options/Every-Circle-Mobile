// BusinessProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert, Modal } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import MiniCard from "../components/MiniCard";
import ProductCard from "../components/ProductCard";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BusinessProfileApi = "https://ioec2ecaspm.infiniteoptions.com/api/v1/businessinfo/";
const ProfileScreenAPI = "https://ioec2ecaspm.infiniteoptions.com/api/v1/userprofileinfo";

export default function BusinessProfileScreen({ route, navigation }) {
  const { business_uid } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [currentUserProfileId, setCurrentUserProfileId] = useState(null);

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

  // Get current user's profile ID
  useEffect(() => {
    const getCurrentUserProfileId = async () => {
      try {
        const profileId = await AsyncStorage.getItem('profile_uid');
        setCurrentUserProfileId(profileId);
      } catch (error) {
        console.error('Error getting current user profile ID:', error);
      }
    };
    getCurrentUserProfileId();
  }, []);

  // Process reviews when currentUserProfileId becomes available
  useEffect(() => {
    if (currentUserProfileId && business && business.ratings) {
      console.log('Reprocessing reviews with profile ID:', currentUserProfileId);
      
      let userReviewFromAPI = null;
      let otherReviews = [];
      
      console.log('Processing ratings from business data:');
      console.log('Current user profile ID:', currentUserProfileId);
      console.log('All ratings from business:', business.ratings);
      
      if (business.ratings && Array.isArray(business.ratings)) {
        business.ratings.forEach(rating => {
          console.log('Processing rating:', rating.rating_uid, 'Profile ID:', rating.rating_profile_id);
          if (rating.rating_profile_id === currentUserProfileId) {
            console.log('Found user review:', rating.rating_uid);
            userReviewFromAPI = rating;
          } else {
            console.log('Adding to other reviews:', rating.rating_uid);
            otherReviews.push(rating);
          }
        });
      }
      
      console.log('User review found:', userReviewFromAPI ? userReviewFromAPI.rating_uid : 'None');
      console.log('Other reviews count:', otherReviews.length);
      console.log('Other reviews:', otherReviews.map(r => r.rating_uid));
      
      setUserReview(userReviewFromAPI);
      setAllReviews(otherReviews);
    }
  }, [currentUserProfileId, business]);

  const fetchBusinessInfo = async () => {
    try {
      setLoading(true);
      const endpoint = `${BusinessProfileApi}${business_uid}`;
      console.log('BusinessProfileScreen GET endpoint:', endpoint);
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!result || !result.business) {
        throw new Error("Business not found or malformed response");
      }

      console.log("BusinessProfileScreen received data:", JSON.stringify(result, null, 2));

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

      // Store ratings in business object for later processing when profile ID is available
      const businessWithRatings = {
        ...rawBusiness,
        facebook: socialLinksData.facebook || "",
        instagram: socialLinksData.instagram || "",
        linkedin: socialLinksData.linkedin || "",
        youtube: socialLinksData.youtube || "",
        images: businessImages,
        customTags: customTags,
        ratings: result.ratings, // Store ratings for later processing
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
      };

      setBusiness(businessWithRatings);
    } catch (err) {
      console.error("Error fetching business data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkBusinessOwnership = async () => {
      try {
        const profileUID = await AsyncStorage.getItem('user_uid');
        if (!profileUID) {
          console.log('No user profile found');
          return;
        }

        const response = await fetch(`${ProfileScreenAPI}/${profileUID}`);
        const userData = await response.json();
        
        if (userData && userData.business_info) {
          const businessInfo = typeof userData.business_info === 'string' 
            ? JSON.parse(userData.business_info) 
            : userData.business_info;
            
          const isBusinessOwner = businessInfo.some(biz => 
            biz.business_uid === business_uid || 
            biz.profile_business_business_id === business_uid
          );
          
          setIsOwner(isBusinessOwner);
        }
      } catch (error) {
        console.error('Error checking business ownership:', error);
      }
    };

    checkBusinessOwnership();
  }, [business_uid]);

  // Add focus listener to refresh data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('BusinessProfileScreen focused - refreshing data');
      fetchBusinessInfo();
    });

    // Initial fetch
    fetchBusinessInfo();

    return unsubscribe;
  }, [navigation, business_uid]);

  const handleProductPress = (service) => {
    if (!isOwner) {
      setSelectedService(service);
      setQuantity(1);
      setQuantityModalVisible(true);
    }
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
      recommender_profile_id: currentUserProfileId
    });
  };

  const renderStars = (rating) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.starCircle, i < rating && styles.starCircleFilled]} />
        ))}
      </View>
    );
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
        <Text style={styles.headerTitle}>Business Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Edit Button - Only show if user owns the business */}
        {isOwner && (
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
        )}

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

        {/* Review Business Button or User Review */}
        {!isOwner && (
          userReview ? (
            <View style={styles.userReviewContainer}>
              <Text style={styles.userReviewTitle}>Your Review</Text>
              <View style={styles.userReviewRow}>
                <Text style={styles.userReviewLabel}>Rating:</Text>
                <Text style={styles.userReviewValue}>{userReview.rating_star} / 5</Text>
              </View>
              <View style={styles.userReviewRow}>
                <Text style={styles.userReviewLabel}>Comments:</Text>
                <Text style={styles.userReviewValue}>{userReview.rating_description}</Text>
              </View>
              <View style={styles.userReviewRow}>
                <Text style={styles.userReviewLabel}>Date:</Text>
                <Text style={styles.userReviewValue}>{userReview.rating_receipt_date}</Text>
              </View>
              <TouchableOpacity
                style={styles.editReviewButton}
                onPress={() => navigation.navigate('ReviewBusiness', {
                  business_uid: business_uid,
                  business_name: business.business_name,
                  reviewData: userReview,
                  isEdit: true
                })}
              >
                <Text style={styles.editReviewButtonText}>Edit Review</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => navigation.navigate('ReviewBusiness', {
                business_uid: business_uid,
                business_name: business.business_name
              })}
            >
              <Text style={styles.reviewButtonText}>Review Business</Text>
            </TouchableOpacity>
          )
        )}

        {/* All Reviews Section */}
        {allReviews.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reviews ({allReviews.length})</Text>
            {allReviews.map((review, index) => (
              <TouchableOpacity
                key={review.rating_uid || index}
                style={styles.reviewCard}
                onPress={() => navigation.navigate('ReviewDetail', {
                  business_uid: business_uid,
                  business_name: business.business_name,
                  reviewer_profile_id: review.rating_profile_id
                })}
                activeOpacity={0.7}
              >
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewProfileInfo}>
                    <View style={styles.reviewProfileAvatar}>
                      <Text style={styles.reviewProfileInitial}>
                        {review.rating_profile_id ? review.rating_profile_id.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View style={styles.reviewProfileDetails}>
                      <Text style={styles.reviewProfileName}>User {review.rating_profile_id}</Text>
                      <Text style={styles.reviewDate}>{review.rating_receipt_date}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRatingContainer}>
                    {renderStars(review.rating_star)}
                    <Text style={styles.reviewRatingText}>{review.rating_star}/5</Text>
                  </View>
                </View>
                
                {review.rating_description && (
                  <View style={styles.reviewContent}>
                    <Text style={styles.reviewDescription}>{review.rating_description}</Text>
                  </View>
                )}
                
                <View style={styles.reviewFooter}>
                  <View style={styles.reviewMetadata}>
                    <Text style={styles.reviewMetadataText}>Transaction ID: {review.rating_uid}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Business Services Section - Only show if no reviews */}
        {Array.isArray(business.business_services) && business.business_services.length > 0 && allReviews.length === 0 && (
          <View style={styles.card}>
            <View style={styles.servicesHeader}>
              <Text style={styles.cardTitle}>Products & Services</Text>
              {!isOwner && cartItems.length > 0 && (
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
                showEditButton={isOwner}
                onPress={() => handleProductPress(service)}
              />
            ))}
          </View>
        )}

        {/* Shopping Cart Button - Only show if there are reviews */}
        {!isOwner && allReviews.length > 0 && (
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.shoppingCartButton}
              onPress={() => navigation.navigate('ReviewDetail', {
                business_uid: business_uid,
                business_name: business.business_name,
                reviewer_profile_id: 'Charity'
              })}
            >
              <Ionicons name="cart" size={24} color="#9C45F7" />
              <Text style={styles.shoppingCartButtonText}>Shopping Cart</Text>
            </TouchableOpacity>
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  serviceName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C45F7',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#9C45F7',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#9C45F7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userReviewContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginVertical: 20,
  },
  userReviewTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  userReviewRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  userReviewLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  userReviewValue: {
    flex: 1,
  },
  editReviewButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editReviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewProfileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewProfileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewProfileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewProfileDetails: {
    marginLeft: 10,
  },
  reviewProfileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  reviewRatingText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  reviewContent: {
    marginBottom: 10,
  },
  reviewDescription: {
    fontSize: 16,
    color: '#333',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewMetadataText: {
    fontSize: 14,
    color: '#666',
  },
  starCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  starCircleFilled: {
    backgroundColor: '#FFCD3C',
    borderColor: '#FFCD3C',
  },
  shoppingCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 20,
  },
  shoppingCartButtonText: {
    marginLeft: 5,
    color: '#9C45F7',
    fontWeight: 'bold',
  },
});
