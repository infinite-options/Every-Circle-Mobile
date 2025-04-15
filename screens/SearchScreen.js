import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";
import { useNavigation } from "@react-navigation/native";

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("Plumber");
  
  // Dummy search results data
  const searchResults = [
    { id: "1", company: "ABC Plumbing", rating: 4, hasPriceTag: false, hasX: false, hasDollar: true },
    { id: "2", company: "Speedy Roto", rating: 3, hasPriceTag: false, hasX: true, hasDollar: false },
    { id: "3", company: "Fast Rooter", rating: 4, hasPriceTag: true, hasX: false, hasDollar: false },
    { id: "4", company: "Hector Handyman", rating: 4, hasPriceTag: false, hasX: false, hasDollar: true },
  ];

  // Helper function to render star ratings as circles
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <View
          key={i}
          style={styles.starCircle}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  // Render each search result item
  const renderResultItem = (item) => {
    return (
      <View key={item.id} style={styles.resultItem}>
        <View style={styles.resultContent}>
          <Text style={styles.companyName}>{item.company}</Text>
        </View>
        <View style={styles.resultActions}>
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={22} color="black" />
          </TouchableOpacity>
          {item.hasX && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.xSymbol}>X</Text>
            </TouchableOpacity>
          )}
          {item.hasPriceTag && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.percentSymbol}>:&nbsp;%</Text>
            </TouchableOpacity>
          )}
          {item.hasDollar && (
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.moneyBagContainer}>
                <Text style={styles.dollarSymbol}>$</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Function to navigate to SearchTab when clicking in the search input
  const handleSearchFocus = () => {
    navigation.navigate("SearchTab");
  };

  return (
    <View style={styles.container}>
      {/* Purple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchInput}
            onPress={handleSearchFocus}
          >
            <Text style={styles.searchText}>
              {searchQuery || "Search..."}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate("Filter")}
          >
            <Ionicons name="filter" size={22} color="black" />
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Company</Text>
          <Text style={styles.tableHeaderText}>Rating</Text>
        </View>

        {/* Results List */}
        <ScrollView style={styles.resultsContainer}>
          {searchResults.map(item => renderResultItem(item))}
        </ScrollView>

        {/* Banner Ad */}
        <View style={styles.bannerAd}>
          <Text style={styles.bannerAdText}>Relevant Banner Ad</Text>
        </View>
      </View>

      {/* Bottom Menu Bar - using your existing component */}
      <MenuBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#9C45F7", // Brighter purple color
    paddingTop: 50,
    paddingBottom: 80, // Increased to make the curve deeper
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
    // This creates the curved bottom effect
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  cartButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 80, // Added extra padding at bottom for the MenuBar
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    marginRight: 10,
  },
  searchText: {
    fontSize: 16,
    color: "#555",
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ratingContainer: {
    flexDirection: "row",
    marginRight: 15,
  },
  tableHeaderText: {
    fontSize: 16,
    color: "#888",
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 15,
  },
  starCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFCD3C", // Golden color for the circular stars
    marginRight: 5,
  },
  xSymbol: {
    fontSize: 22,
    fontWeight: "bold",
  },
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
  dollarSymbol: {
    fontSize: 14,
    fontWeight: "bold",
  },
  bannerAd: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  bannerAdText: {
    fontSize: 16,
    fontWeight: "bold",
  }
});