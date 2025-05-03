// SearchResults.jsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function SearchResults({ route }) {
  const navigation = useNavigation();
  const { query } = route.params;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch once on mount
  useEffect(() => {
    fetch(
      `https://ioec2testsspm.infiniteoptions.com/api/business_results/${encodeURIComponent(
        query
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        const list =
          data.result && Array.isArray(data.result)
            ? data.result.map((b, i) => ({
                id: `${b.business_uid || "unknown"}-${i}`,
                name: b.business_name || "Unknown Business",
                rating: 4,
                review: b.business_address_line_1 || "No address available",
              }))
            : [];
        setResults(list);
      })
      .catch((err) => {
        console.error("Search API error:", err);
        setResults([]); // treat errors as “no results”
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Search");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results for “{query}”</Text>
      </View>

      {/* ── LIST ──────────────────────────────────────────────────────────────── */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        // only show “no results” after loading finishes
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text>No results for “{query}”</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("CompanyDetails", { company: item })
            }
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.review}>{item.review}</Text>
          </TouchableOpacity>
        )}
      />

      {/* ── BOTTOM NAV BAR ─────────────────────────────────────────────────── */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialIcons name="person" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialIcons name="settings" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Home")}
        >
          <MaterialIcons name="home" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Network")}
        >
          <MaterialIcons name="share" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Search")}
        >
          <MaterialIcons name="search" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  listContent: { padding: 20, paddingBottom: 80 },
  emptyContainer: { alignItems: "center", marginTop: 50 },

  item: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  rating: { marginTop: 5, color: "#555" },
  review: { marginTop: 8, color: "#333" },

  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  navButton: { alignItems: "center" },
  navLabel: { fontSize: 12, color: "#333", marginTop: 4 },
});
