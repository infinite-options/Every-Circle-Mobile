// SearchScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";

export default function SearchScreen() {
  const navigation = useNavigation();

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
      // const apiUrl = `https://ioec2testsspm.infiniteoptions.com/api/v1/business_results/${encodeURIComponent(q)}`;
      const apiUrl = `https://ioec2testsspm.infiniteoptions.com/api/v1/tagsplitsearchdistinct/${encodeURIComponent(q)}`;
      console.log("🎯 EXACT ENDPOINT BEING CALLED:", apiUrl);
      console.log("🌐 API URL:", apiUrl);
      
      const res = await fetch(apiUrl);
      
      console.log("📡 Response status:", res.status);
      console.log("📡 Response headers:", res.headers);
      console.log("📡 Content-Type:", res.headers.get('content-type'));
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Get raw response text first
      const responseText = await res.text();
      console.log("📄 Raw response text (first 500 chars):", responseText.substring(0, 500));
      
      // Check if response looks like JSON
      if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
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
            rating: typeof b.rating_star === "number" ? b.rating_star : 
                    typeof b.score === "number" ? Math.min(5, Math.max(1, Math.round(b.score * 5))) : 4,
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
      if (err.message.includes('404')) {
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
      `https://ioec2testsspm.infiniteoptions.com/api/businessresults/${encodeURIComponent(query)}`,
      `https://ioec2testsspm.infiniteoptions.com/api/v1/business_search/${encodeURIComponent(query)}`,
      `https://ioec2testsspm.infiniteoptions.com/api/search/${encodeURIComponent(query)}`,
      `https://ioec2testsspm.infiniteoptions.com/api/v1/search/${encodeURIComponent(query)}`
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log("🔄 Trying alternative endpoint:", endpoint);
        const res = await fetch(endpoint);
        console.log("📡 Alternative endpoint response status:", res.status);
        
        if (res.ok) {
          const responseText = await res.text();
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            const json = JSON.parse(responseText);
            console.log("✅ Alternative endpoint worked! Response:", JSON.stringify(json, null, 2));
            
            // Handle both possible response structures
            const resultsArray = json.results || json.result || [];
            
            const list = resultsArray.map((b, i) => ({
              id: `${b.business_uid || i}`,
              company: b.business_name || b.company || "Unknown Business",
              // Use score as rating if rating_star not available, convert to 1-5 scale
              rating: typeof b.rating_star === "number" ? b.rating_star : 
                      typeof b.score === "number" ? Math.min(5, Math.max(1, Math.round(b.score * 5))) : 4,
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
      style={styles.resultItem}
      activeOpacity={0.7}
      onPress={() => {
        console.log("🏢 Navigating to business profile for:", item.company, "ID:", item.id);
        navigation.navigate("BusinessProfile", { business_uid: item.id });
      }}
    >
      <View style={styles.resultContent}>
        <Text style={styles.companyName}>{item.company}</Text>
      </View>
      <View style={styles.resultActions}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFCD3C" />
        <Text style={styles.ratingText}>
          {typeof item.rating === "number"
            ? item.rating.toFixed(1)
            : item.rating}
        </Text>
      </View>


        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
            navigation.navigate("SearchTab", {
              centerCompany: {
                id:     item.id,
                name:   item.company,
                rating: item.rating,
              },
            });
          }}
        >
          <Ionicons name="share-social-outline" size={22} color="black" />
        </TouchableOpacity>

        {item.hasX && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.xSymbol}>X</Text>
          </TouchableOpacity>
        )}
        {item.hasPriceTag && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.percentSymbol}>:%</Text>
          </TouchableOpacity>
        )}
        {item.hasDollar && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
            <View style={styles.moneyBagContainer}>
              <Text style={styles.dollarSymbol}>$</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking for?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Ionicons name="search" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate("Filters")}
          >
            <MaterialIcons name="filter-list" size={22} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Company</Text>
          <Text style={styles.tableHeaderText}>Rating</Text>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {loading
            ? <Text style={styles.loadingText}>Loading…</Text>
            : results.map((item, idx) => renderResultItem(item, idx))
          }
        </ScrollView>

        <View style={styles.bannerAd}>
          <Text style={styles.bannerAdText}>Relevant Banner Ad</Text>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#9C45F7",
    paddingTop: 50,
    paddingBottom: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" },
  cartButton: { backgroundColor: "#fff", borderRadius: 20, padding: 5 },

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
});
