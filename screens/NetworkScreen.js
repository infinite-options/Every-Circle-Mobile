import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NetworkScreen = ({ navigation }) => {
  const [storageData, setStorageData] = useState([]);
  const [bountyData, setBountyData] = useState(null);
  const [bountyLoading, setBountyLoading] = useState(true);

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        setStorageData(stores);
      } catch (e) {
        setStorageData([["error", e.message]]);
      }
    };
    loadAsyncStorage();
  }, []);

  useEffect(() => {
    const loadBountyData = async () => {
      try {
        setBountyLoading(true);
        const profileId = await AsyncStorage.getItem('profile_uid');
        if (profileId) {
          const response = await fetch(`https://ioec2testsspm.infiniteoptions.com/api/bountyresults/${profileId}`);
          const result = await response.json();
          console.log('Bounty results:', result);
          setBountyData(result);
        }
      } catch (error) {
        console.error('Error loading bounty data:', error);
        setBountyData({ error: error.message });
      } finally {
        setBountyLoading(false);
      }
    };
    loadBountyData();
  }, []);

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Network</Text>
        </View>

        <View style={styles.content}>
          <Text>Fast Router</Text>
        </View>

        {/* AsyncStorage Debug Info */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>AsyncStorage Contents:</Text>
          {storageData.length === 0 ? (
            <Text style={{ color: '#888' }}>No data in AsyncStorage.</Text>
          ) : (
            storageData.map(([key, value]) => (
              <View key={key} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{key}:</Text>
                <Text style={{ color: '#555', fontSize: 13 }}>{value}</Text>
              </View>
            ))
          )}
        </View>

        {/* Bounty Results */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Bounty Results:</Text>
          {bountyLoading ? (
            <Text style={{ color: '#888' }}>Loading bounty data...</Text>
          ) : bountyData?.error ? (
            <Text style={{ color: 'red' }}>Error: {bountyData.error}</Text>
          ) : bountyData?.data ? (
            <View>
              {/* Totals */}
              <View style={styles.bountyTotals}>
                <Text style={styles.bountyTotalText}>Total Transactions: {bountyData.total_bounties}</Text>
                <Text style={styles.bountyTotalText}>Total Earned: ${bountyData.total_bounty_earned?.toFixed(2)}</Text>
              </View>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>ID</Text>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Purchaser</Text>
                <Text style={styles.tableHeaderCell}>Business</Text>
                <Text style={styles.tableHeaderCell}>Bounty</Text>
              </View>
              
              {/* Table Rows */}
              {bountyData.data.map((transaction, index) => {
                // Format date to MM/DD
                const formatDate = (dateString) => {
                  if (!dateString) return 'N/A';
                  const date = new Date(dateString);
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${month}/${day}`;
                };

                return (
                  <View key={transaction.transaction_uid || index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{transaction.transaction_uid}</Text>
                    <Text style={styles.tableCell}>{formatDate(transaction.transaction_datetime)}</Text>
                    <Text style={styles.tableCell}>{transaction.transaction_profile_id || 'N/A'}</Text>
                    <Text style={styles.tableCell}>{transaction.transaction_business_id || 'N/A'}</Text>
                    <Text style={styles.tableCell}>${transaction.bounty_earned?.toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: '#888' }}>No bounty data available.</Text>
          )}
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,
    height: 25,
  },
  navLabel: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
  bountyTotals: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bountyTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#9C45F7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  tableHeaderCell: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
});

export default NetworkScreen;
