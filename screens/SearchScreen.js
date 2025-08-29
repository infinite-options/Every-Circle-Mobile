// SearchScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, FlatList, ActivityIndicator, Alert, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BUSINESS_RESULTS_ENDPOINT, TAG_SEARCH_DISTINCT_ENDPOINT, TAG_CATEGORY_DISTINCT_ENDPOINT } from "../apiConfig";
import { useDarkMode } from "../contexts/DarkModeContext";

export default function SearchScreen({ route }) {
  const navigation = useNavigation();
  const { darkMode } = useDarkMode();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Load cart items when component mounts and when screen is focused
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        console.log("Loading cart items...");
        // Get all keys from AsyncStorage
        const keys = await AsyncStorage.getAllKeys();
        // Filter keys that start with 'cart_'
        const cartKeys = keys.filter((key) => key.startsWith("cart_"));
        console.log("Found cart keys:", cartKeys);

        let totalItems = 0;
        let allCartItems = [];

        // Load items from each cart
        for (const key of cartKeys) {
          const cartData = await AsyncStorage.getItem(key);
          if (cartData) {
            const { items } = JSON.parse(cartData);
            totalItems += items.length;
            // Add business_uid to each item
            const businessUid = key.replace("cart_", "");
            const itemsWithBusiness = items.map((item) => ({
              ...item,
              business_uid: businessUid,
            }));
            allCartItems = [...allCartItems, ...itemsWithBusiness];
          }
        }

        console.log("Cart count updated:", totalItems);
        console.log("Total cart items:", allCartItems.length);
        setCartCount(totalItems);
        setCartItems(allCartItems);
      } catch (error) {
        console.error("Error loading cart items:", error);
        // Reset cart state on error
        setCartCount(0);
        setCartItems([]);
      }
    };

    // Load cart items when component mounts
    loadCartItems();

    // Add focus listener to refresh cart count when returning to this screen
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("SearchScreen focused - refreshing cart");
      loadCartItems();
    });

    return unsubscribe;
  }, [navigation, route.params?.refreshCart]); // Add route.params?.refreshCart as a dependency

  // Clear cart data when refreshCart is true
  useEffect(() => {
    const clearCartData = async () => {
      if (route.params?.refreshCart) {
        console.log("Clearing cart data due to refreshCart parameter");
        try {
          const keys = await AsyncStorage.getAllKeys();
          const cartKeys = keys.filter((key) => key.startsWith("cart_"));
          await Promise.all(cartKeys.map((key) => AsyncStorage.removeItem(key)));
          setCartCount(0);
          setCartItems([]);
          console.log("Cart data cleared successfully");
        } catch (error) {
          console.error("Error clearing cart data:", error);
        }
      }
    };

    clearCartData();
  }, [route.params?.refreshCart]);

  // --- stub initial data, so you see the four items by default ---
  const initialResults = [
    { id: "1", company: "ABC Plumbing", rating: 4, hasPriceTag: false, hasX: false, hasDollar: true },
    { id: "2", company: "Speedy Roto", rating: 3, hasPriceTag: false, hasX: true, hasDollar: false },
    { id: "3", company: "Fast Rooter", rating: 4, hasPriceTag: true, hasX: false, hasDollar: false },
    { id: "4", company: "Hector Handyman", rating: 4, hasPriceTag: false, hasX: false, hasDollar: true },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    console.log("🔍 User searched for:", q);

    setLoading(true);
    try {
      // Try the v1 API endpoint to match other endpoints in the app
      // const apiUrl = `${BUSINESS_RESULTS_ENDPOINT}/${encodeURIComponent(q)}`;
      // const apiUrl = `${BUSINESS_RESULTS_ENDPOINT}/${encodeURIComponent(q)}`;
      const apiUrl = 'http://ioec2ecaspm.infiniteoptions.com:5001/search?q=${encodeURIComponent(q)}'
      // const apiUrl = `${TAG_SEARCH_DISTINCT_ENDPOINT}/${encodeURIComponent(q)}`;
      // const apiUrl = `${TAG_CATEGORY_DISTINCT_ENDPOINT}/${encodeURIComponent(q)}`;
      console.log("🎯 EXACT ENDPOINT BEING CALLED:", apiUrl);
      console.log("🌐 API URL:", apiUrl);

      const res = await fetch(apiUrl);

      console.log("📡 Response status:", res.status);
      console.log("📡 Response headers:", res.headers);
      console.log("📡 Content-Type:", res.headers.get("content-type"));

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Get raw response text first
      const responseText = await res.text();
      console.log("📄 Raw response text (first 500 chars):", responseText.substring(0, 500));

      // Check if response looks like JSON
      if (!responseText.trim().startsWith("{") && !responseText.trim().startsWith("[")) {
        throw new Error(`API returned non-JSON response: ${responseText.substring(0, 200)}`);
      }

      // Parse JSON
      const json = JSON.parse(responseText);

      console.log("📡 Search API Response:", JSON.stringify(json, null, 2));
      console.log("📊 Number of results returned:", json.results?.length || json.result?.length || 0);

      // Handle both possible response structures
      const resultsArray = json.results || json.result || [];

      const list = resultsArray.map((b, i) => ({
        id: `${b.business_uid || i}`,
        company: b.business_name || b.company || "Unknown Business",
        // Use score as rating if rating_star not available, convert to 1-5 scale
        rating: typeof b.rating_star === "number" ? b.rating_star : typeof b.score === "number" ? Math.min(5, Math.max(1, Math.round(b.score * 5))) : 4,
        hasPriceTag: b.has_price_tag || false,
        hasX: b.has_x || false,
        hasDollar: b.has_dollar_sign || false,
      }));

      console.log("✅ Processed search results:", list);
      setResults(list);
    } catch (err) {
      console.warn("❌ Search failed for query:", q, "Error:", err);
      console.warn("❌ Error details:", err.message);

      // If the v1 endpoint fails, let's try alternative endpoints
      if (err.message.includes("404")) {
        console.log("🔄 Trying alternative endpoints...");
        await tryAlternativeEndpoints(q);
      } else {
        setResults([]);
      }
    }
    setLoading(false);
  };

  const tryAlternativeEndpoints = async (query) => {
    const alternativeEndpoints = [
      // `${BUSINESS_RESULTS_ENDPOINT}/${encodeURIComponent(query)}`,
      // `${TAG_SEARCH_DISTINCT_ENDPOINT}/${encodeURIComponent(query)}`,
      // `${TAG_CATEGORY_DISTINCT_ENDPOINT}/${encodeURIComponent(query)}`
      `${TAG_SEARCH_DISTINCT_ENDPOINT}/${encodeURIComponent(query)}`,
      `${TAG_CATEGORY_DISTINCT_ENDPOINT}/${encodeURIComponent(query)}`,
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log("🔄 Trying alternative endpoint:", endpoint);
        const res = await fetch(endpoint);
        console.log("📡 Alternative endpoint response status:", res.status);

        if (res.ok) {
          const responseText = await res.text();
          if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
            const json = JSON.parse(responseText);
            console.log("✅ Alternative endpoint worked! Response:", JSON.stringify(json, null, 2));

            // Handle both possible response structures
            const resultsArray = json.results || json.result || [];

            const list = resultsArray.map((b, i) => ({
              id: `${b.business_uid || i}`,
              company: b.business_name || b.company || "Unknown Business",
              // Use score as rating if rating_star not available, convert to 1-5 scale
              rating: typeof b.rating_star === "number" ? b.rating_star : typeof b.score === "number" ? Math.min(5, Math.max(1, Math.round(b.score * 5))) : 4,
              hasPriceTag: b.has_price_tag || false,
              hasX: b.has_x || false,
              hasDollar: b.has_dollar_sign || false,
            }));

            console.log("✅ Processed results from alternative endpoint:", list);
            setResults(list);
            return;
          }
        }
      } catch (error) {
        console.log("❌ Alternative endpoint failed:", endpoint, error.message);
      }
    }

    console.log("❌ All endpoints failed, showing empty results");
    setResults([]);
  };

  const renderStars = (rating) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: rating }).map((_, i) => (
          <View key={i} style={styles.starCircle} />
        ))}
      </View>
    );
  };

  const renderResultItem = (item, idx) => (
    <TouchableOpacity
      key={`${item.id}-${idx}`}
      style={[styles.resultItem, darkMode && styles.darkResultItem]}
      activeOpacity={0.7}
      onPress={() => {
        console.log("🏢 Navigating to business profile for:", item.company, "ID:", item.id);
        navigation.navigate("BusinessProfile", { business_uid: item.id });
      }}
    >
      <View style={styles.resultContent}>
        <Text style={[styles.companyName, darkMode && styles.darkCompanyName]}>{item.company}</Text>
      </View>
      <View style={styles.resultActions}>
        <View style={styles.ratingContainer}>
          <Ionicons name='star' size={16} color='#FFCD3C' />
          <Text style={[styles.ratingText, darkMode && styles.darkRatingText]}>{typeof item.rating === "number" ? item.rating.toFixed(1) : item.rating}</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
            navigation.navigate("SearchTab", {
              centerCompany: {
                id: item.id,
                name: item.company,
                rating: item.rating,
              },
            });
          }}
        >
          <Ionicons name='share-social-outline' size={22} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>

        {item.hasX && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.xSymbol, darkMode && styles.darkXSymbol]}>X</Text>
          </TouchableOpacity>
        )}
        {item.hasPriceTag && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.percentSymbol, darkMode && styles.darkPercentSymbol]}>:%</Text>
          </TouchableOpacity>
        )}
        {item.hasDollar && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.moneyBagContainer, darkMode && styles.darkMoneyBagContainer]}>
              <Text style={[styles.dollarSymbol, darkMode && styles.darkDollarSymbol]}>$</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() =>
              navigation.navigate("ShoppingCart", {
                cartItems: cartItems,
                onRemoveItem: async (index) => {
                  // Get the business_uid from the item being removed before filtering
                  const itemToRemove = cartItems[index];
                  const businessUid = itemToRemove.business_uid;

                  // Create a new array without the removed item
                  const newCartItems = cartItems.filter((_, i) => i !== index);
                  setCartItems(newCartItems);
                  setCartCount(newCartItems.length);

                  // Update AsyncStorage for the specific business
                  await AsyncStorage.setItem(
                    `cart_${businessUid}`,
                    JSON.stringify({
                      items: newCartItems.filter((item) => item.business_uid === businessUid),
                    })
                  );
                },
                businessName: "All Items",
                business_uid: "all",
              })
            }
          >
            <Ionicons name='cart-outline' size={24} color='black' />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, darkMode && styles.darkSearchInput]}
              placeholder='What are you looking for?'
              placeholderTextColor={darkMode ? "#cccccc" : "#666"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType='search'
              onSubmitEditing={onSearch}
            />
            <TouchableOpacity style={[styles.searchButton, darkMode && styles.darkSearchButton]} onPress={onSearch}>
              <Ionicons name='search' size={22} color={darkMode ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, darkMode && styles.darkFilterButton]} onPress={() => navigation.navigate("Filters")}>
              <MaterialIcons name='filter-list' size={22} color={darkMode ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>

          <View style={[styles.tableHeader, darkMode && styles.darkTableHeader]}>
            <Text style={[styles.tableHeaderText, darkMode && styles.darkTableHeaderText]}>Company</Text>
            <Text style={[styles.tableHeaderText, darkMode && styles.darkTableHeaderText]}>Rating</Text>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {loading ? <Text style={[styles.loadingText, darkMode && styles.darkLoadingText]}>Loading…</Text> : results.map((item, idx) => renderResultItem(item, idx))}
          </ScrollView>

          <View style={[styles.bannerAd, darkMode && styles.darkBannerAd]}>
            <Text style={[styles.bannerAdText, darkMode && styles.darkBannerAdText]}>Relevant Banner Ad</Text>
          </View>
        </View>

        {/* Bottom Navigation Bar */}
        <BottomNavBar navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  cartButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    marginLeft: 10,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: { flex: 1, padding: 20, paddingTop: 30, paddingBottom: 100 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  searchInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
  },
  searchButton: { marginLeft: 10, backgroundColor: "#f0f0f0", borderRadius: 8, padding: 12 },
  filterButton: { marginLeft: 10, backgroundColor: "#f0f0f0", borderRadius: 8, padding: 12 },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableHeaderText: { fontSize: 16, color: "#888" },

  resultsContainer: { flex: 1, marginBottom: 15 },
  loadingText: { textAlign: "center", marginVertical: 10 },

  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 2,
  },
  resultContent: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: "500", color: "#333" },
  resultActions: { flexDirection: "row", alignItems: "center" },
  actionButton: { marginLeft: 15 },

  ratingContainer: { flexDirection: "row" },
  starCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFCD3C",
    marginRight: 5,
  },
  xSymbol: { fontSize: 22, fontWeight: "bold" },
  percentSymbol: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  moneyBagContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  dollarSymbol: { fontSize: 14, fontWeight: "bold" },

  bannerAd: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  bannerAdText: { fontSize: 16, fontWeight: "bold" },

  // Dark mode styles
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  darkSafeArea: {
    backgroundColor: "#1a1a1a",
  },
  darkSearchInput: {
    backgroundColor: "#404040",
    color: "#ffffff",
  },
  darkSearchButton: {
    backgroundColor: "#404040",
  },
  darkFilterButton: {
    backgroundColor: "#404040",
  },
  darkTableHeader: {
    borderBottomColor: "#404040",
  },
  darkTableHeaderText: {
    color: "#cccccc",
  },
  darkResultItem: {
    backgroundColor: "#2d2d2d",
    borderBottomColor: "#404040",
  },
  darkCompanyName: {
    color: "#ffffff",
  },
  darkRatingText: {
    color: "#cccccc",
  },
  darkXSymbol: {
    color: "#ffffff",
  },
  darkPercentSymbol: {
    color: "#ffffff",
    borderColor: "#ffffff",
  },
  darkMoneyBagContainer: {
    borderColor: "#ffffff",
  },
  darkDollarSymbol: {
    color: "#ffffff",
  },
  darkLoadingText: {
    color: "#cccccc",
  },
  darkBannerAd: {
    backgroundColor: "#404040",
  },
  darkBannerAdText: {
    color: "#ffffff",
  },
});
